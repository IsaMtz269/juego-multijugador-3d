import * as THREE from 'three';

export default class SceneManager{

    constructor(container){

        this.container = container;

        this.scene =
            new THREE.Scene();

        this.scene.background =
            new THREE.Color(0x87ceeb);

        this.camera =
            new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );

        this.renderer =
            new THREE.WebGLRenderer({
                antialias:true
            });

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        this.renderer.shadowMap.enabled = true;

        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        this.container.appendChild(
            this.renderer.domElement
        );

        this.createLights();

    }

    createLights(){

        const ambient =
            new THREE.AmbientLight(
                0xffffff,
                0.7
            );

        this.scene.add(ambient);

        const directional =
            new THREE.DirectionalLight(
                0xffffff,
                1
            );

        directional.position.set(10,20,10);

        directional.castShadow = true;

        this.scene.add(directional);

    }

    followPlayer(player){

        this.camera.position.x =
            player.mesh.position.x;

        this.camera.position.y =
            player.mesh.position.y + 8;

        this.camera.position.z =
            player.mesh.position.z + 12;

        this.camera.lookAt(
            player.mesh.position
        );

    }

    render(){

        this.renderer.render(
            this.scene,
            this.camera
        );

    }

}