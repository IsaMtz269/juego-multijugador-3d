import ScreenManager from '../core/ScreenManager.js';
import GameData from '../data/GameData.js';

// Mapea cada botón con su nombre de modelo .obj
const carModels = {
    'sport-btn':  'carroazul',
    'muscle-btn': 'AutoFin',
    'truck-btn':  'Troca'
};

const buttons = document.querySelectorAll('.car-btn');

buttons.forEach((btn) => {
    btn.addEventListener('click', () => {

        const modelName = carModels[btn.id];

        // Guardar en localStorage para que Player.js lo lea
        localStorage.setItem('selectedCar', modelName);

        GameData.selectedCar = btn.innerText;

        ScreenManager.changeScreen('/loading');
    });
});