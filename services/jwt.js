'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_curso_desarrollar_red_social_angular';

exports.createToken = function(user){
	var payload = {
		sub: user._id,
		name: user.name,
		nick: user.nick,
		email: user.email,
		pride: user.pride,
		wins: user.wins,
		lose: user.lose,
		iat: moment().unix(),
		exp: moment().add(30, 'days').unix
	};

	return jwt.encode(payload, secret);
};