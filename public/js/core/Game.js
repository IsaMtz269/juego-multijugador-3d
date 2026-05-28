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
                this.sceneManager.scene
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
                this.player 
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
                escala = 80; 
            } 

            else if (mapName === "1") {
                escala = 6; 
            }
           

            // 3. Cargamos los modelos usando la variable 'escala'
            const escenarioFondo = await loadModel(`escenario${mapName}`, escala);
            escenarioFondo.position.set(0, 0, 0);
            this.sceneManager.scene.add(escenarioFondo);
            console.log(`✅ Fondo escenario${mapName} cargado con escala ${escala}`);

            const pistaJuego = await loadModel(`pista${mapName}`, escala);
            pistaJuego.position.set(0, 0, 0);
            this.sceneManager.scene.add(pistaJuego);
            console.log(`✅ Pista pista${mapName} cargada con escala ${escala}`);

            this.pistaActual = pistaJuego; 

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

        for(let enemy of this.enemies){

            const collision =
                CollisionSystem.checkCollision(
                    this.player.mesh,
                    enemy.mesh
                );
                if(collision){
                    if(!this.player.isGhost){
                        this.player.revertPosition();
                        this.player.takeDamage(1);}
                        this.audio.playCrash();
                    }
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