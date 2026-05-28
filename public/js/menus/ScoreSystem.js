const scores =
    JSON.parse(
        localStorage.getItem(
            "raceResults"
        )
    ) || [];

for(let i = 0; i < scores.length; i++){

    const playerName =
        document.getElementById(
            `player${i+1}-name`
        );

    const playerScore =
        document.getElementById(
            `player${i+1}-score`
        );

    if(playerName){

        playerName.innerHTML =
            scores[i].name;

    }

    if(playerScore){

        playerScore.innerHTML =
            scores[i].score;

    }

}