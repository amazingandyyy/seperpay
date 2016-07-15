'use strict';

const express = require('express');
const router = express.Router();
let User = require('../models/user');
let Plan = require('../models/plan');

router.get('/:planId', function(req, res) {
    res.render('plan')
})
router.post('/saveSinglePlan', User.authMiddleware, (req, res) => {
    if (req.user._id == req.body.creator._id) {
        Plan.saveSinglePlan(req.body, (err, data) => {
            if (err) return console.log('err: ', err);
            console.log('data: ', data)
            res.status(err ? 400 : 200).send(err || data)
        })
    }
})
router.get('/getSinglePlan/:id', User.authMiddleware, (req, res) => {
        Plan.findById(req.params.id, (err, plan) => {
            if (err) return console.log('err: ', err);
            console.log('plan: ', plan)
            res.status(err ? 400 : 200).send(err || plan)
        })
})

module.exports = router;
