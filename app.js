'use strict';
require('dotenv').config();

let express = require('express');
let http = require('http');
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongoose = require('mongoose');
let chalk = require('chalk');
let error = chalk.bold.red;

let PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGOLAB_URI || 'mongodb://localhost/pinchApp';

if (!process.env.JWT_SECRET) {
    console.error(error(`ERROR:  Missing process.env.JWT_SECRET.`));
} else {
    mongoose.connect(MONGOURL, err => {
        console.log(err || `Connected to MongoDB: ${MONGOURL}`);
    });
}

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./routes/api'));
app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/index'));

app.use(function(req, res) {
    res.status(404).render('404');
});

var server = http.createServer(app);

server.listen(PORT);
server.on('error', function(err) {
    console.error(err);
});
server.on('listening', function() {
    console.log(`Listening on port ${PORT}`);
});
