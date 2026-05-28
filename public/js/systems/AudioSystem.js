export default class AudioSystem{

constructor(){

    this.musicVolume =
        localStorage.getItem(
            "musicVolume"
        ) || 0.5;

    this.effectsVolume =
        localStorage.getItem(
            "effectsVolume"
        ) || 0.7;

    this.createSounds();

}

    createSounds(){

        this.bgMusic =
            new Audio(
                "/public/sounds/bg-music.mp3"
            );

        this.crashSound =
            new Audio(
                "/public/sounds/crash.mp3"
            );

        this.itemSound =
            new Audio(
                "/public/sounds/item.mp3"
            );

        this.winSound =
            new Audio(
                "/public/sounds/win.mp3"
            );

        this.loseSound =
            new Audio(
                "/public/sounds/lose.mp3"
            );

        this.bgMusic.loop = true;

        this.updateVolume();

    }

    startMusic(){

        this.bgMusic.play();

    }

    playCrash(){

        this.crashSound.currentTime = 0;

        this.crashSound.play();

    }

    playItem(){

        this.itemSound.currentTime = 0;

        this.itemSound.play();

    }

    playWin(){

        this.winSound.play();

    }

    playLose(){

        this.loseSound.play();

    }

setMusicVolume(value){

    this.musicVolume = value;

    localStorage.setItem(
        "musicVolume",
        value
    );

    this.updateVolume();

}

setEffectsVolume(value){

    this.effectsVolume = value;

    localStorage.setItem(
        "effectsVolume",
        value
    );

    this.updateVolume();

}

updateVolume(){

    this.bgMusic.volume =
        this.musicVolume;

    this.crashSound.volume =
        this.effectsVolume;

    this.itemSound.volume =
        this.effectsVolume;

    this.winSound.volume =
        this.effectsVolume;

    this.loseSound.volume =
        this.effectsVolume;
    }

}