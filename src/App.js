import React, {Component} from 'react';
import './css/App.css';
import Map from './components/Map';
import { Vector } from "@glazier/vector-js";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startPt : null,
            endPt : null,
            obstacles : []
        }
    }

    place_start_pt = () => {
        var canvas = document.getElementById('nav-area');
        canvas.addEventListener("click", this.drawStartPoint, { once: true });        
    }

    place_end_pt = () => {
        var canvas = document.getElementById('nav-area');
        canvas.addEventListener("click", this.drawEndPoint, { once: true });
    }

    place_obstacle = () => {
        var canvas = document.getElementById('nav-area');
        canvas.addEventListener("click", this.drawObstacle, { once: true });
    }

    // Seek and Arrival
    seek = () => {
        var MAX_VELOCITY = 10;
        var SLOWING_RADIUS = 20;
        var position = this.state.startPt;
        var target = this.state.endPt;
        var current_velocity = new Vector(0, 0);
     
        var desired = target.sub(position);
        var distance = desired.length; 

        while(distance > 0.1) {
            
            desired = target.sub(position);
            distance = desired.length;
            
            var desired_velocity;
            if(distance < SLOWING_RADIUS) {
                // Inside the slowing area
                desired_velocity = desired.normalize().mul(MAX_VELOCITY).mul(distance / SLOWING_RADIUS);
            } else {
                // Outside the slowing area.
                desired_velocity = desired.normalize().mul(MAX_VELOCITY);
            }
            
            var steering = desired_velocity.sub(current_velocity);
            current_velocity = current_velocity.add(steering);
            position = position.add(current_velocity);

            this.drawMovement(position.toArray()[0], position.toArray()[1]);
        }
        
        this.setState({ startPt : position });
    }

    drawStartPoint = (e) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");   
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = e.clientY - rect.top;

        ctx.fillStyle = "#FF0000"; // Red color
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.fill();

        this.setState({ startPt : new Vector(x, y) });
    }

    drawEndPoint = (e) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");   
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = e.clientY - rect.top;
    
        ctx.fillStyle = "#FF0000"; // Red color
        ctx.beginPath();
        ctx.rect(x, y, 10, 10);
        ctx.stroke();
        ctx.fill();

        this.setState({ endPt : new Vector(x, y) });
    }

    drawObstacle = (e) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");   
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = e.clientY - rect.top;

        ctx.fillStyle = "#FF0000"; // Red color
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI, true);
        ctx.stroke();

        var obs = this.state.obstacles;
        obs.push(new Vector(x, y));
        this.setState({ obstacles : obs });
    }

    drawMovement = (x, y) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");   
        var rect = canvas.getBoundingClientRect();
        var x = x - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = y - rect.top;

        ctx.fillStyle = "#00FF00"; // Green color
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.fill();
    }

    render = () => {
        return (
            <div className='App'>                
                <canvas className='nav-area' id='nav-area' width="800" height="800">                    
                </canvas>
                <button onClick={this.place_start_pt}>Place Start Point</button>
                <button onClick={this.place_end_pt}>Place End Point</button>
                <button onClick={this.place_obstacle}>Place Obstacle</button>
                <button onClick={this.seek}>Seek</button>
            </div>
        )
    };
}

export default App;