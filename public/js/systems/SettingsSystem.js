export default class SettingsSystem{

    constructor(game){

        this.game = game;

        this.settings = {

            musicVolume: 0.5,

            effectsVolume: 0.7,

            mute: false,

            sensitivity: 1,

            graphics: "high"

        };

        this.load();

        this.createMenu();

    }

    load(){

        const saved =
            localStorage.getItem(
                "gameSettings"
            );

        if(saved){

            this.settings =
                JSON.parse(saved);

        }

    }

    save(){

        localStorage.setItem(
            "gameSettings",
            JSON.stringify(this.settings)
        );

    }

    createMenu(){

        this.menu =
            document.createElement("div");

        this.menu.style.position =
            "absolute";

        this.menu.style.top =
            "50%";

        this.menu.style.left =
            "50%";

        this.menu.style.transform =
            "translate(-50%,-50%)";

        this.menu.style.background =
            "rgba(0,0,0,0.9)";

        this.menu.style.padding =
            "20px";

        this.menu.style.color =
            "white";

        this.menu.style.display =
            "none";

        this.menu.style.zIndex =
            "500";

        this.menu.innerHTML = `

            <h2>CONFIGURACIÓN</h2>

            <label>
                Música
            </label>

            <input
                type="range"
                id="music-volume"
                min="0"
                max="1"
                step="0.1"
                value="${this.settings.musicVolume}"
            >

            <br><br>

            <label>
                Efectos
            </label>

            <input
                type="range"
                id="effects-volume"
                min="0"
                max="1"
                step="0.1"
                value="${this.settings.effectsVolume}"
            >

            <br><br>

            <label>
                Sensibilidad
            </label>

            <input
                type="range"
                id="sensitivity"
                min="0.5"
                max="3"
                step="0.1"
                value="${this.settings.sensitivity}"
            >

            <br><br>

            <button id="mute-btn">

                ${this.settings.mute ? "UNMUTE" : "MUTE"}

            </button>

            <br><br>

            <button id="fullscreen-btn">

                FULLSCREEN

            </button>

            <br><br>

            <select id="graphics-select">

                <option value="low">
                    LOW
                </option>

                <option value="medium">
                    MEDIUM
                </option>

                <option value="high">
                    HIGH
                </option>

            </select>

        `;

        document.body.appendChild(
            this.menu
        );

        this.addEvents();

    }

    addEvents(){

        const musicSlider =
            document.getElementById(
                "music-volume"
            );

        musicSlider.addEventListener(
            "input",
            (e)=>{

                this.settings.musicVolume =
                    parseFloat(e.target.value);

                    this.game.audio.setMusicVolume(
                        this.settings.musicVolume
                    );

                this.save();

            }
        );

        const effectsSlider =
            document.getElementById(
                "effects-volume"
            );

effectsSlider.addEventListener(
    "input",
    (e)=>{

        this.settings.effectsVolume =
            parseFloat(e.target.value);

        this.game.audio.setEffectsVolume(
            this.settings.effectsVolume
        );

        this.save();

    }
);

        const sensitivity =
            document.getElementById(
                "sensitivity"
            );

        sensitivity.addEventListener(
            "input",
            (e)=>{

                this.settings.sensitivity =
                    parseFloat(e.target.value);

                this.game.player.speed =
                    0.2 *
                    this.settings.sensitivity;

                this.save();

            }
        );

        const muteBtn =
            document.getElementById(
                "mute-btn"
            );

        muteBtn.addEventListener(
            "click",
            ()=>{

                this.settings.mute = 
                !this.settings.mute;

                this.game.audio.bgMusic.muted =
                this.settings.mute;

                this.game.audio.crashSound.muted =
                this.settings.mute;

                this.game.audio.itemSound.muted =
                this.settings.mute;

                this.game.audio.winSound.muted =
                this.settings.mute;

                this.game.audio.loseSound.muted =
                this.settings.mute;

                muteBtn.innerText =
                    this.settings.mute
                    ? "UNMUTE"
                    : "MUTE";

                this.save();

            }
        );

        const fullscreenBtn =
            document.getElementById(
                "fullscreen-btn"
            );

        fullscreenBtn.addEventListener(
            "click",
            ()=>{

                if(!document.fullscreenElement){

                    document.documentElement
                    .requestFullscreen();

                }else{

                    document.exitFullscreen();

                }

            }
        );

        const graphics =
            document.getElementById(
                "graphics-select"
            );

        graphics.value =
            this.settings.graphics;

        graphics.addEventListener(
            "change",
            (e)=>{

                this.settings.graphics =
                    e.target.value;

                this.applyGraphics();

                this.save();

            }
        );

    }

    applyGraphics(){

    const renderer =
        this.game.sceneManager.renderer;

    if(this.settings.graphics === "low"){

        renderer.setPixelRatio(1);

        renderer.shadowMap.enabled = false;

    }

    if(this.settings.graphics === "medium"){

        renderer.setPixelRatio(1.5);

        renderer.shadowMap.enabled = true;

    }

    if(this.settings.graphics === "high"){

        renderer.setPixelRatio(
            window.devicePixelRatio
        );

        renderer.shadowMap.enabled = true;
    }
}

    toggle(){

        if(this.menu.style.display === "none"){

            this.menu.style.display =
                "block";

        }else{

            this.menu.style.display =
                "none";

        }

    }

}