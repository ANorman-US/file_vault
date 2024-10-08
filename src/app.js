const express = require('express');
const https = require('https');
const port = 8080;
const app = express();
const authenticateToken = require('./middleware/authenticateToken');
const fs = require('fs');//file system
const db = require('./db.js')


//import routes
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/filesRoutes.js');

//middleware
app.use(express.json());

//routes
app.use('/auth', authRoutes);//includes POST signup, POST login
app.use('/files', fileRoutes)

app.get('/test',(req, res) => {
    res.status(200).json({ message: 'GET request successful' });
});

//SSL certificate
const privateKey = fs.readFileSync('../certs/privatekey.pem', 'utf8');
const certificate = fs.readFileSync('../certs/certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
    console.log(`HTTPS server running on https://localhost:${port}`);
});