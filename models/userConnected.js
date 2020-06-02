'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserConnectedSchema = Schema({
		userId: { type: Schema.ObjectId, ref: 'User' },
		socketId: String,
		created_at: String
});

module.exports = mongoose.model('UserConnected', UserConnectedSchema);