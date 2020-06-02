'use strict'

var User = require('../models/user');
var Follow = require('../models/follow');

var Follow_Request = require('../models/followRequest');

function followRequest(req, res){
	var follow_request = new Follow_Request();
	var userId = req.user.sub;
	var followed = req.body.followed;
	if(!req.body.followed) return error(res, "No has llenado el campo", 400)
		 
	User.findOne({nick: followed}).exec((err, userFound) => {
		if(err || !userFound) return error( res,"No se ha encontrado un usuario",400);
		followed = userFound._id; 
		if(userId == userFound._doc._id) return error(res,"No puedes agregarte a tí mismo", 400)
		
		follow_request.user = userId;
		follow_request.followed = followed;
	
		// //Comprobar si el usuario ya ha mando una solicitud 
		Follow_Request.findOne({ $or: [
			{user: userId, followed: followed},
			{user: followed, followed: userId}
				]}).exec((err, follow) => {

				if(follow) return error(res, "Ya se ha mandado una solicitud", 400)
				if(err) return error(res, "Ha sucedido un error en el servidor", 500);
				// Comprobar si el usuario ya sigue al solicitado
				Follow.findOne({ $or: [
					{user: followed, followed: userId},
					{user: userId, followed: followed}
						]}).exec((err,user_f) => {

					if(user_f) return error(res, "No puedes enviar una solicitud cuando ya lo has agregado",400)
					if(err) return error(res,  "Ha sucedido un error en el servidor", 500);
					// Guardar la peticion
					follow_request.save((err, follow_requestStored) => {
						if(err) return error(res,  "Ha sucedido un error al intentar agregar", 500);
						if(!follow_requestStored) return error(res, "No se ha podido agregar", 500)
				
						return res.status(200).send({follow_request:follow_requestStored});
					});
				});
		});
	});
	
}

function error(res, error, status){
	res.status(status).send({message: error});
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
		if(!following || err) return res.status(500).send({message: 'Error al obtener follows'});

		Follow.find({'followed':userId}).populate('user').select({'password':0}).exec((err, followed) => {
			if(!followed || err) return res.status(500).send({message: 'Error al obtener follows'});
			
			if(following != null){
				for (const friend of following) {
					delete friend._doc.followed._doc.email 
					delete friend._doc.followed._doc.password 
					delete friend._doc.followed._doc.created_at
				}
			}
			
			
			if(followed != null){
				for (const friend of followed) {
					delete friend._doc.user._doc.email
					delete friend._doc.user._doc.password
					delete friend._doc.user._doc.created_at
				}
			}
			

			var friends = followed.concat(following);
			friends.sort(function (a, b) {return a._doc.created_at - b._doc.created_at});

			return res.status(200).send({friends});
	});
});
}

function deleteFollow(req, res){
	var friend = req.params.friend;

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