import * as THREE from 'three';

import CollisionSystem from './CollisionSystem.js';

export default class RaceSystem{

    constructor(scene, player){

        this.scene = scene;

        this.player = player;

        this.laps = 0;

        this.maxLaps = 3;

        this.finished = false;

        this.time = 60;

        this.paused = false;

        this.audio = player.audio;

        this.createFinishLine();

        this.createUI();

        this.startTimer();

    }

    createFinishLine(){

        const geometry =
            new THREE.BoxGeometry(
                5,
                1,
                1
            );

        const material =
            new THREE.MeshStandardMaterial({
                color:0xffff00
            });

        this.finishLine =
            new THREE.Mesh(
                geometry,
                material
            );

        this.finishLine.position.set(
            0,
            1,
            -20
        );

        this.scene.add(
            this.finishLine
        );

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

        this.cooldown = true;

        this.laps++;

        console.log(
            "Vuelta completada:",
            this.laps
        );

        if(this.laps >= this.maxLaps){

            this.win();

        }

        setTimeout(()=>{

            this.cooldown = false;

        },2000);

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
