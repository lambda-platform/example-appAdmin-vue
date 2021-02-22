<template>
    <div id="MRPAM_AREA">

        <FormItem :prop=rule :label=label>
            <div id="map">
            </div>

            <div id="graphics_container">
                <div id="sketch_container">

                </div>
                <div class="created_graphics">
                    <span v-if="graphic_loading"></span>
                    <!--<RadioGroup v-model="coordinate_format" type="button" style="text-align: center">-->
                        <!--<Radio label="dms"></Radio>-->
                        <!--<Radio label="utm"></Radio>-->

                    <!--</RadioGroup>-->
                    <RadioGroup v-model="geometryType" class="geometry_type"   type="button">
                        <Radio label="point" >
                            <span>Point</span>
                        </Radio>
                        <Radio label="polygon" >
                            <span>Polygon</span>
                        </Radio>
                    </RadioGroup>

                    <div>
                        <table>
                            <thead>
                            <tr>
                                <th>Уртраг</th>
                                <th>Өргөрөг</th>
                            </tr>
                            </thead>
                            <tbody>

                            <tr v-for="(point, index) in points" :key="index">
                                <td>
                                    <input type="text" v-model="point[0]"/>
                                </td>
                                <td>
                                    <input type="text" v-model="point[1]"/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <input type="text" ref="lng" v-model="new_point.lng" @change="createNewGeometry"/>
                                </td>
                                <td>
                                    <input type="text" ref="lat" v-model="new_point.lat" @change="createNewGeometry"/>
                                </td>
                            </tr>
                            </tbody>
                        </table>

                        <Button type="success" @click="saveGraphic" v-if="points.length >= 1">Хадгалах</Button>
                        <Button type="warning" @click="cancelGraphic" v-if="points.length >= 1">Болих</Button>
                        <Button type="info" @click="checkOverlaps" v-if="points.length >= 1">Давхцал шалгах</Button>


                        <h4  v-if="results.length >= 1">Талбайн давхцал</h4>
                        <Collapse v-model="activeResult" v-if="results.length >= 1" >

                            <Panel v-for="(layer, index) in results"  :name="`${index}`" v-if="layer.features.length >= 1" :key="index">
                                {{layer.title}}: <b>{{layer.features.length}}</b>
                                <div slot="content" v-if="layer.features.length >= 1">

                                    <Input size="small" placeholder="Хайх" v-model="layer.filter"/>


                                    <ul>
                                        <li v-for="(feature, featureIndex) in layer.features" @click="openPopUp(layer.layer_id, feature)" v-if="feature.text.indexOf(layer.filter) > -1">

                                            {{feature.text}}

                                        </li>
                                    </ul>
                                </div>
                            </Panel>

                        </Collapse>
                    </div>
<!--<ul v-if="!graphic_loading">-->
    <!--<li v-for="(created_graphic, index) in created_graphics" :key="index">-->

        <!--<div v-for="(coordinate, c_index) in created_graphic.geometry.rings[0]" :key="c_index">-->
            <!--<span v-html="converted(coordinate)"></span>-->
        <!--</div>-->



    <!--</li>-->
<!--</ul>-->
                </div>
            </div>
            <div id="infoDiv">
                <input class="esri-component esri-widget-button esri-widget esri-interactive" type="button"
                       @click="switchMode" id="switch-btn" :value="mode == '3D' ? '2D' : '3D'">
            </div>
            <div id="base_map"></div>

        </FormItem>
    </div>

</template>
<script>
    import { loadModules } from 'esri-loader';
    import "./MRPAM_Area.scss"
    const options = { css: true, url: `http://bums.test/4.11/init.js` };
    import {getLayerShow, getRerender} from "./utils/helpers"
    function stored(key){
        return localStorage.getItem(key);
    }
    let zoom = stored('zoom');
    let mode = stored('mode');
    let lng = stored('lng');
    let lat = stored('lat');

    import axios from "axios"
    import {
        template,
        refresh
    } from "./utils/Map";
    export default {
        props: ["model", "rule", "label", "meta"],
        data(){
            return {
                activeResult: '0',
                geometryType: "polygon",
                // mode:mode ? mode : '2D',
                mode:'2D',
                mainColor:'#225ba5',
                page: null,
                hexagonLayer: null,
                hexagonLayer_filtered: null,
                hexagonsSet:false,
                showSideBar:false,
                showPage:false,
                showElement:false,
                map:null,
                mapView:null,
                viewReady:false,
                center:{
                    lat:lat ? lat : 47.4429,
                    lng:lng ? lng : 104.1284
                },
                baseMap:0,
                zoom: zoom ? zoom : 6,
                layers:[],
                baseMaps:[],
                mapLayers:[],
                init_data:null,
                sketch:null,
                legendsCount: 0,
                sketch_layer: null,
                Graphic: null,
                coordinateFormatter: null,
                webMercatorUtils: null,
                created_graphics:[],
                graphic_loading:false,
                coordinate_format:'dms',
                current:null,
                new_point: {
                    lng: null,
                    lat: null
                },
                points: [],
                results: [],
                resultsLayer: null
            }
        },
        methods:{
            resetInput() {
                this.new_point = {
                    lng: null,
                    lat: null
                };
                this.$refs.lng.focus();

            },
            IsValidCoordinates(lng_lat) {
                if (lng_lat[0] && lng_lat[1]) {
                    lng_lat[0] = lng_lat[0] * 1;
                    lng_lat[1] = lng_lat[1] * 1;
                    return this.longitude(lng_lat[0]) && this.latitude(lng_lat[1])
                } else return false

            },
            longitude(lon) {
                return !!(this.isNumber(lon) && this.between(lon, -180, 180))
            },
            latitude(lat) {
                return !!(this.isNumber(lat) && this.between(lat, -90, 90))
            },
            isNumber(n) {
                return typeof n === 'number'
            },
            between(value, n1, n2) {
                return n1 <= value && n2 >= value
            },
            queryTask(layer, graphic) {

                var query = layer.createQuery();

                    query.geometry = graphic.geometry;

                query.spatialRelationship = "intersects";
                query.outFields = ["*"];

                return layer.queryFeatures(query);
            },
            openPopUp(layer_id, feature) {
                this.mapView.popup.open({
                    content: feature.text,
                    features: [feature],
                    highlightEnabled:true,
                    location: feature.geometry.centroid,
                    view: this.mapView
                });

                let highfillSymbol = {
                    type: "simple-fill",
                    color: "red",
                    remove: true,
                    style: "solid",
                    outline: {
                        width: "2px",
                        color: "red"
                    }
                };

                this.resultsLayer.graphics.items.map(gra => {
                    if (gra.symbol.remove) {
                        this.resultsLayer.remove(gra);
                    }
                });

                this.mapView
                    .hitTest(this.mapView.toScreen(feature.geometry.centroid))
                    .then(response => {
                        var graphics = response.results;

                        let found = false;

                        console.log(graphics);
                        graphics.map(graphic => {
                            if(graphic.graphic.attributes){
                                console.log(feature.attributes.OBJECTID, graphic.graphic.attributes.OBJECTID)
                                if (
                                    feature.attributes.OBJECTID ==
                                    graphic.graphic.attributes.OBJECTID
                                ) {
                                    if (found) {
                                    } else {
                                        found = true;

                                        var graphic__ = graphic.graphic.clone();

                                        graphic__.symbol = highfillSymbol;
                                        console.log('FOUND')
                                        this.resultsLayer.addMany([graphic__]);
                                    }
                                }
                            }

                        });
                    });

                this.mapView.center = [
                    feature.geometry.centroid.longitude,
                    feature.geometry.centroid.latitude
                ];


            },
            getResultContent(attributes, searchResultFileds) {
                let title = "";

                let showFields = searchResultFileds;

                title = template(showFields, attributes);

                return title;
            },
            displayResults(results, title, uid, searchResultFileds, layer_id) {
                console.log("checkOverlaps 3")
                let layerResults = {
                    title: title,
                    uid: uid,
                    layer_id: layer_id,
                    filter: "",
                    features: []
                };

                let maxCount = 0;
                var features = results.features.map(graphic => {
                    graphic.symbol = {
                        type: "simple-fill",
                        color: "rgba(0,0,0,0)",

                        style: "solid",
                        outline: {
                            width: "2px",
                            color: "red"
                        }
                    };

                    //                    graphic.= false;
                    graphic.text = this.getResultContent(
                        graphic.attributes,
                        searchResultFileds
                    );



                    layerResults.features.push(graphic);

                    // graphic.popupTemplate_ = graphic.popupTemplate;
                    // graphic.popupTemplate = null;

                    //                    popupEnabled:false,
                    //                        popupTemplate:null

                    maxCount++;
                    return graphic;
                });

                console.log(layerResults, 'layerResults')
                this.results.push(layerResults);

                this.resultsLayer.addMany(features);

                if (maxCount >= this.maxCount) {
                    let addedIndex = this.results.findIndex(result_ => result_.uid == uid);
                    this.maxCount = maxCount;
                    this.activeResult = addedIndex;
                }
            },
            checkOverlaps(){

                console.log("checkOverlaps 1")

                this.resultsLayer.removeAll();
                this.results = [];

                this.mapLayers.map(mapLayer => {
                    if (mapLayer.layer.visible && mapLayer.type == "feature") {
                        if (mapLayer.layer.parent.visible) {
                            this.queryTask(mapLayer.layer, this.current).then(
                                results => {
                                    this.displayResults(
                                        results,
                                        mapLayer.layer.title,
                                        mapLayer.layer.uid,
                                        mapLayer.searchResultFileds,
                                        mapLayer.id
                                    );
                                }
                            );
                        }
                    }
                });
                // if(this.geometryType == 'point'){
                //     this.mapView.popup.open({
                //         content: 'test',
                //         features: [this.current],
                //
                //         location: this.current.geometry,
                //         view: this.mapView
                //     });
                // } else {
                //     this.mapView.popup.open({
                //         content: 'test',
                //         features: [this.current],
                //
                //         location: this.current.geometry.centroid,
                //         view: this.mapView
                //     });
                // }

            },
            createNewGeometry() {
                let source_value = null;
                if (this.new_point.lng !== null && this.new_point.lat === null) {
                    source_value = this.new_point.lng;
                }
                if (this.new_point.lng === null && this.new_point.lat !== null) {
                    source_value = this.new_point.lat;
                }
                if (this.new_point.lng !== null && this.new_point.lat !== null) {
                    this.new_point.lng = this.new_point.lng * 1;
                    this.new_point.lat = this.new_point.lat * 1;
                    if (this.IsValidCoordinates([this.new_point.lng, this.new_point.lat])) {



                        this.points.push([this.new_point.lng, this.new_point.lat]);

                        this.resetInput()
                    }
                }


                if (source_value) {

                    let coordinates = source_value.split(' ');

                    if (coordinates.length >= 1) {
                        let is_not_paste = false;
                        coordinates.map(coordinate => {
                            let lat_lng = coordinate.split('\t');
                            if (lat_lng.length >= 2) {
                                lat_lng[0] = lat_lng[0] * 1;
                                lat_lng[1] = lat_lng[1] * 1;
                                if (this.IsValidCoordinates([lat_lng[0], lat_lng[1]])) {

                                    this.points.push([lat_lng[0], lat_lng[1]]);
                                }
                            } else {
                                is_not_paste = true
                            }

                        });
                        if (!is_not_paste) {
                            this.resetInput()
                        }

                    }


                }

            },
            saveGraphic() {
                if (this.current) {
                    console.log(this.current);
                    // this.current.geometry.removeRing(this.current.geometry.rings[this.current.geometry.rings.length - 1]);




                    if (this.geometryType == 'point') {
                        if (this.IsValidCoordinates(this.points[0])) {


                            this.sketch_layer.remove(this.current);

                            let points = [];
                            this.points.map(point => {

                                if (this.IsValidCoordinates(point)) {
                                    points.push(this.webMercatorUtils.lngLatToXY(point[0], point[1]));
                                }
                            });

                          //  let point_x_y = this.webMercatorUtils.lngLatToXY(points[0][0], points[0][1]);


                            var point = {
                                type: "point",
                                x: points[0][0],
                                y: points[0][1],
                                spatialReference: {wkid: 102100}
                            };

                            var markerSymbol = {
                                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                                color: "red",
                                size: 8,
                                outline: { // autocasts as new SimpleLineSymbol()
                                    width: 0.5,
                                    color: "red"
                                }
                            };

                            var pointGraphic = new this.Graphic({
                                geometry: point,
                                symbol: markerSymbol
                            });

                            this.sketch_layer.add(pointGraphic)



                            this.sketch.complete();
                        }
                    } else {

                        // let rings = this.current.geometry.rings[0].map(point=>{
                        //
                        //     console.log(point);
                        //
                        //     return this.webMercatorUtils.xyToLngLat(point[0], point[1]);
                        // });
                        // this.points = rings;

                        this.sketch_layer.remove(this.current);

                        let points = [];
                        this.points.map(point => {

                            if (this.IsValidCoordinates(point)) {
                                points.push(this.webMercatorUtils.lngLatToXY(point[0], point[1]));
                            }
                        });


                        this.current.geometry.rings = [points];
                        this.sketch_layer.add(this.current);
                        this.sketch.complete();
                    }
                    this.cancelGraphic();
                    // return true;
                }


                if (this.geometryType == 'point') {
                    let points = []
                    this.points.map(point => {
                        if (this.IsValidCoordinates(point)) {
                            points.push([point[0], point[1]]);
                        }
                    });

                    let point_x_y = this.webMercatorUtils.lngLatToXY(points[0][0], points[0][1]);


                    var point = {
                        type: "point",
                        x: point_x_y[0],
                        y: point_x_y[1],
                        spatialReference: {wkid: 102100}
                    };

                    var markerSymbol = {
                        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                        color: "red",
                        size: 8,
                        outline: { // autocasts as new SimpleLineSymbol()
                            width: 0.5,
                            color: "red"
                        }
                    };

                    var pointGraphic = new this.Graphic({
                        geometry: point,
                        symbol: markerSymbol
                    });

                    this.sketch_layer.add(pointGraphic)

                } else {
                    let points = []
                    this.points.map(point => {
                        if (this.IsValidCoordinates(point)) {
                            points.push([point[1], point[0]])
                        }
                    });




                    if (this.geometryType == 'polygon') {

                         var fillSymbol = {
                             type: "simple-fill", // autocasts as new SimpleFillSymbol()
                             color: [0, 0, 0, 0.8],
                             outline: {
                                 // autocasts as new SimpleLineSymbol()
                                 color: [0, 0, 0],
                                 width: 1
                             }
                         };
                       let xy_poins = this.points.map(point=>{
                            return this.webMercatorUtils.lngLatToXY(point[0], point[1]);
                        });
                       console.log(xy_poins, 'xy_poins');
                         var polygon = {
                             type: "polygon", // autocasts as new Polygon()
                             rings: [
                                 xy_poins
                             ],
                             spatialReference: {wkid: 102100}
                         };

                         var polygonGraphic = new this.Graphic({
                             geometry: polygon,
                             symbol: fillSymbol
                         });

                         this.sketch_layer.add(polygonGraphic)


                    }
                }



                this.cancelGraphic();
            },
            cancelGraphic() {
                this.points = [];
                this.current = null;

            },
            converted(coordinate){
                if(this.coordinateFormatter.isLoaded()){
                    // let converted_point = this.coordinateFormatter.fromLatitudeLongitude(`${coordinate[0]} ${coordinate[1]}`, new this.SpatialReference({ wkid: 102100}));

                    let converted_point = this.webMercatorUtils.xyToLngLat(coordinate[0], coordinate[1]);


                    if(this.coordinate_format == 'dms'){
                        let converted_2 = this.coordinateFormatter.fromLatitudeLongitude(converted_point[1]+" "+converted_point[0]);
                        let converted_dms = this.coordinateFormatter.toLatitudeLongitude(converted_2, 'dms', '0');
                        return converted_dms
                    } else
                    return converted_point[0]+" "+converted_point[1];
                } else {
                    return coordinate[0]+'--'+coordinate[1];
                }

            },
            showSetch(){

                let checkDOMS = document.getElementsByClassName("esri-sketch__button");


                       for (var i = 0; i < checkDOMS.length; i++) {
                           checkDOMS[i].setAttribute("type", "button");
                       }
               //  console.log(this.sketch_layer)
               //  console.log(this.sketch)
               //
               //  // this.sketch.updateGraphics([]);
               //
               //  var fillSymbol = {
               //      type: "simple-fill", // autocasts as new SimpleFillSymbol()
               //      color: [0, 0, 0, 0.8],
               //      outline: {
               //          // autocasts as new SimpleLineSymbol()
               //          color: [0, 0, 0],
               //          width: 1
               //      }
               //  };
               //  var polygon = {
               //      type: "polygon", // autocasts as new Polygon()
               //      rings: [
               //         [11431967.72320119, 6252846.432891712],
               //  [12451800.109210275, 6252846.432891712],
               // [12451800.109210275, 5740957.209094558],
               // [11431967.72320119, 5740957.209094558],
               //  [11431967.72320119, 6252846.432891712]
               //      ],
               //      spatialReference: {wkid: 102100}
               //  };
               //
               //  var polygonGraphic = new this.Graphic({
               //      geometry: polygon,
               //      symbol: fillSymbol
               //  });
               //
               //  this.sketch_layer.removeAll()
               //  this.sketch_layer.add(polygonGraphic)

                console.log(this.created_graphics)
            },
            setLegendStyle(legend, layerDOM) {
                this.legendsCount = this.legendsCount + 1;

                if (layerDOM) {
                    if (legend.element_type == "point") {
                        let img_src = `${legend.icon.destinationUrl}${
                            legend.icon.uniqueName
                            }`;

                        layerDOM.innerHTML =
                            "<img class='legend-symbol' style='width:16px; height:16px; display:inline-block;' src='" +
                            img_src +
                            "'/>";
                    }

                    if (legend.element_type == "polygon") {
                        //                    let polygon = `<svg overflow="hidden" width="24" height="24" style="touch-action: none;"><defs></defs><g transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,12.00000000,12.00000000)"><path fill="rgb(0, 38, 115)" fill-opacity="0.7743055555555556" stroke="rgb(153, 153, 153)" stroke-opacity="0.29757625272331156" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" path="M -10,-10 L 10,0 L 10,10 L -10,10 L -10,-10 Z" d="M-10-10L 10 0L 10 10L-10 10L-10-10Z" fill-rule="evenodd" stroke-dasharray="none" dojoGfxStrokeStyle="solid"></path></g></svg>`;

                        if (legend.style_type == "0")
                            layerDOM.style = `border:1px solid ${
                                legend.border_color
                                }; background: ${legend.fill_color}`;

                        if (legend.style_type == "1") {
                            layerDOM.style = `border-color: ${
                                legend.border_color
                                }; background-image: radial-gradient(${
                                legend.fill_color
                                } 20%, transparent 21%), radial-gradient(${
                                legend.fill_color
                                } 20%, transparent 21%); `;
                            layerDOM.classList.add("legend-doted");
                        }

                        if (legend.style_type == "2") {
                            layerDOM.style = `border-color: ${
                                legend.border_color
                                }; background-color: ${legend.fill_color}`;
                            layerDOM.classList.add("legend-hudlun-zuraas");
                        }

                        if (legend.style_type == "3") {
                            layerDOM.style = `border-color: ${
                                legend.border_color
                                }; background-color: ${legend.fill_color}`;
                            layerDOM.classList.add("legend-bosoo-zuraas");
                        }

                        if (legend.style_type == "4") {
                            layerDOM.style = `border-color: ${
                                legend.border_color
                                }; background-color: ${legend.fill_color}`;
                            layerDOM.classList.add("legend-baruun-zuraas");
                        }

                        if (legend.style_type == "5") {
                            layerDOM.style = `border-color: ${
                                legend.border_color
                                }; background-color: ${legend.fill_color}`;
                            layerDOM.classList.add("legend-zuun-zuraas");
                        }
                    }
                    if (legend.element_type == "line") {
                        if (legend.style_type == "0")
                            layerDOM.style = `border:1px solid ${
                                legend.border_color
                                }; width:16px; height:3px; margin-top:6px; background: ${
                                legend.border_color
                                }`;
                    }
                } else {
                    console.log(legend, layerDOM, "layer initing");
                }
            },
            switchMode() {
                // if (this.mode == "2D") {
                //     localStorage.setItem("mode", "3D");
                // } else {
                //     localStorage.setItem("mode", "2D");
                // }
                // refresh(this);
            },
            sketTypeAdd(){
                       let checkDOMS = document.getElementsByClassName("esri-sketch__button");

                       if(checkDOMS.length >= 1){
                           for (var i = 0; i < checkDOMS.length; i++) {
                               checkDOMS[i].setAttribute("type", "button");
                           }
                       } else {
                           setTimeout(()=>{
                               this.sketTypeAdd()
                           }, 500)

                       }


            },
            createMap() {

                loadModules(['esri/Map',
                    'esri/views/SceneView',
                    'esri/views/MapView',
                    'esri/widgets/BasemapGallery',
                    'esri/widgets/Expand',
                    'esri/widgets/LayerList',
                    'esri/layers/FeatureLayer',
                    'esri/widgets/CoordinateConversion',
                    'esri/layers/MapImageLayer',
                    'esri/widgets/BasemapGallery/support/LocalBasemapsSource',
                    'esri/layers/GroupLayer',
                    'esri/config',
                    'esri/layers/WebTileLayer',
                    'esri/Basemap',
                    'esri/Graphic',
                    'esri/geometry/geometryEngineAsync',
                    'esri/widgets/Sketch',
                    'esri/layers/GraphicsLayer',
                    'esri/core/watchUtils',
                    'esri/geometry/coordinateFormatter',
                    'esri/geometry/SpatialReference',
                    'esri/geometry/support/webMercatorUtils',
                ], options)
                    .then(([Map,
                               SceneView,
                               MapView,
                               BasemapGallery,
                               Expand,
                               LayerList,
                               FeatureLayer,
                               CoordinateConversion,
                               MapImageLayer,
                               LocalBasemapsSource,
                               GroupLayer,
                               esriConfig,
                               WebTileLayer,
                               Basemap,
                               Graphic,
                               geometryEngineAsync,
                               Sketch,
                               GraphicsLayer,
                               watchUtils,
                               coordinateFormatter,
                               SpatialReference,
                               webMercatorUtils,

                           ]) => {
                        // var map = new Map({
                        //     basemap: "streets",
                        //     ground: "world-elevation"
                        // });
                        // var view = new SceneView({
                        //     container: "MRPAM_AREA", // Reference to the DOM node that will contain the view
                        //     map: map // References the map object created in step 3
                        // });

                        this.init = true;
                        this.Graphic = Graphic;
                        this.coordinateFormatter = coordinateFormatter;
                        this.SpatialReference = SpatialReference;
                        this.webMercatorUtils = webMercatorUtils;

                        this.coordinateFormatter.load();
                        this.esriInit(Map,
                            SceneView,
                            MapView,
                            BasemapGallery,
                            Expand,
                            LayerList,
                            FeatureLayer,
                            CoordinateConversion,
                            MapImageLayer,
                            LocalBasemapsSource,
                            GroupLayer,
                            esriConfig,
                            WebTileLayer,
                            Basemap,
                            geometryEngineAsync,
                            Sketch,
                            GraphicsLayer,
                            watchUtils,
                            SpatialReference,
                        );
                    })
                    .catch(err => {
                        // handle any errors
                        console.error(err);
                    });

            },
            esriInit(Map,
                     SceneView,
                     MapView,
                     BasemapGallery,
                     Expand,
                     LayerList,
                     FeatureLayer,
                     CoordinateConversion,
                     MapImageLayer,
                     LocalBasemapsSource,
                     GroupLayer,
                     esriConfig,
                     WebTileLayer,
                     Basemap,
                     geometryEngineAsync,
                     Sketch,
                     GraphicsLayer,
                     watchUtils,
                     SpatialReference,
            ) {
                let viewCreator = this.mode == "2D" ? MapView : SceneView;


                esriConfig.request.corsEnabledServers.push(
                    "http://mt0.google.com",
                    "http://mt1.google.com",
                    "http://mt2.google.com",
                    "http://mt3.google.com",
                    "http://a.tile.openstreetmap.org",
                    "http://b.tile.openstreetmap.org",
                    "http://c.tile.openstreetmap.org",
                );

                this.baseMaps = [
                    new Basemap({
                        baseLayers: [new WebTileLayer({
                            urlTemplate: "http://{subDomain}.google.com/vt/lyrs=m&x={col}&y={row}&z={level}",
                            subDomains: ["mt0", "mt1", "mt2", "mt3"],
                        })],
                        title: 'Google Гудамж',
                        id: "google Streets",
                        thumbnailUrl: "/bums/map/images/baseMaps/googleStreets.jpg"
                    }),
                    new Basemap({
                        baseLayers: [new WebTileLayer({
                            urlTemplate: "http://{subDomain}.google.com/vt/lyrs=s,h&x={col}&y={row}&z={level}",
                            subDomains: ["mt0", "mt1", "mt2", "mt3"],
                        })],
                        title: 'Google Сансрын',
                        id: "googleSatellite",

                        thumbnailUrl: "/bums/map/images/baseMaps/googleSatellite.jpg"
                    }),
                    new Basemap({
                        baseLayers: [new WebTileLayer({
                            urlTemplate: "https://{subDomain}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{level}/{row}/{col}",
                            subDomains: ["server", "services"]
                        })],
                        title: 'Сансрын зураг',
                        id: "imagery",
                        thumbnailUrl: "/bums/map/images/baseMaps/tempimagery.jpg"
                    }),
                    new Basemap({
                        baseLayers: [new WebTileLayer({
                            urlTemplate: "http://{subDomain}.tile.openstreetmap.org/{level}/{col}/{row}.png",
                            subDomains: ["a", "b", "c"]
                        })],
                        title: 'Open Street Map',
                        id: "OpenStreetMap",
                        thumbnailUrl: "/bums/map/images/baseMaps/openstreet.jpg"
                    }),
                ];

                this.map = new Map({
                    basemap: this.baseMaps[0]
                });

                // Create a MapView that displays map data

                let mapView = new viewCreator({
                    container: "map",
                    center: [this.center.lng, this.center.lat],
                    zoom: this.zoom,
                    map: this.map,
                    popup: {
                        highlightEnabled: true
                    }
                });



                this.mapView = mapView;


                /*Main basemaps start*/
                var localSource = new LocalBasemapsSource({
                    basemaps: this.baseMaps
                });
                var basemapGallery = new BasemapGallery({
                    view: this.mapView,
                    container: document.createElement("div"),
                    source: localSource
                });

// Create an Expand instance and set the content
// property to the DOM node of the basemap gallery widget

                var bgExpand = new Expand({
                    view: this.mapView,
                    content: basemapGallery
                });

// Add the expand instance to the ui






                let mapLayers = [];
                let showedLayers = localStorage.getItem('showedLayers');
                if (showedLayers) {
                    showedLayers = JSON.parse(showedLayers);
                }

                this.layers = this.init_data.categories;

                this.layers.map((layer, index) => {
                    let children = [];



                    //    if(layer.id == '2'){
                    //         state.hexagonLayer_filtered = new GraphicsLayer({
                    //             title:init.locale == "MNG" ? 'Бусад тайлангийн индекс' : 'Index polygons for other reports',
                    //             visible:false
                    //         });


                    //         children.push(state.hexagonLayer_filtered);

                    //         mapLayers.push({
                    //             layer: state.hexagonLayer_filtered,
                    //             type: 'hexagon',
                    //             uid: state.hexagonLayer_filtered.uid,
                    //             legends: [{ fill_color: 'rgba(45,127,251,0.5)',
                    //                 border_color: 'rgba(45,127,251,0.1)',element_type:'polygon', style_type:0}],
                    //             searchResultFileds: null,
                    //             id: 999999

                    //         });

                    //     }

                    layer.children.reverse().map((child, childIndex) => {



                        let mapLayer = null;

                        if (child.layer_type == 'feature') {

                            let Renderer;

                            if (child.legends.length >= 2) {

                                let uniqueRenderer = {
                                    type: "unique-value", // autocasts as new UniqueValueRenderer()
                                    field: child.style_field,
                                    uniqueValueInfos: []
                                };

                                child.legends.map((legend, lindex)=>{

                                    let symbol = getRerender(legend);

                                    let uniSymbol = {
                                        value: legend.style_value,
                                        symbol: symbol.symbol,
                                        label:childIndex+"-"+lindex

                                    }
                                    uniqueRenderer.uniqueValueInfos.push(uniSymbol);
                                });

                                uniqueRenderer.defaultLabel = childIndex+"-";
                                uniqueRenderer.defaultSymbol = uniqueRenderer.uniqueValueInfos[0].symbol;

                                Renderer = uniqueRenderer;


                            } else {

                                let legend = child.legends[0];

                                Renderer = getRerender(legend);
                            }

                            let formated = child.info_template.replace(/}/g, ":formatDateStrign}");



                            let template = { // autocasts as new PopupTemplate()
                                title: child.name,
                                content: child.id == '51' ? formated.replace('<p>&nbsp;</p>', '')+"{OBJECTID_1:getMetaLink_(layer_id:"+ child.id + ")}" : formated.replace('<p>&nbsp;</p>', '')+"{OBJECTID:getMetaLink_(layer_id:"+ child.id + ")}"
                            };

                            mapLayer = new FeatureLayer({
                                url: child.layer_url,
                                title: child.name,
                                visible: getLayerShow(child.id, child.show, showedLayers, false),
                                layerName: `${index}${childIndex}`,
                                renderer: Renderer,
                                outFields: ["*"],
                                popupTemplate: template
                            });




                        } else {

                            mapLayer = new MapImageLayer({
                                url: child.layer_url,
                                title: child.name,
                                visible: getLayerShow(child.id, child.show, showedLayers, false),
                                layerName: `${index}${childIndex}`,
                                listMode: 'hide-children',

                            });
                        }
                        if (mapLayer)
                            children.push(mapLayer);
                        // if(child.id == 17){
                        //     console.log(JSON.stringify({
                        //         layer: mapLayer,
                        //         type: child.layer_type,
                        //         uid: mapLayer.uid,
                        //         legends: child.legends,
                        //         searchResultFileds: child.search_result_fields,
                        //         id: child.id
                        //
                        //     }))
                        // }

                        mapLayers.push({
                            layer: mapLayer,
                            type: child.layer_type,
                            uid: mapLayer.uid,
                            legends: child.legends,
                            searchResultFileds: child.search_result_fields,
                            id: child.id

                        });

                    });


                    if (children.length >= 1) {




                        let layerGroup = new GroupLayer({
                            title: layer.name,
                            visible: true,
                            open: index == 1 ? true : false,
                            visibilityMode: "independent",
                            layers: children,

                        });

                        this.map.add(layerGroup);
                    }

                });

                this.mapLayers = mapLayers;
                /*
                * LAYER LIST
                * */

                var layer_list =  document.createElement("div");
                layer_list.setAttribute("id", "layer_list");
                var layerList = new LayerList({
                    view: this.mapView,
                    container: layer_list,
                    listItemCreatedFunction: (event)=> {

                        const item = event.item;

                        item.actionsSections = [
                            [{
                                title: "Давхарга томруулах",
                                className: "esri-icon-zoom-out-fixed",
                                id: "full-extent"
                            }]
                        ];

                        if (item.layer.type != "group") { // don't show legend twice
                            item.panel = {
                                content: "legend",
                                open: true
                            };
                        }

                    }
                });



                layerList.on("trigger-action", (event)=> {

                    // Capture the action id.
                    var id = event.action.id;
                    if (id === "full-extent") {

                        // if the full-extent action is triggered then navigate
                        // to the full extent of the visible layer
                        this.mapView.goTo(event.item.layer.fullExtent);

                    }
                });
                var layerListЕЕ = new Expand({
                    view: this.mapView,
                    content: layerList,

                });

                var ccWidget = new CoordinateConversion({
                    view: this.mapView
                });


                this.sketch_layer = new GraphicsLayer({
                    title: "Тусгай хэрэгцээнд авах талбай",
                });

                this.resultsLayer = new GraphicsLayer({
                    title: "Талбайгаар сонгосон элэрц",
                    listMode: "hide"
                });

                this.map.add(this.sketch_layer);
                this.map.add(this.resultsLayer);

                this.sketch = new Sketch({
                    layer: this.sketch_layer,
                    view: this.mapView,
                    container:document.getElementById('sketch_container')
                });
                setTimeout(()=>{
                    this.sketTypeAdd();
                }, 500);

                this.sketch.on("create", (event)=> {


                   if(event.state == 'complete'){
                       console.log(this.sketch_layer);

                       this.graphic_loading = true;
                       this.created_graphics = this.sketch_layer.graphics.items;
                       setTimeout(()=>{

                           this.cancelGraphic();
                           this.graphic_loading = false;
                       }, 500)
                   }
                });

                this.sketch.on("update", (event)=>{


                    console.log(event)
                   if(event.state == 'start'){
                       this.current = event.graphics[0];
                       if(this.current.geometry.type == 'point'){


                           this.geometryType = this.current.geometry.type;


                           this.points = [[this.current.geometry.longitude, this.current.geometry.latitude]];
                       } else {
                           this.geometryType = this.current.geometry.type;


                           let rings = this.current.geometry.rings[0].map(point=>{
                               return this.webMercatorUtils.xyToLngLat(point[0], point[1]);
                           });
                           if(rings[0][0] == rings[rings.length - 1][0] && rings[0][1] == rings[rings.length - 1][1]){
                               rings.splice(rings.length - 1, 1);
                           }

                           this.points = rings;
                       }



                   }
                   if(event.state == 'complete' || event.state == 'cancel'){

                       this.graphic_loading = true;
                       this.created_graphics = this.sketch_layer.graphics.items;

                       this.cancelGraphic();
                       setTimeout(()=>{


                           this.graphic_loading = false;
                       }, 500);

                       this.resultsLayer.removeAll();

                       this.results = [];


                   }
                });




                // var sketch_epend = new Expand({
                //     view: this.mapView,
                //     content: this.sketch,
                //
                // });
                //
                // watchUtils.pausable(sketch_epend, "expanded", function(newValue, oldValue){
                //    if(sketch_epend.expanded){
                //        let checkDOMS = document.getElementsByClassName("esri-sketch__button");
                //
                //
                //        for (var i = 0; i < checkDOMS.length; i++) {
                //            checkDOMS[i].setAttribute("type", "button");
                //        }
                //    }
                // });




                this.mapView.when(() => {

                    this.mapView.ui.add(bgExpand, "top-right");
                    this.mapView.ui.add(layerListЕЕ, "top-right");
                    // this.mapView.ui.add(sketch_epend, "top-right");
                    this.setViewReady = true;
                    this.mapView.ui.add(ccWidget, "bottom-left");




                });

            },
        },
        mounted() {


            axios.get('/GISDATA/mng.json').then(res=>{

                this.init_data = res.data;
                this.createMap();
            })



        }
    };
</script>
