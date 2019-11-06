import { Vector } from "@glazier/vector-js";
import Painter from './painter';
import Collision from './collision'

const MAX_VELOCITY = 10;
const SLOWING_RADIUS = 20;
const MAX_FORCE = 8; // Limits the acceleration for more fluid and natural movement
const MAX_AVOIDANCE = 30;

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

    avoid = (obstacles) => {
        var avoided = this.doAvoid(obstacles);
        this.steering = this.steering.add(avoided);
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
    
    // Seek & Arrival
    doSeek = (target) => {
        var desired = target.sub(this.boid.position);
        var distance = desired.length;

        var desired_velocity;
        if(distance < SLOWING_RADIUS) {
            // Arrival, inside the slowing area
            desired_velocity = desired.normalize().mul(MAX_VELOCITY).mul(distance / SLOWING_RADIUS);
        } else {
            desired_velocity = desired.normalize().mul(MAX_VELOCITY);
        }

        var steering_force = desired_velocity.sub(this.boid.velocity);

        return steering_force;
    }

    // Avoid
    doAvoid = (obstacles) => {
        var dynamic_length = this.boid.velocity.length / MAX_VELOCITY;
        var ahead = this.boid.position.add(this.boid.velocity.normalize().mul(dynamic_length));
        var ahead2 = this.boid.position.add(this.boid.velocity.normalize().mul(dynamic_length*0.5));
        var threat = this.getMostThreatening(ahead, ahead2, obstacles);

        var avoidance_force = new Vector(0.0, 0.0);
        if(threat != null) {
            // var look_ahead = this.boid.velocity.normalize().mul(13);
            avoidance_force = ahead.sub(threat);
            // avoidance_force = ahead.sub(threat);
            avoidance_force = avoidance_force.normalize().mul(MAX_AVOIDANCE);
        }
        
        return avoidance_force;
    }

    doAvoidAll = (obstacles) => {

    }

    getMostThreatening = (ahead, ahead2, obstacles) => {
        var position = this.boid.position;
        var mostThreatening = null;
        var look_ahead = this.boid.velocity.normalize().mul(13);
        var ahead_point = this.boid.position.add(look_ahead);
        
        for(var i=0; i<obstacles.length; i++) {
            var obstacle = obstacles[i];
            // var collided = this.collided(ahead, ahead2, obstacle);
            var intercepted = Collision.intercept(this.boid.position, ahead_point, obstacle, 20.0);

            if(intercepted && (mostThreatening == null || Collision.distance(position, obstacle) < Collision.distance(position, mostThreatening))) {
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