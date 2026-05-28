import Item from '../entities/Item.js';
import CollisionSystem from './CollisionSystem.js';

export default class ItemSystem {

    // 1. Agregamos mapName como parámetro
    constructor(scene, player, mapName) {
        this.scene = scene;
        this.player = player;
        this.mapName = mapName; // Guardamos el mapa actual
        this.items = [];

        this.spawnItems();
    }

    spawnItems() {
        // 2. Dependiendo del mapa, ponemos diferentes posiciones
        
        if (this.mapName === "1") {
            // Posiciones para el Escenario 1 (Día)
            this.items.push(new Item(this.scene, "speed", 5, 1, 5));
            this.items.push(new Item(this.scene, "life", -10, 1, -10));
            this.items.push(new Item(this.scene, "ghost", 15, 1, -5));
            this.items.push(new Item(this.scene, "time", 12.50, 4, 1.75));
            console.log("Ítems generados para el Mapa 1");

        } else if (this.mapName === "2") {
            // Posiciones para el Escenario 2 (Arcoíris)
            // (Cambia estos números X, Y, Z usando tu recuadro flotante de debug)
            this.items.push(new Item(this.scene, "speed", 20, 1, 20));
            this.items.push(new Item(this.scene, "life", -20, 1, -20));
            this.items.push(new Item(this.scene, "ghost", 25, 1, -15));
            this.items.push(new Item(this.scene, "time", -25, 1, 18));
            console.log("Ítems generados para el Mapa 2");

        } else if (this.mapName === "3") {
            // Posiciones para el Escenario 3 (Rojo)
            this.items.push(new Item(this.scene, "speed", 12, 1, -30));
            this.items.push(new Item(this.scene, "life", -12, 1, 30));
            this.items.push(new Item(this.scene, "ghost", 8, 1, -10));
            this.items.push(new Item(this.scene, "time", -8, 1, 20));
            console.log("Ítems generados para el Mapa 3");
            
        } else {
            // Por si acaso no detecta el mapa, unas posiciones por defecto
            this.items.push(new Item(this.scene, "speed", 5, 1, 5));
            this.items.push(new Item(this.scene, "life", -5, 1, -5));
        }
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