'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');

api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/getUsers',  md_auth.ensureAuth, UserController.getUsers);

module.exports = api;