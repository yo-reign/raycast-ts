const GRID_ROWS = 10;
const GRID_COLS = 10;

class Vector2 {
    constructor(public x: number, public y: number) { }

    //*[Symbol.iterator]() {
    //    yield this.x;
    //    yield this.y;
    //}

    static add(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    static sub(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    static scale(a: Vector2, b: number): Vector2 {
        return new Vector2(a.x * b, a.y * b);
    }
}

function fillCircle(ctx: CanvasRenderingContext2D, center: Vector2, radius: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawLine(ctx: CanvasRenderingContext2D, startPoint: Vector2, endPoint: Vector2, color: string) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
}

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

    // Clear canvas (fill background)
    gameCtx.fillStyle = "#202020";
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Scale canvas from grid units to pixels
    const cellWidth = gameCanvas.width / GRID_COLS;
    const cellHeight = gameCanvas.height / GRID_ROWS;
    gameCtx.scale(cellWidth, cellHeight);
    gameCtx.lineWidth = 1 / cellWidth;

    // Draw grid
    gameCtx.strokeStyle = "#404040";
    for (let x = 0; x <= GRID_ROWS; x++) {
        drawLine(gameCtx, new Vector2(x, 0), new Vector2(x, GRID_ROWS), "#404040");
    }

    for (let y = 0; y <= GRID_COLS; y++) {
        drawLine(gameCtx, new Vector2(0, y), new Vector2(GRID_COLS, y), "#404040");
    }

    // Draw points
    var p1 = new Vector2(GRID_COLS / 2, GRID_ROWS / 2);
    fillCircle(gameCtx, p1, 0.25, "#4400ff");

    var p2 = new Vector2(GRID_COLS / 4.45, GRID_ROWS / 4.25);
    fillCircle(gameCtx, p2, 0.25, "#4400ff");
})()
