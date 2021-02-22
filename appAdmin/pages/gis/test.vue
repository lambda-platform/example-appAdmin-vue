<template>
    <div id="MRPAM_AREA">
        <div id="map">
        </div>
        <div id="infoDiv">
            <input class="esri-component esri-widget-button esri-widget esri-interactive" type="button"
                   @click="switchMode" id="switch-btn" :value="mode == '3D' ? '2D' : '3D'">
        </div>
        <div id="base_map"></div>
    </div>

</template>

<script>
    import { loadModules } from 'esri-loader';
    import "./MRPAM_Area.scss"
    const options = { css: true };
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

        refresh
    } from "./utils/Map";
    export default {
        props: ["model", "rule", "label", "meta"],
        data(){
            return {
                mode:mode ? mode : '2D',
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
                legendsCount: 0,
            }
        },
        methods:{
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
                    'esri/geometry/geometryEngineAsync',
                    'esri/widgets/Sketch',
                    'esri/layers/GraphicsLayer',
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
                               geometryEngineAsync,
                               Sketch,
                               GraphicsLayer,

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


                const sketch_layer = new GraphicsLayer();

                this.map.add(sketch_layer);

                const sketch = new Sketch({
                    layer: sketch_layer,
                    view: this.mapView
                });

                sketch.on("create", function(event) {

                    console.log(event.state)
                });


                var sketch_epend = new Expand({
                    view: this.mapView,
                    content: sketch,

                });


                this.mapView.when(() => {

                    this.mapView.ui.add(bgExpand, "top-right");
                    this.mapView.ui.add(layerListЕЕ, "top-right");
                    this.mapView.ui.add(sketch_epend, "top-right");
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
