'use strict'
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var jwt = require('../services/jwt');
var User = require('../models/user');
var Sala = require('../models/sala');

async function changeState(req, sala){
    var userId = req.user.sub;
    var sala = sala;

        await User.findByIdAndUpdate(userId, {sala: sala},{new:true}, (err, userUpdated) => {
            return userUpdated
        });
} 

async function createSala(req, res){
    var sala = new Sala();
    var body = req.body;
    var userId = req.user.sub;
    sala.game = "Tateti";
    if(body.game) sala.game = body.game;
    sala.password = null;
    if(body.password) sala.password = body.password;
    sala.name = "Unete";
    if(body.name) sala.name = body.name;
    sala.master = userId;
    sala.red_1 = userId;
    sala.red_2 = null;
    sala.blue_1 = null;
    sala.blue_2 = null
    sala.redB_1 = true;
    if(body.redB_2) sala.redB_2 = true;
    else sala.redB_2 = false;
    if(body.blueB_1) sala.blueB_1 = true;
    else sala.blueB_1 = false;
    if(body.blueB_2) sala.blueB_2 = true;
    else sala.blueB_2 = false;
    sala.blueB
    sala.num = 1;
    
    var i = 0; 
    var num = 0;
    while( i == num){
    ++i;
    var laSala = await Sala.findOne({num:i}).exec((err, lasSalas) => { 
        return lasSalas;
    });
    if(laSala == null) sala.num = i;
    else num++;
    }

    var checker = await Sala.find({master: userId}).exec((err, lasSalas) => {return lasSalas});
    if(checker && checker.length >= 1) return res.status(400).send({message: 'Ya te encuentras en una sala'});
    
    // Cifra la password
    if(sala.password != null){
        bcrypt.hash(sala.password, null, null, (err, hash) => {
            sala.password = hash;
    
            return registerSala(req, sala,res);
        });
    }else{
        return registerSala(req, sala,res);
    }
}  

function registerSala(req,sala,res){
    sala.save((err, salaStored) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!salaStored) res.status(404).send({message: 'No se ha registrado el usuario'});
        changeState(req ,sala.num).then((value)=> {
            return res.status(200).send({
                sala: salaStored,
                user: value
            });
        });
    }); 
}

async function getSalas(req, res){  
    var pagination = 16;
    var page = 1;
    // if(req.params.page) page = req.params.page;
    var ordenar = 'num';
    if(req.params.ordenar) ordenar = req.params.ordenar;
    var allSalas = await Sala.find().sort(ordenar).limit(pagination).skip((page - 1 ) * pagination).exec((err, sala) => {
        if(err) return res.status(400).send({message: 'No hay salas aún'});

        return sala;
});
    var allSalas_clean = [];

    allSalas.forEach(sala => {
        allSalas_clean.push(sala);
    });

    return res.status(200).send({allSalas_clean}); 
}


async function joinSala(req, res){
    var userId = req.user.sub;
    var num = req.params.num;

    var sala = await Sala.findOne({num: num}).exec((err,sala) => {
        if(err) return res.status(500).send({message: 'Hubo un error mientras se intentaba unir'});
        else if(!sala) return res.status(404).send({message: 'No se a encontrado la sala'});
        else return sala;
    }); 
    // preguntar si el usuario ya se encuentra dentro
    if(sala.red_1 == userId) return error(res);
    else if(sala.red_2 == userId) return error(res);
    else if(sala.blue_1 == userId) return error(res);
    else if(sala.blue_2 == userId) return error(res);
 
    //elegir la posicion al entrar
    if(sala.red_1 == null  && sala.redB_1) sala.red_1 = userId;
    else if(sala.blue_1 == null && sala.redB_2) sala.blue_1 = userId;
    else if(sala.red_2 == null  && sala.blueB_1) sala.red_2 = userId;
    else if(sala.blue_2 == null && sala.blueB_2) sala.blue_2 = userId;
    else return res.status(500).send({message: 'La sala se encuentra llena'})

        //identificar contraseña
        if(sala.password != null){
        bcrypt.compare(req.body.password, sala.password, (err, check) => {
            if(check){
                return doJoin(sala, res);
            }else{
                    return res.status(404).send({message: 'La contraseña es incorrecta'});
            }
        });
}else{
    return doJoin(sala, res);
}   
}

function doJoin(sala, res){
    Sala.findByIdAndUpdate(sala._id, sala,{new:true}, (err, salaUpdated) =>{
        if(err) return res.status(500).send({message: 'Error en la petición'});
        else if(!salaUpdated) return res.status(404).send({message: 'No se ha podido actualizar la sala'});
        
        return res.status(200).send({sala: salaUpdated});
    });
}

async function joinSalaQuick(req, res){
    var userId = req.user.sub;
    console.log(req.user.sala);

    Sala.find({password: null}).exec((err,salas) => {
        if(err) return res.status(500).send({message: 'Hubo un error mientras se intentaba unir'});
        else if(!salas) return res.status(404).send({message: 'No se a encontrado la sala'});
        
        for (var sala of salas) {
            // preguntar si el usuario ya se encuentra dentro
            if(sala.red_1 == userId) return error(res);
            else if(sala.red_2 == userId) return error(res);
            else if(sala.blue_1 == userId) return error(res);
            else if(sala.blue_2 == userId) return error(res);
            
            //elegir la posicion al entrar
            if(sala.red_1 == null  && sala.redB_1){ sala.red_1 = userId;break;} 
            else if(sala.blue_1 == null && sala.redB_2)  {sala.blue_1 = userId; break;}
            else if(sala.red_2 == null  && sala.blueB_1) { sala.red_2 = userId; break;}
            else if(sala.blue_2 == null && sala.blueB_2) {sala.blue_2 = userId; break;}
        }

        Sala.findByIdAndUpdate(sala._id, sala,{new:true}, (err, salaUpdated) =>{
            if(err) return res.status(500).send({message: 'Error en la petición'});
            else if(!salaUpdated) return res.status(404).send({message: 'No se ha podido actualizar la sala'});

            User.findByIdAndUpdate(req.user.sub, {sala: sala._id}, {new:true} , (err, userUpdated) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});

                return res.status(200).send({sala: salaUpdated, user:userUpdated});
            });
        });
    }); 
    
}

function error(res){
    return res.status(400).send({message: 'Ya te encuentras en una sala'});
}

module.exports = {
    changeState,
    createSala,
    getSalas,
    joinSala,
    joinSalaQuick
}