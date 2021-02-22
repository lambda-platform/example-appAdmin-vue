<template>
    <list-view src="/lambda/puzzle/schema/chart" prefix="/extra" title="Chart Builder" type="chart" :data="listData" ></list-view>
</template>

<script>
    import listView from "../../../../components/listview.vue";

    export default {
        components: {
            "list-view": listView
        },
        data() {
            return {

                extra: window.init.permissions.extra,

            };
        },
        mounted() {

            if(!this.extra.chart){
                this.$router.push("/");
            }



        }
    };
</script>
