import * as THREE from 'three';
import { loadModel } from '../utils/Loader.js';

export default class Player {

    constructor(scene, mapName) {
        this.scene   = scene;
        this.mapName = mapName;

        this.speed     = 0.25;
        this.gravity   = 0.01;
        this.velocityY = 0;
        this.life      = 100;
        this.canMove   = true;
        this.isGhost   = false;
        this.floorY    = 1;

        this.mesh = this.createPlayer();
        this.scene.add(this.mesh);

        this.loadCarModel();
    }

    createPlayer() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x0000ff,
            visible: false // Hacemos invisible tu cubo base para que solo se vea el carro
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.copy(this.getSpawnPosition());
        return cube;
    }

    getSpawnPosition() {
        if (this.mapName === "1") {
            return new THREE.Vector3(-47, 5, 70.25);
        } else if (this.mapName === "2") {
            return new THREE.Vector3(8.50, 5, -57.50);
        } else if (this.mapName === "3") {
            return new THREE.Vector3(32.75, -35.00, 2.50);
        } else {
            return new THREE.Vector3(-12, 6.4, 14);
        }
    }

    async loadCarModel() {
        const selectedCar = localStorage.getItem('selectedCar') || 'AutoFin';

        const scales = {
            'AutoFin':   0.2,
            'carroazul': 0.2,
            'Troca':     0.5
        };

        const rotations = {
            'AutoFin':   0,
            'carroazul': 0,
            'Troca':     0
        };

        try {
            const scale = scales[selectedCar] || 0.5;
            const carModel = await loadModel(selectedCar, scale);

            carModel.position.copy(this.mesh.position);
            carModel.rotation.y = rotations[selectedCar] ?? 0;

            this.scene.remove(this.mesh);
            this.mesh = carModel;
            this.scene.add(this.mesh);

            console.log(`✅ Carro cargado: ${selectedCar}`);

        } catch (error) {
            this.mesh.material.visible = true;
            console.warn('⚠️ No se pudo cargar el modelo, usando cubo azul:', error);
        }
    }

    update(input) {
        if (!this.canMove) return;

        const previousPosition = this.mesh.position.clone();

        if (input["w"]) {
            this.mesh.position.z -= this.speed;
            this.mesh.rotation.y = Math.PI;      // apunta hacia adelante
        }
        if (input["s"]) {
            this.mesh.position.z += this.speed;
            this.mesh.rotation.y = 0;            // apunta hacia atrás
        }
        if (input["a"]) {
            this.mesh.position.x -= this.speed;
            this.mesh.rotation.y = -Math.PI / 2; // apunta a la izquierda
        }
        if (input["d"]) {
            this.mesh.position.x += this.speed;
            this.mesh.rotation.y = Math.PI / 2;  // apunta a la derecha
        }

        this.mesh.userData.previousPosition = previousPosition;

        this.applyGravity();
    }

    applyGravity() {
        this.velocityY -= this.gravity;
        this.mesh.position.y += this.velocityY;

        if (this.mesh.position.y <= this.floorY) {
            this.mesh.position.y = this.floorY;
            this.velocityY = 0;
        }
    }

    revertPosition() {
        if (this.mesh.userData.previousPosition) {
            this.mesh.position.copy(this.mesh.userData.previousPosition);
        }
    }

    takeDamage(amount) {
        this.life -= amount;
        console.log("Vida restante:", this.life);

        if (this.life <= 0) {
            this.life    = 0;
            this.canMove = false;
            if (this.onDeath) this.onDeath();
        }
    }
}