<template>
    <section class="page page-puzzle">
        <moqup-builder :editMode="editMode" :src="src" :onCreate="onCreate" :onUpdate="onUpdate"></moqup-builder>
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
            editMode: false,
            src: ""
        };
    },
    created() {
        let id = this.$route.params.id;

        if (typeof id !== "undefined" && id !== "" && id !== null) {
            this.editMode = true;
            this.src = `/lambda/puzzle/schema/moqup/${this.$route.params.id}`;
        }
    },
    methods: {
        onCreate() {
            this.$router.push("/extra/moqup");
        },
        onUpdate() {
            this.$router.push("/extra/moqup");
        }
    }
};
</script>
