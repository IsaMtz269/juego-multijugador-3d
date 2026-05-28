import ScreenManager
from '../core/ScreenManager.js';

const playBtn =
    document.getElementById(
        "play-btn"
    );

const settingsBtn =
    document.getElementById(
        "settings-btn"
    );

const exitBtn =
    document.getElementById(
        "exit-btn"
    );

playBtn.addEventListener(
    "click",
    ()=>{

        ScreenManager.changeScreen(
            "/select-mode"
        );

    }
);

settingsBtn.addEventListener(
    "click",
    ()=>{

        alert(
            "Configuraciones próximamente"
        );

    }
);

exitBtn.addEventListener(
    "click",
    ()=>{

        window.close();

    }
);