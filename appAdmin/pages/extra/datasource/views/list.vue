<template>
    <list-view src="/lambda/puzzle/schema/datasource" prefix="/extra" title="Data Source"  type="datasource" preview="hidden"></list-view>
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

            if(!this.extra.datasource){
                this.$router.push("/");
            }



        }
    };
</script>
