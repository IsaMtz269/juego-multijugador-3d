import * as THREE from 'three';

export default class Player{

    constructor(scene){

        this.scene = scene;

        this.speed = 0.25;

        this.gravity = 0.01;

        this.velocityY = 0;

        this.life = 100;

        this.canMove = true;

        this.isGhost = false;

        this.mesh = this.createPlayer();

        this.scene.add(this.mesh);

    }

    createPlayer(){

        const geometry =
            new THREE.BoxGeometry(1,1,1);

        const material =
            new THREE.MeshStandardMaterial({
                color:0x0000ff
            });

        const cube =
            new THREE.Mesh(
                geometry,
                material
            );

        cube.position.set(-12,6.4,14);

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

        if(this.mesh.position.y <= 1){

            this.mesh.position.y = 1;

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