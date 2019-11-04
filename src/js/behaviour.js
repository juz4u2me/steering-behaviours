import { Vector } from "@glazier/vector-js";

const MAX_VELOCITY = 10;
const SLOWING_RADIUS = 20;
const MAX_STEERING = 10;
const MAX_LOOK_AHEAD = 20;
const BUFFER = 20.0;
const MAX_AVOIDANCE = 10;

class Behaviour {

    // host : object
    // steering : sum of all steering force acting on the object
    constructor(host) {
        this.host = host;
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
        var previous = this.host.position;
        this.host.velocity = this.host.velocity.add(this.steering);
        if(this.host.velocity.length > MAX_VELOCITY) {
            this.host.velocity = this.host.velocity.normalize().mul(MAX_VELOCITY);
        }
        this.host.position = this.host.position.add(this.host.velocity);

        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");   
        var rect = canvas.getBoundingClientRect();
        var x1 = previous.toArray()[0] - rect.left;
        var y1 = previous.toArray()[1] - rect.top;
        var x2 = this.host.position.toArray()[0] - rect.left;
        var y2 = this.host.position.toArray()[1] - rect.top;

        ctx.strokeStyle = "#FFA500"; // Orange color
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        // ctx.arc(x, y, 2, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.fill();

        this.reset();
    }

    reset = () => {
        this.steering = new Vector(0.0, 0.0);
    }
    
    // Seek
    doSeek = (target) => {
        var desired = target.sub(this.host.position);
        var distance = desired.length;

        // Arrival
        var desired_velocity;
        if(distance < SLOWING_RADIUS) {
            // Inside the slowing area
            desired_velocity = desired.normalize().mul(MAX_VELOCITY).mul(distance / SLOWING_RADIUS);
        } else {
            // Outside the slowing area.
            desired_velocity = desired.normalize().mul(MAX_VELOCITY);
        }

        var steering_force = desired_velocity.sub(this.host.velocity);
        if(steering_force.length > MAX_STEERING) {
            steering_force = steering_force.normalize().mul(MAX_STEERING);
        }

        return steering_force;
    }

    // Avoid
    doAvoid = (obstacles) => {
        var obstacle_1 = obstacles[0];
        var ahead = this.host.position.add(this.host.velocity.normalize().mul(MAX_LOOK_AHEAD));
        var ahead2 = this.host.position.add(this.host.velocity.normalize().mul(MAX_LOOK_AHEAD*0.5));
        var d1 = this.distance(ahead, obstacle_1);
        var d2 = this.distance(ahead2, obstacle_1);

        var avoidance_force = new Vector(0.0, 0.0);        
        if(d1 < BUFFER || d2 < BUFFER) {

            var avoidance_force = ahead.sub(obstacle_1);
            // if(avoidance_force.length > MAX_AVOIDANCE) {
                avoidance_force = avoidance_force.normalize().mul(MAX_AVOIDANCE);
            // }
        }
        
        return avoidance_force;
    }

    distance = (a, b) => {
        var ax = a.toArray()[0];
        var ay = a.toArray()[1];
        var bx = b.toArray()[0];
        var by = b.toArray()[1];
        return Math.sqrt((ax - bx) * (ax - bx)  + (ay - by) * (ay - by));
    }
}

export default Behaviour;