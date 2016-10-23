'use strict'
require('dotenv').config()

let express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    mongoose = require('mongoose'),
    chalk = require('chalk'),
    error = chalk.bold.red,
    crypto = require('crypto')

let PORT = process.env.PORT
const MONGOURL = process.env.MONGOLAB_URI

if (!process.env.JWT_SECRET) {
    console.error(error(`ERROR:  Missing process.env.JWT_SECRET.`))
} else {
    mongoose.connect(MONGOURL, err => {
        console.log(err || `Connected to MongoDB: ${MONGOURL}`)
    })
}

let app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/testing', require('./routes/testing'))
app.use('/api', require('./routes/api'))
app.use('/plan', require('./routes/plans'))
app.use('/auth', require('./routes/auth'))
app.use('/', require('./routes/index'))

app.use(function(req, res) {
    res.status(404).render('404')
})

var server = http.createServer(app)

server.listen(PORT)
server.on('error', function(err) {
    console.error(err)
})
server.on('listening', function() {
    console.log(`Listening on port ${PORT}`)
})
