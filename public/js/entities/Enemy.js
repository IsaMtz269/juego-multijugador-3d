import * as THREE from 'three';

export default class Enemy{

    constructor(scene, x, y, z){

        this.scene = scene;

        const geometry =
            new THREE.BoxGeometry(2,2,2);

        const material =
            new THREE.MeshStandardMaterial({
                color:0xff0000
            });

        this.mesh =
            new THREE.Mesh(
                geometry,
                material
            );

        this.mesh.position.set(x,y,z);

        this.scene.add(this.mesh);

    }

}