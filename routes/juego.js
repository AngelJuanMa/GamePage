'use strict'

var express = require('express');
var JuegoController = require('../controllers/juego');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');


api.post('/juego', md_auth.ensureAuth, JuegoController.saveMove);
api.get('/getMove/:num', md_auth.ensureAuth, JuegoController.getMove);


module.exports = api;