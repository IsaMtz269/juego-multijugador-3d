const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const listaJugadores = [];


const app = express();
const server = createServer(app);

const io = new Server(server);

app.use('/public', express.static(join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/escenario2', (req, res) => {
  res.sendFile(join(__dirname, 'escenario2.html'));
});

app.get('/escenario3', (req, res) => {
  res.sendFile(join(__dirname, 'escenario3.html'));
});


io.on('connection', (socket) => {
  console.log('a user connected');
 
  socket.on('Iniciar', (nombre) => {
    console.log('iniciar nombre: ' + nombre);
 
    listaJugadores.push({
      name: nombre,
      x: 0,
      y: 0,
      z: 0
    });
 
    for (let item of listaJugadores) {
 
      io.emit('Iniciar', item.name);
 
    }
 
  });
 
 socket.on('Posicion', (posicion, nombre) => {
    for (let item of listaJugadores) {
      if (item.name == nombre) {
        item.x = posicion.x;
        item.y = posicion.y;
        item.z = posicion.z;
        
        // Emite la posición SOLAMENTE una vez por movimiento
        io.emit('Posicion', item, item.name);
        break; // Detiene el loop porque ya encontramos al jugador
      }
    }
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
 