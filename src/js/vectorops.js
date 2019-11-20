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

    // Angle of v2 with respect to v1
    static angleBetween = (v1, v2) => {

        // TODO : to evaluate which is the best/correct algorithm
        // var theta = Math.atan2(this.getY(v2) - this.getY(v1), this.getX(v2) - this.getX(v1));
        var theta = Math.atan2(this.getY(v2), this.getX(v2)) - Math.atan2(this.getY(v1), this.getX(v1));
        // atan2( dx1*dy2-dx2*dy1 , dx1*dy1+dx2*dy2 )
        // var theta = Math.atan2(this.getX(v1)*this.getY(v2)-this.getX(v2)*this.getY(v1), this.getX(v1)*this.getY(v1)+this.getX(v2)*this.getY(v2));
        // var dot = v1.dot(v2);
        // var theta = Math.acos(dot / (v1.length * v2.length));

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

    // Return component of vector parallel to a unit vector
    static parallelComp = (v, unit_vector) => {
        var magnitude = v.dot(unit_vector);
        if(magnitude == 0) {
            return new Vector(0, 0);
        }
        
        return unit_vector.mul(magnitude);
    }

    // Return component of vector perpendicular to a unit vector
    static perpendicularComp = (v, unit_vector) => {
        var parallel = this.parallelComp(v, unit_vector);
        if(this.isZeroVector(parallel)) {
            return new Vector(0, 0);
        }

        return v.sub(parallel);
    }

    static isZeroVector = (v) => {
        if(this.getX(v) == 0 && this.getY(v) == 0) {
            return true;
        }

        return false;
    }

    // Limits the maximum deviation angle of source vector to max_deviation_angle of basis vector, returns limited vector
    static limitMaxDeviation = (basis, source, max_deviation_degrees) => {
        var deviation = this.angleBetween(source, basis);
        var max_deviation_radians = this.toRadians(max_deviation_degrees);
        var limited_steering_force = source;
        if(deviation > max_deviation_radians) {
            var perp_component = this.perpendicularComp(source, basis.normalize());
            var cosAngle = Math.cos(max_deviation_radians);
            var perp_distance = Math.sqrt( 1-(cosAngle*cosAngle));
            var v1 = basis.normalize().mul(cosAngle);
            var v2 = perp_component.mul(perp_distance);
            limited_steering_force = v1.add(v2).mul(source.length);
        }

        return limited_steering_force;
    }

    static toDegrees = (radians) => {
        return radians*180/Math.PI;
    }

    static toRadians = (degrees) => {
        return degrees*Math.PI/180;
    }
}

export default VectorOps;