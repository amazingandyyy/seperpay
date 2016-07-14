var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/', (req, res) => {
    User.find({}, (err, users) => {
        res.status(err ? 400 : 200).send(err || users);
    });
});
// /api/users/own
router.get('/own', User.authMiddleware, (req, res) => {
    // console.log('res.user: ', req.user);
    res.send(req.user);
})

router.put('/event/follow', User.authMiddleware, (req, res) => {
    if (req.user._id == req.body.currentUser) {
        User.eventFollow(req.body, (err, data) => {
            if (err) return console.log('err: ', err);
            console.log('data: ', data)
            res.status(err ? 400 : 200).send(err || data)
        })
    }
})
router.get('/:userId', (req, res) => {
    // console.log('req.user:', req.user);
    User.findById(req.params.userId, (err, user) => {
        res.status(err ? 400 : 200).send(err || user);
    }).populate('projects followersList followingsList');
})
router.put('/:userId', User.authMiddleware, (req, res) => {
    if (req.user._id == req.body._id) {
        User.findByIdAndUpdate(req.params.userId, req.body, {
            new: true
        }, (err, user) => {
            res.status(err ? 400 : 200).send(err || user);
        });
    }
})
module.exports = router;
