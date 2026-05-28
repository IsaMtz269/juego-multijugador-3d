export default class PauseSystem{

    constructor(game){

        this.game = game;

        this.paused = false;

        this.createMenu();

        this.addEvents();

    }

    createMenu(){

        this.menu =
            document.createElement("div");

        this.menu.style.position = "absolute";

        this.menu.style.top = "50%";

        this.menu.style.left = "50%";

        this.menu.style.transform =
            "translate(-50%,-50%)";

        this.menu.style.background =
            "rgba(0,0,0,0.8)";

        this.menu.style.padding =
            "40px";

        this.menu.style.display =
            "none";

        this.menu.style.flexDirection =
            "column";

        this.menu.style.gap =
            "20px";

        this.menu.style.zIndex =
            "1000";

        const title =
            document.createElement("h1");

        title.innerHTML = "PAUSA";

        title.style.color = "white";

        const continueBtn =
            document.createElement("button");

        continueBtn.innerHTML =
            "CONTINUAR";

        continueBtn.onclick =
            ()=>this.togglePause();

        const exitBtn =
            document.createElement("button");

        exitBtn.innerHTML =
            "SALIR";

        exitBtn.onclick =
            ()=>{

                window.location.href =
                    "/menu";

            };

        this.menu.appendChild(title);

        this.menu.appendChild(
            continueBtn
        );

        this.menu.appendChild(
            exitBtn
        );

        document.body.appendChild(
            this.menu
        );

    }

    addEvents(){

        window.addEventListener(
            "keydown",
            (e)=>{

                if(e.key === "Escape"){

                    this.togglePause();

                }

            }
        );

    }


    togglePause(){

        this.paused = !this.paused;
        
        this.menu.style.display =
                this.paused
                ? "flex"
                : "none";
                if(this.paused){
                    this.game.raceSystem.pause();
                }else{
                    this.game.raceSystem.resume();
                }
            }

}