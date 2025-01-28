const express = require('express');
const https = require('https');
//const bodyParser = require('body-parser');
const port = 8080;
const app = express();
const authenticateToken = require('./src/middleware/authenticateToken.js');
const fs = require('fs');//file system
const db = require('./src/db.js')
require('dotenv').config();//env variables


//import routes
const webRoutes = require('./src/routes/webroutes.js');
const authRoutes = require('./src/routes/authRoutes.js');
const fileRoutes = require('./src/routes/filesRoutes.js');

//middleware
app.use(express.json());
//app.use(bodyParser.json());

//static files
app.use(express.static('./public'));

//routes
app.use('/', webRoutes);
app.use('/auth', authRoutes);//includes POST signup, POST login
app.use('/files', fileRoutes)

app.get('/test',(req, res) => {
    res.status(200).json({message:'GET request successful'});
});

//SSL certificate
const privateKey = fs.readFileSync('./certs/privatekey.pem', 'utf8');
const certificate = fs.readFileSync('./certs/certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
    console.log(`HTTPS server running on https://localhost:${port}`);
});