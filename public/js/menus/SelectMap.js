import ScreenManager from '../core/ScreenManager.js';
import GameData from '../data/GameData.js';

const buttons = document.querySelectorAll(".map-btn");

buttons.forEach((btn) => {

    btn.addEventListener("click", () => {

        // Aquí está el cambio clave: Leemos el número del atributo data-map
        GameData.selectedMap = btn.getAttribute("data-map");

        // Se guardará un simple "1", "2" o "3" en el LocalStorage
        localStorage.setItem(
            "selectedMap",
            GameData.selectedMap
        );

        ScreenManager.changeScreen(
            "/select-car"
        );

    });

});