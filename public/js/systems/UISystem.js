export default class UISystem{

    constructor(player){

        this.player = player;

        this.createUI();

    }

    createUI(){

        this.lifeText =
            document.createElement("div");

        this.lifeText.style.position = "absolute";

        this.lifeText.style.top = "20px";

        this.lifeText.style.right = "20px";

        this.lifeText.style.color = "white";

        this.lifeText.style.fontSize = "24px";

        this.lifeText.style.zIndex = "100";

        document.body.appendChild(
            this.lifeText
        );

    }

    update(){

        this.lifeText.innerHTML =
            "VIDA: " + this.player.life;

    }

}