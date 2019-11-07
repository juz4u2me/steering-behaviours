import VectorOps from './vectorops'

const BUFFER = 20.0;

class Collision {

    static collided = (ahead, ahead2, obstacle) => {
        var position = this.boid.position;
        var d1 = VectorOps.distance(ahead, obstacle);
        var d2 = VectorOps.distance(ahead2, obstacle);
        var d3 = VectorOps.distance(position, obstacle);
        if(d1 <= BUFFER || d2 <= BUFFER || d3 <= BUFFER) {
            return true;
        }

        return false;
    }

    // a - start point of line
    // b - end point of line
    // c - obstacle center
    // radius - radius of obstacle
    static intercept = (a, b, c, radius) => {
        var ax = VectorOps.getX(a);
        var ay = VectorOps.getY(a);
        var bx = VectorOps.getX(b);
        var by = VectorOps.getY(b);
        var cx = VectorOps.getX(c);
        var cy = VectorOps.getY(c);        

        var v1x = bx - ax;
        var v1y = by - ay;
        var v2x = cx - ax;
        var v2y = cy - ay;
        // get the unit distance along the line of the closest point to circle center
        var u = (v2x * v1x + v2y * v1y) / (v1y * v1y + v1x * v1x);
        
        var dist;
        // if the point is on the line segment get the distance squared from that point to the circle center
        if(u >= 0 && u <= 1){
            dist  = Math.pow((ax + v1x * u - cx), 2.0) + Math.pow((ay + v1y * u - cy), 2.0);
        } else {
            // if closest point not on the line segment
            // use the unit distance to determine which end is closest
            // and get dist square to circle
            dist = u < 0 ?
                Math.pow((ax - cx), 2.0) + Math.pow((ay - cy), 2.0) :
                Math.pow((bx - cx), 2.0) + Math.pow((by - cy), 2.0);
        }

        var d = VectorOps.distance(a, c);        
        var within = (d <= BUFFER);
        var intercepted = (dist < radius*radius);

        return within || intercepted;
    }
}

export default Collision;