/**
 * TODO:
 * Refactor
 * Add axis labels (numbers)
 * Add grid lines
 * The screen needs to zoom towards the mouse rather than the center
 * 
 * ISSUES:
 * Zooming out too far causes the graph to disappear (probably because the numbers are too big)
 * * Most noticable with exponential functions
 * 
 * Because the graphing program plots points and connects them with lines, 
 * functions with two consecutive vertical asymptotes such as 1/x or tan(x) 
 * will be graphed with a very steep line, almost vertical line in the middle of the infinite discontinuity
 */

const width = 800;
const height = 800;
let canvas = document.getElementById("canvas");
canvas.width = width;
canvas.height = height;

let ctx = canvas.getContext("2d");
let canvasRect = canvas.getBoundingClientRect();

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
            return {x: (x - this.x) * this.widthRatio + width / 2, y: (-y + this.y) * this.heightRatio + height / 2};
        }

        // Translates screen coords to graphing coords
        toGraph(x, y) {
            return {x: (x - width / 2) / this.widthRatio - this.x, y: (-y + height / 2) / this.heightRatio + this.y};
        }
    }

    return new Camera();
})();

function f(x) {
    return Math.log(x);
}

function drawAxisLabels() {
    ctx.font = "12px Verdana";
    ctx.fillStyle = "black";

    
}

function drawPlane() {
    let origin = camera.toScreen(0, 0);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";

    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
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

    pmouse.x = mouse.x;
    pmouse.y = mouse.y;
}

function onMouseUp(event) {
    mouseIsDown = false;
}

function onMouseLeave(event) {
    mouseIsDown = false;
}

function onMouseScroll(event) {
    let deltaZoom = Math.pow(1.1, event.deltaY / 100);
    event.preventDefault();

    camera.width *= deltaZoom;
    camera.height *= deltaZoom;
    camera.widthRatio = width / camera.width;
    camera.heightRatio = height / camera.height;

    console.log(event.deltaY);
}

let start, lastTimestamp = 0;
function gameLoop(timestamp) {
    // Content to be animated
    ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);
    drawPlane();

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "green";

    let x = camera.x - camera.width / 2;
    let y = f(x);
    let coords = camera.toScreen(x, y);
    ctx.moveTo(coords.x, coords.y);
    x += camera.width / width;

    for (; x < camera.x + camera.width / 2; x += camera.width / width) {
        y = f(x);
        coords = camera.toScreen(x, y);
        ctx.lineTo(coords.x, coords.y);
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
canvas.addEventListener("mouseleave", onMouseLeave);
canvas.addEventListener("wheel", onMouseScroll);
window.requestAnimationFrame(gameLoop);
