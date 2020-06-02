'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/probando-md', md_auth.ensureAuth, MessageController.probando);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages', md_auth.ensureAuth, MessageController.getReceivedMessages);
api.get('/userMessages/:friend', md_auth.ensureAuth, MessageController.userMessages);
api.get('/messages', md_auth.ensureAuth, MessageController.getEmmitMessages);
api.get('/unviewed-messages', md_auth.ensureAuth, MessageController.getUnviewedMessages);
api.put('/set-viewed-messages', md_auth.ensureAuth, MessageController.setViewedMessages);

api.get('/getMessageGeneral/:pride', md_auth.ensureAuth, MessageController.getMessageGeneral);

module.exports = api;