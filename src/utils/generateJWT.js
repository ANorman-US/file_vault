const jwt = require('jsonwebtoken');
require('dotenv').config();//env variables
const JWT_SECRET = process.env.JWT_SECRET;
//console.log("JWT Secret:", JWT_SECRET);

function generateJWT(user_id, username) {
    //username payload, 1 hr expiration. implement extension later
    return jwt.sign({user_id, username}, JWT_SECRET, {expiresIn: '1h'});
}

module.exports = generateJWT;
