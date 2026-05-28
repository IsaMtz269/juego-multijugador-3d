import * as THREE from 'three';

export default class Item{

    constructor(scene, type, x, y, z){

        this.scene = scene;

        this.type = type;

        this.collected = false;

        this.mesh = this.createItem();

        this.mesh.position.set(x,y,z);

        this.scene.add(this.mesh);

    }

    createItem(){

        let color = 0xffffff;

        if(this.type === "speed"){

            color = 0x00ff00;

        }

        if(this.type === "life"){

            color = 0xff00ff;

        }

        if(this.type === "ghost"){

            color = 0x00ffff;

        }

        const geometry =
            new THREE.SphereGeometry(
                0.5,
                32,
                32
            );

        const material =
            new THREE.MeshStandardMaterial({
                color:color,
                emissive:color,
                emissiveIntensity:0.5
            });

        return new THREE.Mesh(
            geometry,
            material
        );

    }

    destroy(){

        this.scene.remove(this.mesh);

        this.collected = true;

    }

}
