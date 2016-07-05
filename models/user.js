'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var uuid = require('uuid');

let AWS = require('aws-sdk');
let s3 = new AWS.S3();
var bucketName = process.env.AWS_BUCKET;
var urlBase = process.env.AWS_URL_BASE;
var CVPkey = process.env.MSFT_CVP_KEY;

const JWT_SECRET = process.env.JWT_SECRET;

var User;

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    profilePicture: {
        type: String
    },
    profilePictureFB: {
        type: String
    },
    displayName: {
        type: String
    },
    title: {
        type: String
    },
    bio: {
        type: String
    },
    location: {
        type: String
    },
    personalStie: {
        type: String
    },
    facebook: {
        type: String
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    followersList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followingsList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    liked: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    history: []
});

userSchema.statics.authMiddleware = function(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).send({
            message: 'Please make sure your request has an Authorization header'
        });
    }
    var token = req.header('Authorization').split(' ')[1];

    console.log('tokennnn: ', token);

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) return res.status(401).send({
            error: 'Must be authenticated.'
        });

        User
            .findById(payload._id)
            .populate('projects followers followings')
            .exec((err, user) => {
                if (err || !user) {
                    // var token = localStorage.satellizer_token;
                    return res.status(400).send(err || {
                        error: 'User not found.'
                    });
                }
                req.user = user;
                next();
            })
    });
};

userSchema.methods.generateToken = function() {
    var payload = {
        _id: this._id,
        iat: Date.now(),
        exp: moment().add(1, 'day').unix()
    };
    var token = jwt.sign(payload, JWT_SECRET);
    return token;
};

userSchema.statics.authenticate = function(userObj, cb) {
    User.findOne({
        username: userObj.username
    }, function(err, user) {
        if (err || !user) {
            return cb("Authentication failed.");
        }
        bcrypt.compare(userObj.password, user.password, function(err, isGood) {
            if (err || !isGood) {
                return cb("Authentication failed.");
            }
            user.password = null;
            cb(null, user);
        });
    });
};

userSchema.statics.register = function(userObj, cb) {
    console.log('userObj:', userObj);
    User.findOne({
        email: userObj.email
    }, (err, dbUser) => {
        console.log(err, dbUser);
        if (err || dbUser) return cb(err || {
            error: 'Email not available.'
        })

        bcrypt.hash(userObj.password, 12, (err, hash) => {
            if (err) return cb(err);

            var user = new User({
                email: userObj.email,
                password: hash
            });

            user.save(cb);
        });
    });
};
userSchema.statics.addProject = function(updateData, cb) {
    this.findOne({
        _id: updateData.currentUser
    }, (err, user) => {
        if (err || !user) return cb(err);
        var alreadyExist = user.projects.indexOf(updateData.projectId) !== -1
        if (alreadyExist) {
            cb(null, user);
        } else {
            user.projects.push(updateData.projectId)
            user.save((err, user) => {
                if (err) return cb(err);
                cb(null, user);
            });
        }
    })
};
userSchema.statics.eventFollow = function(data, cb) {
    var followerId = data.currentUser;
    var followingReceiverId = data.followTarget;
    // workflow:
    // 1 - followTarget the target and push the currentUser as follower
    // 2 - find the follower and push the followTarget._id to the followingsList
    this.findOne({
        _id: followingReceiverId
    }, (err, user) => {
        if (err || !user) return cb(err);
        if (user.followersList.indexOf(followerId) == -1) {
            // the folower does not exist
            console.log('Trigger following event!');
            user.followersList.push(followerId)
            user.save((err, user) => {
                // save the followingReceiver with a updated followersList
                if (err) return cb(err)
                var updatedfollowingReceiver = user;
                // next step: after successfully save followingReceiver
                this.findOne({
                    _id: followerId
                }, (err, user) => {
                    if (err || !user) return cb(err)
                    console.log('follower before following: ', user);
                    var follerReveiverNotExisted = user.followingsList.indexOf(followingReceiverId) == -1;
                    console.log('follerReveiverNotExisted: ', follerReveiverNotExisted);
                    if (follerReveiverNotExisted) {
                        // update follower's followingsList
                        user.followingsList.push(followingReceiverId);
                        // save the follower with a updated followingsList
                        user.save((err, follower) => {
                            if (err || !follower) return cb(err)
                                // successfully save the follower with a updated followingsList
                            var resData = {
                                eventType: 'follow',
                                followingReceiver: updatedfollowingReceiver,
                                follower: follower
                            }
                            console.log('following event participants: ', resData);
                            cb(null, resData)
                        })
                    }
                })
            })
        } else if (user.followersList.indexOf(followerId) !== -1) {
            // the folower must already exist
            var unfollowerId = data.currentUser
            var unfollowingReceiverId = data.followTarget
            console.log('Trigger unfollowing event!')
            var index = user.followersList.indexOf(unfollowerId)
            user.followersList.splice(index, 1)
            user.save((err, user) => {
                if (err) return cb(err)
                var updatedunfollowingReceiver = user;
                this.findOne({
                    _id: unfollowerId
                }, (err, user) => {
                    if (err || !user) return cb(err)
                    var unfollerReveiverNotExisted = user.followingsList.indexOf(unfollowingReceiverId) !== -1;
                    if (unfollerReveiverNotExisted) {
                        var index = user.followingsList.indexOf(unfollowingReceiverId);
                        user.followingsList.splice(index, 1);
                        user.save((err, unfollower) => {
                            if (err) return cb(err)
                            var resData = {
                                eventType: 'unfollow',
                                unfollowingReceiver: updatedunfollowingReceiver,
                                unfollower: unfollower
                            }
                            console.log('unfollowing event participants: ', resData);
                            cb(null, resData)
                        })
                    }
                })
            });
        }
    })
};
userSchema.statics.updateProfilePhoto = function(data, cb) {
    var userId = data.userId;
    var file = data.file;
    if (!file.mimetype.match(/image/)) {
        return cb({
            error: 'File must be image'
        })
    }
    let filenameParts = file.originalname.split('.');
    let ext;
    if (filenameParts.length > 1) {
        ext = "." + filenameParts.pop();
    } else {
        ext = '';
    }

    let key = `${uuid.v4()}${ext}`;

    let params = {
        Bucket: bucketName,
        Key: key,
        ACL: 'public-read-write',
        Body: file.buffer
    }
    s3.putObject(params, (err, result) => {
        if (err) return cb(err);
        console.log('result from aws s3: ', result);
        let imageUrl = `${urlBase}/${bucketName}/${key}`;

        User.findById(userId, (err, user) => {
            if (err) return cb(err);
            user.profilePicture = imageUrl;
            user.save((err, savedUser) => {
                if (err) {
                    console.log('err when save user after updating profilePhoto: ', err);
                    if (err) return cb(err);
                }
                cb(null, savedUser);
            });
        })
    });
};

User = mongoose.model('User', userSchema);
module.exports = User;
