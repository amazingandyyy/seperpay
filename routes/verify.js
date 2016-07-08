'use strict';

var express = require('express');
var router = express.Router();

var qs = require('querystring');
var request = require('request');
var User = require('../models/user');
var jwt = require('jsonwebtoken');

router.get('/email/:token', function(req, res) {
    var token = req.params.token;
    User.verifyEmail(token, (err, savedUser) => {
        if (err) return res.status(409).send(err)
        res.render('emailVerified');
    })
})


module.exports = router;
