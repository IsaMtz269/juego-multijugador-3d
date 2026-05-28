import ScreenManager
from '../core/ScreenManager.js';

import GameData
from '../data/GameData.js';

const singleBtn =
    document.getElementById(
        "single-btn"
    );

const multiBtn =
    document.getElementById(
        "multi-btn"
    );

singleBtn.addEventListener(
    "click",
    ()=>{

        GameData.gameMode =
            "single";

        ScreenManager.changeScreen(
            "/select-map"
        );

    }
);

multiBtn.addEventListener(
    "click",
    ()=>{

        GameData.gameMode =
            "multi";

        ScreenManager.changeScreen(
            "/select-map"
        );

    }
);