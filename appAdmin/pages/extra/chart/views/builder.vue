<template>

     <section class="page page-chart">
        <chart-builder :editMode="editMode" :src="src" :onCreate="onCreate" :onUpdate="onUpdate"></chart-builder>
    </section>
</template>

<script>


    export default {
        components: {

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
                this.src = `/lambda/puzzle/schema/chart/${this.$route.params.id}`;
            }
        },
        methods: {
            onCreate() {
                this.$router.push("/extra/chart");
            },
            onUpdate() {
                this.$router.push("/extra/chart");
            }
        }
    };
</script>
