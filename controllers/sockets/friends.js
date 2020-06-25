'use strict'

var moment = require('moment')
var express = require('express')
const Http = require("http").Server(express);
const io = require("socket.io")(Http);

const UserConnected = require("../../models/userConnected");
const User = require("../../models/user");
const Follow = require("../../models/follow");

var moment = require('moment');

io.on("connection", socket => {
    const _id = socket.id;

    socket.on("user", (userId) => {
        socket.join(userId);

        socket.on("onFollow", (data) => {
            User.findOne({ _id: data.follow_request.followed }).exec((err, user) => {
                if (err || !user) return error(_id, "No se ha encontrado un usuario");
                if (data.follow_request.user.password) delete data.follow_request.user.password
                if (data.follow_request.user.email) delete data.follow_request.user.email

                User.findOne({ _id: data.follow_request.user }).exec((err, userT) => {
                    if (err || !userT) return error(_id, "Hubo un problema en el servidor");

                    delete userT._doc.password;
                    delete userT._doc.email;

                    socket.broadcast.to(user._doc._id).emit("request", userT);
                })
            })
        })

        socket.on("accepted", (user) => {
            socket.broadcast.to(user).emit("accepted", true);
        })

        socket.on("deleted", (user) => {

            socket.broadcast.to(user).emit("friendOut", true);
        })

        socket.on("writing", (userTo, userFor) => {

            socket.broadcast.to(userFor._id).emit("friendWriting", userTo)
        });

        socket.on("noWriting", (userTo, userFor) => {

            socket.broadcast.to(userFor._id).emit("stopWriting", userTo)
        });

        socket.on("message", (message, emitter) => {

            var created_at = moment().unix();
            delete emitter.password;
            delete emitter.email;

            socket.broadcast.to(message.receiver._id).emit("newMessage", message, emitter, created_at);
        });

        socket.on("messagesViewed", (user, emitter) => {

            socket.broadcast.to(emitter._id).emit("friendViewedMessages", user)
        });
    })
});

function error(_id, error) {
    io.to(_id).emit("error", error);
}

Http.listen(3003, () => {
    console.log("Listening friends socket at :3003...");
});

var api = express.Router();

module.exports = api;