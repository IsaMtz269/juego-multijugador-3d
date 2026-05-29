const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');

const app = express();
const server = createServer(app);
const io = new Server(server);

const listaJugadores = [];

/* =========================
   CONEXION MYSQL
========================= */

const db = mysql.createPool({
    host:     'localhost',
    user:     'root',        // cambia si tu usuario es diferente
    password: 'admin',            // pon tu contraseña de MySQL aquí
    database: 'gcw_pia'
});

/* =========================
   CARPETAS PUBLICAS
========================= */

app.use(express.json());

app.use('/public', express.static(join(__dirname, 'public')));

app.use('/menus', express.static(join(__dirname, 'menus')));

/* =========================
   AUTH ENDPOINTS
========================= */

// Registro
app.post('/register', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Nombre y contraseña requeridos.' });
    }

    try {
        await db.query(
            'INSERT INTO usuarios (nombre, password) VALUES (?, ?)',
            [name, password]
        );
        res.status(201).json({ message: 'Usuario creado.' });

    } catch (err) {
        if (err.errno === 1062) {
            return res.status(409).json({ error: 'Ese nombre ya está en uso.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor.' });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Nombre y contraseña requeridos.' });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE nombre = ? AND password = ?',
            [name, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Nombre o contraseña incorrectos.' });
        }

        res.json({ name: rows[0].nombre, id: rows[0].id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor.' });
    }
});

// Guardar puntuación
app.post('/scores', async (req, res) => {
    const { usuario_id, tiempo, mapa } = req.body;

    if (!usuario_id || !tiempo || !mapa) {
        return res.status(400).json({ error: 'Datos incompletos.' });
    }

    try {
        await db.query(
            'INSERT INTO puntuaciones (usuario_id, tiempo, mapa) VALUES (?, ?, ?)',
            [usuario_id, tiempo, mapa]
        );
        res.status(201).json({ message: 'Puntuación guardada.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar puntuación.' });
    }
});

// Obtener top 10 puntuaciones de un mapa
app.get('/scores/:mapa', async (req, res) => {
    const mapa = parseInt(req.params.mapa);

    try {
        const [rows] = await db.query(
            `SELECT u.nombre, p.tiempo, p.fecha
             FROM puntuaciones p
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.mapa = ?
             ORDER BY p.tiempo ASC
             LIMIT 10`,
            [mapa]
        );
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener puntuaciones.' });
    }
});

/* =========================
   PANTALLAS
========================= */

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(join(__dirname, 'game.html'));
});

app.get('/menu', (req, res) => {
    res.sendFile(join(__dirname, 'menus/mainMenu.html'));
});

app.get('/select-map', (req, res) => {
    res.sendFile(join(__dirname, 'menus/selectMap.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(join(__dirname, 'menus/settings.html'));
});

app.get('/pause', (req, res) => {
    res.sendFile(join(__dirname, 'menus/pause.html'));
});

app.get('/scores-page', (req, res) => {
    res.sendFile(join(__dirname, 'menus/puntuaciones.html'));
});

app.get('/select-mode', (req, res) => {
    res.sendFile(join(__dirname, 'menus/SelectMode.html'));
});

app.get('/select-car', (req, res) => {
    res.sendFile(join(__dirname, 'menus/selectCar.html'));
});

app.get('/loading', (req, res) => {
    res.sendFile(join(__dirname, 'menus/loading.html'));
});

app.get('/historial', (req, res) => {
    res.sendFile(join(__dirname, 'menus/historial.html'));
});

// Variable global para registrar quién cruza la meta primero en Multijugador
let lugaresLlegada = [];

/* =========================
   SISTEMA DE PUNTAJES (API)
========================= */
app.post('/save-score', async (req, res) => {
    const { playerId, puntos, esVictoria, mapa, modo } = req.body;

    if (!playerId) return res.status(400).json({ error: 'Falta el ID del jugador' });

    try {
        // 1. Sumar los puntos al total del usuario
        let queryUpdate = 'UPDATE usuarios SET puntaje_general = puntaje_general + ?';
        let paramsUpdate = [puntos];

        // Si quedó en 1er lugar, sumamos una victoria
        if (esVictoria) {
            queryUpdate += ', partidas_ganadas = partidas_ganadas + 1';
        }
        queryUpdate += ' WHERE id = ?';
        paramsUpdate.push(playerId);
        
        await db.query(queryUpdate, paramsUpdate);

        // 2. Guardar este registro en el Historial (puntuaciones)
        await db.query(
            'INSERT INTO puntuaciones (usuario_id, puntos_ganados, mapa, modo_juego) VALUES (?, ?, ?, ?)', 
            [playerId, puntos, mapa, modo]
        );

        res.json({ success: true, message: 'Puntaje e historial guardados' });
    } catch (error) {
        console.error("Error al guardar puntaje:", error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// NUEVO: Obtener el historial de un jugador
app.get('/api/historial/:id', async (req, res) => {
    const playerId = req.params.id;
    try {
        // 1. Obtenemos el puntaje general y victorias
        const [user] = await db.query('SELECT puntaje_general, partidas_ganadas FROM usuarios WHERE id = ?', [playerId]);
        
        // 2. Obtenemos las últimas 5 carreras
        const [history] = await db.query('SELECT * FROM puntuaciones WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 5', [playerId]);
        
        res.json({ stats: user[0], history: history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo historial' });
    }
});

/* =========================
   SOCKETS
========================= */

io.on('connection', (socket) => {

    console.log('Jugador conectado');

    socket.on('Iniciar', (nombre) => {

        console.log('Jugador:', nombre);

        listaJugadores.push({ name: nombre, x: 0, y: 0, z: 0 });

        for (let item of listaJugadores) {
            io.emit('Iniciar', item.name);
        }
    });

    socket.on('Posicion', (posicion, nombre) => {

        for (let item of listaJugadores) {
            if (item.name === nombre) {
                item.x = posicion.x;
                item.y = posicion.y;
                item.z = posicion.z;
                io.emit('Posicion', item, item.name);
                break;
            }
        }
    });

   // --- NUEVO ÁRBITRO DE META MULTIJUGADOR ---
    let resultadosCarrera = [];

    socket.on('LlegueALaMeta', (datosJugador) => {
        // Guardamos al jugador si no estaba ya en la lista
        if (!resultadosCarrera.find(j => j.nombre === datosJugador.nombre)) {
            resultadosCarrera.push(datosJugador);
        }

        // Si es el PRIMERO en llegar, él es el GANADOR
        if (resultadosCarrera.length === 1) {
            
            // 1. Le avisamos a todos los demás en la sala que la carrera terminó
            socket.broadcast.emit('ForzarFin');
            
            // 2. Damos 1.5 segundos exactos para que los perdedores envíen su vida y tiempo sobrante
            setTimeout(() => {
                // Armamos los bonos para el ganador (índice 0)
                if (resultadosCarrera[0]) {
                    resultadosCarrera[0].lugar = 1;
                    resultadosCarrera[0].puntajeTotal = resultadosCarrera[0].puntosBase + 100;
                    resultadosCarrera[0].esVictoria = true;
                }
                // Armamos los bonos para el perdedor (índice 1)
                if (resultadosCarrera[1]) {
                    resultadosCarrera[1].lugar = 2;
                    resultadosCarrera[1].puntajeTotal = resultadosCarrera[1].puntosBase + 50;
                    resultadosCarrera[1].esVictoria = false;
                }
                
                // 3. Enviamos la tabla final acomodada a TODOS los jugadores a la vez
                io.emit('TablaFinal', resultadosCarrera);
                
                // Limpiamos la carrera en el servidor para la próxima partida
                resultadosCarrera = []; 
            }, 1500);
        }
    });
});



/* =========================
   SERVIDOR
========================= */

server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});