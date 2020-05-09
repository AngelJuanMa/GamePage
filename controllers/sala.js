'use strict'

var User = require('../models/user');
var Sala = require('../models/sala');


function prueba(req,res){
    return res.status(200).send({message: 'Hola desde sala'});
}

function ready(req, res){
    var userId = req.user.sub;

    User.findByIdAndUpdate(userId, {ready: false},{new:true}, (err, userUpdated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

        return res.status(200).send({user: userUpdated});
    });
}

function updateSala(req,res){
    var userId = req.user.sub;
    var update = req.body;

    Sala.findOne({master: userId}, (err, sala) => {
            delete update.master;
            delete update.num;
            delete update.players;
            delete update.password;
            
            sala.update(update, {new:true}, (err, salaUpdated) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!salaUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
        
                return res.status(200).send({salaUpdated});
            });
    });
}

function getSala(req, res){ 
    Sala.findOne({num: req.params.num}, (err, sala) => {
        if(err) return res.status(400).send({message: 'No hay salas aún'});
        return res.status(200).send({sala});
    }); 
}

function goOutSala(req, res){
    let userId = req.user.sub

    User.findById(userId).exec((err, user)  =>{   
        console.log(user);

        User.findByIdAndUpdate(userId, {sala: null}, {new:true} , (err, userUpdated) => {
            if(err) return res.status(500).send({message: 'Error en la petición'});
            
            Sala.findByIdAndUpdate(userId, {sala: null}, {new:true} , (err, salaUpdated) => {
    
            return res.status(200).send({user:userUpdated});
            });
        });
    });
}

module.exports = {
    prueba,
    ready,
    updateSala, 
    getSala,
    goOutSala
}