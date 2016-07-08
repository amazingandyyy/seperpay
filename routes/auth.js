'use strict';

var express = require('express');
var router = express.Router();

var qs = require('querystring');
var request = require('request');
var User = require('../models/user');
var jwt = require('jsonwebtoken');

router.get('/', function(req, res) {
    res.render('index');
})

router.get('/currentUser', User.authMiddleware, function(req, res) {
    if (!req.user) {
        return res.status(409).send()
    }
    res.send(req.user)
})

router.post('/signup', function(req, res) {
    User.enterSystem(req.body, (err, token) => {
        if (err) return res.status(409).send(err)
        res.send({
            token: token
        })
    })
})

//
// router.post('/facebook', function(req, res) {
//     var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
//     var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
//     var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
//     var params = {
//         code: req.body.code,
//         client_id: req.body.clientId,
//         client_secret: process.env.FACEBOOK_SECRET,
//         redirect_uri: req.body.redirectUri
//     }
//
//     // Step 1. Exchange authorization code for access token.
//     request.get({
//         url: accessTokenUrl,
//         qs: params,
//         json: true
//     }, function(err, response, accessToken) {
//         if (response.statusCode !== 200) {
//             return res.status(500).send({
//                 message: accessToken.error.message
//             });
//         }
//
//         // Step 2. Retrieve profile information about the current user.
//         request.get({
//             url: graphApiUrl,
//             qs: accessToken,
//             json: true
//         }, function(err, response, profile) {
//             if (response.statusCode !== 200) {
//                 return res.status(500).send({
//                     message: profile.error.message
//                 });
//             }
//             if (req.header('Authorization')) {
//                 console.log('facebook profile: ', profile);
//                 User.findOne({
//                     facebook: profile.id
//                 }, function(err, existingUser) {
//                     if (existingUser) {
//                         return res.status(409).send({
//                             message: 'There is already a Facebook account that belongs to you'
//                         });
//                     }
//                     var token = req.header('Authorization').split(' ')[1];
//                     console.log('token: ', token);
//                     var payload = jwt.verify(token, process.env.JWT_SECRET);
//                     console.log('payload: ', payload);
//                     User.findById(payload.sub, function(err, user) {
//                         if (!user) {
//                             return res.status(400).send({
//                                 message: 'User not found'
//                             });
//                         }
//                         user.facebook = profile.id;
//                         user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
//                         user.displayName = user.displayName || profile.name;
//                         user.save(function() {
//                             var token = user.generateToken();
//                             res.send({
//                                 token: token
//                             });
//                         });
//                     });
//                 });
//             } else {
//                 console.log('Server: Create a new user account or return an existing one.');
//                 console.log('User\'s facebook profile: \n', profile);
//                 // Step 3. Create a new user account or return an existing one.
//                 User.findOne({
//                     facebook: profile.id
//                 }, function(err, existingUser) {
//                     if (existingUser) {
//                         console.log('existingUser: ', existingUser);
//                         var token = existingUser.generateToken();
//                         console.log('fresh token: ', token);
//                         return res.send({
//                             token: token
//                         });
//                     }
//                     var user = new User();
//                     var profilePictureResource = 'https://graph.facebook.com/' + profile.id + '/picture?type=large'
//                     user.email = profile.email;
//                     user.facebook = profile.id;
//                     user.profilePicture = profilePictureResource;
//                     user.profilePictureFB = profilePictureResource;
//                     user.displayName = profile.name;
//                     user.save((err, savedUser) => {
//                         if (err) {
//                             console.log('err when create new user: ', err);
//                             res.status(400).send(err);
//                         } else {
//                             console.log('savedUser: ', savedUser);
//                             var token = savedUser.generateToken();
//                             console.log('fresh token: ', token);
//                             res.send({
//                                 token: token
//                             });
//                         }
//                     });
//                 });
//             }
//         });
//     });
// });
//



module.exports = router;
