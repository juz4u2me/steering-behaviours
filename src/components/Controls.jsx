import React, {Component} from "react";
import '../css/controls.css';
import { Vector } from "@glazier/vector-js";
import Painter from '../js/painter';
import { OBSTACLE_SIZE } from '../js/const'

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
        var point = new Vector(e.clientX, e.clientY);
        var drawnPt = Painter.drawPoint(point, 5, "#00FF00");
        this.props.addStartPt(drawnPt);
    }

    drawEndPoint = (e) => {
        var point = new Vector(e.clientX, e.clientY);
        var drawnPt = Painter.drawPoint(point, 5, "#FF0000");
        this.props.addEndPt(drawnPt);
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

    step_through = () => {
        this.props.step_through();
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
                <button className="toolbutton" onClick={this.step_through}>Step</button>
            </div>
        );
    }
}