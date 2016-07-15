'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const uuid = require('uuid');
const autopopulate = require('mongoose-autopopulate');
const CronJob = require('cron').CronJob;

const ses = require('node-ses')
const SESserver = ses.createClient({
        key: process.env.AWS_KEY,
        secret: process.env.AWS_SECRET
    })
    // let AWS = require('aws-sdk');
    // let s3 = new AWS.S3();
    // let bucketName = process.env.AWS_BUCKET;
    // let urlBase = process.env.AWS_URL_BASE;
    // let CVPkey = process.env.MSFT_CVP_KEY;

const JWT_SECRET = process.env.JWT_SECRET;

let User;

let userSchema = new mongoose.Schema({
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
        verifyCode: {
            data: {
                type: String,
                select: false
            },
            expiredAt: {
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
    },
    payment: [{
        event: {
            state: {
                type: String
            },
            createAt: {
                type: String,
                default: Date.now()
            },
            details: {
                type: Object
            }
        }
    }],
    plans: [{
        type: mongoose.Schema.Types.ObjectId,
        autopopulate: true,
        ref: 'Plan'
    }]
})
userSchema.plugin(autopopulate);


userSchema.statics.authMiddleware = function(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).send({
            message: 'Please make sure your request has an Authorization header'
        })
    }
    let token = req.header('Authorization').split(' ')[1]

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
    let payload = {
        _id: data._id,
        iat: Date.now(),
        exp: moment().add(7, 'day').unix()
    };
    let token = jwt.sign(payload, JWT_SECRET);
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
        })
        .select('+password')
        .exec((err, existingUser) => {
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
                        SESserver.sendEmail({
                            to: existingUser.email.data,
                            from: process.env.AWS_SES_SENDER,
                            cc: null,
                            bcc: ['amazingandyyy@gmail.com'],
                            subject: 'Seperpay: please verify the email!',
                            message: notificationTemplate({
                                title: 'Verify this Email!',
                                description: `Please click the button to verify this email and coninue to your dashboard.`,
                                destination: `api/verify/email/${token}`,
                                button: `verify this email`
                            }),
                            altText: 'plain text'
                        }, function(err, data, res) {
                            if (err) {
                                console.log(err);
                                return cb(err, null)
                            }
                            return cb(null, token)
                        })
                    } else if (existingUser.setting.notification.login) {
                        console.log('email is verify and login notifacation triggered!')
                        SESserver.sendEmail({
                            to: existingUser.email.data,
                            from: process.env.AWS_SES_SENDER,
                            cc: null,
                            bcc: ['amazingandyyy@gmail.com'],
                            subject: 'You just login Seperpay.',
                            message: notificationTemplate({
                                title: 'Login Notification',
                                description: `You just logged in Seperpay dashboard at ${moment().format('hh:mm a, MMMM Do YYYY')}.`,
                                destination: `#/dashboard`,
                                button: `Go to my dashboard`
                            }),
                            altText: 'plain text'
                        }, function(err, data, res) {
                            if (err) {
                                console.log(err);
                                return cb(err, null)
                            }
                            cb(null, token)

                            // let job = new CronJob({
                            //     cronTime: '* * * * * *',
                            //     onTick: function() {
                            //         console.log('yo');
                            //     },
                            //     start: false,
                            //     timeZone: 'America/Los_Angeles'
                            // })
                            // job.start()


                        })
                    }
                })
            }

            bcrypt.hash(userObj.password, 12, (err, hash) => {
                if (err) return cb(err);
                let user = new User({
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
                    SESserver.sendEmail({
                        to: savedUser.email.data,
                        from: process.env.AWS_SES_SENDER,
                        cc: null,
                        bcc: ['amazingandyyy@gmail.com'],
                        subject: 'Seperpay: verify this email',
                        message: notificationTemplate({
                            title: 'Verify this Email!',
                            description: `Please click the button to verify this email and coninue to your dashboard.`,
                            destination: `api/verify/email/${token}`,
                            button: `verify this email`
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
        })
}

let twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

userSchema.statics.sendPhoneVerify = function(userObj, cb) {
    let currentUser = userObj.userData;
    console.log('currentUser before send: ', currentUser)
    function generateVerifyToken() {
        let verifyCodeArr = ''
        for (let i = 0; i < 4; i++) {
            verifyCodeArr += ~~(Math.random() * 10)
        }
        return verifyCodeArr
    }
    User
        .findById(currentUser._id)
        .select('+phone.verifyCode.data')
        .exec((err, user) => {
            console.log('user data when verify the code: ', user);
            if (err || !user) return cb(err)
            if (user.phone.verified) {
                // if the user's phone is already verified, then ignore this request
                // -> send back some user data
                return cb(null, user)
            }
            user.phone.data = userObj.phone // change user's phone Number as they type in
            let now = Date.now()
            if (user.phone.verifyCode.expiredAt > now) {
                // code is still good
                console.log(`${(user.phone.verifyCode.expiredAt - now) / 1000} secs left, it\'s still a good code: `, user.phone.verifyCode.data)
                user.phone.verifyCode.data = null //hide the code before making the successful callback
                console.log('user: ', user)
                return cb(null, user)
            }
            console.log('code expired or code does not exist');
            // code expired or code does not exist
            // -> send verify code to user
            let code = generateVerifyToken()
            user.phone.verifyCode.data = code
            user.phone.verifyCode.expiredAt = Date.now() + (1000 * 300) // expire in 5 minutes
            user.save((err, savedUser) => {
                if (err) return cb(err)
                savedUser.phone.verifyCode.data = null // hide the code before making the successful callback
                console.log('savedUser: ', savedUser);
                sendTwilio(savedUser.phone.data, `Your verify code for Seperpay is ${code}`, savedUser, cb)
            })

        })
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
                <svg width="30px" viewBox="582 404 71 71" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g id="Group-4" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(582.000000, 404.000000)">
                        <path d="M35,70 C54.3299662,70 70,54.3299662 70,35 C70,15.6700338 54.3299662,0 35,0 C15.6700338,0 0,15.6700338 0,35 C0,54.3299662 15.6700338,70 35,70 Z M35,59.5 C48.5309764,59.5 59.5,48.5309764 59.5,35 C59.5,21.4690236 48.5309764,10.5 35,10.5 C21.4690236,10.5 10.5,21.4690236 10.5,35 C10.5,48.5309764 21.4690236,59.5 35,59.5 Z" id="Combined-Shape" fill="#04AADC"></path>
                    </g>
                </svg>
                <div>
                    <h1 style="font-weight: 300; text-transform: capitalize">${data.title}</h1>
                    <h2 style="font-weight: 300; font-size: 1.1em; color: rgba(0,0,0,0.4); margin-top: 10px;">${data.description}</h2>
                    <a href="http://localhost:8000/${data.destination}" target="_blank"><button class="verify">${data.button}</button></a>
                </div>
            </div>
        </body>
        </html>`
}

userSchema.statics.verifyPhoneToken = function(userObj, cb) {
    let userId = userObj.userData._id
    let code = userObj.code
    User
        .findById(userId)
        .select('+phone.verifyCode.data')
        .exec((err, dbUser) => {
            if (err || !dbUser) {
                return cb(err)
            }
            console.log('dbUser: ', dbUser);
            let now = Date.now()
            if (dbUser.phone.verified) {
                return cb(null, {
                    msg: "It's already been verified!",
                    dbUser: dbUser
                })
            } else if (dbUser.phone.verifyCode.expiredAt < now) {
                // code is expired
                return cb(null, {
                    msg: "expired"
                })
            } else if (code == dbUser.phone.verifyCode.data) {
                console.log('not expired and matched!');
                // codes are the same
                // -> set user's phone verified to true
                dbUser.phone.verified = true
                dbUser.save((err, savedUser) => {
                    if (err) return cb(err)
                    console.log(savedUser)
                    sendTwilio(savedUser.phone.data, `Big congrats! Your phone, ${savedUser.phone.data} is now successfully verified! Login dashboard to create a plan: ${process.env.SITE_CURRENT_URL}`, savedUser, cb)
                })
            } else {
                // code is not expired
                console.log('not expired but not matched!')
                cb(null, {
                    msg: "incorrect"
                })
            }
        })
        // With a valid Authy ID, send the 2FA token for this user
        // authy.request_sms(currentUser.phone.authyId, true, function(err, res) {
        //     if (err) return cb(err)
        //     cb(null, res)
        // });
}

let stripe = require('stripe')(process.env.STRIPE_API_SECRET)

userSchema.statics.chargedNow = function(dataObj, cb) {
        // console.log('dataObj: ', dataObj)
        console.log(dataObj.stripeToken.id);
        console.log(dataObj.userData._id);
        // User
        //     .findById(payload._id)
        //     .exec((err, user) => {
        //         if (err || !user) {
        //             return res.status(400).send(err || {
        //                 error: 'User not found.'
        //             })
        //         }
        //         user.email.verified = true
        //         user.save((err, savedUser) => {
        //             if (err) return cb(err)
        //             cb(null, savedUser)
        //         })
        //     })
        stripe.charges.create({
            amount: 50 * 100,
            currency: "usd",
            source: dataObj.stripeToken.id,
            description: `payment verification for ${dataObj.userData._id}!`
        }, cb)
    }
    // userSchema.statics.updateProfilePhoto = function(data, cb) {
    //     let userId = data.userId;
    //     let file = data.file;
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
