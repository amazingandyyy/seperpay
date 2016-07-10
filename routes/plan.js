'use strict';

var express = require('express');
var router = express.Router();

router.get('/:planId', function(req, res) {
    res.render('plan')
})
module.exports = router;
