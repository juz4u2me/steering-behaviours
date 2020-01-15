import React, {Component} from "react";
import '../css/controls.css';
import { Vector } from "@glazier/vector-js";
import Painter from '../js/painter';
import { OBSTACLE_SIZE } from '../js/const';
// Material-UI
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton, Typography, Button, ButtonGroup } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';


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
                {/* <AppBar className="appbar" position="static">
                    <Toolbar>
                        <IconButton edge="start" className="menuButton" color="inherit" aria-label="menu">
                        <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" className="title">
                        Steering Behaviour
                        </Typography>
                        <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar> */}
                <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                    <Button onClick={this.place_start_pt}>Place Start Point</Button>
                    <Button onClick={this.place_end_pt}>Place End Point</Button>
                    <Button onClick={this.place_obstacle}>Place Obstacle</Button>
                    <Button onClick={this.clear_obstacles}>Clear Obstacles</Button>
                    <Button onClick={this.load_env}>Load Test Environment</Button>
                    <Button onClick={this.seek}>Seek</Button>
                    <Button onClick={this.wander}>Wander</Button>
                    <Button onClick={this.flock}>Flock</Button>
                    <Button onClick={this.step_through}>Step</Button>
                    <Button onClick={this.stop}>Stop</Button>
                </ButtonGroup>
            </div>
        );
    }
}