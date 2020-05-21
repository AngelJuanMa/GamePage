'use strict'

var express = require('express');
var SalaController = require('../controllers/sala');
var md_auth = require('../middlewares/authenticated');
var api = express.Router();
var multipart = require('connect-multiparty');

api.get('/prueba', SalaController.prueba);
api.post('/ready', md_auth.ensureAuth, SalaController.ready);
api.put('/updateSala', md_auth.ensureAuth, SalaController.updateSala);
api.get('/getSala/:num', md_auth.ensureAuth, SalaController.getSala);
api.put('/goOutSala', md_auth.ensureAuth, SalaController.goOutSala);
api.get('/findUserInSala', md_auth.ensureAuth, SalaController.findUserInSala);


module.exports = api;