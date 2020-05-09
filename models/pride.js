'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PrideSchema = Schema({
    name: String,
    master: { type: Schema.ObjectId, ref:'User' }
});

module.exports = mongoose.model('Pride', PrideSchema);