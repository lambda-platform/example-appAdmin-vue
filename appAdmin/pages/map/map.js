import MapView from 'esri/views/MapView';
import WebMap from 'esri/WebMap';
import WebTileLayer from 'esri/layers/WebTileLayer';
import Sceneview from 'esri/views/SceneView';
import Basemap from 'esri/Basemap';
import esriConfig from 'esri/config';
// import CoordinateConversion from 'esri/widgets/CoordinateConversion';
import Locate from 'esri/widgets/Locate';
import LayerList from 'esri/widgets/LayerList';
import BasemapGallery from 'esri/widgets/BasemapGallery';
import LocalBasemapsSource from 'esri/widgets/BasemapGallery/support/LocalBasemapsSource';
import Expand from "esri/widgets/Expand";
import Print from 'esri/widgets/Print';
import Bookmarks from "esri/widgets/Bookmarks";
import TileLayer from 'esri/layers/TileLayer';
import MapImageLayer from 'esri/layers/MapImageLayer';
import GroupLayer from 'esri/layers/GroupLayer';
import FeatureLayer from 'esri/layers/FeatureLayer';

import { getRerender } from './helper';
import GraphicsLayer from 'esri/layers/GraphicsLayer';

import Graphic from "esri/Graphic";
// import { formatDate } from './utils';


/**
 * Map, View, Config
 * */
esriConfig.request.corsEnabledServers.push(
  'http://mt0.google.com',
  'http://mt1.google.com',
  'http://mt2.google.com',
  'http://mt3.google.com',
  'http://a.tile.openstreetmap.org',
  'http://b.tile.openstreetmap.org',
  'http://c.tile.openstreetmap.org',
);
export const Graphic_ = Graphic;
export const baseMaps = [
  new Basemap({
    baseLayers: [
      new WebTileLayer({
        urlTemplate: 'https://{subDomain}.google.com/vt/lyrs=m&x={col}&y={row}&z={level}',
        subDomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
    ],
    title: 'Google Гудамж',
    id: 'google Streets',
    thumbnailUrl: '/web/images/baseMaps/googleStreets.jpg',
  }),
  new Basemap({
    baseLayers: [
      new WebTileLayer({
        urlTemplate: 'https://{subDomain}.google.com/vt/lyrs=s,h&x={col}&y={row}&z={level}',
        subDomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }),
    ],
    title: 'Google Сансрын',
    id: 'googleSatellite',

    thumbnailUrl: '/web/images/baseMaps/googleSatellite.jpg',
  }),
  new Basemap({
    baseLayers: [
      new WebTileLayer({
        urlTemplate:
          'https://{subDomain}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{level}/{row}/{col}',
        subDomains: ['server', 'services'],
      }),
    ],
    title: 'Сансрын зураг',
    id: 'imagery',
    thumbnailUrl: '/web/images/baseMaps/tempimagery.jpg',
  }),
  new Basemap({
    baseLayers: [
      new WebTileLayer({
        urlTemplate: 'https://{subDomain}.tile.openstreetmap.org/{level}/{col}/{row}.png',
        subDomains: ['a', 'b', 'c'],
      }),
    ],
    title: 'Open Street Map',
    id: 'OpenStreetMap',
    thumbnailUrl: '/web/images/baseMaps/openstreet.jpg',
  }),
];
export const mapMode = localStorage.getItem('mode');
export const webmap = new WebMap({
  basemap: baseMaps[0],
});
export const view =
  mapMode == '3D'
    ? new Sceneview({
      container: 'viewDiv',
      map: webmap,
      center: [106.917782, 47.9187],
      zoom: 12,
    })
    : new MapView({
      container: 'viewDiv',
      map: webmap,
      center: [106.917782, 47.9187],
      zoom: 12,
    });


export const removeAll = () => {
  if (SearchResultLayer.graphics.length >= 1) {
    SearchResultLayer.graphics.removeAll();
  }
};
export const selectedSymbol = {
  type: 'simple-fill', // autocasts as new SimpleFillSymbol()
  color: [53, 128, 216, 0.1],
  outline: {
    // autocasts as new SimpleLineSymbol()
    color: [53, 128, 216],
    width: 1,
  },
};
export const addGraphic = (geometry) => {
  view.goTo(geometry.extent);
  removeAll();
  const newGraphic = new Graphic_({
    geometry: geometry,
    symbol: selectedSymbol,
  });

  SearchResultLayer.graphics.add(newGraphic);
};

/**
 * Map Widgets
 * */
// const ccWidget = new CoordinateConversion({
//   view: view,
// });
// view.ui.add(ccWidget, 'bottom-left');
const locateBtn = new Locate({
  view: view,
});
const localSource = new LocalBasemapsSource({
  basemaps: baseMaps,
});
view.ui.add(
    [
      new Expand({
        content: new LayerList({ view: view }),
        view: view,
        group: "top-left",
        expandTooltip:"Давхарга"
      }),
      new Expand({
        content: new BasemapGallery({
          view: view,
          source: localSource,
        }),
        view: view,
        expandIconClass: "esri-icon-basemap",
        group: "top-left",
        expandTooltip:"Суурь зураг"
      }),
      locateBtn
    ],
    "top-left"
);
view.ui.add(
    [

      new Expand({
        content:new Bookmarks({
          view: view,
          // allows bookmarks to be added, edited, or deleted
          editingEnabled: true
        }),
        view: view,
        group: "bottom-right",
        expandTooltip:"Байршил тэмдэглэж авах"
      }),
      new Expand({
        content:  new Print({
          view: view,
          printServiceUrl:
              'https://dms.ulaanbaatar.mn/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        }),
        view: view,
        expandIconClass: "esri-icon-printer",
        group: "bottom-right",
        expandTooltip:"Хэвлэх"
      }),

    ],
    "bottom-right"
);

const duuregHil = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [53, 128, 216, 0],
    outline: {
      width: '1px',
      color: [53, 128, 216],
      opacity: 1,
      join:"round",
      cap:"round",
    },
  },
};
const khorooHil = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [53, 128, 216, 0],
    outline: {
      width: '1px',
      color: [232, 74, 10],
      opacity: 1,
      join:"round",
      cap:"round",
    },
  },
  // visualVariables: [{
  //     type: "rotation",
  //     // the tetrahedron points south by default, so we need to subtract 180 degrees
  //     valueExpression: "$feature.KH_MON",
  //     axis: "heading"
  // }]
};


const duuregLabel = {
  // autocasts as new LabelClass()
  symbol: {
    type: 'text', // autocasts as new TextSymbol()
    color: [53, 128, 216],
    haloColor: 'white',
    haloSize: 2,
    font: {
      // autocast as new Font()
      family: 'Arial',
      size: 11,
    },
  },
  labelPlacement: 'above-center',
  labelExpressionInfo: {
    expression: '$feature.NAME',
  },
};
const KhorooLabel = {
  // autocasts as new LabelClass()
  symbol: {
    type: 'text', // autocasts as new TextSymbol()
    color: [232, 74, 10],
    haloColor: 'white',
    haloSize: 2,
    font: {
      // autocast as new Font()
      family: 'Arial',
      size: 9,
    },
  },
  labelPlacement: 'above-center',
  labelExpressionInfo: {
    expression: `$feature.Khoroo_name`,
  },
};
const AimagLabel = {
  // autocasts as new LabelClass()
  symbol: {
    type: 'text', // autocasts as new TextSymbol()
    color: [53, 128, 216],
    haloColor: 'white',
    haloSize: 2,
    font: {
      // autocast as new Font()
      family: 'Arial',
      size: 11,
    },
  },
  labelPlacement: 'above-center',
  labelExpressionInfo: {
    expression: '$feature.MONNAME',
  },
};
const SumLabel = {
  // autocasts as new LabelClass()
  symbol: {
    type: 'text', // autocasts as new TextSymbol()
    color: [232, 74, 10],
    haloColor: 'white',
    haloSize: 2,
    font: {
      // autocast as new Font()
      family: 'Arial',
      size: 9,
    },
  },
  labelPlacement: 'above-center',
  labelExpressionInfo: {
    expression: `$feature.MONNAME`,
  },
};
export const duuregLayer = new FeatureLayer({
  url: 'https://dms.ulaanbaatar.mn/arcgis/rest/services/Admin/Admin/FeatureServer/1',
  title: 'Дүүргийн хил',
  visible: true,
  labelingInfo: [duuregLabel],
  labelsVisible: true,
  renderer: duuregHil,
});
export const khorooLayer = new FeatureLayer({
  url: 'https://dms.ulaanbaatar.mn/arcgis/rest/services/Admin/Admin/FeatureServer/0',
  title: 'Хорооны хил',
  visible: false,
  labelingInfo: [KhorooLabel],
  labelsVisible: true,
  elevationInfo: {
    mode: 'relative-to-ground',
    offset: 1000,
  },
  renderer: khorooHil,
  opacity: 1,
});
export const AimagLayer = new FeatureLayer({
  url: 'https://gismap.mris.mn:6443/arcgis/rest/services/Administration/AimagNewMon/FeatureServer/0',
  title: 'Aймагийн хил',
  visible: false,
  labelingInfo: [AimagLabel],
  labelsVisible: true,
  renderer: duuregHil,
});
export const SumLayer = new FeatureLayer({
  url: 'https://gismap.mris.mn:6443/arcgis/rest/services/Administration/SoumNewMon/FeatureServer/0',
  title: 'Сумын хил',
  visible: false,
  labelingInfo: [SumLabel],
  labelsVisible: true,
  elevationInfo: {
    mode: 'relative-to-ground',
    offset: 1000,
  },
  renderer: khorooHil,
  opacity: 1,
});


/**
 * Map layers
 * */
const setLayers = () => {
  /**
   * local base maps
   * */
  const localBaseMaps = [];

  window.init.baseMaps.map(baseMap => {
    if (baseMap.is_dynamic) {
      const mapImageLayer = new MapImageLayer({
        url: baseMap.url,
        title: baseMap.layerName,
        visible: baseMap.show == '1' ? true : false,
        // listMode:'hide'
      });
      localBaseMaps.push(mapImageLayer);
    } else {
      const tileLayer = new TileLayer({
        url: baseMap.url,
        title: baseMap.layerName,
        visible: baseMap.show == '1' ? true : false,
        // listMode:'hide'
      });
      localBaseMaps.push(tileLayer);
    }
  });

  if (localBaseMaps.length >= 1) {
    const localBaseMapGroup = new GroupLayer({
      legendClass: ``,
      title: 'Бусад суур зураг',
      visible: false,
      visibilityMode: 'independent',
      layers: localBaseMaps,
    });

    webmap.add(localBaseMapGroup);
  }

  // const sheet = document.createElement('style');
  // let styles = '';

  /*aditional layers start*/

  /*zz hil*/
  const layerGroupHil = new GroupLayer({
    legendClass: `group-legend category_hil`,
    title: 'Засаг захиргааны хил',
    visible: true,
    listMode: 'show',
    visibilityMode: 'independent',
    layers: [ khorooLayer, duuregLayer, AimagLayer, SumLayer],
  });

  webmap.add(layerGroupHil);



  /*aditional layers end*/

  window.init.categories.reverse().map(category => {
    const layers = [];

    category.children.map((layer, childIndex) => {
      if (layer.layer_type == 'feature') {
        let Renderer;

        if (layer.legends.length >= 2) {
          const uniqueRenderer = {
            type: 'unique-value', // autocasts as new UniqueValueRenderer()
            field: layer.style_field,
            uniqueValueInfos: [],
          };

          layer.legends.map(legend => {
            const symbol = getRerender(legend);

            const uniSymbol = {
              value: legend.style_value,
              symbol: symbol.symbol,
              label: legend.title,
            };
            uniqueRenderer.uniqueValueInfos.push(uniSymbol);
          });

          uniqueRenderer.defaultLabel = childIndex + '-';
          uniqueRenderer.defaultSymbol = uniqueRenderer.uniqueValueInfos[0].symbol;

          Renderer = uniqueRenderer;
        } else {
          Renderer = getRerender(layer.legends[0]);
        }
        // let formated = layer.info_template.replace(/}/g, ":formatDateStrign}");

        const template = {
          // autocasts as new PopupTemplate()
          title: layer.name,
          content: layer.info_template,
          // content: [ {
          //     type: "text",
          //     text:
          // },
          //     {
          //         type: "media",
          //         mediaInfos: [ {
          //
          //             type: "image",
          //             value: {
          //                 sourceURL: "https://www.beverlyhills.org/cbhfiles/storage/files/13203374121770673849/122707_039r_final.jpg"
          //             }
          //         }, {
          //             type: "image",
          //             value: {
          //                 sourceURL: "{Zurag}"
          //             }
          //         }]
          //     }],
        };

        // const clusterConfig = {
        //   type: "cluster",
        //   popupTemplate: {
        //     content: [
        //       {
        //         type: "text",
        //         text: "This cluster represents <b>{cluster_count}</b> features."
        //       },
        //       {
        //         type: "text",
        //         // layer.renderer.field = "religion"
        //         text:
        //             "The predominant place of worship in this cluster is <b>{cluster_type_religion}</b>."
        //       }
        //     ]
        //   }
        // };


        const mapLayer = new FeatureLayer({
          url: layer.layer_url,
          title: layer.name,
          visible: layer.show == 1 ? true : false,
          renderer: Renderer,
          outFields: ['*'],
          // featureReduction: clusterConfig,
          popupTemplate: template,
          searchResultFields: layer.search_info,
          infoTemplate: layer.info_template,
          exportData: layer.export == 1,
          isMultipleLegend: layer.legends.length >= 2,
          multipleLegends: layer.legends.length >= 2 ? layer.legends : [],
        });

        layers.push(mapLayer);
      }
    });

    const layerGroup = new GroupLayer({
      // legendClass: `group-legend category_${category.id}`,
      title: category.name,
      visible: category.show == 1 ? true : false,
      visibilityMode: 'independent',
      layers: layers,
    });

//     styles =
//         styles +
//         `
//         .category_${category.id}::before{
//             background: url("${category.icon}");
//             background-size: cover;
//         }
// `;

    webmap.add(layerGroup);
  });

  // sheet.innerHTML = styles;
  // document.body.appendChild(sheet);
};


export const SearchResultLayer = new GraphicsLayer({
  title: 'Хайлтын үр дүн',
  listMode: 'hide',
});
webmap.add(SearchResultLayer);

/**
 * Assigns the container element to the View
 * @param container
 */
export const initialize = (container) => {
  //
  setLayers();

  view.container = container;

  view.when()
    .then(() => {
      console.log('Map and View are ready');
    })
    .catch(error => {
      console.warn('An error in creating the map occured:', error);
    });
};
