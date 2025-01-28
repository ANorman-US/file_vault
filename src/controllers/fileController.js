const db = require('../db');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();//env variables

const AES_KEY = Buffer.from(process.env.AES_KEY, 'base64');
const IV_LENGTH = 16;

//config multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userID = req.user.user_id;
        const userFolder = './files/' + userID;

        //create dir if doesn't exist (shouldn't happen)
        fs.mkdir(userFolder, {recursive: true}, (err) =>{
            cb(err ? new Error('Error creating user folder'): null, userFolder);//no idea what cb does
        });
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

//init multer
const upload = multer({storage});

//AES encrypt
function encryptFile(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, iv);
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);

        input.pipe(cipher).pipe(output);
        output.on('finish', () => {
            resolve(iv.toString('base64'));
        });
        output.on('error', (err) => reject(err));
    });
}

//AES decrypt
function decryptFile(inputPath, outputPath, iv) {
    return new Promise((resolve, reject) => {
        const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, Buffer.from(iv, 'base64'));
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);

        input.pipe(decipher).pipe(output);
        output.on('finish', resolve);
        output.on('error', reject);
    });
}

//single file upload
const uploadFile = async (req, res) => {
    const userID = req.user.user_id;
    const file = req.file;

    if(!file){
        return res.status(400).send('No file uploaded');
    }

    const encryptedPath = file.path+'.enc';

    try {
        const iv = await encryptFile(file.path, encryptedPath);
        fs.unlinkSync(file.path);//delete original

        //metadata
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO files (user_id, filename, file_path, file_size, file_type, iv) VALUES (?, ?, ?, ?, ?, ?)`,
                [userID, file.originalname, encryptedPath, file.size, file.mimetype, iv],
                function (err) {
                    if (err) 
                        reject(err);
                    else 
                        resolve(this.lastID);
                }
            );
        });

        res.status(201).json({message: 'File uploaded and encrypted successfully'});
    }
    catch (error){
        console.error(error);
        res.status(500).send('Error encrypting and saving file');
    }
};

//file download
const downloadFile = (req, res) => {
    const {fileID} = req.params;

    db.get(`SELECT file_path, filename, iv FROM files WHERE file_id = ?`, [fileID], async (err, row) => {
        if (err || !row) {
            return res.status(404).send('File not found');
        }

        const encryptedPath = row.file_path;
        const decryptedPath = encryptedPath.replace('.enc', '');
        const {iv, filename} = row;

        try {
            await decryptFile(encryptedPath, decryptedPath, iv);

            res.download(decryptedPath, filename, (err) => {
                fs.unlinkSync(decryptedPath);//delete after download
                if (err) {
                    console.error('Error sending file:', err);
                    res.status(500).send('Error downloading file');
                }
            });
        } catch (error) {
            console.error('Error decrypting file:', error);
            res.status(500).send('Error decrypting file');
        }
    });
};
/*
//single file upload
const uploadFile = async (req, res) =>{
    const userID = req.user.user_id;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    const fileMetadata = {
        userID: userID,
        filename: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        fileType: file.mimetype,
    };

    try {
        await new Promise((resolve, reject) =>{
            db.run(`INSERT INTO files (user_id, filename, file_path, file_size, file_type) VALUES (?, ?, ?, ?, ?)`,
                [fileMetadata.userID, fileMetadata.filename, fileMetadata.filePath, fileMetadata.fileSize, fileMetadata.fileType],
                function (err) {
                    if (err)
                        reject(err);//reject if error
                    else resolve(this.lastID);
                }
            );
        });

        res.status(201).json({message: 'File uploaded success'});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving file metadata');
    }
};

//download
const downloadFile = (req, res) => {
    const {fileID} = req.params;//pass fileid as route param

    db.get(`SELECT file_path FROM files WHERE file_id = ?`, [fileID], (err, row) => {
        if(err || !row) {
            return res.status(404).send('File not found');
        }
        //file found now download
        const filePath = row.file_path;//path to file
        res.download(filePath, (err) => {
            if(err) {
                return res.status(500).send('Error downloading file');
            }
        });
    });
};*/

//search by name
//limit number of rows later maybe
const searchFiles = async (req, res) => {
    const {keyword} = req.query; //keyword
    const userID = req.user.user_id;

    db.all(`SELECT file_id, filename, file_type FROM files WHERE user_id = ? AND filename LIKE ?`, [userID, `%${keyword}%`], 
        (err, rows) => {
            if (err) {
                return res.status(500).send('Error retrieving files');
            }
        res.json(rows);//return rows(id, name, type)
    });
};

//delete by id
const deleteFile = async (req, res) => {
    const {fileID} = req.params;
    const userID = req.user.user_id; 

    //get filepath from db
    db.get(`SELECT file_path FROM files WHERE user_id = ? AND file_id = ?`, [userID, fileID], (err, row) => {
        if(err || !row) {
            return res.status(404).send('File not found');
        }

        const filePath = row.file_path;

        //delete file
        fs.unlink(filePath,(err) => {
            if(err) {
                return res.status(500).send('Error deleting file from filesystem');
            }
            //deletion success. now delete from db
            db.run(`DELETE FROM files WHERE file_id = ?`, [fileID], (err) => {
                if (err) {
                    return res.status(500).send('Error deleting file from database');
                }
                res.status(200).send('File deleted successfully');
            });
        });
    });
};

//exports
module.exports = {upload, uploadFile, searchFiles, downloadFile, deleteFile};
