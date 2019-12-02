import { Vector } from "@glazier/vector-js";
import Painter from './painter';
import Collision from './collision'
import VectorOps from './vectorops'
import { SLOWING_RADIUS, MAX_VELOCITY, MAX_FORCE, MAX_AVOIDANCE, CIRCLE_DISTANCE, CIRCLE_RADIUS, ANGLE_CHANGE } from './const'

class Behaviour {

    // boid : object
    // steering : sum of all steering force acting on the object
    constructor(boid) {
        this.boid = boid;
        this.steering = new Vector(0.0, 0.0);
    }

    /*
     *  Section : Scenarios/Strategies
     */

    seek_only = (target) => {        
        var steered = this.arrive(target);
        this.steering = this.steering.add(steered);
    }

    wander_only = () => {
        var steered = this.wander();
        this.steering = this.steering.add(steered);
    }

    avoid_only = (obstacles, walls) => {
        var avoided = this.avoidAll(obstacles);
        this.steering = this.steering.add(avoided);
        var avoided_too = this.avoidWalls(walls);
        this.steering = this.steering.add(avoided_too);
    }
    
    // Seek only when there is no obstacles
    avoidToSeek = (target, obstacles, walls) => {
        var avoid_obstacles = this.avoidAll(obstacles);
        var avoid_walls = this.avoidWalls(walls);
        if(avoid_obstacles.length > 0.000001 || avoid_walls.length > 0.000001) {
            var total_avoidance = avoid_walls.add(avoid_obstacles);
            total_avoidance = VectorOps.limitMaxDeviation(this.boid.velocity, total_avoidance, 45);
            this.steering = this.steering.add(total_avoidance);
            // this.steering = this.steering.add(avoid_obstacles);

            // Painter.label(this.boid.position, 'Avoid');
        }
        else {
            var steered = this.arrive(target);
            console.log('Steering by: '+steered);
            console.log('Current V: '+this.boid.velocity);
            // steered = VectorOps.limitMaxDeviation(this.boid.velocity, steered, 45);
            var distance = target.sub(this.boid.position).length;
            if(distance < 1) {
                console.log('Distance: '+distance);
            }
            console.log('Steering adjusted by: '+steered);
            this.steering = this.steering.add(steered);
            console.log('Final steering: '+this.steering);
            // Painter.label(this.boid.position, 'Seek');
        }        
        // this.steering = VectorOps.limitMaxDeviation(this.boid.velocity, this.steering, 45);
    }

    /*
     *  Section : Behaviours
     */
    
    // Seek & Arrival, boid seeking/moving towards target at max speed and slows down upon arrival
    seek = (target, radius = 0) => {
        var desired = target.sub(this.boid.position);
        var distance = desired.length;

        var desired = desired.normalize();
        if(distance < radius) {
            desired = desired.mul(MAX_VELOCITY * distance / SLOWING_RADIUS);
        } else {
            desired = desired.mul(MAX_VELOCITY);
        }

        var steering_force = desired.sub(this.boid.velocity);        

        return steering_force;
    }

    arrive = (target) => {
        return this.seek(target, SLOWING_RADIUS);
    }

    wander = () => {
        var center = this.boid.velocity;
        center = center.normalize();
        center = center.mul(CIRCLE_DISTANCE);
        
        var displacement = new Vector(0, -1);
        displacement.mul(CIRCLE_RADIUS);
        
        displacement = this.setAngle(displacement, this.boid.wander);
        this.boid.wander += Math.random() * ANGLE_CHANGE - ANGLE_CHANGE * .5;
        
        var wander_force = center.add(displacement);
        
        return wander_force;        
    }

    // Avoid the most threatening obstacle
    avoid = (obstacles) => {
        var threat = this.getMostThreatening(obstacles);
        var avoidance_force = new Vector(0.0, 0.0);
        if(threat != null) {
            var push_vector = this.boid.position.sub(threat);
            var avoidance_force = VectorOps.perpendicularComp(push_vector, this.boid.velocity.normalize());
            avoidance_force = avoidance_force.normalize().mul(MAX_AVOIDANCE);
        }
        
        return avoidance_force;
    }

    // Avoid all obstacles within range
    avoidAll = (obstacles) => {
        var position = this.boid.position;
        var avoidance_force = new Vector(0.0, 0.0);
        var count = 0;
        for(var i=0; i<obstacles.length; i++) {
            var obstacle = obstacles[i];
            var willIntersect = Collision.willIntersect(this.boid, obstacle);
            if(willIntersect) {
                var push_vector = position.sub(obstacle);
                var single_avoidance_force = VectorOps.perpendicularComp(push_vector, this.boid.velocity.normalize());
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
        var position = this.boid.position;
        var look_ahead = this.boid.velocity.normalize().mul(20);
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
        var previous = this.boid.position;
        this.steering = this.truncate(this.steering, MAX_FORCE);
        this.boid.velocity = this.boid.velocity.add(this.steering);
        this.boid.velocity = this.truncate(this.boid.velocity, MAX_VELOCITY);
        this.boid.position = this.boid.position.add(this.boid.velocity);

        Painter.drawLine(previous, this.boid.position, '#FFA500');
        this.reset();
    }

    reset = () => {
        this.steering = new Vector(0.0, 0.0);
    }

    /*
     *  Section : Utility functions
     */

    getMostThreatening = (obstacles) => {
        var position = this.boid.position;
        var mostThreatening = null;        
        for(var i=0; i<obstacles.length; i++) {
            var obstacle = obstacles[i];
            var willIntersect = Collision.willIntersect(this.boid, obstacle);

            if(willIntersect && (mostThreatening == null || VectorOps.distance(position, obstacle) < VectorOps.distance(position, mostThreatening))) {
                mostThreatening = obstacle;
            }
        }

        return mostThreatening;
    }

    truncate = (v, max) => {
        var scale = max / v.length;
        scale = (scale < 1.0) ? scale : 1.0;
        
        return v.mul(scale);
    }

    getSteering = () => {
        return this.steering;
    }

    setAngle = (vector, value) => {
        var len = vector.length;        
        var x = Math.cos(value) * len;
        var y = Math.sin(value) * len;

        return new Vector(x, y);
    }
}

export default Behaviour;