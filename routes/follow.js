'use strict'

var express = require('express');
var FollowController = require('../controllers/follow');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
 
// api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
// 
// api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers);
// api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowedUsers);
// api.get('/get-my-follows/:followed?', md_auth.ensureAuth, FollowController.getMyFollows);


api.post('/followReq', md_auth.ensureAuth, FollowController.followRequest);
api.delete('/doFollowReq/:followed/:follow', md_auth.ensureAuth, FollowController.doFollowReq);
api.get('/followedRequest', md_auth.ensureAuth, FollowController.getFollowedUsersRequest);
api.get('/getFollows', md_auth.ensureAuth, FollowController.getFollows);
api.delete('/deleteFollow/:friend', md_auth.ensureAuth, FollowController.deleteFollow);

module.exports = api; 