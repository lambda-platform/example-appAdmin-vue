<template>
    <section class="page ">
        <data-source :editMode="editMode" :src="src" :onCreate="onCreate" :onUpdate="onUpdate"></data-source>
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
                this.src = `/lambda/puzzle/schema/datasource/${this.$route.params.id}`;
            }
        },
        methods: {
            onCreate() {
                this.$router.push("/extra/datasource");
            },
            onUpdate() {
                this.$router.push("/extra/datasource");
            }
        }
    };
</script>
