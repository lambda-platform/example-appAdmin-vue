<template>
    <section class="map home-padding" id="map">
        <div v-show="aimags.length >= 1 || districts.length >= 1"
             :class="`map-filter ${showFilter ? 'show-filter' : 'show-filter'}`"
             @mouseover="showFilter = true"
             @mouseleave="hideFilter">

<!--            <span v-show="!showFilter && mongolianMap">-->
<!--                Аймаг, сумаар хайх-->
<!--            </span>-->
<!--            <span v-show="!showFilter && !mongolianMap">-->
<!--                Дүүрэг, хороогоор хайх-->
<!--            </span>-->
            <div >
                <div v-show="mongolianMap">
                    <Select v-model="aimag" filterable clearable placeholder="Аймаг сонгох" size="small"
                            class="filter-selector" :loading="aimagLoading" @on-change="selectAimag">
                        <Option v-for="item in aimags" :value="item.attributes.OBJECTID"
                                :key="item.attributes.OBJECTID">{{ item.attributes.MONNAME }}
                        </Option>
                    </Select>
                    <Select v-model="sum" filterable clearable placeholder="Сум сонгох" size="small"
                            class="filter-selector" :loading="sumLoading" @on-change="selectSum">
                        <Option v-for="item in sums" :value="item.attributes.OBJECTID" :key="item.attributes.OBJECTID">
                            {{ item.attributes.MONNAME }}
                        </Option>
                    </Select>
                </div>
                <div v-show="!mongolianMap">
                    <Select v-model="district" filterable clearable placeholder="Дүүрэг сонгох" size="small"
                            class="filter-selector" @on-change="selectDuureg" :loading="districtLoading">
                        <Option v-for="item in districts" :value="item.attributes.OBJECTID"
                                :key="item.attributes.OBJECTID">{{ item.attributes.NAME }}
                        </Option>
                    </Select>
                    <Select v-model="region" filterable clearable placeholder="Хороо сонгох" size="small"
                            class="filter-selector" :loading="regionLoading" @on-change="selectKhoroo">
                        <Option v-for="item in regions" :value="item.attributes.OBJECTID"
                                :key="item.attributes.OBJECTID">{{ item.attributes.Khoroo_name }}
                        </Option>
                    </Select>
                </div>
            </div>
        </div>
        <div class="map-level">
            <i-switch size="small" v-model="mongolianMap" @on-change="clear" true-color="#008B42">
            </i-switch>
            Улсын хэмжээнд
        </div>
        <SearchResult ref="search" @clear="clear" :class="aimag || district ? 'show-result' : 'hide-result'"/>
    </section>
</template>

<script lang="ts">
    import {duuregLayer, khorooLayer, addGraphic, removeAll} from "./map";
    import SearchResult from "./SearchResult.vue";
    import {AimagLayer, SumLayer} from "./map";

    export default {
        name: 'WebMap',
        components:{
            SearchResult:SearchResult
        },
        data() {
            return {
                mongolianMap: false,
                showFilter: false,
                showFilterSelector: false,
                aimags: [],
                sums: [],
                districts: [],
                regions: [],
                aimag: null,
                aimagLoading: false,
                sum: null,
                sumLoading: false,
                district: null,
                districtLoading: false,
                region: null,
                regionLoading: false,
            }
        },
        methods: {
            clear(){
                this.aimag = null;
                this.sum = null;
                this.district = null;
                this.region = null;
                removeAll();

            },
            hideFilter() {
                if(this.showFilter){
                    if(this.aimag || this.district){
                        this.showFilter = true;
                        this.showFilterSelector = true;
                    } else {
                        this.showFilter = false;
                        this.showFilterSelector = false;
                    }
                } else {
                    this.showFilterSelector = false;
                    this.showFilter = false;
                }
            },
            getDuureg() {
                this.districtLoading = true;
                duuregLayer.when(() => {
                    const query = duuregLayer.createQuery();
                    query.outSpatialReference = {latestWkid: 3857, wkid: 102100};
                    query.orderByFields = 'NAME';

                    duuregLayer.queryFeatures(query).then(features => {
                        this.districts = features.features;
                        this.districtLoading = false;
                    }).catch(()=>{
                        this.districtLoading = false;
                    });
                });
            },
            selectDuureg(duureg_id) {
                this.regionLoading = true;
                this.regions = [];
                const duuregIndex = this.districts.findIndex(duureg => duureg.attributes.OBJECTID == duureg_id);

                if (duuregIndex >= 0) {

                    const query = khorooLayer.createQuery();
                    query.outSpatialReference = {latestWkid: 3857, wkid: 102100};
                    query.geometry = this.districts[duuregIndex].geometry;
                    query.spatialRelationship = 'contains';
                    query.orderByFields = 'KH_MON';
                    khorooLayer.queryFeatures(query).then(features => {
                       this.regions = features.features;

                        this.regionLoading = false;
                    }).catch(()=>{
                        this.regionLoading = false;
                    });

                    addGraphic(this.districts[duuregIndex].geometry);
                    this.$refs.search.doSearch(this.districts[duuregIndex].geometry);


                } else {
                    this.$refs.search.clear();
                    this.regionLoading = false;
                    removeAll();
                }
            },
            getAimag() {
                this.districtLoading = true;
                AimagLayer.when(() => {
                    const query = AimagLayer.createQuery();
                    query.outSpatialReference = {latestWkid: 3857, wkid: 102100};
                    query.orderByFields = 'MONNAME';
                    AimagLayer.queryFeatures(query).then(features => {
                        this.aimags = features.features;
                        this.aimagLoading = false;
                    }).catch(()=>{
                        this.aimagLoading = false;
                    });
                });
            },
            selectAimag(aimag_id) {
                this.regionLoading = true;
                this.regions = [];
                const aimagIndex = this.aimags.findIndex(aimag => aimag.attributes.OBJECTID == aimag_id);

                if (aimagIndex >= 0) {

                    const query = SumLayer.createQuery();
                    query.outSpatialReference = {latestWkid: 3857, wkid: 102100};
                    query.geometry = this.aimags[aimagIndex].geometry;
                    query.spatialRelationship = 'contains';
                    query.orderByFields = 'MONNAME';
                    SumLayer.queryFeatures(query).then(features => {
                       this.sums = features.features;

                        this.sumLoading = false;
                    }).catch(()=>{
                        this.sumLoading = false;
                    });

                    addGraphic(this.aimags[aimagIndex].geometry);
                    this.$refs.search.doSearch(this.aimags[aimagIndex].geometry);


                } else {
                    this.$refs.search.clear();
                    this.sumLoading = false;
                    removeAll();
                }
            },
            selectSum(Sum_id){

                const SumIndex = this.sums.findIndex(region => region.attributes.OBJECTID == Sum_id);

                if (SumIndex >= 0) {

                    addGraphic(this.sums[SumIndex].geometry);
                    this.$refs.search.doSearch(this.sums[SumIndex].geometry);

                } else {
                    this.$refs.search.clear();
                    this.sumLoading = false;
                    removeAll();
                }
            },
            selectKhoroo(khoroo_id){

                const khorooIndex = this.regions.findIndex(region => region.attributes.OBJECTID == khoroo_id);

                if (khorooIndex >= 0) {

                    addGraphic(this.regions[khorooIndex].geometry);
                    this.$refs.search.doSearch(this.regions[khorooIndex].geometry);

                } else {
                    this.$refs.search.clear();
                    this.regionLoading = false;
                    removeAll();
                }
            }
        },
        async mounted() {
            const app = await import('./map.js');
            app.initialize(this.$el);

            this.getDuureg();
            this.getAimag();
        },
        watch: {
            showFilter(value) {
                if (value) {
                    setTimeout(() => {
                        this.showFilterSelector = true;
                    }, 450)
                }
            }
        }
    };
</script>

