(() => {
    const gameCanvas = document.getElementById("game") as (HTMLCanvasElement | null);
    if (gameCanvas === null) {
        throw new Error("No canvas with id 'game' found");
    }
    gameCanvas.width = 800;
    gameCanvas.height = 800;

    const gameCtx = gameCanvas.getContext("2d");
    if (gameCtx === null) {
        throw new Error("Unable to get `2d` context from canvas with id 'game'");
    }
    gameCtx.fillStyle = "#202020";
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    console.log("Game canvas context:", gameCtx);
})()
