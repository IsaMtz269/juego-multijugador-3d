import ScreenManager
from '../core/ScreenManager.js';

import GameData
from '../data/GameData.js';

const buttons =
    document.querySelectorAll(
        ".car-btn"
    );

buttons.forEach(
    (btn)=>{

        btn.addEventListener(
            "click",
            ()=>{

                GameData.selectedCar =
                    btn.innerText;

                ScreenManager.changeScreen(
                    "/loading"
                );

            }
        );

    }
);