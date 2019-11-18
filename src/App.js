import React, {Component} from 'react';
import './css/App.css';
import { Vector } from "@glazier/vector-js";
import Behaviour from './js/behaviour';
import Painter from './js/painter';
import { OBSTACLE_SIZE } from './js/const'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startPt : null,
            endPt : null,
            obstacles : [],
            walls : []
        }
    }

    componentDidMount = () => {
        this.setUpEnvironment();
    }

    setUpEnvironment = () => {
        var p1 = new Vector(300, 600);
        Painter.label(p1, 'p1');
        var p2 = new Vector(300, 250);
        Painter.label(p2, 'p2');
        var p3 = new Vector(700, 250);
        Painter.label(p3, 'p3');
        var p4 = new Vector(500, 600);
        Painter.label(p4, 'p4');
        var p5 = new Vector(500, 400);
        Painter.label(p5, 'p5');
        var p6 = new Vector(700, 400);
        Painter.label(p6, 'p6');
        Painter.drawLine(p1, p2, '#000000');
        Painter.drawLine(p2, p3, '#000000');
        Painter.drawLine(p4, p5, '#000000');
        Painter.drawLine(p5, p6, '#000000');
        var wall_1 = p2.sub(p1);
        var wall_2 = p3.sub(p2);
        var wall_3 = p5.sub(p4);
        var wall_4 = p6.sub(p5);
        var walls = this.state.walls;
        walls.push([p1, p2]);
        walls.push([p2, p3]);
        walls.push([p4, p5]);
        // walls.push([p5, p6]);
        this.setState({ walls : walls });
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
            velocity : new Vector(0, -2.7)
        };
        var b = new Behaviour(vehicle);
        var target = this.state.endPt;

        var obstacles = this.state.obstacles;
        var walls = this.state.walls;

        var distance = target.sub(vehicle.position).length;
        while(distance > 0.000001) {
            // b.seek(target);
            // b.avoid(obstacles, walls);
            b.avoidToSeek(target, obstacles, walls);
            b.update();
            distance = target.sub(vehicle.position).length; 
        }

        this.setState({ startPt : vehicle.position });
    }

    drawStartPoint = (e) => {
        var point = new Vector(e.clientX, e.clientY);
        var drawnPt = Painter.drawPoint(point, 5, "#00FF00");
        this.setState({ startPt : drawnPt });
    }

    drawEndPoint = (e) => {
        var point = new Vector(e.clientX, e.clientY);
        var drawnPt = Painter.drawPoint(point, 5, "#FF0000");
        this.setState({ endPt : drawnPt });
    }

    drawObstacle = (e) => {
        var point = new Vector(e.clientX, e.clientY);
        var drawnPt = Painter.drawPoint(point, OBSTACLE_SIZE, "#000000");
        var obs = this.state.obstacles;
        obs.push(drawnPt);
        this.setState({ obstacles : obs });
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