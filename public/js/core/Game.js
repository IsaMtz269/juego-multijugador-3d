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

        this.player.onDeath =()=>{
        
            this.raceSystem.gameOver();
            };

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

        this.createObstacles();

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

    createObstacles(){

        const obstacle1 =
            new Enemy(
                this.sceneManager.scene,
                -5,
                1,
                5
            );

        const obstacle2 =
            new Enemy(
                this.sceneManager.scene,
                5,
                1,
                -5
            );

        const obstacle3 =
            new Enemy(
                this.sceneManager.scene,
                10,
                1,
                10
            );

        this.enemies.push(
            obstacle1,
            obstacle2,
            obstacle3
        );

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

}