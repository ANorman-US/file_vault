const express = require('express');
const path = require('path');
const router = express.Router();

//index(login)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/register.html'));
});

//dashboard
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});


module.exports = router;
