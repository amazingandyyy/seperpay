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
router.post('/phone', User.authMiddleware, (req, res) => {
    if(req.user._id==req.body.userData._id){
        User.sendPhoneVerify(req.body, (err, data) => {
            if (err) return console.log('err @sendPhoneVerify: ', err);
            res.status(err ? 400 : 200).send(err || data)
        })
    }
})
router.put('/phone', User.authMiddleware, (req, res) => {
    if(req.user._id==req.body.userData._id){
        console.log('verify phone verification code')
        User.verifyPhoneToken(req.body, (err, data) => {
            if (err) return console.log('err @verifyAuthyToken: ', err);
            console.log('data: ', data)
            res.status(err ? 400 : 200).send(err || data)
        })
    }
})

module.exports = router;
