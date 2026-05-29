import * as THREE from 'three';

import SceneManager from './SceneManager.js';

import InputManager from './InputManager.js';

import Player from '../entities/Player.js';

import Enemy from '../entities/Enemy.js';

import UISystem from '../systems/UISystem.js';

import CollisionSystem from '../systems/CollisionSystem.js';

import { loadModel } from '../utils/Loader.js';

import ItemSystem from '../systems/ItemSystem.js';

import RaceSystem from '../systems/RaceSystem.js';

import PauseSystem from '../systems/PauseSystem.js';

import AudioSystem from '../systems/AudioSystem.js';

import SettingsSystem from '../systems/SettingsSystem.js';

export default class Game{

    constructor(mapName){

        this.container =
            document.getElementById(
                "game-container"
            );

        this.debugCoords = document.getElementById("debug-coords");

        this.sceneManager =
            new SceneManager(
                this.container
            );

        this.input =
            new InputManager();

        this.player =
            new Player(
                this.sceneManager.scene,
                mapName // <--- Pasamos el nombre del mapa aquí
            );

        this.player.onDeath = () => {
            this.raceSystem.gameOver(); // Si muere, no gana puntos, solo pierde
        };

      
       this.gameMode = localStorage.getItem("gameMode") || "single";
        this.playerName = localStorage.getItem("playerName") || "Jugador";
        
        // 2. Iniciamos el diccionario VACÍO de rivales
        this.otherPlayers = {}; 

        // 3. Si eligió multijugador, lo conectamos a Sockets
        if (this.gameMode === "multi") {
            this.socket = io();
            
            // Avisamos al servidor que entramos
            this.socket.emit('Iniciar', this.playerName);

            // Escuchamos la posición de los demás
            this.socket.on('Posicion', (data, nombreJugador) => {
                if (nombreJugador !== this.playerName) {
                    if (!this.otherPlayers[nombreJugador]) {
                        console.log("✅ ¡Creando cubo para el rival:", nombreJugador, "!");
                        const geo = new THREE.BoxGeometry(1, 1, 1);
                        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const enemyCube = new THREE.Mesh(geo, mat);
                        this.sceneManager.scene.add(enemyCube);
                        this.otherPlayers[nombreJugador] = enemyCube;
                    }
                    const x = Number(data.x) || 0;
                    const y = Number(data.y) || 0;
                    const z = Number(data.z) || 0;
                    this.otherPlayers[nombreJugador].position.set(x, y, z);
                }
            });

            // --- NUEVO: SINCRONIZACIÓN DE FINAL DE CARRERA ---
            this.socket.on('ForzarFin', () => {
                if (!this.raceSystem.finished) {
                    this.raceSystem.finished = true;
                    clearInterval(this.raceSystem.interval); // Detenemos el reloj
                    
                    // Juntamos nuestra vida y tiempo sobrante
                    const misPuntosBase = this.player.life + this.raceSystem.time;
                    this.socket.emit('LlegueALaMeta', { nombre: this.playerName, puntosBase: misPuntosBase });
                }
            });

            this.socket.on('TablaFinal', async (resultados) => {
                // Buscamos nuestros datos
                const misDatos = resultados.find(r => r.nombre === this.playerName);
                if (misDatos) {
                    const playerId = localStorage.getItem("playerId");
                    const mapa = this.currentMap || "1";
                    await this.enviarPuntajeBD(playerId, misDatos.puntajeTotal, misDatos.esVictoria, mapa, "multi");
                }

                // Acomodamos los datos en la memoria
                let raceResults = [];
                for (let res of resultados) {
                    raceResults[res.lugar - 1] = { name: res.nombre, score: res.puntajeTotal };
                }
                localStorage.setItem("raceResults", JSON.stringify(raceResults));

                // Redirigimos
                window.location.href = '/scores-page';
            });
            // ------------------------------------------------
        }

        this.ui =
            new UISystem(
                this.player
            );

            this.audio =
                new AudioSystem();

        this.player.audio =
            this.audio;


            this.raceSystem = 
            new RaceSystem(
                this.sceneManager.scene,
                this.player,
                mapName
            );
this.raceSystem.onWin = async (puntosBase) => {
            if (this.gameMode === "single") {
                const playerId = localStorage.getItem("playerId");
                const mapa = this.currentMap || "1";
                await this.enviarPuntajeBD(playerId, puntosBase, false, mapa, "single");
                setTimeout(() => { window.location.href = '/historial'; }, 1000);
                
            } else if (this.gameMode === "multi" && this.socket) {
                this.socket.emit('LlegueALaMeta', { nombre: this.playerName, puntosBase: puntosBase });
            }
        };

            this.itemSystem = 
            new ItemSystem
            ( this.sceneManager.scene,
                 this.player,
                 mapName 
            );

            this.itemSystem.raceSystem = 
            this.raceSystem;

            this.pauseSystem =
                new PauseSystem(this);

            this.settingsSystem =
                new SettingsSystem(this);

        this.enemies = [];

        this.createObstacles(mapName);

        this.loadMap(mapName);

        this.audio.startMusic();

        this.settingsSystem.applyGraphics();

        this.animate();

    }

    async loadMap(mapName){
        try {
            let escala = 5; 

            if (mapName === "3") {
                escala = 60; 
            } 

            if (mapName === "2") {
                escala = 18; 
            } 

            else if (mapName === "1") {
                escala = 12; 
            }
           

            const escenarioFondo = await loadModel(`escenario${mapName}`, escala);
            escenarioFondo.position.set(0, 0, 0);
            this.sceneManager.scene.add(escenarioFondo);
            console.log(`✅ Fondo escenario${mapName} cargado con escala ${escala}`);

            const pistaJuego = await loadModel(`pista${mapName}`, escala);
            pistaJuego.position.set(0, 0, 0);
            this.sceneManager.scene.add(pistaJuego);
            console.log(`✅ Pista pista${mapName} cargada con escala ${escala}`);

            this.pistaActual = pistaJuego; 
            this.currentMap = mapName;         
            this.escenarioActual = escenarioFondo; 


        } catch (error) {
            console.error("❌ Error al cargar los modelos del nivel:", error);
        }
    }

   createObstacles(mapName){

        if (mapName === "1") {
            this.enemies.push(new Enemy(this.sceneManager.scene, 80.00, 22.58, -24.25));
            this.enemies.push(new Enemy(this.sceneManager.scene, 86.50, 22.54, -30.50));
            this.enemies.push(new Enemy(this.sceneManager.scene, 88.25, 22.59, -19.00));
            this.enemies.push(new Enemy(this.sceneManager.scene, 101.00, 22.56, -20.75));
            this.enemies.push(new Enemy(this.sceneManager.scene, 96.00, 22.57, -31.00));
            this.enemies.push(new Enemy(this.sceneManager.scene, 52.25, 18.17, 69.25));
            this.enemies.push(new Enemy(this.sceneManager.scene, 55.75, 16.60, 81.50));
            this.enemies.push(new Enemy(this.sceneManager.scene, 47.25, 15.91, 93.00));

        } else if (mapName === "2") {
            this.enemies.push(new Enemy(this.sceneManager.scene, -5, 1, 5));
            this.enemies.push(new Enemy(this.sceneManager.scene, 5, 1, -5));

        } else if (mapName === "3") {
            this.enemies.push(new Enemy(this.sceneManager.scene, -53.00, -34.56, -126.00));
            this.enemies.push(new Enemy(this.sceneManager.scene, -8.25, -36.49, -240.00));
            this.enemies.push(new Enemy(this.sceneManager.scene, 10.75, -37.44, -276.25));
            this.enemies.push(new Enemy(this.sceneManager.scene, 176.00, -27.69, -484.00));
            this.enemies.push(new Enemy(this.sceneManager.scene, 186.50, -25.24, -485.75));
            this.enemies.push(new Enemy(this.sceneManager.scene, 196.25, -23.28, -485.75));
            this.enemies.push(new Enemy(this.sceneManager.scene, 147.50, -25.94, -21.25));
            this.enemies.push(new Enemy(this.sceneManager.scene, 136.50, -26.66, 79.00));
            this.enemies.push(new Enemy(this.sceneManager.scene, 112.25, -28.07, 95.50));

        } else {
            // Por defecto por si ocurre un error
            this.enemies.push(new Enemy(this.sceneManager.scene, -5, 1, 5));
            this.enemies.push(new Enemy(this.sceneManager.scene, 5, 1, -5));
        }

    }

    checkCollisions(){

        // 1. Colisiones con Enemigos/Obstáculos (Causan daño)
        for(let enemy of this.enemies){
            const collision =
                CollisionSystem.checkCollision(
                    this.player.mesh,
                    enemy.mesh
                );
                if(collision){
                    if(!this.player.isGhost){
                        this.player.revertPosition();
                        this.player.takeDamage(1);
                        this.audio.playCrash();
                    }
                }
        }

        // 2. Colisión con la Pista y/o Escenario
        let modelosAColisionar = [];
        if (this.pistaActual) modelosAColisionar.push(this.pistaActual);
        
        // Si es el mapa 3, le agregamos la física también al escenario
        if (this.currentMap === "3" && this.escenarioActual) {
            modelosAColisionar.push(this.escenarioActual);
        }

        let alturaPisoFinal = null;

        // Revisamos cada modelo de la lista
        for (let modelo of modelosAColisionar) {
            
            // A. Checar paredes
            const hitWall = CollisionSystem.checkTrackCollision(this.player.mesh, modelo);
            if (hitWall) {
                this.player.revertPosition();
            }

            // B. Checar piso
            const floorHeight = CollisionSystem.getFloorY(this.player.mesh, modelo);
            
            // Si detectó piso en este modelo, guardamos el que esté más alto
            if (floorHeight !== null) {
                if (alturaPisoFinal === null || floorHeight > alturaPisoFinal) {
                    alturaPisoFinal = floorHeight;
                }
            }
        }

        // Si encontramos un piso válido debajo del carro
        if (alturaPisoFinal !== null) {
            this.player.floorY = alturaPisoFinal + 0.5;

            // Lo subimos a la rampa si quedó enterrado
            if (this.player.mesh.position.y < this.player.floorY) {
                this.player.mesh.position.y = this.player.floorY;
                this.player.velocityY = 0;
            }
        } else {
            // Si el jugador se sale por completo del mapa (no hay piso), 
            // le ponemos un límite bajo para que caiga por gravedad
            this.player.floorY = -50; 
        }
    }
    

    addEvents(){
        document.addEventListener(
            "keydown",
            (e)=>{
                if(e.key === "o"){
                    this.settingsSystem.toggle();
                }
            }
        );
    }

    animate(){

        requestAnimationFrame(
            ()=>this.animate()
        );

        if(this.pauseSystem.paused){
                return;
            }

        this.addEvents();

        this.player.update(
            this.input.keys
        );

        // Emitimos nuestra posición al servidor
        if (this.gameMode === "multi" && this.socket) {
            
            const pos = this.player.mesh.position;
            
            // IMPORTANTE: Armamos un objeto simple para que Sockets no pierda los datos
            this.socket.emit('Posicion', { x: pos.x, y: pos.y, z: pos.z }, this.playerName);
        }

        if (this.debugCoords && this.player && this.player.mesh) {
            const pos = this.player.mesh.position;
            this.debugCoords.innerText = `X: ${pos.x.toFixed(2)} | Y: ${pos.y.toFixed(2)} | Z: ${pos.z.toFixed(2)}`;
        }

        this.checkCollisions();
        
        this.itemSystem.update();

        this.raceSystem.update();

        this.sceneManager.followPlayer(
            this.player
        );

        this.ui.update();

        this.sceneManager.render();

    }

    // Función para hablar con MySQL
    async enviarPuntajeBD(playerId, puntos, esVictoria, mapa, modo) {
        if (!playerId) {
            console.warn("No hay sesión iniciada, no se guardan puntos.");
            return;
        }

        try {
            const respuesta = await fetch('/save-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId, puntos, esVictoria, mapa, modo })
            });
            const data = await respuesta.json();
            console.log("Respuesta de BD:", data);
        } catch (error) {
            console.error("Error subiendo puntaje:", error);
        }
    }

}