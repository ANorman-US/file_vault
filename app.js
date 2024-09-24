const express = require('express');
const https = require('https');
const port = 8080;
const app = express();
const authenticateToken = require('./src/middleware/authenticateToken');
//const fs = require('fs');//file system
//const sqlite3 = require('sqlite3');
//const db = new sqlite3.Database('../file_vault_db/file_vault.db');


//import routes
const authRoutes = require('./src/routes/authRoutes');

//middleware
app.use(express.json());

//routes
app.use('/auth', authRoutes);//includes POST signup, POST login

app.get('/test',(req, res) => {
    res.status(200).json({ message: 'GET request successful' });
});

//SSL certificate
const privateKey = fs.readFileSync('./certs/privatekey.pem', 'utf8');
const certificate = fs.readFileSync('./certs/certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
    console.log(`HTTPS server running on https://localhost:${port}`);
});