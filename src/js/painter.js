import { Vector } from "@glazier/vector-js";

class Painter {

    static drawPoint = (point, radius, color) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");   
        var rect = canvas.getBoundingClientRect();
        var x = point.toArray()[0] - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = point.toArray()[1] - rect.top;
    
        ctx.fillStyle = color; // Red color
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
        var x1 = start.toArray()[0] - rect.left;
        var y1 = start.toArray()[1] - rect.top;
        var x2 = end.toArray()[0] - rect.left;
        var y2 = end.toArray()[1] - rect.top;

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fill();
    }
}

export default Painter;