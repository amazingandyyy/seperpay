var express = require('express');
var router = express.Router();

var User = require('../models/user');

var mongoose = require('mongoose');
var uuid = require('uuid');
var request = require('request');

var multer = require('multer');
var upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        filesize: 1000000 * 10
    }
});

router.post('/:userId', upload.single('newFile'), User.authMiddleware, (req, res) => {
    console.log('fff');
    console.log('req.file: ', req.file);
    var data = {
        userId: req.params.userId,
        file: req.file
    }

    if (req.user._id == req.params.userId) {
        User.updateProfilePhoto(data, (err, photo) => {
            if (err) return console.log('err: ', err);
            res.status(err ? 400 : 200).send(err || photo)
        })
    }
})
module.exports = router;
