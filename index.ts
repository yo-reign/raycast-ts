const GRID_ROWS = 10;
const GRID_COLS = 10;

class Vector2 {
    constructor(public x: number, public y: number) { }

    add(b: Vector2): Vector2 {
        return new Vector2(this.x + b.x, this.y + b.y);
    }

    sub(b: Vector2): Vector2 {
        return new Vector2(this.x - b.x, this.y - b.y);
    }

    scale(b: Vector2): Vector2 {
        return new Vector2(this.x * b.x, this.y * b.y);
    }

    div(b: Vector2): Vector2 {
        return new Vector2(this.x / b.x, this.y / b.y);
    }
}

function drawCircle(ctx: CanvasRenderingContext2D, center: Vector2, radius: number, color: string) {
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

function getCanvasSize(ctx: CanvasRenderingContext2D): Vector2 {
    return new Vector2(ctx.canvas.width, ctx.canvas.height);
}

function drawScene(ctx: CanvasRenderingContext2D, p2: Vector2 | undefined) {
    // Clear canvas (fill background)
    ctx.reset();
    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Scale canvas from grid units to pixels
    const cellWidthPx = ctx.canvas.width / GRID_COLS;
    const cellHeight = ctx.canvas.height / GRID_ROWS;
    ctx.scale(cellWidthPx, cellHeight);
    ctx.lineWidth = 1 / cellWidthPx;

    // Draw grid
    ctx.strokeStyle = "#404040";
    for (let x = 0; x <= GRID_ROWS; x++) {
        drawLine(ctx, new Vector2(x, 0), new Vector2(x, GRID_ROWS), "#404040");
    }
    for (let y = 0; y <= GRID_COLS; y++) {
        drawLine(ctx, new Vector2(0, y), new Vector2(GRID_COLS, y), "#404040");
    }

    // Draw points
    var p1 = new Vector2(GRID_COLS / 2, GRID_ROWS / 2);
    drawCircle(ctx, p1, 0.25, "#4400ff");

    if (p2 !== undefined) {
        drawCircle(ctx, p2, 0.25, "#4400ff");
        drawLine(ctx, p1, p2, "#4400ff");
    }
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

    // p2 represents the mouse position in grid units
    let p2: Vector2 | undefined = undefined;
    gameCanvas.addEventListener("mousemove", (event) => {
        p2 = new Vector2(event.offsetX, event.offsetY)
            .div(getCanvasSize(gameCtx))
            .scale(new Vector2(GRID_COLS, GRID_ROWS));
        // Re-draw the scene with the updated p2 position
        drawScene(gameCtx, p2);
    });

    // Initial draw
    drawScene(gameCtx, p2);
})()
