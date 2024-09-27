const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret_key';

function generateJWT(user_id, username) {
    //username payload, 1 hr expiration. implement extension later
    return jwt.sign({user_id, username}, JWT_SECRET, {expiresIn: '1h'});
}

module.exports = generateJWT;
