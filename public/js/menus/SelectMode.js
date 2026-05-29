import ScreenManager from '../core/ScreenManager.js';
import GameData from '../data/GameData.js';

const singleBtn = document.getElementById("single-btn");
const multiBtn = document.getElementById("multi-btn");

singleBtn.addEventListener("click", () => {
    GameData.gameMode = "single";
    localStorage.setItem("gameMode", "single");
    ScreenManager.changeScreen("/select-map");
});

multiBtn.addEventListener("click", () => {
    
    // 1. Verificamos que el jugador haya iniciado sesión previamente
    const nombreGuardado = localStorage.getItem("playerName");
    
    if (!nombreGuardado) {
        alert("Error: Debes iniciar sesión primero para jugar en Multijugador.");
        // Opcional: mandarlo de regreso al login
        // window.location.href = "/"; 
        return;
    }

    // 2. Si ya tiene nombre, activamos el modo multi y avanzamos
    GameData.gameMode = "multi";
    localStorage.setItem("gameMode", "multi");
    ScreenManager.changeScreen("/select-map");
});