'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MessageSchema = Schema({
		text: String,
		viewed: String,
		created_at: String,
		emitter: { type: Schema.ObjectId, ref:'User' },
		receiver: String,
		pride: String
});

module.exports = mongoose.model('Message', MessageSchema);