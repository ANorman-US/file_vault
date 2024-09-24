const bcrypt = require('bcrypt');
const generateJWT = require('../utils/generateJWT');

const saltRounds = 12;

let users = [];

const signup = async (req, res) => {
    const {username, password} = req.body;

    //check existing
    const existingUser = users.find(u => u.username === username);
    if (existingUser)
        return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    users.push({username, password: hashedPassword});

    //generate token and return
    const token = generateJWT(username);
    res.status(201).json({message: 'User registered successfully', token});
}

const login = async (req, res) => {
    const {username, password} = req.body;

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
}

const getProfile = (req, res) => {
    res.send(`Hello ${req.user.username}. Your password is ${req.user.password}`);
}

//exports
module.exports = {signup, login, getProfile};