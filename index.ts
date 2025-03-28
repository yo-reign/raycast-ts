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

function rayStep(p1: Vector2, p2: Vector2): Vector2 {
    // p1 = (x1, y1)
    // p2 = (x2, y2)
    //
    // | y1 = m*x1 + b
    // | y2 = m*x2 + b

    // dy = y2 - y1
    // dx = x2 - x1
    const delta = p2.sub(p1);

    // Handle vertical lines to avoid division by zero
    // Ray is vertical, move directly up or down
    if (delta.x === 0) {
        return new Vector2(p1.x, delta.y > 0 ? Math.ceil(p1.y) : Math.floor(p1.y));
    }

    // m = dy / dx
    const slope = delta.y / delta.x;
    // b = y1 - m*x1
    const yIntercept = p1.y - slope * p1.x;

    //console.debug(`delta | x: ${delta.x}, y ${delta.y}\nm: ${m}`);

    let nextX: number, nextY: number;
    if (delta.x < 0 && slope > 0) {
        console.debug("Looking at Top-Left Sector");
        const potentialY = slope * Math.floor(p1.x) + yIntercept;
        if (potentialY > Math.floor(p1.y)) {
            nextX = Math.floor(p1.x);
            nextY = potentialY;
        }
        else {
            nextX = (Math.floor(p1.y) - yIntercept) / slope;
            nextY = Math.floor(p1.y);
        }
    } // Top right angle
    else if (delta.x > 0 && slope < 0) {
        console.debug("Looking at Top-Right Sector");
        const potentialY = slope * Math.ceil(p1.x) + yIntercept;
        if (potentialY > Math.floor(p1.y)) {
            nextX = Math.ceil(p1.x);
            nextY = potentialY;
        }
        else {
            nextX = (Math.floor(p1.y) - yIntercept) / slope;
            nextY = Math.floor(p1.y);
        }
    } // Bottom left angle
    else if (delta.x < 0 && slope < 0) {
        console.debug("Looking at Bottom-Left Sector");
        const potentialY = slope * Math.floor(p1.x) + yIntercept;
        if (potentialY < Math.ceil(p1.y)) {
            nextX = Math.floor(p1.x);
            nextY = potentialY;
        }
        else {
            nextX = (Math.ceil(p1.y) - yIntercept) / slope;
            nextY = Math.ceil(p1.y);
        }
        return new Vector2(nextX, nextY);
    } // Bottom right angle
    else if (delta.x > 0 && slope > 0) {
        console.debug("Looking at Bottom-Right Sector");
        const potentialY = slope * Math.ceil(p1.x) + yIntercept;
        if (potentialY < Math.ceil(p1.y)) {
            nextX = Math.ceil(p1.x);
            nextY = potentialY;
        }
        else {
            nextX = (Math.ceil(p1.y) - yIntercept) / slope;
            nextY = Math.ceil(p1.y);
        }
    } else {
        throw new Error("Invalid ray step!");
    }

    return new Vector2(nextX, nextY);
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

    // TODO: Combine this with the map drawing loop for efficiency
    //// Draw map
    //for (let y = 0; y < GRID_ROWS; y++) {
    //    for (let x = 0; x < GRID_COLS; x++) {
    //        const cell = MAP[y][x];
    //        if (cell === MapValues.Empty) {
    //            continue;
    //        }
    //        else if (cell === MapValues.Wall) {
    //            drawRect(ctx, new Vector2(x, y), new Vector2(x + 1, y + 1), "#ff0000");
    //        }
    //        else {
    //            throw new Error("Invalid map value: " + cell);
    //        }
    //    }
    //}

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

    if (p2 !== undefined) {
        drawCircle(ctx, p2, 0.25, "#4400ff");
        drawLine(ctx, p1, p2, "#4400ff");

        const p3 = rayStep(p1, p2);
        drawCircle(ctx, p3, 0.25, "#4400ff");
        drawLine(ctx, p2, p3, "#4400ff");
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
