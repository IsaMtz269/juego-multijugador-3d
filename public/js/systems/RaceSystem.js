import * as THREE from 'three';
import CollisionSystem from './CollisionSystem.js';

export default class RaceSystem{

    constructor(scene, player, mapName){

        this.scene = scene;
        this.player = player;
        this.mapName = mapName;
        this.laps = 0;

        if (this.mapName === "1") {
            this.maxLaps = 3;
        } else if (this.mapName === "2") {
            this.maxLaps = 2;
        } else if (this.mapName === "3") {
            this.maxLaps = 1;
        } else {
            this.maxLaps = 3; 
        }

        this.finished = false;
        
        // Coloca aquí los segundos que decidiste para tu cronómetro
        this.time = 300; 

        this.paused = false;
        this.audio = player.audio;

        // NUEVAS VARIABLES PARA CONTROLAR LA SALIDA
        this.esSalida = true; 
        this.cooldown = false;

        this.createFinishLine();
        this.createUI();
        this.startTimer();
    }

    createFinishLine(){

        const geometry = new THREE.BoxGeometry(15, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color:0xffff00
        });

        this.finishLine = new THREE.Mesh(geometry, material);

        if (this.mapName === "1") {
            this.finishLine.position.set(-47, 0.75, 63.50); 
        } else if (this.mapName === "2") {
            this.finishLine.position.set(10, 1, -58.25); 
        } else if (this.mapName === "3") {
            this.finishLine.position.set(32.75, -37.79, -3.00); 
        } else {
            this.finishLine.position.set(0, 1, -20);
        }

        // NUEVO: Hacemos que la línea de meta sea invisible
        this.finishLine.visible = false; 

        this.scene.add(this.finishLine);
    }

    createUI(){

        this.timeText =
            document.createElement("div");

        this.timeText.style.position =
            "absolute";

        this.timeText.style.top =
            "20px";

        this.timeText.style.left =
            "20px";

        this.timeText.style.color =
            "white";

        this.timeText.style.fontSize =
            "24px";

        this.timeText.style.zIndex =
            "100";

        document.body.appendChild(
            this.timeText
        );

        this.lapText =
            document.createElement("div");

        this.lapText.style.position =
            "absolute";

        this.lapText.style.top =
            "60px";

        this.lapText.style.left =
            "20px";

        this.lapText.style.color =
            "white";

        this.lapText.style.fontSize =
            "24px";

        this.lapText.style.zIndex =
            "100";

        document.body.appendChild(
            this.lapText
        );

    }

    startTimer(){

        this.interval =
            setInterval(()=>{

                if(this.finished || this.paused)
                    return;

                this.time--;

                if(this.time <= 0){

                    this.time = 0;

                    this.gameOver();

                }

            },1000);

    }

    pause(){
            this.paused = true;
        }
        
    resume(){
            this.paused = false;
        }

    update(){

        this.timeText.innerHTML =
            "TIEMPO: " + this.time;

        this.lapText.innerHTML =
            "VUELTA: " +
            this.laps +
            "/" +
            this.maxLaps;

        if(this.finished) return;

        const collision =
            CollisionSystem.checkCollision(
                this.player.mesh,
                this.finishLine
            );

        if(collision){

            this.completeLap();

        }

    }

    completeLap(){

        if(this.cooldown) return;

        // Bloqueamos colisiones temporalmente
        this.cooldown = true;

        // NUEVA LÓGICA DE SALIDA
        if (this.esSalida) {
            console.log("¡Arranca la carrera!");
            this.esSalida = false; // El próximo choque ya será la vuelta 1
        } else {
            // Solo sumamos vuelta si NO es la salida
            this.laps++;
            console.log("Vuelta completada:", this.laps);

            if(this.laps >= this.maxLaps){
                this.win();
            }
        }

        // 10000 milisegundos (10 segundos) de cooldown para evitar trampas
        setTimeout(()=>{
            this.cooldown = false;
        }, 10000); 

    }

    reduceTime(seconds){

        this.time += seconds;

    }

    win(){

        this.finished = true;

        clearInterval(this.interval);

        this.player.audio.playWin();

        alert("GANASTE LA CARRERA");

    }

    gameOver(){

        this.finished = true;

        clearInterval(this.interval);

        this.player.canMove = false;

        this.player.audio.playLose();

        alert("Perdiste :( ...");

    }

}
