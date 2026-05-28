import * as THREE from 'three';

export default class CollisionSystem{

    // Este es el que ya tenías para los enemigos (ítems y cubos)
    static checkCollision(object1, object2){
        const box1 = new THREE.Box3().setFromObject(object1);
        const box2 = new THREE.Box3().setFromObject(object2);
        return box1.intersectsBox(box2);
    }

    // NUEVO: Sistema de láseres (Raycaster) para la pista
    static checkTrackCollision(playerMesh, trackMesh) {
        if (!trackMesh) return false;

        const origin = playerMesh.position.clone();
        
        // Direcciones: Derecha, Izquierda, Adelante, Atrás
        const directions = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, -1)
        ];

        const raycaster = new THREE.Raycaster();
        
        for (let dir of directions) {
            raycaster.set(origin, dir);
            
            // intersectObject(mesh, true) revisa todos los polígonos del modelo
            const intersects = raycaster.intersectObject(trackMesh, true);
            
            // Si hay algo a menos de 0.6 unidades (tu cubo mide 1, así que 0.5 es la orilla + 0.1 de margen)
            if (intersects.length > 0 && intersects[0].distance < 0.6) {
                
                // CRÍTICO: ¿Es una pared o es el piso?
                // Las normales de las paredes apuntan hacia los lados (Y = 0)
                // Las normales del piso apuntan hacia arriba (Y = 1)
                // Si la "Y" es menor a 0.8, significa que es una pared o una rampa muy inclinada
                if (Math.abs(intersects[0].face.normal.y) < 0.8) {
                    return true; // ¡Chocó con una pared!
                }
            }
        }
        return false;
    }

    // NUEVO: Sistema para detectar la altura del piso (Rampas)
    static getFloorY(playerMesh, trackMesh) {
        if (!trackMesh) return 0;

        // Lanzamos un rayo desde "arriba" del jugador hacia abajo (-Y)
        const origin = playerMesh.position.clone();
        
        // Empezamos 5 unidades arriba para asegurar que estemos por encima del inicio de la rampa
        origin.y += 5; 

        const raycaster = new THREE.Raycaster(origin, new THREE.Vector3(0, -1, 0));
        
        // intersectObject busca la cara del modelo que el rayo toca primero
        const intersects = raycaster.intersectObject(trackMesh, true);

        if (intersects.length > 0) {
            // intersects[0].point.y es la altura exacta del piso en ese punto
            return intersects[0].point.y; 
        }
        
        return null; // Si no detecta piso (ej. se salió del mapa), regresa 0
    }
}