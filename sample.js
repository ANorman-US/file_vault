const express = require('express');
const app = express();
const port = 8080;
const https = require('https');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { createServer } = require('http');

app.use(express.json());

let users = [];
const saltRounds = 10;
const secretKey = 'secret-key';
const privateKey = fs.readFileSync('privatekey.pem', 'utf8');
const certificate = fs.readFileSync('certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

https:createServer(credentials, app).listen(8080, () => {
    console.log('HTTPS server running on https://localhost:8080');
});

// Index Route
app.get('/', (req, res) => {
    res.send('File server is running!');
})

/*app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})*/




//signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;//read in user data

    const hashedPassword = await bcrypt.hash(password, saltRounds);//hash

    users.push({ username, password: hashedPassword });//add user
    res.send('User registered!');//response
    console.log(users);
})



app.post('/login', /* express.json(), */ async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username == username);
    if (!user) return res.status(404).send('User not found!');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).send('Invalid password!');

    //jsonwebtoken
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
    console.log(token);
    //res.send('Login successful!');
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).send('Access denied!');

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).send('Invalid token!');
        req.user = user;
        next();
    });
};

app.get('/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route!');
  });