'use strict';

var mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
    moment = require('moment'),
    uuid = require('uuid')

var ses = require('node-ses'),
    client = ses.createClient({
        key: process.env.AWS_KEY,
        secret: process.env.AWS_SECRET
    })
    // let AWS = require('aws-sdk');
    // let s3 = new AWS.S3();
    // var bucketName = process.env.AWS_BUCKET;
    // var urlBase = process.env.AWS_URL_BASE;
    // var CVPkey = process.env.MSFT_CVP_KEY;

const JWT_SECRET = process.env.JWT_SECRET;

var User;

var userSchema = new mongoose.Schema({
    email: {
        data: {
            type: String,
            required: true
        },
        verified: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    phone: {
        data: {
            type: String
        },
        verified: {
            type: Boolean,
            required: true,
            default: false
        },
        // authyId: {
        //     type: String
        // },
        verifyCode: {
            data: {
                type: String
            },
            createAt: {
                type: String
            }
        }
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    setting: {
        notification: {
            login: {
                type: Boolean,
                required: true,
                default: true
            }
        }
    }
})

userSchema.statics.authMiddleware = function(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).send({
            message: 'Please make sure your request has an Authorization header'
        })
    }
    var token = req.header('Authorization').split(' ')[1]

    // console.log('tokennnn: ', token);
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) return res.status(401).send({
            error: 'Must be authenticated.'
        })

        User
            .findById(payload._id)
            .exec((err, user) => {
                if (err || !user) {
                    return res.status(400).send(err || {
                        error: 'User not found.'
                    });
                }
                user.password = null
                req.user = user;
                next()
            })
    })
};

function generateToken(data) {
    var payload = {
        _id: data._id,
        iat: Date.now(),
        exp: moment().add(7, 'day').unix()
    };
    var token = jwt.sign(payload, JWT_SECRET);
    return token
}

userSchema.statics.verifyEmail = function(token, cb) {
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) return res.status(401).send({
            error: 'Must be authenticated.'
        })

        User
            .findById(payload._id)
            .exec((err, user) => {
                if (err || !user) {
                    return res.status(400).send(err || {
                        error: 'User not found.'
                    })
                }
                user.email.verified = true
                user.save((err, savedUser) => {
                    if (err) return cb(err)
                    cb(null, savedUser)
                })
            })
    })
}
userSchema.statics.authenticate = function(userObj, cb) {
    User.findOne({
        email: userObj.email
    }, function(err, user) {
        if (err || !user) {
            return cb("Authentication failed.");
        }
        bcrypt.compare(userObj.password, user.password, function(err, isGood) {
            if (err || !isGood) {
                return cb("Authentication failed.")
            }
            user.password = null
            cb(null, user)
        })
    })
}

userSchema.statics.enterSystem = function(userObj, cb) {
        console.log('userObj:', userObj);
        User.findOne({
            'email.data': {
                '$in': userObj.email
            }
        }, (err, existingUser) => {
            if (err) return cb(err)
            if (existingUser) {
                console.log('existingUser!');
                console.log('existingUser: ', existingUser);
                return bcrypt.compare(userObj.password, existingUser.password, function(err, isGood) {
                    if (err || !isGood) {
                        return cb("Authentication failed.");
                    }
                    existingUser.password = null
                    let token = generateToken(existingUser)
                    if (!existingUser.email.verified) {
                        console.log('email is not verify!')
                        client.sendEmail({
                            to: existingUser.email.data,
                            from: process.env.AWS_SES_SENDER,
                            cc: null,
                            bcc: ['amazingandyyy@gmail.com'],
                            subject: 'Installments: please verify the email!',
                            message: notificationTemplate({
                                title: 'Verify this Email!',
                                description: `Please click the button to verify this email and coninue to your dashboard.`,
                                destination: `api/verify/email/${token}`
                            }),
                            altText: 'plain text'
                        }, function(err, data, res) {
                            if (err) {
                                console.log(err);
                                return cb(err, null)
                            }
                            cb(null, token)
                        })
                    } else if (existingUser.setting.notification.login) {
                        console.log('email is verify and login notifacation triggered!')
                        client.sendEmail({
                            to: existingUser.email.data,
                            from: process.env.AWS_SES_SENDER,
                            cc: null,
                            bcc: ['amazingandyyy@gmail.com'],
                            subject: 'You just login Installments.',
                            message: notificationTemplate({
                                title: 'Login Notification',
                                description: `You just logged in installments dashboard at ${moment().format('hh:mm a, MMMM Do YYYY')}.`,
                                destination: `#/dashboard`
                            }),
                            altText: 'plain text'
                        }, function(err, data, res) {
                            if (err) {
                                console.log(err);
                                return cb(err, null)
                            }
                            cb(null, token)
                        })
                    }
                })
            }

            bcrypt.hash(userObj.password, 12, (err, hash) => {
                if (err) return cb(err);
                var user = new User({
                    email: {
                        data: userObj.email
                    },
                    password: hash
                })
                user.save((err, savedUser) => {
                    if (err) return cb(err)
                    console.log('savedUser: ', savedUser)
                    console.log('-> SES triggered -> ')

                    let token = generateToken(savedUser)
                    client.sendEmail({
                        to: savedUser.email.data,
                        from: process.env.AWS_SES_SENDER,
                        cc: null,
                        bcc: ['amazingandyyy@gmail.com'],
                        subject: 'Installments: verify email',
                        message: notificationTemplate({
                            title: 'Verify this Email!',
                            description: `Please click the button to verify this email and coninue to your dashboard.`,
                            destination: `api/verify/email/${token}`
                        }),
                        altText: 'plain text'
                    }, function(err, data, res) {
                        if (err) {
                            console.log(err);
                            return cb(err, null)
                        }
                        cb(null, token)
                    })

                })
            })
        }).select('+password')
    }
    // var authy = require('authy')(process.env.AUTHY_API_KEY)
    // var authy = require('authy')(process.env.AUTHY_API_KEY_SANDBOX, 'http://sandbox-api.authy.com')
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// userSchema.statics.sendAuthyToken = function(userObj, cb) {
//     var currentUser = userObj.userData;
//     if (!userObj.userData.phone.authyId) {
//         // Register this user if it's a new user (to authy)
//         console.log('Register user on authy')
//         authy.register_user(currentUser.email.data, userObj.phone,
//             function(err, res) {
//                 if (err || !res.user) return cb(err)
//                 User.findById(currentUser._id, (err, dbUser) => {
//                     if (err || !dbUser) return cb(err);
//                     dbUser.phone.data = userObj.phone;
//                     dbUser.phone.authyId = res.user.id;
//                     dbUser.save((err, savedUser) => {
//                         if (err) {
//                             console.log('err @saveUserWithPhone: ', err)
//                             if (err) return cb(err)
//                         }
//                         console.log('savedUser @saveUserWithPhone: ', savedUser);
//                         currentUser = savedUser
//                         sendAuthyToken()
//                     })
//                 })
//             })
//     } else {
//         console.log('Send SMS from authy')
//         // Otherwise send token to a known user
//         sendAuthyToken()
//     }
//     // With a valid Authy ID, send the 2FA token for this user
//     function sendAuthyToken() {
//         authy.request_sms(currentUser.phone.authyId, true, function(err, res) {
//             if (err) return cb(err)
//             cb(null, res)
//         })
//     }
// }
userSchema.statics.sendPhoneVerify = function(userObj, cb) {
    var currentUser = userObj.userData;
    // console.log('currentUser before send: ', currentUser)
    function generateVerifyToken() {
        var verifyCodeArr = ''
        for (var i = 0; i < 4; i++) {
            verifyCodeArr += ~~(Math.random() * 10)
        }
        return verifyCodeArr
    }
    User
        .findById(currentUser._id)
        .exec((err, user) => {
            if (err || !user) return cb(err)
            user.phone.data = userObj.phone
            if (user.phone.verifyCode) {
                console.log('verifyCode existing!')
                var timeStamp = user.phone.verifyCode.createAt //milliseconds
                var now = Date.now() //milliseconds
                var timeDiff = (now-timeStamp)/1000 //second
                if(timeDiff < 301){
                    console.log('it\'s a good code')
                    // code is still good
                    return cb(null, user)
                }
            }
            // code expired or code does not existing
            // -> send verify code to user
            user.phone.verifyCode.data = generateVerifyToken()
            user.phone.verifyCode.createAt = Date.now()
            user.save((err, savedUser) => {
                if (err) return cb(err)
                sendTwilio(currentUser.phone.data, `Your verify code for installments is ${user.phone.verifyCode.data}`,currentUser, cb)
                savedUser.phone.verifyCode = null
            })

        })


    // sendTwilio(currentUser.phone.data, 'currentUser',currentUser, cb)
    // if (!userObj.userData.phone.authyId) {
    //     // Register this user if it's a new user (to authy)
    //     console.log('Register user on authy')
    //     authy.register_user(currentUser.email.data, userObj.phone,
    //         function(err, res) {
    //             if (err || !res.user) return cb(err)
    //             User.findById(currentUser._id, (err, dbUser) => {
    //                 if (err || !dbUser) return cb(err);
    //                 dbUser.phone.data = userObj.phone;
    //                 dbUser.phone.authyId = res.user.id;
    //                 dbUser.save((err, savedUser) => {
    //                     if (err) {
    //                         console.log('err @saveUserWithPhone: ', err)
    //                         if (err) return cb(err)
    //                     }
    //                     console.log('savedUser @saveUserWithPhone: ', savedUser);
    //                     currentUser = savedUser
    //                     sendAuthyToken()
    //                 })
    //             })
    //         })
    // } else {
    //     console.log('Send SMS from authy')
    //     // Otherwise send token to a known user
    //     // sendTwilio()
    // }

}

function sendTwilio(phone, message, successRes, cb) {
    console.log('check');
    twilio.sendMessage({
        to: phone,
        from: process.env.TWILIO_NUMBER,
        body: message
    }, (err, res) => {
        if (err) {
            console.log('err when send twilio SMS: ', err);
            return cb(err)
        }
        cb(null, successRes);
    })
}

userSchema.statics.verifyAuthyToken = function(userObj, cb) {
        console.log(userObj)
        var currentUser = userObj.userData
            // With a valid Authy ID, send the 2FA token for this user
            // authy.request_sms(currentUser.phone.authyId, true, function(err, res) {
            //     if (err) return cb(err)
            //     cb(null, res)
            // });
    }
    // userSchema.statics.verifyPhone = function(req, res) {
    //     var user;
    //     User.findById(req.params.userId, (err, dbUser) => {
    //         if (err || !dbUser) return die('User not found for this ID.')
    //         user = dbUser
    //         console.log('req.body: ', req.body);
    //         authy.verify(user.phone.authyId, req.body.code, function(err, response) {
    //             if (err) {
    //                 console.log('err: ', err)
    //                 return cb(err)
    //             }
    //         })
    //     })
    //
    //     // Handle verification response
    //     function postVerify(err) {
    //         if (err) return die('The token you entered was invalid - please retry.')
    //
    //         // If the token was valid, flip the bit to validate the user account
    //         user.phone.verified = true;
    //         user.save((err, savedUser) => {
    //             if (err) {
    //                 console.log('err when save user after verifying phone: ', err);
    //                 if (err) return cb(err)
    //             }
    //             cb(null, savedUser)
    //         })
    //     }
    // }

// userSchema.methods.verifyAuthyToken = function(otp, cb) {
//     var self = this;
//     authy.verify(self.phone.authyId, otp, function(err, response) {
//         cb.call(self, err, response);
//     })
// }

function notificationTemplate(data) {
    return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <link href='https://fonts.googleapis.com/css?family=PT+Serif|Lato:300' rel='stylesheet' type='text/css' />
            <style media="screen">
                .verify {
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    padding: 15px 50px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: 500;
                    border: none;
                    color: white;
                    background: #04AADC;
                    transition: .1s background ease-in-out;
                    margin-top: 20px;
                }
                .verify:hover {
                    transition: .1s background ease-in-out;
                    background: #03528D;
                }
            </style>
        </head>

        <body>
            <div style="text-align: center; font-weight: 300; font-family: 'Lato', sans-serif; padding-top:30px;">
                <svg width="30px" viewBox="4979 3649 798 796" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(4979.000000, 3649.000000)">
                        <rect id="Rectangle-1-Copy-3" fill="#65CFF1" x="0" y="198" width="598" height="598" rx="125"></rect>
                        <rect id="Rectangle-1-Copy-4" fill="#04AADC" x="200" y="0" width="598" height="598" rx="125"></rect>
                        <path d="M200,198 L473.003735,198 C542.037266,198 598,253.956065 598,322.996265 L598,598 L324.996265,598 C255.962734,598 200,542.043935 200,473.003735 L200,198 Z" id="Combined-Shape" fill="#00538D"></path>
                    </g>
                </svg>
                <div>
                    <h1 style="font-weight: 300; text-transform: capitalize">${data.title}</h1>
                    <h2 style="font-weight: 300; font-size: 1.1em; color: rgba(0,0,0,0.4); margin-top: 10px;">${data.description}</h2>
                    <a href="http://localhost:8000/${data.destination}" target="_blank"><button class="verify">Go to my dashboard</button></a>
                </div>
            </div>
        </body>
        </html>`
}
// userSchema.statics.updateProfilePhoto = function(data, cb) {
//     var userId = data.userId;
//     var file = data.file;
//     if (!file.mimetype.match(/image/)) {
//         return cb({
//             error: 'File must be image'
//         })
//     }
//     let filenameParts = file.originalname.split('.');
//     let ext;
//     if (filenameParts.length > 1) {
//         ext = "." + filenameParts.pop();
//     } else {
//         ext = '';
//     }
//
//     let key = `${uuid.v4()}${ext}`;
//
//     let params = {
//         Bucket: bucketName,
//         Key: key,
//         ACL: 'public-read-write',
//         Body: file.buffer
//     }
//     s3.putObject(params, (err, result) => {
//         if (err) return cb(err);
//         console.log('result from aws s3: ', result);
//         let imageUrl = `${urlBase}/${bucketName}/${key}`;
//
//         User.findById(userId, (err, user) => {
//             if (err) return cb(err);
//             user.profilePicture = imageUrl;
//             user.save((err, savedUser) => {
//                 if (err) {
//                     console.log('err when save user after updating profilePhoto: ', err);
//                     if (err) return cb(err);
//                 }
//                 cb(null, savedUser);
//             });
//         })
//     });
// };

User = mongoose.model('User', userSchema);
module.exports = User;
