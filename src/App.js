import React, {Component} from 'react';
import './css/App.css';
import { Vector } from "@glazier/vector-js";
import Behaviour from './js/behaviour';
import Painter from './js/painter';
import Controls from './components/Controls';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startPt : null,
            endPt : null,
            velocity : new Vector(0, -2.7),
            obstacles : [],
            walls : [],
        }
    }

    componentDidMount = () => {
        this.resizeCanvas();
    }

    loadEnvironment = () => {
        this.resizeCanvas();

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

    update = () => {

        var vehicle = {
            position : this.state.startPt,
            velocity : this.state.velocity,
            wander : 0.0
        };
        var b = new Behaviour(vehicle);
        var target = this.state.endPt;

        var obstacles = this.state.obstacles;
        var walls = this.state.walls;

        var distance = target.sub(vehicle.position).length;
        while(distance > 0.000001) {
            b.avoidToSeek(target, obstacles, walls);
            b.update();
            distance = target.sub(vehicle.position).length; 
        }

        this.setState({ startPt : vehicle.position, velocity : vehicle.velocity });
    }

    wander = () => {

        var vehicle = {
            position : this.state.startPt,
            velocity : this.state.velocity,
            wander : 0.0
        };
        var b = new Behaviour(vehicle);
        for(var j = 0; j < 100; j++) {
            b.wander_only();
            b.update();
        }
    }

    step_through = () => {

        var vehicle = {
            position : this.state.startPt,
            velocity : this.state.velocity
        };

        var b = new Behaviour(vehicle);
        var target = this.state.endPt;
        var obstacles = this.state.obstacles;
        var walls = this.state.walls;
        b.avoidToSeek(target, obstacles, walls);
        b.update();
        var distance = target.sub(vehicle.position).length;

        this.setState({ startPt : vehicle.position, velocity : vehicle.velocity });
    }

    resizeCanvas = () => {
        var canvas = document.getElementById('nav-area');
        var displayWidth  = canvas.clientWidth;
        var displayHeight = canvas.clientHeight;

        // Check if the canvas is not the same size
        if (canvas.width  !== displayWidth ||
            canvas.height !== displayHeight) {

            // Make the canvas the same size
            canvas.width  = displayWidth;
            canvas.height = displayHeight;
        }
    }

    addStartPt = (start) => {
        this.setState({ startPt : start });
    }

    addEndPt = (end) => {
        this.setState({ endPt : end });
    }

    addObstacle = (obstacle) => {
        var obs = this.state.obstacles;
        obs.push(obstacle);
        this.setState({ obstacles : obs }, ()=>{console.log(this.state.obstacles)} );
    }

    clearObstacles = () => {
        this.setState({ obstacles : [] });
    }

    render = () => {
        return (
            <div className='App'>
                <div className='nav-div'>
                    <canvas className='nav-area' id='nav-area' width="800" height="800" />
                </div>
                <Controls addStartPt={(start) => this.addStartPt(start)}
                    addEndPt={(end) => this.addEndPt(end)}
                    addObstacle={(obs) => this.addObstacle(obs)}
                    clearObstacles={this.clearObstacles}
                    loadEnvironment={this.loadEnvironment}
                    seek={this.update}
                    wander={this.wander}
                    step_through={this.step_through}></Controls>
            </div>
        )
    };
}

export default App;