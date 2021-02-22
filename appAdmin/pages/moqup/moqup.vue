<template>
    <moqup :src="url" :disable_preview="true"></moqup>
</template>

<script>
    export default {
        data() {

            return {
                url: '',
            };
        },
        methods: {

        },
        mounted(){

            this.url = window.init.url;
        }
    };
</script>
