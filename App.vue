<template>
    <ControlApp
            guide_url="/user_guide"
    >
    </ControlApp>
</template>

<script>
    import ControlApp from "./appAdmin/app"
    import {mapGetters} from "vuex";
    export default {
        computed: {
            ...mapGetters({
                themeMode: "themeMode",
            })
        },
        components:{
            ControlApp
        },
        name: "App"
    }
</script>

<style scoped>

</style>