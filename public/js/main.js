import Game from './core/Game.js';

const selectedMap =
    localStorage.getItem(
        "selectedMap"
    ) || "escenario";

new Game(selectedMap);