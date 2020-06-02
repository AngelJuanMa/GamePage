'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = Schema({
		description: String,
		nick: String,
		email: String,
		password: String,
		created_at: String,
		politics: Boolean,
		sala: { type: Schema.ObjectId, ref: 'Sala' },
		game: String,
		ready: Boolean,
		pride: { type: Schema.ObjectId, ref: 'Pride' },
		wins: Number,
		lose: Number,
		color: String,
		color2: String,
		color3: String,
		deg: Number
});

module.exports = mongoose.model('User', UserSchema);