const bcrypt = require('bcrypt');
const generateJWT = require('../utils/generateJWT');
const db = require('../db.js');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const saltRounds = 12;

//let users = [];

const signup = async (req, res) => {
    const { username, password} = req.body;
    //either returns error or row
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if(err){
            return res.status(500).send({message: 'Server error'});
        }
        if(row){
            return res.status(400).send({message: 'User already exists'});
        }
        //else
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //insert into db
        db.run(`INSERT INTO users (username, hashed_password) VALUES (?, ?)`, [username, hashedPassword], function(err)
        {
            if(err){
                return res.status(500).send({message: 'Error creating user'});
            }
            
            console.log(`Row inserted with username ${username}`);

            const userFolder = './files/' + this.lastID;
            //recursive true avoids error if directory exists
            fs.mkdir(userFolder, {recursive: true}, (err) => {
                if(err){
                    return res.status(500).send({message: 'Error creating user folder'});
                }

                console.log(`Folder created for ${username}`);

                return res.status(200).json(
                    {message: 'Registration successful',
                    redirectUrl: '/login'}
                );


            });
        });
    });
}

const blacklistToken = (token) =>{
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp*1000);
    db.run(`
        INSERT INTO token_blacklist (token, expires_at) VALUES(?,?)`, [token, expiresAt], (err) => {
            if(err) {
                console.error('Error blacklisting token:', err);
            }
        }
    );
}

const login = async (req, res) => {
    const {username, password} = req.body;
    
    //console.log('attempt made');
    //check exists
    db.get('SELECT * FROM users WHERE username = ?', [username], async(err, row) =>{
        if(err){
            return res.status(500).send({message: 'Server error'});
        }
        //if username not found
        if(!row){
            //return res.status(400).send({message: 'Username not found'});
            return res.status(400).send({message: 'Invalid credentials'});
        }
        //verify password
        const isMatch = await bcrypt.compare(password, row.hashed_password);
        if(!isMatch){
            //return res.status(400).send({message: 'Invalid password'});
            return res.status(400).send({message: 'Invalid credentials'});
        }
        
        //generate JWT
        const token = generateJWT(row.user_id, row.username);

        return res.status(200).json(
            {message: 'Login successful',
            token,
            userN: row.username,
            redirectUrl: '/dashboard'}
        );
        
    })

}

const logout = (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];

    //blacklist the token
    blacklistToken(token);

    //send response
    return res.status(200).json({ message:'Signed out successfully'});
}

const getProfile = (req, res) => {

    res.send(`Hello ${req.user.username}. Your id is ${req.user.user_id}`);
}

//exports
module.exports = {signup, login, blacklistToken, getProfile, logout};