<template>
    <div :class="menuMode == 'top'  ? 'paper-theme aside-page paper-with-top-nav '+themeMode : menuMode == 'nested' ? showSidebar == 'full' ? 'paper-theme aside-page nested '+themeMode : 'paper-theme aside-page nested hidden-nested '+themeMode :  'paper-theme aside-page side-menu '+themeMode">
        <header>
            <div class="logo">
                <slot name="logo">

                    <router-link to="/" v-if="logo_dark == '' && logo_light == ''">
                        <img :src="logo" alt="">
                    </router-link>

                    <router-link :to="brandBtnUrl" v-if="themeMode == 'light' && logo_dark != '' && logo_light != ''">
                        <img :src="logo_light" alt="">
                    </router-link>
                    <router-link :to="brandBtnUrl" v-if="themeMode == 'dark' && logo_dark != '' && logo_light != ''">
                        <img :src="logo_dark" alt="">
                    </router-link>
                </slot>

            </div>
            <div class="wbg">
            </div>
            <div class="wbg-border">
            </div>
            <div :class="menuMode == 'top_in_header' ? 'header-left hidden-page-title' : 'header-left'">
                <a href="javascript:void(0)" class="side-toggle" @click="toggleSideBar" v-if="menuMode == 'nested'">
                    <Icon type="ios-menu-outline"/>
                </a>

                <portal-target name="header-left">
                </portal-target>
            </div>

            <div class="top-nav-in-header" v-if="menuMode == 'top_in_header'">
                <page-nav></page-nav>
            </div>

            <div class="header-right">
                <portal-target name="header-right">
                </portal-target>
                <a :href="guide_url ? guide_url: '/user_guide'" class="settings-btn" target="_blank">
                    <Icon type="ios-help"/>
                    <span>Гарын авлага</span>
                </a>
                <slot name="headerMenu"></slot>

                <user-control></user-control>

                <a href="javascript:void(0)" class="settings-btn" @click="showSettings = !showSettings">
                    <Icon type="ios-settings-outline"/>
                </a>
            </div>

        </header>
        <div class="top-nav" v-show="menuMode == 'top'">
            <page-nav v-show="menuMode == 'top'"></page-nav>
            <ul>
<!--                <li>-->
<!--                    <router-link :to="`/analytics`" style="width: 120px">-->
<!--                        <i class="ti-pie-chart"></i>-->
<!--                        <span>Анализ</span>-->
<!--                    </router-link>-->
<!--                </li>-->
                <slot name="sideBottomMenu">
                </slot>
                <li>
                    <a @click="logoutModal = true" style="width: 100px">
                        <i class="ti-power-off"></i>
                        <span>Гарах</span>
                    </a>
                </li>
            </ul>
        </div>
        <side-bar-nested v-if="menuMode == 'nested'"

                         :show_analytic="show_analytic"
                         :customMenuItems="customMenuItems"
                         @logout="showLogout">


        </side-bar-nested>
        <sidebar :class="menuMode == 'lambda_sidebar_with_text' ? 'with-text' : ''"
                 v-if="menuMode == 'lambda_sidebar_with_text' || menuMode == 'lambda_side_bar'">

            <page-nav :showTooltip="menuMode == 'lambda_side_bar'"></page-nav>

            <div slot="aside-bottom">
                <ul>
<!--                    <li>-->
<!--                        <router-link :to="`/analytics`">-->
<!--                            <i class="ti-pie-chart"></i>-->
<!--                            <span>Анализ</span>-->
<!--                        </router-link>-->
<!--                    </li>-->
                    <slot name="sideBottomMenu">
                    </slot>
                    <li class="logout-help">
                        <a @click="logoutModal = true">
                            <Icon type="ios-log-out"></Icon>
                        </a>
                    </li>
                </ul>
            </div>
        </sidebar>
        <main :class="menuMode == 'top' ? 'with-top-bar' : ''">
            <router-view :key="$route.path"></router-view>
        </main>
        <Modal v-model="logoutModal" :closable="false" width="252" class="logout-modal">
            <p slot="header" style="display:none;"></p>
            <div style="text-align:center">
                <a @click="logout()">
                    <Icon type="md-log-out"></Icon>
                    Гарах
                </a>
                <a @click="cancel()">
                    <Icon type="md-refresh"></Icon>
                    Болих
                </a>
            </div>
            <div slot="footer" style="display:none;">
                <form action="/auth/logout"></form>
            </div>
        </Modal>
        <settings :showSettings="showSettings"></settings>
    </div>
</template>
<script>
    import {mapGetters} from "vuex";
    import sideBar from './components/sideBar'
    import settings from './components/settings'

    export default {
        props: ["guide_url", "customMenuItems"],
        components: {
            "side-bar-nested": sideBar,
            "settings": settings,
        },
        data() {
            return {
                logo: window.init.logo,
                logo_dark: window.init.logo_dark,
                logo_light: window.init.logo_light,
                brandBtnUrl: window.init.brandBtnUrl,
                showSettings: false,
                logoutModal: false,
                is_admin: window.init.user.role == '2' ? true : false,
                show_analytic: window.init.user.role == '2' || window.init.user.role == '5' || window.init.user.role == '7' || window.init.user.role == '8' || window.init.user.role == '9' ? true : false,
                extra: window.init.permissions.extra,

            };
        },
        computed: {

            ...mapGetters({
                showSidebar: "showSidebar",
                menuMode: "menuMode",
                themeMode: "themeMode",
            })
        },
      watch:{
        $route (to, from){
          document.body.scrollTop = 0; // For Safari
          document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        }
      },
        methods: {

            toggleSideBar() {
                let newValue = "hidden";
                if (this.showSidebar == "hidden")
                    newValue = "full";
                this.$store.commit('toggleSideBar', newValue)
            },
            showLogout() {
                this.logoutModal = true;
            },
            logout() {
                axios.post("/auth/logout", {}).then(o => {
                    window.location = "/auth/login";
                });
            },
            cancel() {
                this.$data.logoutModal = false;
            },
            can_extra() {
                if (this.extra) {
                    if (this.extra.moqup || this.extra.datasource || this.extra.chart) {
                        return true
                    } else return false
                } else return false
            },
        },
    };
</script>
