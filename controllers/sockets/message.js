'use strict'

var moment = require('moment')
var express = require('express')
const Http = require("http").Server(express);
const io = require("socket.io")(Http);

const UserConnected = require("../../models/userConnected");

io.on("connection", socket => {
    const _id = socket.id;

    socket.on("user", (userId) => {

        UserConnected.findOne({ userId: userId }).exec((err, user) => {
            if (err || !user) return error(_id);
            if (user) socket.join(userId);

            socket.on("chatbox todos:send", (messageTodos) => {
                console.log(messageTodos)
                if (messageTodos.text) {
                    io.sockets.emit("chatbox todos:input", messageTodos);
                }

            });

            socket.on("chatbox pride:send", (messagePride, pride) => {
                if (messagePride.text) {
                    UserConnected.find().populate('userId').exec((err, usersConnected) => {
                        if (err || !usersConnected) return error(_id);
                        for (const userConnected of usersConnected) {
                            if (userConnected._doc.userId.pride == pride) {
                                io.to(userConnected._doc.userId._id).emit("chatbox pride:input", messagePride);
                            }
                        }
                    });
                }

            });

        })

    })
});

function error(_id) {
    io.to(_id).emit("error", "Ha sucedido un error en los mensajes, intente refrescando la pagina");
}

Http.listen(3001, () => {
    console.log("Listening message socket at :3001...");
});

var api = express.Router();

module.exports = api;