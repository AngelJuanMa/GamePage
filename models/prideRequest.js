'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PrideRequestSchema = Schema({
    user: { type: Schema.ObjectId, ref:'User' },
    name: String
});

module.exports = mongoose.model('PrideRequest', PrideRequestSchema);