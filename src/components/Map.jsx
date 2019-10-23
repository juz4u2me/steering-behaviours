import React, {Component} from 'react';
import '../css/map.css';
// Cesium Widgets
import Viewer from "cesium/Source/Widgets/Viewer/Viewer";

// Cesium Core
import Rectangle from "cesium/Source/Core/Rectangle";
import JulianDate from "cesium/Source/Core/JulianDate";

// Cesium Scene
import Camera from "cesium/Source/Scene/Camera";
import MapboxImageryProvider from "cesium/Source/Scene/MapboxImageryProvider";
import Cesium3DTileset from "cesium/Source/Scene/Cesium3DTileset";

// Cesium Third Party
import sprintf from "cesium/Source/ThirdParty/sprintf";

export default class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewer : null
        }
    }

    componentDidMount() {

        var rec = [103.6, 1.22, 104.05, 1.46];
        var boundingRectangle = Rectangle.fromDegrees(rec[0], rec[1], rec[2], rec[3]);
        Camera.DEFAULT_VIEW_FACTOR = 0;
        Camera.DEFAULT_VIEW_RECTANGLE = boundingRectangle;

        var viewer = new Viewer(this.cesiumContainer, {
            imageryProvider: new MapboxImageryProvider({
                mapId: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoianV6NHUybWUiLCJhIjoiY2p6bWEzZnc1MDc2bTNsbXRrdTA0Y2N6YSJ9.fFZK8B8eUMI566srobBvNg'
            }),
            baseLayerPicker: false,
            vrButton: false,
            geocoder: false,
            animation: true,
            timeline: true,
            scene3DOnly: true,
            selectionIndicator: true,
            shouldAnimate : false,
            shadows: true
        });
		
		var tileset = viewer.scene.primitives.add(new Cesium3DTileset({
            url : '../hdb-models/tileset.json'
        }));

        this.setState({ viewer : viewer }, this.init);
    }

    componentWillUnmount() {
        if(this.state.viewer) {
            this.state.viewer.destroy();
        }
    }

    init = () => {
        var v = this.state.viewer;
        this.updateClockFormat(v);

        var start = JulianDate.now();
        var stop = JulianDate.addDays(start, 100, new JulianDate());
        v.timeline.zoomTo(start, stop);
    }

    updateClockFormat = (v) => {
        v.animation.viewModel.dateFormatter = this.localeDateTimeFormatter;
        v.animation.viewModel.timeFormatter = this.localeTimeFormatter;
        v.timeline.makeLabel = function (time) {
            return v.animation.viewModel.dateFormatter(time);
        }

        document.querySelectorAll('.cesium-timeline-ticLabel').forEach((i) => {
            i.textContent = i.textContent.replace("UTC", "SGT");
        });
    }

    // Date formatting to a global form
    localeDateTimeFormatter = (datetime, viewModel, ignoredate) => {
        var TZcode = 'SGT';
        var UTCoffset = new Date();
        UTCoffset = -UTCoffset.getTimezoneOffset();
        var UTCscratch = new JulianDate();

        if(UTCoffset) {
            datetime = JulianDate.addMinutes(datetime, UTCoffset, UTCscratch);
        }

        var gregorianDT = JulianDate.toGregorianDate(datetime), objDT;
        if(ignoredate) {
            objDT = '';
        }            
        else {
            objDT = new Date(gregorianDT.year, gregorianDT.month - 1, gregorianDT.day);
            objDT = gregorianDT.day + ' ' + objDT.toLocaleString("en-us", {
                    month: "short"
                }) + ' ' + gregorianDT.year;
            if(viewModel || gregorianDT.hour + gregorianDT.minute === 0)
                return objDT;
            objDT += ' ';
        }

        return objDT + sprintf("%02d:%02d:%02d " + TZcode, gregorianDT.hour, gregorianDT.minute, gregorianDT.second);
    }

    localeTimeFormatter = (time, viewModel) => {
        return this.localeDateTimeFormatter(time, viewModel, true);
    }

    render = () => {

        return (
            <div className='map-container'>
                <div className='map' ref={ element => this.cesiumContainer = element } />
            </div>
        );
    }
}