'use strict'

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Like = require('../models/like');

function saveLike(req, res){
	var params = req.body;

	var like = new Like();
	like.user = req.user.sub;
	like.liked = params.liked;
	like.publication = params.publication;

	like.save((err, likeStored) => {
		if(err) return res.status(500).send({message: 'Error al guardar el like'});

		if(!likeStored) return res.status(404).send({message: 'El like no se ha guardado'});

		return res.status(200).send({like:likeStored});
	});
}

function deleteLike(req, res){
	var userId = req.user.sub;
	var likeId = req.params.id;

	Like.find({'user':userId, 'liked':likeId}).remove(err => {
		if(err) return res.status(500).send({message: 'Error al dejar el like'});

		return res.status(200).send({message: 'El like se ha eliminado!!'});
	});
}




module.exports = {
	saveLike,
	deleteLike
}