const jwt = require('jsonwebtoken');
const db = require('../db.js');//check for blacklsited tokens
require('dotenv').config();//env variables
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];//token format is "Bearer token"

    if(token == null)
        return res.status(401).send('Access denied. No token provided.');

    //check blacklist
    db.get('SELECT * FROM token_blacklist WHERE TOKEN = ?', [token], (err, row) =>{
        if(err){
            return res.status(500).send('Server error');
        }
        if(row){
            return res.status(403).send('Token invalidated');
        }
    })


    jwt.verify(token, JWT_SECRET, (err, user_info) => {
        if (err)
            return res.status(403).send('Invalid token.');
        req.user = user_info;
        next();//pass control to next middleware/route handler
    })

};

module.exports = authenticateToken;//allows usage outside