import * as THREE from 'three';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

export async function loadModel(path, scale = 1){

    return new Promise((resolve, reject)=>{

        const manager = new THREE.LoadingManager();

        const objLoader = new OBJLoader(manager);
        const mtlLoader = new MTLLoader(manager);

        mtlLoader.setResourcePath('/public/models/');

        mtlLoader.load(
            `/public/models/${path}.mtl`,

            (materials)=>{

                materials.preload();

                objLoader.setMaterials(materials);

                objLoader.load(
                    `/public/models/${path}.obj`,

                    (object)=>{

                        object.scale.set(scale, scale, scale);

                        resolve(object);

                    },

                    undefined,

                    (error)=>{
                            console.error(
                            "Error cargando modelo:",
                            path,
                            error
                        );
                        reject(error);
                    }
                );

            }
        );

    });

}