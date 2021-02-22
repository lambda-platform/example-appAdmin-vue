<template>
    <list-view src="/lambda/puzzle/schema/moqup" prefix="/extra" title="Page builder" type="moqup" :data="listData"></list-view>
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

        if(!this.extra.moqup){
            this.$router.push("/");
        }



    }
};
</script>
