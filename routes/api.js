'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('index');
});

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/plans', require('./plans'));
router.use('/verify', require('./verify'));
router.use('/payment', require('./payment'));

module.exports = router;
