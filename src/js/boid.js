import { Vector } from "@glazier/vector-js";
import Painter from './painter';
import Collision from './collision';
import Proximity from './proximity';
import VectorOps from './vectorops';
import { SLOWING_RADIUS, MAX_VELOCITY, MAX_FORCE, MAX_AVOIDANCE, CIRCLE_DISTANCE, CIRCLE_RADIUS, ANGLE_CHANGE, EPSILON } from './const';

class Boid {

    // boid : object
    // acceleration : sum of all acceleration force acting on the object
    // constructor(boid) {
    //     this.boid = boid;
    //     this.acceleration = new Vector(0.0, 0.0);

    //     // Test randomize
    //     this.boid.velocity = new Vector(Math.random(-1, 1), Math.random(-1, 1));
    // }

    constructor(i, v) {
        this.id = i;
        this.acceleration = new Vector(0, 0);
        this.velocity = Boid.generateXY(99, 99);
        this.position = v
        this.r = 3.0;
        this.maxspeed = 3;    // Maximum speed
        this.maxforce = 0.05; // Maximum acceleration force
        this.wander_angle = 0.0;
        // this.color = Painter.getRandomColor();
        this.color = 'black';
    }

    /*
     *  Section : Scenarios/Strategies
     */

    seek_only = (target) => {        
        var seeking = this.arrive(target);
        this.applyForce(seeking);
    }

    wander_only = (boids) => {
        var wandering = this.wander();
        // var separation = this.separate(boids);
        this.applyForce(wandering);
        // this.applyForce(separation);
    }

    avoid_only = (obstacles, walls) => {
        var avoiding = this.avoidAll(obstacles);
        var avoiding_walls = this.avoidWalls(walls);
        this.applyForce(avoiding);
        this.applyForce(avoiding_walls);
    }
    
    // Seek only when there is no obstacles
    avoid_and_seek = (target, obstacles, walls) => {
        var avoid_obstacles = this.avoidAll(obstacles);
        var avoid_walls = this.avoidWalls(walls);
        if(avoid_obstacles.length > EPSILON || avoid_walls.length > EPSILON) {
            var total_avoidance = avoid_walls.add(avoid_obstacles);
            total_avoidance = VectorOps.limitMaxDeviation(this.boid.velocity, total_avoidance, 45);
            this.applyForce(total_avoidance);
            // this.acceleration = this.acceleration.add(avoid_obstacles);
        }
        else {
            var arrival = this.arrive(target);
            console.log('acceleration by: '+arrival);
            console.log('Current V: '+this.velocity);
            // steered = VectorOps.limitMaxDeviation(this.velocity, steered, 45);
            var distance = target.sub(this.position).length;
            if(distance < 1) {
                console.log('Distance: '+distance);
            }
            console.log('acceleration adjusted by: '+arrival);
            this.applyForce(arrival);
            console.log('Final acceleration: '+this.acceleration);
            // Painter.label(this.position, 'Seek');
        }        
        // this.acceleration = VectorOps.limitMaxDeviation(this.velocity, this.acceleration, 45);
    }

    flock = (boids) => {
        var separation = this.separate(boids);        
        var alignment = this.align(boids);        
        var cohesion = this.cohere(boids);
        separation = separation.mul(1.5);
        alignment = alignment.mul(1.0);
        cohesion = cohesion.mul(0.02);
        this.applyForce(separation);
        this.applyForce(alignment);
        this.applyForce(cohesion);
    }
    
    blendedSteering = () => {
        /* BlendedSteering is a combination behavior that simply sums up all the active behaviors, applies their weights, 
         * and truncates the result before returning. There are no constraints on the blending weights; they don't have to 
         * sum to one, for example, and rarely do. Don't think of BlendedSteering as a weighted mean, because it's not.
         */
    }

    prioritySteering = () => {
        /* PrioritySteering behavior iterates through the active behaviors and returns the first non zero steering. It makes 
         * sense since certain steering behaviors only request an acceleration in particular conditions. Unlike Seek or Evade, 
         * which always produce an acceleration, RaycastObstacleAvoidance, CollisionAvoidance, Separation, Hide and Arrive will 
         * suggest no acceleration in many cases. But when these behaviors do suggest an acceleration, it is unwise to ignore it. 
         * An obstacle avoidance behavior, for example, should be honored immediately to avoid the crash.
         */
    }

    /*
     *  Section : Behaviours
     */
    
    // Seek & Arrival, boid seeking/moving towards target at max speed and slows down upon arrival
    seek = (target, radius = 0) => {
        var desired = target.sub(this.position);
        var distance = desired.length;

        var desired = desired.normalize();
        if(distance < radius) {
            desired = desired.mul(this.maxspeed * distance / SLOWING_RADIUS);
        } else {
            desired = desired.mul(this.maxspeed);
        }

        var steering_force = desired.sub(this.velocity);        

        return steering_force;
    }

    arrive = (target) => {
        return this.seek(target, SLOWING_RADIUS);
    }

    pursuit = (target) => {

    }

    wander = () => {
        var center = this.velocity;
        center = center.normalize();
        center = center.mul(CIRCLE_DISTANCE);
        
        var displacement = new Vector(0, -1);
        displacement.mul(CIRCLE_RADIUS);
        
        displacement = this.setAngle(displacement, this.wander_angle);
        this.wander_angle += Math.random() * ANGLE_CHANGE - ANGLE_CHANGE * .5;
        
        var wander_force = center.add(displacement);
        
        return wander_force;        
    }
    
    /* The acceleration is calculated by iterating through all the neighbors, examining each one. 
     * The vector to each agent under consideration is normalized, multiplied by a strength decreasing 
     * according to the inverse square law in relation to distance, and accumulated.
     */
    separate = (boids) => {
        
        let desiredseparation = 25.0;
        let steer = new Vector(0, 0);
        let count = 0;
        // For every boid in the system, check if it's too close
        for(let i=0; i<boids.length; i++) {
            let d = VectorOps.distance(this.position, boids[i].position);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < desiredseparation)) {
                // Calculate vector pointing away from neighbor
                let diff = this.position.sub(boids[i].position);     
                diff = this.norm_scale(diff, 1/d); // Weight by inverse distance
                steer = steer.add(diff);
                count++;            // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            steer = steer.mul(1/count);
        }

        // As long as the vector is greater than 0
        if (steer.length > 0) {
            // Implement Reynolds: Steering = Desired - Velocity
            steer = this.norm_scale(steer, this.maxspeed);
            steer = steer.sub(this.velocity);
            steer = this.truncate(steer, this.maxforce);
        }
        return steer;
    }

    /* The acceleration is calculated by first iterating through all the neighbors and averaging their 
     * linear velocity vectors. This value is the desired direction, so we just subtract the owner's linear 
     * velocity to get the steering output.
     */
    align = (boids) => {
        let neighbordist = 50;
        let sum = new Vector(0,0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = VectorOps.distance(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum = sum.add(boids[i].velocity);
                count++;
            }
        }

        if (count > 0) {
            sum = sum.mul(1/count);
            sum = this.norm_scale(sum, this.maxspeed);
            let steer = sum.sub(this.velocity);
            steer = this.truncate(steer, this.maxforce);
            return steer;
        } else {
            return new Vector(0, 0);
        }
    }

    /* The acceleration is calculated by first iterating through all the neighbors and averaging their position 
     * vectors. This gives us the center of mass of the neighbors, the place the agents wants to get to, so it seeks to that position.
     */
    cohere = (boids) => {
        let neighbordist = 50;
        let sum = new Vector(0, 0);   // Start with empty vector to accumulate all locations
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = VectorOps.distance(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum = sum.add(boids[i].position); // Add location
                count++;
            }
        }
        if (count > 0) {
            sum = sum.mul(1/count);
            return this.seek(sum);  // Steer towards the location
        } else {
            return new Vector(0, 0);
        }
    }

    // Avoid the most threatening obstacle
    avoid = (obstacles) => {
        var threat = Proximity.getMostThreatening(obstacles);
        var avoidance_force = new Vector(0.0, 0.0);
        if(threat != null) {
            var push_vector = this.position.sub(threat);
            var avoidance_force = VectorOps.perpendicularComp(push_vector, this.velocity.normalize());
            avoidance_force = avoidance_force.normalize().mul(MAX_AVOIDANCE);
        }
        
        return avoidance_force;
    }

    raycast_avoid = (obstacles) => {
        
    }

    // Avoid all obstacles within range
    avoidAll = (obstacles) => {
        var position = this.position;
        var avoidance_force = new Vector(0.0, 0.0);
        var count = 0;
        for(var i=0; i<obstacles.length; i++) {
            var obstacle = obstacles[i];
            var willIntersect = Collision.willIntersect(this, obstacle);
            if(willIntersect) {
                var push_vector = position.sub(obstacle);
                var single_avoidance_force = VectorOps.perpendicularComp(push_vector, this.velocity.normalize());
                avoidance_force = avoidance_force.add(single_avoidance_force);
                count++;
            }
        }

        if(count != 0) {
            avoidance_force = avoidance_force.mul(1/count);
        }

        avoidance_force = avoidance_force.mul(MAX_AVOIDANCE);

        return avoidance_force;
    }

    avoidWalls = (walls) => {

        // Compute for vehicle look ahead point
        var position = this.position;
        var look_ahead = this.velocity.normalize().mul(20);
        var ahead_point = position.add(look_ahead);

        // wall start point to ahead_point
        var wall_avoidance_force = new Vector(0.0, 0.0);
        for(var i=0; i<walls.length; i++) {
            console.log('Wall '+(i+1)+' : '+walls[i]);
            var wall = walls[i];
            var a = ahead_point.sub(wall[0]);
            var b = wall[1].sub(wall[0]);
            var theta = VectorOps.angleBetween(a, b);
            // var d = a.length*Math.sin(theta);
            b = b.normalize();
            b = b.mul(a.dot(b));
            var normPt = wall[0].add(b);
            if(VectorOps.distance(wall[0], normPt) <= VectorOps.distance(wall[0], wall[1])) { // Ensure within length of wall
                var gap = VectorOps.distance(ahead_point, normPt);
                console.log(gap);
                Painter.drawPoint(normPt, 2, '#0000FF');
                if(gap < 20) {
                    var normal = VectorOps.clockwise_perp(b).normalize().mul(MAX_AVOIDANCE);
                    // Painter.drawLine(normPt, normPt.add(normal), '#FF0000');

                    wall_avoidance_force = wall_avoidance_force.add(normal);
                }
            }
        }

        return wall_avoidance_force;
    }

    update = () => {
        var previous = this.position;
        this.acceleration = this.truncate(this.acceleration, MAX_FORCE);
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.truncate(this.velocity, MAX_VELOCITY);
        this.position = this.position.add(this.velocity);

        Painter.drawLine(previous, this.position, '#FFA500');
        this.reset();
    }

    update2 = () => {
        // this.acceleration = this.truncate(this.acceleration, MAX_FORCE);
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.truncate(this.velocity, MAX_VELOCITY);
        this.position = this.position.add(this.velocity);        
       
        this.reset();
    }

    reset = () => {
        this.acceleration = new Vector(0.0, 0.0);
    }

    /*
     *  Section : Utility functions
     */

    applyForce = (f) => {
        this.acceleration = this.acceleration.add(f);
    }

    truncate = (v, max) => {
        var scale = max / v.length;
        scale = (scale < 1.0) ? scale : 1.0;
        
        return v.mul(scale);
    }

    limit = (v, max) => {
        var x = VectorOps.getX(v);
        var y = VectorOps.getY(v);
        var magSq = x*x+y*y;
        // const mSq = this.magSq();
        if(magSq > max * max) {
            return v.mul(1/Math.sqrt(magSq)) //normalize it
            .mul(max);
        }

        return v;
    }

    norm_scale = (v, factor) => {
        return v.normalize().mul(factor);
    }

    getAcceleration = () => {
        return this.acceleration;
    }

    setAngle = (vector, value) => {
        var len = vector.length;        
        var x = Math.cos(value) * len;
        var y = Math.sin(value) * len;

        return new Vector(x, y);
    }

    /*
     * Bounds the global position so that it will not exceed canvas bounds
     */
    bound = () => {
        var x = VectorOps.getX(this.position);
        var y = VectorOps.getY(this.position);
        var corrected_x = x;
        var corrected_y = y;
        var canvas = document.getElementById('nav-area');
        
        var changed = false;
        if(x < -canvas.width/2) {
            console.log('Minimum X bound hit '+this.id);
            corrected_x = x + canvas.width;
            changed = true;
        }
        else if(x > canvas.width/2) {
            console.log('Maximum X bound hit '+this.id);
            corrected_x = x - canvas.width;
            changed = true;
        }

        if(y < -canvas.height/2) {
            console.log('Minimum Y bound hit '+this.id);
            corrected_y = y + canvas.height;
            changed = true;
        }
        else if(y > canvas.height/2) {
            console.log('Maximum Y bound hit '+this.id);
            corrected_y = y - canvas.height;
            changed = true;
        }

        if(changed) {
            console.log(this.id+' before: '+x, y);
            console.log(this.id+' after: '+corrected_x, corrected_y);
        }

        this.position = new Vector(corrected_x, corrected_y);
    }

    static generateXY = (x, y) => {
        var rx = Math.floor(Math.random()*x); // this will get a number between 0 and x;
        rx *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases

        var ry = Math.floor(Math.random()*y); // this will get a number between 0 and y;
        ry *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases
        
        return new Vector(rx, ry);
    }
}

export default Boid;