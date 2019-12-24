import React, {Component} from 'react';
import './css/App.css';
import { Vector } from "@glazier/vector-js";
import Boid from './js/boid';
import Painter from './js/painter';
import Controls from './components/Controls';
import { EPSILON } from './js/const';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startPt : new Vector(300, 600),
            endPt : null,
            velocity : new Vector(0, -2.7),
            obstacles : [],
            walls : [],
            wander : 0.0,
            boids : []
        }
        this._frameId = null;
    }

    componentDidMount = () => {
        this.resizeCanvas();
        this.init(200);
    }
      
    componentWillUnmount = () => {
        this.stopLoop();
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
        var b = new Boid(vehicle);
        var target = this.state.endPt;

        var obstacles = this.state.obstacles;
        var walls = this.state.walls;

        var distance = target.sub(vehicle.position).length;
        while(distance > EPSILON) {
            b.avoid_and_seek(target, obstacles, walls);
            b.update();
            distance = target.sub(vehicle.position).length; 
        }

        this.setState({ startPt : vehicle.position, velocity : vehicle.velocity });
    }

    wander_only = () => {

        var vehicle = {
            position : this.state.startPt,
            velocity : this.state.velocity,
            wander : 0.0
        };
        var b = new Boid(vehicle);
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

        var b = new Boid(vehicle);
        var target = this.state.endPt;
        var obstacles = this.state.obstacles;
        var walls = this.state.walls;
        b.avoid_and_seek(target, obstacles, walls);
        b.update();
        var distance = target.sub(vehicle.position).length;

        this.setState({ startPt : vehicle.position, velocity : vehicle.velocity });
    }

    startLoop = () => {
        if(!this._frameId) {
            this._frameId = window.requestAnimationFrame(this.wander);
        }
    }
      
    wander = () => {
        // perform loop work here
        var boids_positions = [];
        var boids = this.state.boids;
        for(var i=0; i<boids.length; i++) {
            var b = boids[i];
            b.wander_only(boids);
            b.update2();
            boids_positions.push(b.position);
        }

        Painter.refresh(boids, 3);
        this.setState({ boids : boids });

        // Set up next iteration of the loop
        this._frameId = window.requestAnimationFrame(this.wander)
    }

    flock = () => {
        // perform loop work here
        var boids_positions = [];
        var boids = this.state.boids;
        for(var i=0; i<boids.length; i++) {
            var b = boids[i];
            b.flock(boids);
            b.update2();
            boids_positions.push(b.position);
        }

        Painter.refresh(boids, 3);
        this.setState({ boids : boids });

        // Set up next iteration of the loop
        this._frameId = window.requestAnimationFrame(this.flock)
    }
    
    stopLoop = () => {
        window.cancelAnimationFrame(this._frameId);
        // Note: no need to worry if the loop has already been cancelled
        // cancelAnimationFrame() won't throw an error
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

    init = (n) => {
        var boids = this.state.boids;
        var canvas = document.getElementById('nav-area');
        for(var i = 0; i < n; i++) {
            var rx = Math.random()*canvas.width;
            var ry = Math.random()*canvas.height;
            var b = new Boid(i, rx, ry);
            Painter.drawPoint(new Vector(rx, ry), 3, b.color);
            boids.push(b);
        }
        this.setState({ boids : boids });
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
                    flock={this.flock}
                    step_through={this.step_through}
                    stop={this.stopLoop}></Controls>
            </div>
        )
    };
}

export default App;