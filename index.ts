const GRID_ROWS = 10;
const GRID_COLS = 10;

const enum MapValues {
    Empty = 0,
    Wall = 1,
}
const MAP = [
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

class Vector2 {
    constructor(public x: number, public y: number) { }

    add(b: Vector2): Vector2 {
        return new Vector2(this.x + b.x, this.y + b.y);
    }

    sub(b: Vector2): Vector2 {
        return new Vector2(this.x - b.x, this.y - b.y);
    }

    scale(b: Vector2 | number): Vector2 {
        if (typeof b === 'number') {
            return new Vector2(this.x * b, this.y * b);
        } else {
            return new Vector2(this.x * b.x, this.y * b.y);
        }
    }

    div(b: Vector2): Vector2 {
        return new Vector2(this.x / b.x, this.y / b.y);
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vector2 {
        const len = this.length();
        if (len === 0) return new Vector2(0, 0);
        return new Vector2(this.x / len, this.y / len);
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

function drawRect(ctx: CanvasRenderingContext2D, topLeft: Vector2, bottomRight: Vector2, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    ctx.fill();
}

function getCanvasSize(ctx: CanvasRenderingContext2D): Vector2 {
    return new Vector2(ctx.canvas.width, ctx.canvas.height);
}

// TODO: Documentation
function rayStep(p1: Vector2, p2: Vector2): Vector2 | null {
    let nextPoint: Vector2 | null;
    let startPoint = new Vector2(p1.x, p1.y);
    let targetPoint = new Vector2(p2.x, p2.y);
    const delta = targetPoint.sub(startPoint);

    // Nudge startPoint slightly if it's already on a gridline to prevent returning the same point
    const tolerance = 1e-9;
    if (Math.ceil(startPoint.x) === Math.trunc(startPoint.x)) {
        startPoint.x += delta.x > 0 ? tolerance : -tolerance;
    }
    if (Math.ceil(startPoint.y) === Math.trunc(startPoint.y)) {
        startPoint.y += delta.y > 0 ? tolerance : -tolerance;
    }

    // Ray is vertical, handle it to avoid division by zero issues
    if (delta.x === 0) { // move directly up or down
        nextPoint = new Vector2(startPoint.x, delta.y > 0 ? Math.ceil(startPoint.y) : Math.floor(startPoint.y));
        if (nextPoint.sub(startPoint).lengthSquared() > delta.lengthSquared()) {
            console.debug("nextPoint is further away than targetPoint");
            return null;
        }

        return nextPoint;
    }

    // m = dy / dx
    // b = y1 - m*x1
    const slope = delta.y / delta.x;
    const yIntercept = startPoint.y - slope * startPoint.x;

    let nextX: number, nextY: number;
    const stepX = directionalRound(startPoint.x, delta.x);
    const potentialY = slope * stepX + yIntercept; // Get Y from X

    // If potentialY is: minY <= potentialY <= maxY, then we're looking at a wall
    if (potentialY > Math.trunc(startPoint.y) && potentialY < Math.ceil(startPoint.y)) {
        if (delta.x > 0) console.debug("Looking at right-wall");
        else console.debug("Looking at left-wall");

        nextX = stepX;
        nextY = potentialY;
    }
    else { // Else we're looking at a floor or ceiling, and mus re-calculate nextX and nextY
        if (delta.y < 0) console.debug("Looking at ceiling");
        else console.debug("Looking at floor");

        const stepY = directionalRound(startPoint.y, delta.y);
        nextY = stepY;
        nextX = (stepY - yIntercept) / slope; // Get X from Y
    }

    nextPoint = new Vector2(nextX, nextY);
    if (nextPoint.sub(startPoint).lengthSquared() > delta.lengthSquared()) {
        console.debug("nextPoint is further away than targetPoint");
        return null;
    }

    return nextPoint;
}

/**
 * Rounds a number either towards positive or negative infinity, depending on the sign of the direction.
 *
 * @param x The number to round.
 * @param dx The direction indicator. If positive, rounds towards positive infinity. If negative, rounds towards negative infinity.
 * @returns The rounded number.
 */
function directionalRound(x: number, dx: number): number {
    if (dx > 0) return Math.ceil(x);
    if (dx < 0) return Math.trunc(x);
    return x;
}

/**
 * Draws the entire scene on the provided canvas context.
 *
 * @param ctx - The canvas rendering context used for drawing.
 * @param p2 - An optional vector representing an additional point to be drawn and connected to the center.
 */
function drawScene(ctx: CanvasRenderingContext2D, p2: Vector2 | undefined) {
    // Clear canvas (fill background)
    ctx.reset();
    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Scale canvas from grid units to pixels
    const cellWidthPx = ctx.canvas.width / GRID_COLS;
    const cellHeightPx = ctx.canvas.height / GRID_ROWS;
    ctx.scale(cellWidthPx, cellHeightPx);
    ctx.lineWidth = 1 / cellWidthPx;

    // Draw grid
    for (let x = 0; x <= GRID_ROWS; x++) {
        drawLine(ctx, new Vector2(x, 0), new Vector2(x, GRID_ROWS), "#404040");
    }
    for (let y = 0; y <= GRID_COLS; y++) {
        drawLine(ctx, new Vector2(0, y), new Vector2(GRID_COLS, y), "#404040");
    }

    // TODO: Combine grid and map draw calls for efficiency

    // Draw map
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            const cell = MAP[y][x];
            if (cell === MapValues.Empty) {
                continue;
            }
            else if (cell === MapValues.Wall) {
                drawRect(ctx, new Vector2(x, y), new Vector2(x + 1, y + 1), "#ff0000");
            }
            else {
                throw new Error("Invalid map value: " + cell);
            }
        }
    }

    // Draw points
    let p1 = new Vector2(GRID_COLS / 2 + 0.5, GRID_ROWS / 2 + 0.5);
    drawCircle(ctx, p1, 0.25, "#4400ff");

    // Continuously draw points up to p2 or a maximum number of steps
    if (p2 !== undefined) {
        drawCircle(ctx, p2, 0.25, "#4400ff");
        drawLine(ctx, p1, p2, "#4400ff");

        let currentPoint = p1;
        const maxSteps = 20;
        for (let i = 0; i < maxSteps; i++) {
            const nextPoint = rayStep(currentPoint, p2);
            if (nextPoint === null) {
                break;
            }
            drawCircle(ctx, nextPoint, 0.10, "#8400ff");
            if (i > 0) {
                drawLine(ctx, currentPoint, nextPoint, "#4400ff");
            }
            currentPoint = nextPoint;
        }
    }
}

(() => {
    // SETUP
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

    if (MAP.length !== GRID_ROWS || MAP[0].length !== GRID_COLS) {
        throw new Error("Invalid map dimensions! Expected " + GRID_ROWS + "x" + GRID_COLS + " but got " + MAP.length + "x" + MAP[0].length + "instead.");
    }

    // UPDATE
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
