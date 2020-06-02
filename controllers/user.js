'use strict'
require('dotenv').config(); //mandarlo a git ignore...
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var handlebars = require('handlebars');
var fs = require('fs');

var User = require('../models/user');
var Gmail = require('../models/gmail');
var UserConnected = require('../models/userConnected');
var jwt = require('../services/jwt');

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
	  user: 'gamepagein@gmail.com',
	  pass: 'G66G66corp'
	}
});

function checkUser(req, res){
	let user = req.body;
	let email = user.email;
	let nick = user.nick;
	
	duplicatedUser(email, nick, true, false, res);
}

function duplicatedUser(email, nick, check, user, res){
	if(!nick && !email && !politics) return res.status(400).send({message: 'Debes llenar todos los campos'});
	if(nick.length > 20) return res.status(400).send({message: 'El nombre del usuario es demasiado largo'});

	User.find({ $or: [
		{email: email.toLowerCase()},
		{nick: nick.toLowerCase()}
	]}).exec((err, users) => {
		if(err) return res.status(500).send({message: 'Error en la petición de usuarios'});
		
		// Controlar usuarios duplicados
		if(users && users.length >= 1) return res.status(400).send({message: 'Ya existe un usuario con el mismo nick o email'});
		else{
			if(check) confirmUser(email, nick, res);
			else saveUser(user, res);
		} 
	});
}

function confirmUser(email, nick, res){
	let gmail = new Gmail;
	gmail.email = email;

	Gmail.find({email: gmail.email}).exec((err, gmails) => {
		if(gmails && gmails.length >= 1) return res.status(400).send({message: 'Ya has enviado un email'});

		let codigoGenerated = crypto.randomBytes(3).toString('hex');

		// Cifra el codigo
		bcrypt.hash(codigoGenerated, null, null, (err, hash) => {
		gmail.codigo = hash;
	
		readHTMLFile(__dirname + '/email/register.html', function(err, html) {
			var template = handlebars.compile(html);
			var replacements = {
				nick: nick,
				code: codigoGenerated
		   };
		
		var htmlToSend = template(replacements);
		let mailOptions = {
			from: 'gamepagein@gmail.com',
			to: email,
			subject: 'Confirmar su email',
			//text: 'Tú codigo es: '+ codigoGenerated
			html: htmlToSend
		};
		
		transporter.sendMail(mailOptions, function(err, data){
			if(err) return res.status(500).send({err}); 
			else{
				gmail.save((err, emailStored) => {
					if(emailStored) res.status(200).send({gmail: emailStored});
					else res.status(404).send({message: 'No se ha podido guardar el codigo'});					
				})
			} 
		});
		
		});
	});
	});
}

function userEmailCheck(req, res){

	Gmail.findOne({email: req.body.email}).exec((err, gmail) => {
		if(err) return res.status(400).send({message: 'Los emails no coinciden'});

		if(gmail) bcrypt.compare(req.body.code, gmail._doc.codigo, (err, check) => {
			if(err) return res.status(400).send({message: 'El codigo es incorrecto'})
			
			gmail.remove((err, gmail) => {
				if(check) defineUser(req, res)
				else return res.status(404).send('Error in Request')
			});	
				
		})
		else return res.status(500).send({message: 'Ha habido un error en el servidor'})
		
	});
} 
 
function defineUser(req, res){
	let user = new User();
	user.description=null
	user.pride= null
	user.sala=null
	user.game=null
	user.ready=null
	user.wins = 0
	user.lose = 0
	user.created_at = moment().unix();
	user.nick = req.body.nick
	user.email = req.body.email
	user.politics = req.body.politics
	user.password = req.body.password
	user.color = "white";
	user.color2 = "white";
	user.color3 = "white";
	user.deg = 180;

	if(!user.politics) return res.status(400).send({message:'Necesitas confirmar el campo de privacidad.'});
	if(!user.password) return res.status(400).send({message:'Necesitas completar el campo de la contraseña.'});
	
	duplicatedUser(user.email, user.nick, false, user, res)
}

function saveUser(user, res){
	bcrypt.hash(user.password, null, null, (err, hash) => {
		user.password = hash;

		user.save((err, userStored) => {
				if(err) return res.status(500).send({message: 'Error al guardar el usuario'});

				if(userStored) res.status(200).send({user: userStored});
				else res.status(404).send({message: 'No se ha registrado el usuario'});
				
		});
	});
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

	UserConnected.find().populate('userId').exec((err, users ) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!users) return res.status(400).send({message: 'No hay usuarios en el lobby'});

		return res.status(200).send({users});
	})
}

// Edición de datos de usuario
function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;

	// borrar propiedad password
	delete update.password; 
	delete update.email

	if(userId != req.user.sub){
		return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario'});
	}

	if(update.deg >= 0 && update.deg <= 360 ){
		User.find({nick: update.nick.toLowerCase()}).exec((err, users) => {
		 
			var user_isset = false;
			users.forEach((user) => {
				if(user && user._id != userId) user_isset = true;
			});

			if(user_isset) return res.status(404).send({message: 'El nick ya se encuentra en uso'});
			
			User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
			   if(err) return res.status(500).send({message: 'Error en la petición'});

			   if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

			   return res.status(200).send({user: userUpdated});
		   });

		});
	}else{
		return res.status(400).send({message: 'Los grados deben ser de 0 a 360'});
	}

	

}


module.exports = {
	checkUser, 
	userEmailCheck,
	loginUser,
	getUsers,
	updateUser
}