'use strict'
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');

var User = require('../models/user');
var jwt = require('../services/jwt');

// Registro
function saveUser(req, res){
	var params = req.body;
	var user = new User();

	if(params.password &&  params.nick && 
	   params.email && params.politics){

		if(params.nick.length > 20) return res.status(400).send({message: 'El nombre del usuario es demasiado largo'});
		user.nick = params.nick;
		user.email = params.email;
		user.description = null;
		user.created_at = moment().unix();
		user.politics = true;
		user.privacity = false;
		user.sala = null;
		user.game = null;
		user.ready = false;
		user.pride = null;
		user.lose = 0;
		user.wins = 0;

		// Controlar usuarios duplicados
		User.find({ $or: [
				 {email: user.email.toLowerCase()},
				 {nick: user.nick.toLowerCase()}
		 ]}).exec((err, users) => {
		 	if(err) return res.status(500).send({message: 'Error en la petición de usuarios'});

		 	if(users && users.length >= 1){
		 		return res.status(200).send({message: 'El usuario que intentas registrar ya existe!!'});
		 	}else{

		 		// Cifra la password y me guarda los datos 
				bcrypt.hash(params.password, null, null, (err, hash) => {
					user.password = hash;

					user.save((err, userStored) => {
						if(err) return res.status(500).send({message: 'Error al guardar el usuario'});

						if(userStored){
							res.status(200).send({user: userStored});
						}else{
							res.status(404).send({message: 'No se ha registrado el usuario'});
						}

					});
				});

		 	}
		 });
		
	}else{
		res.status(200).send({
			message: 'Envia todos los campos necesarios!!'
		});
	}
}


// Login
function loginUser(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;
	var nick = params.nick;
if(email.indexOf('@') != -1){
User.findOne({email: email}, (err, user) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});

		if(user){
			bcrypt.compare(password, user.password, (err, check) => {
				if(check){
					
					if(params.gettoken){
						//generar y devolver token
						return res.status(200).send({
							token: jwt.createToken(user)
						});
					}else{
						//devolver datos de usuario
						user.password = undefined;
						return res.status(200).send({user});
					}
					 
				}else{
					return res.status(404).send({message: 'El usuario no se ha podido identificar'});
				}
			});
		}else{
			return res.status(404).send({message: 'El usuario no se ha podido identificar!!'});
		}
	});
}else{
	User.findOne({nick: nick}, (err, user) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});

		if(user){
			bcrypt.compare(password, user.password, (err, check) => {
				if(check){
					
					if(params.gettoken){
						//generar y devolver token
						return res.status(200).send({
							token: jwt.createToken(user)
						});
					}else{
						//devolver datos de usuario
						user.password = undefined;
						return res.status(200).send({user});
					}
					
				}else{
					return res.status(404).send({message: 'El usuario no se ha podido identificar'});
				}
			});
		}else{
			return res.status(404).send({message: 'El usuario no se ha podido identificar!!'});
		}
	});
}

}

function getUsers(req, res){
	var sala = null;

	User.find({sala: sala}).select({'password': 0}).exec((err, users ) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!users) return res.status(400).send({message: 'No hay usuarios en el lobby'});

		return res.status(200).send({users});
	})
}

module.exports = {
	saveUser,
	loginUser,
	getUsers
}