'use strict'

var moment = require('moment');
var express = require('express');
const Http = require("http").Server(express);
const io = require("socket.io")(Http);

var UserConnected = require("../../models/userConnected");
var Pride = require("../../models/pride")
var PrideRequest = require("../../models/prideRequest")

io.on('connection', socket => {
    const _id = socket.id

    socket.on("user", (userId) => {
        if(userId) socket.join(userId);
        else return error(_id, "Ha habido un error con tu usuario");

        UserConnected.findOne({userId: userId}).exec((err, userC) =>{
            if(err) console.log(err)
            if(!userC || err) return error(_id, "Ha sucedido un error en la conexion");
            

            socket.on("applyPride", (user, prideName ,prideReq) => {
                console.log("2")
                if(user.pride) return error(_id, "Ya te encuentras en un clan");
                delete user.password
                delete user.email

                //Existe el pride
                Pride.findOne({name: prideName}).exec((err, pride)  =>{
                    if(err){
                        console.log(err)
                        return error(_id, "Ha ocurrido un error en el servidor");
                    }
                    if(!pride) return error(_id, "No se ha encontra un clan");
                    
                    PrideRequest.findOne({user: user._id}).exec((err, prideRequests)  =>{
                        if(err){
                            console.log(err)
                            return error(_id, "Ha ocurrido un error en el servidor");
                        }
                        if(!prideRequests) return error(_id, "No has solicitado unirte");
                        socket.broadcast.to(pride._doc.master).emit("request", prideReq, user);
                    });
                });    
            });    
            
            socket.on("requestAccept", (userReq, prideId) => {
                socket.broadcast.to(userReq._id).emit("requestAceppted", prideId);
            })


        });
    });
})

function error(_id, typeError){
    io.to(_id).emit("error", typeError);
}

Http.listen(3002, () => {
    console.log("Listening pride sockets at :3002..."); 
}); 

var api = express.Router();

module.exports = api;
