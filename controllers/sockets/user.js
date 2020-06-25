'use strict'

var moment = require('moment');
var express = require('express');
const Http = require("http").Server(express);
const io = require("socket.io")(Http);

var UserConnected = require("../../models/userConnected");


io.on("connection", socket => {
    const _id = socket.id;

    // Save user Connected
    socket.on("user", (user) => {
        if (user) socket.join(_id);

        var userConnected = new UserConnected
        userConnected.userId = user._id
        userConnected.socketId = _id
        userConnected.created_at = moment().unix();

        UserConnected.find({ userId: user._id }).exec((err, userR) => {
            if (err) return error(_id, "c");
            if (userR && userR.length >= 1) return;

            userConnected.save((err, UserConnectedStored) => {
                UserConnected.findOne({ userId: user._id }).populate('userId').exec((err, userF) => {
                    if (err) return error(_id, "c");
                    io.sockets.emit("userConnected", userF);
                })
            });
        });
    });

    socket.on("joiningSala", (userId, salaNum) => {
        console.log("2")
        console.log(userId)
        console.log(salaNum)
        UserConnected.findOne({ userId: userId }).exec((err, user) => {
            if (err || !user) return io.to(_id).emit("error", "Ha sucedido un error en los mensajes, intente refrescando la pagina");
            socket.join(salaNum);
            console.log("3")
            socket.broadcast.to(salaNum).emit('joinedSala', user);
        });
    })

    socket.on("creatingSala", (userId, salaNum) => {
        console.log("1")
        console.log(userId)
        console.log(salaNum)
        UserConnected.findOne({ userId: userId }).exec((err, user) => {
            if (err || !user) return io.to(_id).emit("error", "Ha sucedido un error en los mensajes, intente refrescando la pagina");
            socket.join(salaNum);
            console.log("user")
        });
    })


    //Disconnect user
    socket.on('disconnect', (data) => {
        UserConnected.findOne({ socketId: _id }).populate('userId').exec((err, user) => {
            if (err || !user) return error(_id, "d");

            user.remove((err, userRemoved) => {
                if (err || !userRemoved) return error(_id, "d");
                io.sockets.emit("userDisconnected", user.userId._doc.nick);
            })
        })
    });

    //Disconnect user
    socket.on("userDisconnect", (userId) => {
        UserConnected.findOne({ userId: userId }).populate('userId').exec((err, user) => {
            if (err | !user) return error(_id, "d");

            user.remove((err, userRemoved) => {
                if (err || !userRemoved) return error(_id, "d");
                io.sockets.emit("userDisconnected", user.userId._doc.nick);
            })
        })
    });
});

function error(_id, data) {
    if (data == "d") io.to(_id).emit("error", "Ha sucedido un error al intentar desconectarse");
    if (data == "c") io.to(_id).emit("error", "Ha sucedido un error al intentar conectarse");
}

Http.listen(3000, () => {
    console.log("Listening user sockets at :3000...");
});

var api = express.Router();

module.exports = api;