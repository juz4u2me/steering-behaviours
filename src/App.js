import React, {Component} from 'react';
import './css/App.css';
import { Vector } from "@glazier/vector-js";
import Behaviour from './js/behaviour'

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

    clear_obstacles = () => {
        this.setState({ obstacles : []});
    }

    update = () => {

        var vehicle = {
            position : this.state.startPt,
            velocity : new Vector(0, -50)
        };
        var b = new Behaviour(vehicle);
        var target = this.state.endPt;

        var obstacles = this.state.obstacles;

        var distance = target.sub(vehicle.position).length;
        while(distance > 0.000001) {
            b.seek(target);
            b.avoid(obstacles);
            b.update();
            distance = target.sub(vehicle.position).length;
        }

        this.setState({ startPt : vehicle.position });
    }

    drawStartPoint = (e) => {
        var canvas = document.getElementById('nav-area');
        var ctx = canvas.getContext("2d");
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
        var y = e.clientY - rect.top;

        ctx.fillStyle = "#00FF00"; // Green color
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
        // ctx.rect(x, y, 10, 10);
        ctx.arc(x, y, 5, 0, 2 * Math.PI, true);
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
                <div className='nav-div'>
                    <canvas className='nav-area' id='nav-area' width="800" height="800" />
                </div>
                <div className='controls'>
                    <button onClick={this.place_start_pt}>Place Start Point</button>
                    <button onClick={this.place_end_pt}>Place End Point</button>
                    <button onClick={this.place_obstacle}>Place Obstacle</button>
                    <button onClick={this.clear_obstacles}>Clear Obstacles</button>
                    <button onClick={this.update}>Seek</button>
                </div>
            </div>
        )
    };
}

export default App;