<template>
    <div class="search-result">
        <div>
            <div>
                <h4>Хайлтын үр дүн</h4>

                <div @click="clear" class="close-btn">
                    <i class="esri-icon-close"></i>
                </div>
            </div>
        </div>
        <Input suffix="ios-search" placeholder="Хайх" style="width: 100%" v-if="results.length >= 1" v-model="filter"/>
        <br>
        <br>
        <Collapse v-model="activeResult" v-if="results.length >= 1" accordion simple>

            <Panel v-for="(layer, index) in results" :key="index" :title="layer.title" :name="`${index}`"
                   v-show="layer.features.length >= 1">
                {{layer.title}} ({{layer.features.length}}})
                <div v-if="layer.features.length >= 1" slot="content">
                    <List border size="small">
                        <ListItem v-for="(feature, fIdnex) in layer.features" :key="fIdnex"
                                  v-show="feature.text.indexOf(filter) > -1">

                            <a @click="showPopup(feature)" class="showItem">
                                <i class="esri-icon-visible"></i> {{feature.text}}
                            </a>

                        </ListItem>


                    </List>
                </div>
            </Panel>

        </Collapse>

        <br>
        <i-button v-if="results.length >= 1" @click="clear" size="small" style="width: 100%">Цэвэрлэх</i-button>

        <Alert v-show="showLayerWarning" type="warning">Бүх давхарга хаалттай байна !!!</Alert>

        <div v-show="showNoData && !loading">
            <div class="ant-empty ant-empty-normal">
                <div class="ant-empty-image">
                    <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                            <ellipse fill="#F5F5F5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                            <g fillRule="nonzero" stroke="#D9D9D9">
                                <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                <path
                                        d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                                        fill="#FAFAFA"
                                ></path>
                            </g>
                        </g>
                    </svg>
                </div>
                <p class="ant-empty-description">Мэдээлэл олдсонгүй</p>
            </div>
        </div>
        <div v-show="loading" class="loading-bar">
            <Spin></Spin>
        </div>
    </div>
</template>
<script>
    import {webmap, view} from './map';
    import {template, dateToString} from './utils';

    export default {
        name: "SearchResult",
        data() {
            return {
                activeResult: "0",
                results: [],
                filter: "",
                showLayerWarning: false,
                showNoData: false,
                loading: false,

            }
        },
        methods: {
            queryTask(layer, geometry) {
                const query = layer.createQuery();
                query.geometry = geometry;
                query.spatialRelationship = 'intersects';
                query.outFields = ['*'];
                return layer.queryFeatures(query);
            },
            showPopup(feature) {
                console.log('testtest')
                view.popup.open({
                    features: [feature],
                    location: feature.geometry.centroid,
                    view: view,
                });
            },
            clear() {
                this.results = [];
                this.showNoData = false;
                this.$emit("clear");
            },
            doSearch(geometry) {
                this.results = [];
                this.loading = true;
                let layerFound = false;
                this.showLayerWarning = false;
                webmap.allLayers.root.layers.items.map(layer => {
                    if (layer.type == 'group' && layer.visible === true) {
                        layer.layers.items.map(subLayer => {
                            if (subLayer.type == 'feature' && subLayer.visible === true) {
                                layerFound = true;
                                if (
                                    subLayer.title != 'Дүүргийн хил' &&
                                    subLayer.title != 'Хорооны хил' &&
                                    subLayer.title != 'Сумын хил' &&
                                    subLayer.title != 'Аймагийн хил'
                                )
                                    this.queryTask(subLayer, geometry).then(results => {
                                        this.displayResults(
                                            results,
                                            subLayer.title,
                                            layer.uid,
                                            subLayer.searchResultFields,
                                            subLayer.infoTemplate,
                                            subLayer.exportData,
                                        );

                                        this.loading = false;
                                    });
                            }
                        });
                    }
                });
                if (this.results.length <= 0) {
                    this.showNoData = true;
                } else {
                    this.showNoData = false;
                }
                if (!layerFound) {
                    this.showLayerWarning = true;
                }
            },
            displayResults(results, title, uid, searchResultFields, infoTemplate, exportData) {
                this.showNoData = false;

                const layerResults = {
                    title: title,
                    uid: uid,
                    loading: false,
                    features: [],
                    searchResultFields: searchResultFields,
                    infoTemplate: infoTemplate,
                    exportData: exportData,
                };

                results.features.map(graphic => {
                    graphic.text = this.getResultContent(graphic.attributes, searchResultFields);
                    layerResults.features.push(graphic);

                });

                if (layerResults.features.length >= 1) {
                    this.results = [...this.results, layerResults];
                }
            },
            getResultContent(attributes, searchResultFields) {
                let title = '';

                const showFields = searchResultFields;

                title = template(showFields, dateToString(attributes));

                return title;
            }
        },

    }
</script>
