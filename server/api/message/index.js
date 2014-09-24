'use strict';

var express = require('express');
var controller = require('./message.controller.js');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/:dialog', auth.isAuthenticated(), controller.show);
router.post('/support', auth.isAuthenticated(), controller.postToSupport);
router.post('/:acceptor', auth.isAuthenticated(), controller.post);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;