const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret_key';

function generateJWT(username) {
    //username payload, 1 hr expiration. implement extension later
    return jwt.sign({username}, JWT_SECRET, {expiresIn: '1h'});
}

module.exports = generateJWT;
