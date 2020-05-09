'use strict'

var path = require('path');
var fs = require('fs');

var User = require('../models/user');
var Follow = require('../models/follow');

var Follow_Request = require('../models/followRequest');

function followRequest(req, res){
	var follow_request = new Follow_Request();
	var userId = req.user.sub;
	var followed = req.body.followed;
	
	User.findOne({nick: followed}).exec((err, user) => {
		if(err) error(res);
		if(user) followed = user._id;
		if(userId == user._doc._id) return res.status(400).send({message: 'No puedes agregarte a tí mismo'});
		if(!followed) return res.status(500).send({message: 'Necesitas enviar el campo del usuario a seguir'});
		
		follow_request.user = userId;
		follow_request.followed = followed;
	
		// //Comprobar si el usuario ya ha mando una solicitud 
		Follow_Request.findOne({user: userId, followed: followed}).exec((err, follow) => {
			if(follow) return res.status(400).send({message: 'No puedes enviar varias solicitudes al mismo usuario'});
			if(err) error(res);
	
			// Comprobar si el usuario ya sigue al usuario
			Follow.findOne({user: userId, followed:followed}).exec((err,user_f) => {
				if(user_f) return res.status(400).send({message: 'No puedes enviar una solicitud cuando ya lo has agregado'});
				if(err) error(res);
	
				// Guardar la peticion
				follow_request.save((err, follow_requestStored) => {
					if(err) return res.status(500).send({message: 'Error al guardar el seguimiento'});
					if(!follow_requestStored) return res.status(404).send({message: 'El seguimiento no se ha guardado'});
			
					return res.status(200).send({follow_request:follow_requestStored});
				});
			});
		});
		
	});
	
}

function error(res){
	return res.status(500).send({message: 'Ha ocurrido un error al mandar la solicitud'});
}

function getFollowedUsersRequest(req, res){
	var userId = req.user.sub;
	
	Follow_Request.find({followed: userId}).populate('user').exec((err, follows) => {
		if(err) return res.status(500).send({message: 'Error en el servidor'});
		if(!follows) return res.status(404).send({message: 'No te sigue ningun usuario'});
		if(follows.length != 0){
			return res.status(200).send({follows});
		}
		
	});
}

function doFollowReq(req, res){
	var user = req.params.followed;
	var followed = req.user.sub;
	Follow_Request.findOne({'followed': followed, 'user': user}).populate('user').exec((err, following) => {
		if(err) return res.status(500).send({message: 'Error en el servidor'});
		if(!following) return res.status(404).send({message: 'No te sigue ningun usuario'});
		if(req.params.follow == 'true'){
			saveFollow(followed, user).then((follow) =>{
				deleteFollowRequest(followed, user).then((deleted) =>{
				return res.status(200).send({
					follow, 
					message: 'El follow req se ha eliminado'
				});
			});
		});
		}else if(req.params.follow == 'false'){
			deleteFollowRequest(followed, user).then((deleted) =>{
			return	res.status(200).send({message: 'El follow req se ha eliminado'});
			});
		} 
	});
}

async function deleteFollowRequest(followed, user){
	await Follow_Request.findOne({'user':user, 'followed':followed}).remove(err => {
		return 'bien';
	});
}


async function saveFollow(followed, user){
	var follow = new Follow();
	follow.user = user;
	follow.followed = followed;

	await follow.save((err, followStored) => {
		return {follow:followStored};
	});

}

function getFollows(req, res){
	var userId = req.user.sub;

	Follow.find({'user':userId}).populate('followed').select({'password':0}).exec((err, following)=> {
		if(err) return res.status(500).send({message: 'Error al obtener follows'});

		Follow.find({'followed':userId}).populate('user').select({'password':0}).exec((err, followed) => {
			if(err) return res.status(500).send({message: 'Error al obtener follows'});

			var friends = followed.concat(following);
			friends.sort(function (a, b) {return a._doc.created_at - b._doc.created_at});

			return res.status(200).send({friends});
	});
});
}

function deleteFollow(req, res){
	var friend = req.params.friend;
	console.log(friend);

	Follow.findOne({_id: friend}).remove((err) => {
		if(err) return res.status(400).send({message: 'No se ha podido eliminar'});
		
		return res.status(200).send({message: 'Usuario borrado de la lista'});
	});
		
}


module.exports = {
	followRequest,
	doFollowReq,
	getFollowedUsersRequest,
	deleteFollow,
	getFollows
}