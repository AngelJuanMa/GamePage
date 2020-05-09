'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Message = require('../models/message');

function probando(req, res){
	res.status(200).send({message: 'Hola que tal desde los mensajes privados'});
}

function saveMessage(req, res){
	var params = req.body;

	if(!params.text) return res.status(200).send({message: 'Envia los datos necesarios'});

	var message = new Message();
	message.emitter = req.user.sub;
	message.text = params.text;
	message.created_at = moment().unix();
	message.viewed = 'false';

	if(!params.receiver) message.receiver = false;
	else message.receiver = params.receiver;

	if(params.pride && req.user.pride) message.pride = req.user.pride;
	else if(params.pride) return res.status(400).send({message: 'No tienes un clan'});
	else message.pride = false;

	message.save((err, messageStored) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!messageStored) return res.status(500).send({message: 'Error al enviar el mensaje'});

		return res.status(200).send({message: messageStored});
	});
}

function getMessageGeneral(req, res){
	let pride = req.params.pride;
	if(pride == 'true') pride = req.user.pride
	
	Message.find({pride: pride}).populate('emitter',  'name  nick _id').exec((err, messages) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!messages) return res.status(500).send({message: 'Error al obtener mensaje'})
	
		let messagesArr = [];
		let messagesPrideArr = [];
		for (let message of messages) {
			if(message._doc.receiver == 'false'){
				if(pride != 'false') messagesPrideArr.push(message);
				else messagesArr.push(message);
			} 
		}
		

		return res.status(200).send({messagesArr, messagesPrideArr});
	})
}

function getReceivedMessages(req, res){
	var userId = req.user.sub; 

	Message.find({receiver: userId}).populate('emitter', 'name  nick _id').sort('-created_at').exec((err, messages) =>{
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!messages) return res.status(404).send({message: 'No hay mensajes'});

		

		return res.status(200).send({messages});
	});
}

function userMessages(req, res){
	var userId = req.user.sub;
	var friend = req.params.friend;

	Message.find({receiver: friend, emitter: userId}).sort('-created_at').populate('emitter').exec((err, messageEmitted) =>{
		
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!messageEmitted) return res.status(404).send({message: 'No hay mensajes'});

		Message.find({emitter: friend, receiver: userId}).sort('-created_at').populate('emitter').exec((err, messageReceived) =>{
			if(err) return res.status(500).send({message: 'Error en la petición'});
			if(!messageReceived) return res.status(404).send({message: 'No hay mensajes'});
			var messages = messageEmitted.concat(messageReceived);
			messages.sort(function (a, b) {return a._doc.created_at - b._doc.created_at});
			
		return res.status(200).send({messages});
		});
	});
}

function getEmmitMessages(req, res){
	var userId = req.user.sub;

	Message.find({emitter: userId}).populate('emitter receiver', 'name nick _id').sort('-created_at').exec((err, messages) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!messages) return res.status(404).send({message: 'No hay mensajes'});

		return res.status(200).send({messages});
	});
}

function getUnviewedMessages(req, res){
	var userId = req.user.sub;

	Message.count({receiver:userId, viewed:'false'}).exec((err, count) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		return res.status(200).send({
			'unviewed': count
		});
	});
}

function setViewedMessages(req, res){
	var userId = req.user.sub;

	Message.update({receiver:userId, viewed:'false'}, {viewed:'true'}, {"multi":true}, (err, messagesUpdated) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		return res.status(200).send({
			messages: messagesUpdated
		});
	});
}

module.exports = {
	probando,
	saveMessage,
	getReceivedMessages,
	userMessages,
	getEmmitMessages,
	getUnviewedMessages,
	setViewedMessages,
	getMessageGeneral
};