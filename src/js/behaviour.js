import { Vector } from "@glazier/vector-js";
import Painter from './painter';
import Collision from './collision'
import VectorOps from './vectorops'
import { SLOWING_RADIUS, MAX_VELOCITY, MAX_FORCE, MAX_AVOIDANCE } from './const'

class Behaviour {

    // boid : object
    // steering : sum of all steering force acting on the object
    constructor(boid) {
        this.boid = boid;
        this.steering = new Vector(0.0, 0.0);
    }

    seek = (target) => {        
        var steered = this.doSeek(target);
        this.steering = this.steering.add(steered);
    }

    avoid = (obstacles, walls) => {
        var avoided = this.doAvoidAll(obstacles);
        this.steering = this.steering.add(avoided);
        var avoided_too = this.doAvoidWalls(walls);
        this.steering = this.steering.add(avoided_too);
    }
    
    // Seek only when there is no obstacles
    avoidToSeek = (target, obstacles, walls) => {
        var avoid_obstacles = this.doAvoidAll(obstacles);
        // var avoid_walls = this.doAvoidWalls(walls);
        if(avoid_obstacles.length > 0.000001) {
            // this.steering = this.steering.add(avoid_walls);
            this.steering = this.steering.add(avoid_obstacles);
            // Painter.label(this.boid.position, 'Avoid');
        }
        else {
            var steered = this.doSeek(target);
            this.steering = this.steering.add(steered);
            // Painter.label(this.boid.position, 'Seek');
        }
    }

    update = () => {
        var previous = this.boid.position;
        this.steering = this.limitSteering(this.steering);
        this.boid.velocity = this.boid.velocity.add(this.steering);        
        this.boid.velocity = this.limitVelocity(this.boid.velocity);
        this.boid.position = this.boid.position.add(this.boid.velocity);

        Painter.drawLine(previous, this.boid.position, '#FFA500');
        this.reset();
    }

    reset = () => {
        this.steering = new Vector(0.0, 0.0);
    }
    
    // Seek & Arrival, boid seeking/moving towards target at max speed and slows down upon arrival
    doSeek = (target) => {
        var desired = target.sub(this.boid.position);
        var distance = desired.length;

        var desired_velocity;
        if(distance < SLOWING_RADIUS) {            
            desired_velocity = desired.normalize().mul(MAX_VELOCITY).mul(distance / SLOWING_RADIUS);
        } else {
            desired_velocity = desired.normalize().mul(MAX_VELOCITY);
        }

        var steering_force = desired_velocity.sub(this.boid.velocity);

        return steering_force;
    }

    // Avoid the most threatening obstacle
    doAvoid = (obstacles) => {
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
    doAvoidAll = (obstacles) => {
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

    doAvoidWalls = (walls) => {

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

    // Limits the amount of steering force acting on the boid, determines the fluidness of the motion
    limitSteering = (steering_force) => {
        if(steering_force.length > MAX_FORCE) {
            steering_force = steering_force.normalize().mul(MAX_FORCE);
        }

        return steering_force;
    }

    limitVelocity = (velocity) => {
        if(velocity.length > MAX_VELOCITY) {
            velocity = velocity.normalize().mul(MAX_VELOCITY);
        }

        return velocity;
    }

    getSteering = () => {
        return this.steering;
    }
}

export default Behaviour;