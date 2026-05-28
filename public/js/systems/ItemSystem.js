import Item from '../entities/Item.js';

import CollisionSystem from './CollisionSystem.js';

export default class ItemSystem{

    constructor(scene, player){

        this.scene = scene;

        this.player = player;

        this.items = [];

        this.spawnItems();

    }

    spawnItems(){

        const item1 =
            new Item(
                this.scene,
                "speed",
                5,
                1,
                5
            );

        const item2 =
            new Item(
                this.scene,
                "life",
                -10,
                1,
                -10
            );

        const item3 =
            new Item(
                this.scene,
                "ghost",
                15,
                1,
                -5
            );

        const item4 =
        new Item(
            this.scene,
            "time",
            -15,
            1,
            8
        );

            this.items.push(
            item1,
            item2,
            item3,
            item4
        );


    }

    update(){

        for(let item of this.items){

            if(item.collected) continue;

            item.mesh.rotation.y += 0.03;

            const collision =
                CollisionSystem.checkCollision(
                    this.player.mesh,
                    item.mesh
                );

            if(collision){

                this.applyEffect(item);

                item.destroy();

                this.player.audio.playItem();

            }

        }

    }

    applyEffect(item){

        if(item.type === "speed"){

            this.activateSpeed();

        }

        if(item.type === "life"){

            this.healPlayer();

        }

        if(item.type === "ghost"){

            this.activateGhost();

        }
        
        if(item.type === "time"){
            this.addTime();
        }
    }

    activateSpeed(){

        console.log("Rapidez activada");

        this.player.speed = 0.5;

        setTimeout(()=>{

            this.player.speed = 0.25;

            console.log("Rapidez terminada");

        },5000);

    }

    addTime(){
        console.log(
            "Tiempo aumentado"
        );
        if(this.raceSystem){
            this.raceSystem.reduceTime(5);
        }
    }


    healPlayer(){

        console.log("Vida recuperada");

        this.player.life += 25;

        if(this.player.life > 100){

            this.player.life = 100;

        }

    }

    activateGhost(){

        console.log("Modo fantasma");

        this.player.isGhost = true;

        this.player.mesh.material.transparent = true;

        this.player.mesh.material.opacity = 0.4;

        setTimeout(()=>{

            this.player.isGhost = false;

            this.player.mesh.material.opacity = 1;

            console.log("Modo fantasma terminado");

        },5000);

    }

}