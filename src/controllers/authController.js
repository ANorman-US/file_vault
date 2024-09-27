const bcrypt = require('bcrypt');
const generateJWT = require('../utils/generateJWT');
const db = require('../db.js');

const saltRounds = 12;

//let users = [];

const signup = async (req, res) => {
    const { username, password} = req.body;

    //either returns error or row
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if(err){
            return res.status(500).send('Server error');
        }
        if(row){
            return res.status(400).send('User already exists');
        }
        //else
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //insert into db
        db.run(`INSERT INTO users (username, hashed_password) VALUES (?, ?)`,
            [username, hashedPassword],
            function(err)
            {
                if(err){
                    return res.status(500).send('Error creating user');
                }
                

                console.log(`Row inserted with username ${username}`);

                //generate JWT (redirect to login instead)
                //const token = generateJWT(username);//update to user_id later
                return res.status(201).json({message: 'User registered successfully' /*token*/});
            });
    });

    /*
    //check existing
    const existingUser = users.find(u => u.username === username);
    if (existingUser)
        return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    users.push({username, password: hashedPassword});

    //generate token and return
    const token = generateJWT(username);
    res.status(201).json({message: 'User registered successfully', token});
    */
}

const login = async (req, res) => {
    const {username, password} = req.body;

    //check exists
    db.get('SELECT * FROM users WHERE username = ?', [username], async(err, row) =>{
        if(err){
            return res.status(500).send('Server error');
        }
        //if username not found
        if(!row){
            return res.status(400).send('Username not found');
        }
        //verify password
        const isMatch = await bcrypt.compare(password, row.hashed_password);
        if(!isMatch){
            return res.status(400).send('Invalid password');
        }
        
        //generate JWT
        const token = generateJWT(row.user_id, row.username);
        return res.status(200).json({message: 'Login successful', token});



    })


    /*
    //check existing
    const existingUser = users.find(u => u.username === username);
    if (!existingUser)
        return res.status(400).send('Invalid username');

    const matching = await bcrypt.compare(password, existingUser.password);
    if(!matching)
        return res.status(401).send('Invalid Password');

    //generate token and return
    const token = generateJWT(username);
    res.status(201).json({message: 'User successfully logged in', token});
    */
}

const getProfile = (req, res) => {

    res.send(`Hello ${req.user.username}. Your id is ${req.user.user_id}`);
}

//exports
module.exports = {signup, login, getProfile};