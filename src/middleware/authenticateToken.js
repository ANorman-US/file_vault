const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret_key';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];//token format is "Bearer token"

    if(token == null)
        return res.status(401).send('Access denied. No token provided.');

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).send('Invalid token.');
        req.user = user;
        next();//pass control to next middleware/route handler
    })

};

module.exports = authenticateToken;//allows usage outside