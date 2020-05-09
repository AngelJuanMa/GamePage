'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TatetiSchema = Schema({
		created_at: String,
		campo: String,
		num: Number,
		user: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Tateti', TatetiSchema);