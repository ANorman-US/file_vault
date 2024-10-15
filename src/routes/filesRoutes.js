const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/upload', authenticateToken, fileController.upload.single('file'), fileController.uploadFile);
router.get('/search', authenticateToken, fileController.searchFiles);
router.get('/download/:fileID', authenticateToken, fileController.downloadFile);
router.delete('/delete/:fileID', authenticateToken, fileController.deleteFile);

//implement multiple file upload later. 5 is arbitrary temp limit
//router.post('/upload-multiple', upload.array('file', 5), uploadFiles);

module.exports = router;