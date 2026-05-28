import * as THREE from 'three';

export default class Player{

    // 1. Agregamos mapName al constructor
    constructor(scene, mapName){

        this.scene = scene;
        this.mapName = mapName; // Guardamos el nombre del mapa

        this.speed = 0.25;
        this.gravity = 0.01;
        this.velocityY = 0;
        this.life = 100;
        this.canMove = true;
        this.isGhost = false;

        this.floorY = 1;

        this.mesh = this.createPlayer();
        this.scene.add(this.mesh);

    }

    createPlayer(){

        const geometry = new THREE.BoxGeometry(1,1,1);
        const material = new THREE.MeshStandardMaterial({
            color:0x0000ff
        });

        const cube = new THREE.Mesh(geometry, material);

        // 2. Definimos las posiciones de spawn según el mapa
        if (this.mapName === "1") {
            // Posición para el Escenario 1 (Día)
            cube.position.set(-47, 1, 70.25); 

        } else if (this.mapName === "2") {
            // Posición para el Escenario 2 (Arcoíris)
            // (Ajusta estos números usando tu herramienta de coordenadas)
            cube.position.set(8.50, 1, -57.50); 

        } else if (this.mapName === "3") {
            // Posición para el Escenario 3 (Rojo)
            // (Ajusta estos números usando tu herramienta de coordenadas)
            cube.position.set(32.75, -37.96, 2.50); 

        } else {
            // Posición por defecto
            cube.position.set(-12, 6.4, 14);
        }

        return cube;
    }


    update(input){

        if(!this.canMove) return;

        const previousPosition =
            this.mesh.position.clone();

        if(input["w"]){

            this.mesh.position.z -= this.speed;

        }

        if(input["s"]){

            this.mesh.position.z += this.speed;

        }

        if(input["a"]){

            this.mesh.position.x -= this.speed;

        }

        if(input["d"]){

            this.mesh.position.x += this.speed;

        }

        this.mesh.userData.previousPosition =
            previousPosition;

        this.applyGravity();

    }

    applyGravity(){

        this.velocityY -= this.gravity;
        this.mesh.position.y += this.velocityY;

        // Ahora choca contra "this.floorY" en vez del "1" fijo
        if(this.mesh.position.y <= this.floorY){

            this.mesh.position.y = this.floorY;
            this.velocityY = 0;

        }

    }

    revertPosition(){

        if(this.mesh.userData.previousPosition){

            this.mesh.position.copy(
                this.mesh.userData.previousPosition
            );

        }

    }

    takeDamage(amount){

        this.life -= amount;

        console.log(
            "Vida restante:",
            this.life
        );

        if(this.life <= 0){

            this.life = 0;

            this.canMove = false;

            if(this.onDeath){
                    this.onDeath();
                }

        }

    }

}