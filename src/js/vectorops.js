import { Vector } from "@glazier/vector-js";

class VectorOps {
    
    static getX = (v1) => {
        return v1.toArray()[0];
    }

    static getY = (v1) => {
        return v1.toArray()[1];
    }

    static distance = (a, b) => {
        var ax = this.getX(a);
        var ay = this.getY(a);
        var bx = this.getX(b);
        var by = this.getY(b);
        return Math.sqrt((ax - bx) * (ax - bx)  + (ay - by) * (ay - by));
    }

    static angleBetween = (v1, v2) => {
        var dot = v1.dot(v2);
        var theta = Math.acos(dot / (v1.length * v2.length));

        return theta;
    }

    static anticlockwise_perp = (v1) => {
        var x = this.getX(v1);
        var y = this.getY(v1);

        return new Vector(-y, x);
    }

    static clockwise_perp = (v1) => {
        var x = this.getX(v1);
        var y = this.getY(v1);

        return new Vector(y, -x);
    }
}

export default VectorOps;