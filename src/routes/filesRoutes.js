const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/upload', authenticateToken, fileController.upload.single('file'), fileController.uploadFile);
router.get('/search', authenticateToken, fileController.searchFiles);
router.get('/download/:fileID', authenticateToken, fileController.downloadFile);
router.delete('/delete/:fileID', authenticateToken, fileController.deleteFile);


module.exports = router;