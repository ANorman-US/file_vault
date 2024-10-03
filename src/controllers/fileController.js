const db = require('../db'); // Import your database connection
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

//exports
module.exports = {upload, uploadFile};
