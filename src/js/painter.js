import { Vector } from "@glazier/vector-js";
import VectorOps from './vectorops';

CanvasRenderingContext2D.prototype.addGrid = function (delta, color, fontParams) {
    // define the default values for the optional arguments
    if (! arguments[0]) { delta = 25; }
    if (! arguments[1]) { color = 'blue'; }
    if (! arguments[2]) { fontParams = '8px sans-serif'; }
    // extend the canvas width and height by delta
    var oldWidth = this.canvas.width;
    var oldHeight = this.canvas.height;      
    this.canvas.width = oldWidth + delta;
    this.canvas.height = oldHeight + delta;        
    // draw the vertical and horizontal lines
    this.lineWidth = 0.1;
    this.strokeStyle = color;
    this.font = fontParams;
    this.beginPath();
    for (let i = 0; i * delta < oldWidth; i ++) {
        this.moveTo (i * delta, 0);
        this.lineTo (i * delta, oldHeight);
    }
    for (let j = 0; j * delta < oldHeight; j ++) {
        this.moveTo (0, j * delta);
        this.lineTo (oldWidth, j * delta);
    }      
    this.closePath();
    this.stroke();
    // draw a thicker line, which is the border of the original canvas
    this.lineWidth = 0.5;
    this.beginPath();
    this.moveTo(0,0);
    this.lineTo(oldWidth,0);
    this.lineTo(oldWidth,oldHeight);
    this.lineTo(0,oldHeight);
    this.lineTo(0,0);
    this.closePath();
    this.stroke();
    // set the text parameters and write the number values to the vertical and horizontal lines
    this.font = fontParams
    this.lineWidth = 0.3;
    // 1. writing the numbers to the x axis
    var textY = oldHeight + Math.floor(delta/2); // y-coordinate for the number strings
    for (let i = 0; i * delta <= oldWidth; i ++) {
        this.strokeText (i * delta, i * delta, textY);        
    }
    // 2. writing the numbers to the y axis
    var textX = oldWidth + 5; // x-coordinate for the number strings
    for (let j = 0; j * delta <= oldHeight; j ++) {
        this.strokeText (j * delta, textX, j * delta);
    }
}; 

class Painter {

    static drawPoint = (point, radius, color) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");   
        var rect = canvas.getBoundingClientRect();
        var x = VectorOps.getX(point) - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = VectorOps.getY(point) - rect.top;
    
        ctx.fillStyle = color;
        ctx.beginPath();
        // ctx.rect(x, y, 10, 10);
        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.fill();

        var pt = new Vector(x, y);

        return pt;
    }

    static drawLine = (start, end, color) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");
        var rect = canvas.getBoundingClientRect();
        var x1 = VectorOps.getX(start) - rect.left;
        var y1 = VectorOps.getY(start) - rect.top;
        var x2 = VectorOps.getX(end) - rect.left;
        var y2 = VectorOps.getY(end) - rect.top;

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fill();
    }

    static drawTriangle = (x, y, d) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(d*Math.PI/180);
        ctx.scale(1, 1);
        ctx.beginPath();
        ctx.moveTo(0,0);      // starting point at the top of the triangle
        ctx.lineTo(3,0);
        ctx.lineTo(0,-9);     // line to right bottom corner
        ctx.lineTo(-3,0);      // line to left bottom corner
        ctx.closePath();         // closes the shape with a line from the left bottom to the initial top point        
        ctx.stroke();            // draw the lines
        ctx.fill();
        ctx.restore();
    }

    static redraw = (point, radius, color) => {
        var canvas = document.getElementById('nav-area');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        var rect = canvas.getBoundingClientRect();
        var x = VectorOps.getX(point) - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = VectorOps.getY(point) - rect.top;
    
        ctx.fillStyle = color;
        ctx.beginPath();
        // ctx.rect(x, y, 10, 10);
        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.fill();
        ctx.restore();        
    }

    static refresh = (points, radius) => {
        var canvas = document.getElementById('nav-area');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        // ctx.addGrid();
        // this.drawTriangle(500, 500, 90);
        // this.drawTriangle(600, 600, 45);
        var rect = canvas.getBoundingClientRect();        
        for(var k in points) {
            // this.gradient_agent(ctx, rect, points[k], radius);
            var p = points[k].position;
            var v = points[k].velocity;
            var pt = Painter.global2local(p);
            this.pointer(pt, v);
            // var p = points[k].position;
            // var c = points[k].color;
            // var pt = Painter.global2local(p);
            // this.re_point(ctx, pt, 3, c);
            // this.label(pt, VectorOps.getX(points[k].velocity)+','+VectorOps.getY(points[k].velocity))
        }

        ctx.restore();  
    }

    static label = (point, text) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");
        ctx.font = "10px Arial";
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.fillText(text, VectorOps.getX(point)-5, VectorOps.getY(point)-5);
    }

    static re_point = (ctx, point, radius, color) => {
        ctx.beginPath();
        var x = VectorOps.getX(point); // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = VectorOps.getY(point);
        ctx.moveTo(x,y);
        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
        ctx.fillStyle = color;
        ctx.fill();
    }

    static pointer = (point, velocity) => {
        var x = VectorOps.getX(point);
        var y = VectorOps.getY(point);
        var vx = VectorOps.getX(velocity);
        var vy = VectorOps.getY(velocity);
        var heading = VectorOps.toDegrees(Math.atan2(vx, vy));
        this.drawTriangle(x, y, heading);
    }

    static agent = (ctx, rect, point, radius) => {
        ctx.beginPath();
        var x = VectorOps.getX(point.position) - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = VectorOps.getY(point.position) - rect.top;
        ctx.moveTo(x,y);
        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
        ctx.fillStyle = point.color;
        var x2 = VectorOps.getX(point.position.add(point.velocity.mul(3.0))) - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y2 = VectorOps.getY(point.position.add(point.velocity.mul(3.0))) - rect.top;
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.fill();
    }

    static gradient_agent = (ctx, rect, point, radius) => {
        ctx.beginPath();
        var x = VectorOps.getX(point.position) - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = VectorOps.getY(point.position) - rect.top;
        ctx.moveTo(x,y);
        ctx.arc(x, y, radius*10, 0, 2 * Math.PI, true);
        var x2 = VectorOps.getX(point.position.add(point.velocity.mul(3.0))) - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y2 = VectorOps.getY(point.position.add(point.velocity.mul(3.0))) - rect.top;
        var rainbowGradient = ctx.createRadialGradient (x, y, radius*10/10, x, y, radius*10);
        rainbowGradient.addColorStop (0, 'blue');
        rainbowGradient.addColorStop (0.25, 'green');
        rainbowGradient.addColorStop (0.5, 'yellow');
        rainbowGradient.addColorStop (0.75, 'orange');
        rainbowGradient.addColorStop (1, 'red');
        ctx.fillStyle = rainbowGradient;
        // ctx.moveTo(x, y);
        // ctx.lineTo(x2, y2);
        // ctx.strokeStyle = '#000000';
        // ctx.stroke();
        ctx.fill();
    }

    static getRandomColor = () => {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    static generateCanvasPt = () => {
        var canvas = document.getElementById('nav-area');
        var rx = Math.floor(Math.random()*canvas.width/2) + 1; // this will get a number between 1 and half of canvas width;
        rx *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases

        var ry = Math.floor(Math.random()*canvas.height/2) + 1; // this will get a number between 1 and half of canvas height;
        ry *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases

        return new Vector(rx, ry);
    }

    /*
     * Converts local (canvas) coordinates to global (boid space) coordinates
     */
    static local2global = () => {

    }

    /*
     * Converts global (boid space) coordinates to local (canvas) coordinates
     */
    static global2local = (pt) => {
        var canvas = document.getElementById('nav-area');
        // Midpt of canvas as (0, 0) of global coordinates
        var midx = canvas.width/2;
        var midy = canvas.height/2;
        var x = midx + VectorOps.getX(pt);
        var y = midy - VectorOps.getY(pt);
        // var wrapped_pt = this.local_wraparound(new Vector(x, y));

        return new Vector(x, y);
    }

    /*
     * Wraps around canvas if global (boid space) coordinates exceeds bounds
     */
    static local_wraparound = (pt) => {
        var canvas = document.getElementById('nav-area');
        // Midpt of canvas as (0, 0) of global coordinates
        var half_width = canvas.width/2;
        var half_height = canvas.height/2;
        var x = VectorOps.getX(pt);
        var y = VectorOps.getY(pt);
        // Minimum X
        if(x < -half_width) {
            // x = half_width - (x + half_width);
            x = x + canvas.width;
        }
        // Maximum X
        if(x > half_width) {
            // x = half_width - (x + half_width);
            x = x - canvas.width;
        }
        // Minimum Y
        if(y < -half_height) {
            // y = half_height - (y + half_height);'
            y = y + canvas.height;
        }
        // Maximum Y
        if(y > half_height) {
            // y = half_height - (y + half_height);
            y = y - 1.5*canvas.height;
        }

        return new Vector(x, y);
    }
}

export default Painter;