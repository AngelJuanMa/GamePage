'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();


// cargar rutas
var user_routes = require('./routes/user');
var juego_routes = require('./routes/juego');
var lobby_routes = require('./routes/lobby');
var sala_routes = require('./routes/sala');
var message_routes = require('./routes/message');
var follow_routes = require('./routes/follow'); 
var pride_routes = require('./routes/pride');

// rutas de sockets
var userSocket_routes = require('./controllers/sockets/user');
var messageSocket_routes = require('./controllers/sockets/message');
var prideSocket_router = require('./controllers/sockets/pride');
var friendsSocket_router = require('./controllers/sockets/friends');

// middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});

// rutas
app.use('/api', user_routes);
app.use('/api', juego_routes);
app.use('/api', lobby_routes);
app.use('/api', sala_routes);
app.use('/api', message_routes);
app.use('/api', follow_routes);
app.use('/api', pride_routes);

// exportar
module.exports = app;