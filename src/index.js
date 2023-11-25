const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const routes = require('./routes')
const cors = require('cors');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

dotenv.config()
mongoose.set('strictQuery', false);

const app = express()

const port = process.env.PORT || 3001
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(bodyParser.json())
app.use(cookieParser())

routes(app);

app.set('trust proxy', 1);
app.use((req, res, next) => {
    req.headers.host = 'your-ngrok-subdomain.ngrok.io';
    next();
});

mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => {
        console.log('Connect Db success!')
    })
    .catch((err) => {
        console.log(err)
    })
app.listen(port, () => {
    console.log('Server is running in port: ', + port)
})