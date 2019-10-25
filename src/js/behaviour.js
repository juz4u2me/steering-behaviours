import { Vector } from "@glazier/vector-js";

const MAX_VELOCITY = 10;
const SLOWING_RADIUS = 20;
const MAX_STEERING = 10;

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

    update = () => {
        this.host.velocity = this.host.velocity.add(this.steering);
        if(this.host.velocity.length > MAX_VELOCITY) {
            this.host.velocity = this.host.velocity.normalize().mul(MAX_VELOCITY);
        }
        this.host.position = this.host.position.add(this.host.velocity);

        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");   
        var rect = canvas.getBoundingClientRect();
        var x = this.host.position.toArray()[0] - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = this.host.position.toArray()[1] - rect.top;

        ctx.fillStyle = "#00FF00"; // Green color
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI, true);
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
}

export default Behaviour;