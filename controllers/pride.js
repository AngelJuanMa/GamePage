'use strict'

var User = require('../models/user');
var Pride = require('../models/pride');
var PrideRequest = require('../models/prideRequest');
var jwt = require('../services/jwt');

async function savePride(req, res){
    let pride = new Pride
    pride.name = req.body.name
    pride.master = req.user.sub

    if(req.user.pride != null) return res.status(400).send({message: 'Ya te encuentras en un clan'})
    if(!req.user.sub || !req.body.name) return res.status(400).send({message: 'No se ha enviado un nombre'})


    Pride.findOne({name: pride.name}).exec((err, onePride)  =>{
        if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'})
        if(onePride) return res.status(400).send({message: 'El nombre ingresado ya existe'})

        pride.save((err, prideStored) => {
            if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'});
            if(!prideStored) return res.status(500).send({message: 'Ha occurido un error al intentar registar un clan'});
        
            User.findByIdAndUpdate(req.user.sub, {pride: prideStored._doc._id}, (err, userUpdated) => {
				if(err) return res.status(500).send({message: 'Error en la petición'})
                if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'})
                

                return res.status(200).send({prideStored, token: jwt.createToken(req.user)});
            });
        });
    });
}

function getPride(req, res){ 
    let id = req.params.id

    Pride.findOne({_id: id}).exec((err, pride)  =>{
        if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'});
        if(!pride) return res.status(500).send({message: 'No se ha encontrado el clan'});

        User.find({pride: id}).exec((err, users) =>{
            if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'});
            if(!users) return res.status(500).send({message: 'El clan a sido cerrado'});

            return res.status(200).send({users});
        })
    });
}

function getMyPride(req, res){ 
    let pride = req.user.pride

    Pride.findOne({_id: pride}).exec((err, pride)  =>{
        if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'});
        if(!pride) return res.status(500).send({message: 'No se ha encontrado el clan'});
    
        return res.status(200).send({pride});
    });
}

async function getPrides(req, res){ 
    let name = req.params.name

    let clanes = await Pride.find().exec((err, prides)  =>{
        if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'})
        if(!prides) return res.status(500).send({message: 'No se han encontrado clanes'})
        
        return prides
    });
    let clanesArr = []
    let i = 0;
    for (const clan of clanes) {
        if(clan._doc.name.indexOf(name) != -1){
            clanesArr.push(clan._doc)
            ++i
        } 
    }
    if(i == 0) return res.status(404).send({message: 'No se han encontrado clanes con ese nombre'})

    return res.status(200).send({clanesArr})
}

function applyPride(req, res){
    let prideRequest  = new PrideRequest
    prideRequest.name = req.body.name
    prideRequest.user = req.user.sub

    //El usuario sigue un pride
    if(req.user.pride) return res.status(400).send({message: 'Ya te encuentras en un clan'})

    //Existe el pride
    Pride.findOne({name: req.body.name}).exec((err, pride)  =>{
        if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'})
        if(!pride) return res.status(500).send({message: 'No se ha encontrado el clan'})
        
        if(pride._doc.master == req.user.sub) return res.status(200).send({message: 'Tu eres el master'});

        //Ya el usuario solicito una request
        PrideRequest.findOne({user: req.user.sub}).exec((err, prideRequests)  =>{
            if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'})
            if(prideRequests) return res.status(500).send({message: 'Ya te encuentras solicitando request'})
    
            prideRequest.save((err, prideReqStored) => {
                if(err) return res.status(500).send({message: 'Ha occurido un error al intentar guardar la solicitud'})
                if(!prideReqStored) return res.status(500).send({message: 'No se ha podido guardar la solicitud'})

                return res.status(200).send({prideReqStored});
            });
        });
    });
}

function getPrideRequests(req, res){
    if(!req.user.pride) return res.status(500).send({message: 'Ha occurido un error tu no tienes clan'})

    // Verificar si soy el master
    Pride.findOne({master: req.user.sub}).exec((err, pride)  =>{
        if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'})
        if(!pride) return res.status(400).send({message: 'No eres master'});

        let name = pride.name
        PrideRequest.find({name : name}).populate('user').exec((err, pridesRequest)  =>{
        if(err) return res.status(500).send({message: 'Ha ocurrido un error en el sistema'})

        for (const prideRequest of pridesRequest) {
            delete prideRequest._doc.user._doc.password
            delete prideRequest._doc.user._doc.email
        }

        return res.status(200).send({pridesRequest})
        });
    });
}

function deleteRequest(req, res){
    let master = req.user.sub
    let userId = req.params.userId

    // PREGUNTAR SI SOY EL MASTER
    Pride.findOne({master: master}).exec((err, pride)  =>{
        if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'})
        if(!pride) return res.status(400).send({message: 'Tu no eres el master del clan'})

        // PREGUNTAR SI EL ID DEL USUARIO APLICO
        PrideRequest.findOne({user: userId}).exec((err, prideReq)  =>{
            if(err) return res.status(500).send({message: 'Ha occurido un error al buscar el usuario'})
            if(!prideReq) return res.status(404).send({message: 'No se ha encontrado el usuario'})

            // ELIMINAR LA PETICION
            PrideRequest.findOne({user: userId}).remove(err => {
                if(err) return res.status(500).send({message: 'El usuario no a podido ser removido'})

                return res.status(200).send({message: 'El usuario ha sido removido'});
            });
        });
    });
}

function joinPride(req, res){
    let master = req.user.sub
    let userId = req.params.userId

    // PREGUNTAR SI SOY EL MASTER
    Pride.findOne({master: master}).exec((err, pride)  =>{
        if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'})
        if(!pride) return res.status(400).send({message: 'Tu no eres el master del clan'})

        // PREGUNTAR SI EL ID DEL USUARIO APLICO
        PrideRequest.findOne({user: userId}).exec((err, prideReq)  =>{
            if(err) return res.status(500).send({message: 'Ha occurido un error al buscar el usuario'})
            if(!prideReq) return res.status(404).send({message: 'No se ha encontrado el usuario'})

            // UNIR AL USUARIO
            User.findByIdAndUpdate(userId, {pride: pride._doc._id}, (err, userUpdated) => {
				if(err) return res.status(500).send({message: 'Error en la petición'})
                if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'})
                if(userUpdated.pride) return res.status(400).send({message: 'El usuario ya tiene un clan'})

                // ELIMINAR LA PETICION
                PrideRequest.find({user: userId}).remove(err => {
                    if(err) return res.status(500).send({message: 'El usuario no a podido ser removido'})

                    return res.status(200).send({message: 'El usuario se ha unido al clan'});
                });
			}); 
        });
    });
}

function getMembers(req, res){
    let prideId = req.params.prideId

    User.find({pride: prideId}).exec((err, users)=> {
        if(err) return res.status(500).send({message: 'Error en la petición'})
        if(!users) return res.status(404).send({message: 'No se han encontrado miembros'})

        for (const user of users) {
            user._doc.password = undefined
        }

        return res.status(200).send({users}); 
    });
}

function deleteMember(req,res){
    let memberId = req.body._id

    // Verificar si soy el master
    Pride.findOne({master: req.user.sub}).exec((err, pride)  =>{
        if(err) return res.status(500).send({message: 'Ha occurido un error en el serivor'})
        if(!pride) return res.status(400).send({message: 'No eres master'});

        User.findByIdAndUpdate(memberId, {pride: null}, (err, userUpdated) => {
            if(err) return res.status(500).send({message: 'Error en la petición'})
            if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'})
            
            return res.status(200).send({message: 'Miembro del clan eliminado'})
        });
    });
}

module.exports = {
    savePride,
    getPride,
    getMyPride,
    getPrides,
    applyPride,
    getPrideRequests,
    deleteRequest,
    joinPride,
    getMembers,
    deleteMember
}