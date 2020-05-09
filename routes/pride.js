'use strict'

var express = require('express');
var PrideController = require('../controllers/pride');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');


api.post('/savePride', md_auth.ensureAuth, PrideController.savePride);
api.get('/getPride/:id', md_auth.ensureAuth, PrideController.getPride);
api.get('/getMyPride', md_auth.ensureAuth, PrideController.getMyPride);
api.get('/getPrides/:name', md_auth.ensureAuth, PrideController.getPrides);
api.post('/applyPride', md_auth.ensureAuth, PrideController.applyPride);
api.get('/getPrideRequests', md_auth.ensureAuth, PrideController.getPrideRequests);
api.delete('/deleteRequest/:userId', md_auth.ensureAuth, PrideController.deleteRequest);
api.get('/joinPride/:userId', md_auth.ensureAuth, PrideController.joinPride);
api.get('/getMembers/:prideId', md_auth.ensureAuth, PrideController.getMembers);
api.put('/deleteMember', md_auth.ensureAuth, PrideController.deleteMember);

module.exports = api;