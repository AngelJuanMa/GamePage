'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');

api.post('/confirmEmail', UserController.checkUser);
api.post('/register', UserController.userEmailCheck);
api.post('/login', UserController.loginUser);
api.get('/getUsers',  md_auth.ensureAuth, UserController.getUsers);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);

module.exports = api;