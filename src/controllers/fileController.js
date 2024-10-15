const db = require('../db');
const multer = require('multer');
const fs = require('fs');

//config multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userID = req.user.user_id;
        const userFolder = '../files/' + userID;

        //create dir if doesn't exist (shouldn't happen)
        fs.mkdir(userFolder, {recursive: true}, (err) =>{
            cb(err ? new Error('Error creating user folder') : null, userFolder);//no idea what cb does
        });
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

//init multer
const upload = multer({storage});

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

//search by name
//limit number of rows later maybe
const searchFiles = async (req, res) => {
    const {keyword} = req.query; //keyword
    const userId = req.user.userId;

    db.all(`SELECT file_id, filename, file_type FROM files WHERE user_id = ? AND filename LIKE ?`, [userId, `%${keyword}%`], 
        (err, rows) => {
            if (err) {
                return res.status(500).send('Error retrieving files');
            }
        res.json(rows);//return rows(id, name, type)
    });
};

//download
const downloadFile = (req, res) => {
    const {fileId} = req.params;//pass fileid as route param

    db.get(`SELECT file_path FROM files WHERE file_id = ?`, [fileId], (err, row) => {
        if(err || !row) {
            return res.status(404).send('File not found');
        }
        //file found now download
        const filePath = row.file_path; // Path to the file
        res.download(filePath, (err) => {
            if(err) {
                return res.status(500).send('Error downloading file');
            }
        });
    });
};

//delete by id
const deleteFile = async (req, res) => {
    const {fileId} = req.params; 

    //get filepath from db
    db.get(`SELECT file_path FROM files WHERE file_id = ?`, [fileId], (err, row) => {
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
            db.run(`DELETE FROM files WHERE file_id = ?`, [fileId], (err) => {
                if (err) {
                    return res.status(500).send('Error deleting file from database');
                }
                res.status(200).send('File deleted successfully');
            });
        });
    });
};




//exports
module.exports = {upload, uploadFile};
