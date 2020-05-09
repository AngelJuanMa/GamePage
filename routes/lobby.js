'use strict'

var express = require('express');
var LobbyController = require('../controllers/lobby');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');


api.put('/lobby', md_auth.ensureAuth, LobbyController.changeState);
api.post('/createSala', md_auth.ensureAuth, LobbyController.createSala);
api.get('/getSalas/:ordenar', md_auth.ensureAuth, LobbyController.getSalas);
api.get('/joinSala/:num', md_auth.ensureAuth, LobbyController.joinSala);
api.get('/joinSalaQuick', md_auth.ensureAuth, LobbyController.joinSalaQuick);

module.exports = api;