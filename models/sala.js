'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SalaSchema = Schema({
    num: Number,
    players: Number,
    game: String,
    name: String,
    password: String,
    red_1: { type: Schema.ObjectId, ref: 'User' },
    red_2: { type: Schema.ObjectId, ref: 'User' },
    blue_1: { type: Schema.ObjectId, ref: 'User' },
    blue_2: { type: Schema.ObjectId, ref: 'User' },
    redB_1: Boolean,
    redB_2: Boolean,
    blueB_1: Boolean,
    blueB_2: Boolean,
    master: { type: Schema.ObjectId, ref: 'User' },
    levelRef: {
        minLevel: Number,
        maxLevel: Number
    }
});

module.exports = mongoose.model('Sala', SalaSchema);