import { Vector } from "@glazier/vector-js";
import VectorOps from './vectorops'

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

    static label = (point, text) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");
        ctx.font = "5px Arial";
        ctx.fillText(text, VectorOps.getX(point)-5, VectorOps.getY(point)-5);
    }
}

export default Painter;