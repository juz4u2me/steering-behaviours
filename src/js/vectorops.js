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
        // atan2( cross(v1,v2) , dot(v1,v2) )


        return theta;
    }

    // Returns the angle between 2 unit vectors [0, pi], input vectors must be unit vectors
    static angleBetweenUnitVectors = (v1, v2) => {
        var dot = v1.dot(v2);
        var theta = Math.acos(dot);

        return theta;
    }

    /* Angle between the vectors as measured in a counterclockwise direction from v1 to v2. 
     * If that angle would exceed 180 degrees, then the angle is measured in the clockwise direction but given a negative value
     * atan2( dx1*dy2-dx2*dy1 , dx1*dy1+dx2*dy2 ), (-180, 180)
     */
    static directedAngleBetween = (v1, v2) => {
        var v1x = this.getX(v1);
        var v1y = this.getY(v1);
        var v2x = this.getX(v2);
        var v2y = this.getY(v2);
        var theta = Math.atan2(v1x*v2y-v2x*v1y, v1x*v1y+v2x*v2y);

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
        if(source.length == 0) {
            console.log('Zero length steering');
            return source;
        }
        // var deviation = this.directedAngleBetween(source.normalize(), basis.normalize());
        var deviation = this.angleBetweenUnitVectors(source.normalize(), basis.normalize());
        var max_deviation_radians = this.toRadians(max_deviation_degrees);
        var limited_steering_force = source;
        // Deviation can be clockwise or anticlockwise to the basis vector
        console.log(VectorOps.toDegrees(deviation))
        if(Math.abs(deviation) > max_deviation_radians) {
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