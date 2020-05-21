'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GmailSchema = Schema({
	codigo: String,
	email: String
	});

module.exports = mongoose.model('Gmail', GmailSchema);