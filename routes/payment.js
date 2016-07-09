'use strict';

var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.post('/chargeNow', User.authMiddleware, function(req, res) {
    if (req.user._id == req.body.userData._id) {
        console.log('charge this user Now')
        User.chargedNow(req.body, (err, data) => {
            console.log('err @payment: ', err)
            if (err) return res.status(409).send(err)
            res.send(data)
        })
    }
})

module.exports = router;
