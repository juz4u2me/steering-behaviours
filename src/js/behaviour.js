import { Vector } from "@glazier/vector-js";

const MAX_VELOCITY = 10;
const SLOWING_RADIUS = 20;
const MAX_STEERING = 10;
const BUFFER = 25.0;
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

        this.drawLine(previous, this.host.position, '#FFA500');
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
        // TODO: Issue with obstacles that are very close together
        var dynamic_length = this.host.velocity.length / MAX_VELOCITY;
        var ahead = this.host.position.add(this.host.velocity.normalize().mul(dynamic_length));
        var ahead2 = this.host.position.add(this.host.velocity.normalize().mul(dynamic_length*0.5));
        var threat = this.getMostThreatening(ahead, ahead2, obstacles);

        var avoidance_force = new Vector(0.0, 0.0);
        if(threat != null) {
            avoidance_force = ahead.sub(threat);
            if(avoidance_force.length > MAX_AVOIDANCE) {
                avoidance_force = avoidance_force.normalize().mul(MAX_AVOIDANCE);
                this.drawLine(threat, ahead, '#00FF00');
            }
        }   
        return avoidance_force;
    }

    getMostThreatening = (ahead, ahead2, obstacles) => {
        var position = this.host.position;
        var mostThreatening = null;
        for(var i=0; i<obstacles.length; i++) {
            var obstacle = obstacles[i];
            var collided = this.collided(ahead, ahead2, obstacle);

            if(collided && (mostThreatening == null || this.distance(position, obstacle) < this.distance(position, mostThreatening))) {
                mostThreatening = obstacle;
            }
        }

        return mostThreatening;
    }

    collided = (ahead, ahead2, obstacle) => {
        var position = this.host.position;
        var d1 = this.distance(ahead, obstacle);
        var d2 = this.distance(ahead2, obstacle);
        var d3 = this.distance(position, obstacle);
        if(d1 <= BUFFER || d2 <= BUFFER || d3 <= BUFFER) {
            return true;
        }

        return false;
    }

    distance = (a, b) => {
        var ax = a.toArray()[0];
        var ay = a.toArray()[1];
        var bx = b.toArray()[0];
        var by = b.toArray()[1];
        return Math.sqrt((ax - bx) * (ax - bx)  + (ay - by) * (ay - by));
    }

    drawLine = (start, end, color) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");   
        var rect = canvas.getBoundingClientRect();
        var x1 = start.toArray()[0] - rect.left;
        var y1 = start.toArray()[1] - rect.top;
        var x2 = end.toArray()[0] - rect.left;
        var y2 = end.toArray()[1] - rect.top;

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fill();
    }
}

export default Behaviour;