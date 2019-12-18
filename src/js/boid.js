import { Vector } from "@glazier/vector-js";
import Painter from './painter';
import Collision from './collision'
import Proximity from './proximity'
import VectorOps from './vectorops'
import { SLOWING_RADIUS, MAX_VELOCITY, MAX_FORCE, MAX_AVOIDANCE, CIRCLE_DISTANCE, CIRCLE_RADIUS, ANGLE_CHANGE } from './const'

class Boid {

    // boid : object
    // acceleration : sum of all acceleration force acting on the object
    // constructor(boid) {
    //     this.boid = boid;
    //     this.acceleration = new Vector(0.0, 0.0);

    //     // Test randomize
    //     this.boid.velocity = new Vector(Math.random(-1, 1), Math.random(-1, 1));
    // }

    constructor(i, x, y) {
        this.id = i;
        this.acceleration = new Vector(0, 0);
        this.velocity = new Vector(Math.random(-1, 1), Math.random(-1, 1));
        this.position = new Vector(x, y);
        this.r = 3.0;
        this.maxspeed = 3;    // Maximum speed
        this.maxforce = 0.05; // Maximum acceleration force
        this.wander_angle = 0.0;
        this.color = Painter.getRandomColor();
    }

    /*
     *  Section : Scenarios/Strategies
     */

    seek_only = (target) => {        
        var steered = this.arrive(target);
        this.acceleration = this.acceleration.add(steered);
    }

    wander_only = () => {
        var steered = this.wander();
        this.acceleration = this.acceleration.add(steered);
    }

    avoid_only = (obstacles, walls) => {
        var avoided = this.avoidAll(obstacles);
        this.acceleration = this.acceleration.add(avoided);
        var avoided_too = this.avoidWalls(walls);
        this.acceleration = this.acceleration.add(avoided_too);
    }
    
    // Seek only when there is no obstacles
    avoidToSeek = (target, obstacles, walls) => {
        var avoid_obstacles = this.avoidAll(obstacles);
        var avoid_walls = this.avoidWalls(walls);
        if(avoid_obstacles.length > 0.000001 || avoid_walls.length > 0.000001) {
            var total_avoidance = avoid_walls.add(avoid_obstacles);
            total_avoidance = VectorOps.limitMaxDeviation(this.boid.velocity, total_avoidance, 45);
            this.acceleration = this.acceleration.add(total_avoidance);
            // this.acceleration = this.acceleration.add(avoid_obstacles);

            // Painter.label(this.position, 'Avoid');
        }
        else {
            var steered = this.arrive(target);
            console.log('acceleration by: '+steered);
            console.log('Current V: '+this.velocity);
            // steered = VectorOps.limitMaxDeviation(this.velocity, steered, 45);
            var distance = target.sub(this.position).length;
            if(distance < 1) {
                console.log('Distance: '+distance);
            }
            console.log('acceleration adjusted by: '+steered);
            this.acceleration = this.acceleration.add(steered);
            console.log('Final acceleration: '+this.acceleration);
            // Painter.label(this.position, 'Seek');
        }        
        // this.acceleration = VectorOps.limitMaxDeviation(this.velocity, this.acceleration, 45);
    }

    flock = (boids) => {
        var steered = this.wander();
        this.acceleration = this.acceleration.add(steered);
        var steered2 = this.separate(boids);
        this.acceleration = this.acceleration.add(steered2);
        var steered3 = this.align(boids);
        this.acceleration = this.acceleration.add(steered3);
        var steered4 = this.cohere(boids);
        this.acceleration = this.acceleration.add(steered4);
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
            desired = desired.mul(MAX_VELOCITY * distance / SLOWING_RADIUS);
        } else {
            desired = desired.mul(MAX_VELOCITY);
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
    
    separate = (boids) => {
        /* The acceleration is calculated by iterating through all the neighbors, examining each one. 
         * The vector to each agent under consideration is normalized, multiplied by a strength decreasing 
         * according to the inverse square law in relation to distance, and accumulated.
         */
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
                diff.normalize();
                diff.mul(1/d);        // Weight by distance
                steer.add(diff);
                count++;            // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            steer.mul(1/count);
        }

        // As long as the vector is greater than 0
        if (steer.length > 0) {
            // Implement Reynolds: Steering = Desired - Velocity
            steer.normalize();
            steer.mul(this.maxspeed);
            steer.sub(this.velocity);
            // steer.limit(this.maxforce);
        }
        return steer;
    }

    align = (boids) => {
        /* The acceleration is calculated by first iterating through all the neighbors and averaging their 
         * linear velocity vectors. This value is the desired direction, so we just subtract the owner's linear 
         * velocity to get the steering output.
         */
        let neighbordist = 50;
        let sum = new Vector(0,0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = VectorOps.distance(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].velocity);
                count++;
            }
        }

        if (count > 0) {
            sum.mul(1/count);
            sum.normalize();
            sum.mul(this.maxspeed);
            let steer = sum.sub(this.velocity);
            // steer.limit(this.maxforce);
            return steer;
        } else {
            return new Vector(0, 0);
        }
    }

    cohere = (boids) => {
        /* The acceleration is calculated by first iterating through all the neighbors and averaging their position 
         * vectors. This gives us the center of mass of the neighbors, the place the agents wants to get to, so it seeks to that position.
         */
        let neighbordist = 50;
        let sum = new Vector(0, 0);   // Start with empty vector to accumulate all locations
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = VectorOps.distance(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].position); // Add location
                count++;
            }
        }
        if (count > 0) {
            sum.mul(1/count);
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
        this.acceleration = this.truncate(this.acceleration, MAX_FORCE);
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.truncate(this.velocity, MAX_VELOCITY);
        this.position = this.position.add(this.velocity);
        this.wrapAround();
       
        this.reset();
    }

    reset = () => {
        this.acceleration = new Vector(0.0, 0.0);
    }

    /*
     *  Section : Utility functions
     */

    truncate = (v, max) => {
        var scale = max / v.length;
        scale = (scale < 1.0) ? scale : 1.0;
        
        return v.mul(scale);
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

    wrapAround = () => {
        var x = VectorOps.getX(this.position);
        var y = VectorOps.getY(this.position);
        var corrected_x = x;
        var corrected_y = y;
        var canvas = document.getElementById('nav-area');
        if(x < 0) {
            corrected_x = canvas.width;
        }
        else if(x > canvas.width) {
            corrected_x = 0;
        }

        if(y < 0) {
            corrected_y = canvas.height;
        }
        else if(y > canvas.height) {
            corrected_y = 0;
        }

        this.position = new Vector(corrected_x, corrected_y);
    }
}

export default Boid;