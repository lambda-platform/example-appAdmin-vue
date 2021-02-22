<template>
<section class="page page-preview">
    <div class="pz-preview">
        <chart :src="src"></chart>
    </div>
</section>
</template>

<script>
import pageHeader from "../../../../components/pageHeader.vue";

export default {
    components: {
        "page-header": pageHeader
    },

    computed: {
        src: function () {
            return `/lambda/puzzle/schema/chart/${this.$route.params.id}`
        }
    }
};
</script>
