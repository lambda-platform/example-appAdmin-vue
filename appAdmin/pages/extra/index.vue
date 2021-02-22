<template>
    <section class="page page-faq page-sidebar">

        <subsidebar >
            <div slot="top">
                <h2>
                    Мэдээлэл боловсруулагч
                </h2>
            </div>
            <ul slot="nav" style="height:90%; overflow-y:auto">

                <li v-if="extra.moqup">
                    <router-link to="/extra/moqup">
                        <Icon type="ios-albums-outline"></Icon>
                        <span>Эх бэлтгэл</span>
                    </router-link>
                </li>
                <li v-if="extra.datasource">
                    <router-link to="/extra/datasource">
                        <Icon type="ios-ionic-outline"></Icon>
                        <span>Өгөгдөл боловсруулах</span>
                    </router-link>
                </li>
                <li v-if="extra.chart">
                    <router-link to="/extra/chart">
                        <Icon type="ios-pie-outline"></Icon>
                        <span>График үүсгэгч</span>
                    </router-link>
                </li>
            </ul>
        </subsidebar>
        <router-view :key="$route.path"></router-view>



    </section>
</template>
<script>
    export default {
        data() {
            return {
                options: {
                    height: "500px"
                },
                extra: window.init.permissions.extra,

            };
        },
        methods: {

            can(menu) {
                return true;
                if (this.permissions[menu.id]) {
                    if (this.permissions[menu.id].show)
                        return true
                    else
                        return false
                } else
                    return true;
            },

        },
        mounted() {

            if(this.extra.moqup || this.extra.datasource || this.extra.chart){
                if(this.$route.path == '/extra' && this.extra.moqup){
                    this.$router.push("/extra/moqup");
                } else  if(this.$route.path == '/extra' && this.extra.datasource){
                    this.$router.push("/extra/datasource");
                } else  if(this.$route.path == '/extra' && this.extra.chart){
                    this.$router.push("/extra/chart");
                }
            } else {
                this.$router.push("/");
            }



        }
    };
</script>
