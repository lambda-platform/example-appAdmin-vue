<template>
    <Drawer title="" class="settings-section" @on-visible-change="changeVisible" :closable="false" v-model="showSettings" width="400px">
        <div>
            <div class="settings-main-title">Тохиргоо <i class="ivu-icon ivu-icon-ios-settings-outline"></i></div>
            <div class="settings-body">
                <div class="settings-title">Цэсний байршил</div>
                <ul class="menu-mode">
                    <li>
                        <a href="javascript:void(0)" class="side-toggle"
                           @click="changeMenuMode('lambda_sidebar_with_text')">
                            <img src="/assets/appadmin/images/list.svg" alt="">
                            Шаталсан
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" class="side-toggle" @click="changeMenuMode('lambda_side_bar')">
                            <img src="/assets/appadmin/images/icon.svg" alt="">
                            Шаталсан жижиг
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" class="side-toggle" @click="changeMenuMode('nested')">
                            <img src="/assets/appadmin/images/nest.svg" alt="">
                            Задардаг
                        </a>
                    </li>
                    <li>
                        <a href="javascript:void(0)" class="side-toggle" @click="changeMenuMode('top')">
                            <img src="/assets/appadmin/images/top.svg" alt="">
                            Хөндлөн
                        </a>
                    </li>
                    <!--                    <li>-->
                    <!--                        <a href="javascript:void(0)" class="side-toggle" @click="changeMenuMode('top_in_header')">-->
                    <!--                            <img src="/control_panel/menuMode/top_in_header.svg" alt="">-->
                    <!--                            Хөндлөн дээд хэсэгт-->
                    <!--                        </a>-->
                    <!--                    </li>-->

                </ul>

                <div class="settings-title">Өнгөний сонголт</div>
                <div class="theme-mode">
                    <RadioGroup v-model="themeMode" size="large" @on-change="changeTheme">
                        <Radio label="dark">Харанхуй горим</Radio>
                        <Radio label="light">Гэрэлтэй горим</Radio>

                    </RadioGroup>
                </div>
                <div class="settings-title">Өнгөний сонголт</div>
                <ul class="color-options">
                    <li v-for="themeColor in themeColors" :key="themeColor.index">
                        <a href="javascript:void(0)"  @click="changeThemeColor(themeColor)" :style="`background: ${themeColor}`" class="black"></a>
                    </li>
                </ul>

            </div>
        </div>
    </Drawer>
</template>

<script>
    import {mapGetters} from "vuex";
    export default {
        name: "settings",

        props:["showSettings"],
        data(){
            return {

            }
        },
        computed:{
            ...mapGetters({

                menuMode: "menuMode",
                primaryColor: "primaryColor",
                themeColors: "themeColors",
                themeMode: "themeMode",
            }),
        },
        methods:{
            changeVisible(value){
              if(!value){
                  this.$parent.showSettings = value;
              }
            },
            changeTheme(value) {
                this.$store.commit('changeThemeMode', value);

            },
            changeThemeColor(value) {
                let root = document.documentElement;
                root.style.setProperty('--primary', value);
                this.$store.commit('changeThemColor', value);

            },
            changeTextColor(value) {
                let root = document.documentElement;
                root.style.setProperty('--textColor', value);
                this.$store.commit('changeTextColor', value);

            },
            changeMenuMode(newValue) {

                this.$store.commit('setMenuMode', newValue);
                this.$store.commit('toggleSideBar', "full");
            },
        },

        beforeMount() {
            let root = document.documentElement;
            root.style.setProperty('--primary', this.primaryColor);
        }
    }
</script>
