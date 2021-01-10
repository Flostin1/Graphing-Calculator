let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let canvasRect = canvas.getBoundingClientRect();

let width = parseInt(canvas.width);
let height = parseInt(canvas.height);

let mouseIsDown = false;

let camera = (function() {
    class Camera {
        constructor() {
            this.x = this.y = 0;
            this.width = this.height = 20;
            this.widthRatio = width / this.width;
            this.heightRatio = height / this.height;
        }

        // Translates graphing coords to screen coords
        toScreen(x, y) {
            return [(x - this.x) * this.widthRatio + width / 2, -(y - this.y) * this.heightRatio + height / 2];
        }

        // Translates screen coords to graphing coords
        toGraph(x, y) {
            return [(x - width / 2) / this.widthRatio - this.x, (-y + height / 2) / this.heightRatio + this.y];
        }
    }

    return new Camera();
})();

function f(x) {
    return x * x;
}

function drawPlane() {
    let cameraPos = camera.toScreen(0, 0);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";

    ctx.moveTo(cameraPos[0], 0);
    ctx.lineTo(cameraPos[0], height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, cameraPos[1]);
    ctx.lineTo(width, cameraPos[1]);
    ctx.stroke();
    ctx.closePath();
}

function onMouseDown(event) {
    mouseIsDown = true;
}

let pmouse = {x: null, y: null};
function onMouseMove(event) {
    let mouse = {x: event.clientX - canvasRect.left, y: event.clientY - canvasRect.top};
    if (mouseIsDown) {
        camera.x -= (mouse.x - pmouse.x) / camera.widthRatio;
        camera.y += (mouse.y - pmouse.y) / camera.heightRatio;
    }
    pmouse = Object.assign({}, mouse);
}

function onMouseUp(event) {
    mouseIsDown = false;
}

function onMouseScroll(event) {
    // ISSUE: Zooming needs to be logarithmic

    event.preventDefault();
    camera.width /= event.deltaY * 0.01;
    camera.height /= event.deltaY * 0.01;
    camera.widthRatio = width / this.width;
    camera.heightRatio = height / this.height;

    console.log(camera.width);
}

let start, lastTimestamp = 0;
function gameLoop(timestamp) {
    // Sets the start time to the first iteration of the game loop
    if (start === undefined) {
        start = timestamp;
    }
    let elapsed = timestamp - start;

    // Content to be animated
    ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);
    drawPlane();

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";
    
    let x = camera.x - camera.width / 2;
    let y = f(x);
    let coords = camera.toScreen(x, y);
    ctx.moveTo(coords[0], coords[1]);
    x += 1 / camera.widthRatio;

    for (; x < camera.x + camera.width / 2; x += 1 / camera.widthRatio) {
        y = f(x);
        coords = camera.toScreen(x, y);
        ctx.lineTo(coords[0], coords[1]);
    }

    ctx.stroke();
    ctx.closePath();

    window.requestAnimationFrame(gameLoop);
    //console.log(1000 / (timestamp - lastTimestamp));
    //lastTimestamp = timestamp;
}

canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("wheel", onMouseScroll);
window.requestAnimationFrame(gameLoop);
