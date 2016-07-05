'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('index');
});

router.use('/users', require('./users'));
router.use('/projects', require('./projects'));
router.use('/upload', require('./upload'));

module.exports = router;
