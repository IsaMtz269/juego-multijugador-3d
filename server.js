const express = require('express');

const { createServer } = require('node:http');

const { join } = require('node:path');

const { Server } = require('socket.io');

const app = express();

const server = createServer(app);

const io = new Server(server);

const listaJugadores = [];

/* =========================
   CARPETAS PUBLICAS
========================= */

app.use(
    '/public',
    express.static(
        join(__dirname, 'public')
    )
);

app.use(
    '/menus',
    express.static(
        join(__dirname, 'menus')
    )
);

/* =========================
   PANTALLAS
========================= */

app.get('/', (req, res) => {

    res.sendFile(
        join(__dirname, 'index.html')
    );

});

app.get('/game', (req, res) => {

    res.sendFile(
        join(__dirname, 'game.html')
    );

});

app.get('/menu', (req, res) => {

    res.sendFile(
        join(__dirname, 'menus/mainMenu.html')
    );

});

app.get('/select-map', (req, res) => {

    res.sendFile(
        join(__dirname, 'menus/selectMap.html')
    );

});

app.get('/settings', (req, res) => {

    res.sendFile(
        join(__dirname, 'menus/settings.html')
    );

});

app.get('/pause', (req, res) => {

    res.sendFile(
        join(__dirname, 'menus/pause.html')
    );

});

app.get('/scores', (req, res) => {

    res.sendFile(
        join(__dirname, 'menus/puntuaciones.html')
    );

});

app.get('/select-mode', (req, res) => {

    res.sendFile(
        join(__dirname, 'menus/SelectMode.html')
    );

});

app.get('/select-car', (req, res) => {

    res.sendFile(
        join(__dirname, 'menus/selectCar.html')
    );

});

app.get('/loading', (req, res) => {

    res.sendFile(
        join(__dirname, 'menus/loading.html')
    );

});

/* =========================
   SOCKETS
========================= */

io.on('connection', (socket) => {

    console.log('Jugador conectado');

    socket.on('Iniciar', (nombre) => {

        console.log('Jugador:', nombre);

        listaJugadores.push({

            name: nombre,

            x: 0,

            y: 0,

            z: 0

        });

        for(let item of listaJugadores){

            io.emit(
                'Iniciar',
                item.name
            );

        }

    });

    socket.on(
        'Posicion',
        (posicion, nombre) => {

            for(let item of listaJugadores){

                if(item.name === nombre){

                    item.x = posicion.x;

                    item.y = posicion.y;

                    item.z = posicion.z;

                    io.emit(
                        'Posicion',
                        item,
                        item.name
                    );

                    break;

                }

            }

        }
    );

});

/* =========================
   SERVIDOR
========================= */

server.listen(3000, () => {

    console.log(
        'Servidor corriendo en http://localhost:3000'
    );

});