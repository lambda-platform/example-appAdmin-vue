<template>
    <section class="page page-preview">
        <h4 style="text-align: center; margin: 20px auto">
            <a :href="`/control/moqup/${$route.params.id}`" target="_blank">Embed Холбоос</a>
        </h4>
        <div class="pz-preview">

            <moqup :src="src"></moqup>
        </div>
    </section>
</template>

<script>
import pageHeader from "../../../../components/pageHeader.vue";

export default {
    components: {
        "page-header": pageHeader
    },
    data() {
        return {
            src: ""
        };
    },
    mounted() {
        this.src = `/lambda/puzzle/schema/moqup/${this.$route.params.id}`;
    }
};
</script>
