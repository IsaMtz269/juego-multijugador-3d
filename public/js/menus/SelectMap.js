import ScreenManager
    from '../core/ScreenManager.js';

import GameData
    from '../data/GameData.js';

const buttons =
    document.querySelectorAll(
        ".map-btn"
    );

buttons.forEach(
    (btn)=>{

        btn.addEventListener(
            "click",
            ()=>{

                GameData.selectedMap =
                    btn.textContent.trim();

                localStorage.setItem(
                    "selectedMap",
                    GameData.selectedMap
                );

                ScreenManager.changeScreen(
                    "/select-car"
                );

            }
        );

    }
);