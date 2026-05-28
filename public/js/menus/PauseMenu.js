const continueBtn =
    document.getElementById(
        "continue-btn"
    );

const settingsBtn =
    document.getElementById(
        "settings-btn"
    );

const restartBtn =
    document.getElementById(
        "restart-btn"
    );

const menuBtn =
    document.getElementById(
        "menu-btn"
    );

continueBtn.addEventListener(
    "click",
    ()=>{

        window.history.back();

    }
);

settingsBtn.addEventListener(
    "click",
    ()=>{

        window.location.href =
            "/settings";

    }
);

restartBtn.addEventListener(
    "click",
    ()=>{

        window.location.href =
            "/game";

    }
);

menuBtn.addEventListener(
    "click",
    ()=>{

        window.location.href =
            "/menu";

    }
);