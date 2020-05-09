'use strict'

var moment = require('moment');
// var jwt = require('../services/jwt');

var Tateti = require('../models/tateti');
// var User = require('../models/user');

function saveMove(req, res){
	
	var params = req.body;
	var tateti = new Tateti();
	tateti.user = req.user.sub;
	tateti.num = params.num;
	tateti.campo = params.campo;
	tateti.created_at = moment().unix();
		
		//Ese campo ya ha sido elegido?
		Tateti.find({num: tateti.num,campo: tateti.campo}).exec((err , moved) => {
			if(err) return res.status(500).send({message: 'Error en la petición'});
			if(moved && moved.length >= 1) return res.status(500).send({message: 'Ese campo ya ha sido elegido!!'});

			//El usuario ya ha movido?
			Tateti.findOne({num: tateti.num,user: tateti.user}).sort('-created_at').exec((err , moveRepet) => {
				if(err) return res.status(500).send({message: 'Error en la petición'});
				if(moveRepet && moveRepet.length >= 1) return res.status(500).send({message: 'Tu ya has movido'});

				//Guarda los valores
				tateti.save((err, moveStored) => {
					if(err) return res.status(500).send({message: 'Error al guardar el usuario'});
					if(moveStored){
						res.status(200).send({tateti: moveStored});
						}else{
							res.status(404).send({message: 'No se ha registrado el usuario'});
						}

					});
				
			});
		});
}

function getMove(req, res){

	var num = req.params.num;
	var user = req.user.sub;

	//cada 1 seg busca si el otro jugador ya guardo un movimiento
	var check =	setInterval(function(){

		Tateti.findOne({num: num}).sort('-created_at').exec((err , move) => {
			if(err) return res.status(500).send({message: 'Error en la petición'});
			if(!move) return res.status(500).send({message: 'No a llegado nada'});
			if(user != move.user)
				{
				clearInterval(check);
				return res.status(200).send({move});
				}
	 	});
	}, 1000);
}



module.exports = {
	saveMove,
	getMove
}