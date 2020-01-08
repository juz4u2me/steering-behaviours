import React, {Component} from "react";
import '../css/controls.css';
import { Vector } from "@glazier/vector-js";
import Painter from '../js/painter';
import { OBSTACLE_SIZE } from '../js/const';

export default class Palette extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tool: null
        }
    }

    componentDidMount = () => {

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

    drawStartPoint = (e) => {
        // Point in local coordinates (canvas)
        var canvas_pt = new Vector(e.clientX, e.clientY);
        Painter.drawPoint(canvas_pt, 5, "#00FF00");
        // Convert local coordinates to global coordinates
        var pt = Painter.local2global(canvas_pt);
        this.props.addStartPt(pt);
    }

    drawEndPoint = (e) => {
        // Point in local coordinates (canvas)
        var canvas_pt = new Vector(e.clientX, e.clientY);
        Painter.drawPoint(canvas_pt, 5, "#FF0000");
        // Convert local coordinates to global coordinates
        var pt = Painter.local2global(canvas_pt);
        this.props.addEndPt(pt);
    }

    drawObstacle = (e) => {
        var point = new Vector(e.clientX, e.clientY);
        var drawnPt = Painter.drawPoint(point, OBSTACLE_SIZE, "#000000");
        this.props.addObstacle(drawnPt);
    }

    clear_obstacles = () => {
        this.props.clearObstacles();
    }

    load_env = () => {
        this.props.loadEnvironment();
    }

    seek = () => {
        this.props.seek();
    }

    wander = () => {
        this.props.wander();
    }

    flock = () => {
        this.props.flock();
    }

    step_through = () => {
        this.props.step_through();
    }

    stop = () => {
        this.props.stop();
    }

    render() {

        return (
            <div className="controls">
                <button className="toolbutton" onClick={this.place_start_pt}>Place Start Point</button>
                <button className="toolbutton" onClick={this.place_end_pt}>Place End Point</button>
                <button className="toolbutton" onClick={this.place_obstacle}>Place Obstacle</button>
                <button className="toolbutton" onClick={this.clear_obstacles}>Clear Obstacles</button>
                <button className="toolbutton" onClick={this.load_env}>Load Test Environment</button>
                <button className="toolbutton" onClick={this.seek}>Seek</button>
                <button className="toolbutton" onClick={this.wander}>Wander</button>
                <button className="toolbutton" onClick={this.flock}>Flock</button>
                <button className="toolbutton" onClick={this.step_through}>Step</button>
                <button className="toolbutton" onClick={this.stop}>Stop</button>
            </div>
        );
    }
}