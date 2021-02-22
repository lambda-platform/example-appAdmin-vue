import Vuex from 'vuex'
Vue.use(Vuex);

import * as mutations from './mutations'

var showSidebar = localStorage.getItem('showSidebar');
var menuMode = localStorage.getItem('menuMode');
var primaryColor = localStorage.getItem('primaryColor');
var textColor = localStorage.getItem('textColor');
var themeMode = localStorage.getItem('themeMode');


export const store = new Vuex.Store({
    state: {
        attributes: [],
        showSidebar: showSidebar ?  showSidebar : "full",
        menuMode: menuMode ?  menuMode :  "nested",
        withoutHeader:true,
        primaryColor:primaryColor ? primaryColor : window.init.primaryColor ? window.init.primaryColor : "#1d3faa",
        textColor:textColor ? textColor : "#F1F5F8",
        themeMode:themeMode ? themeMode : window.init.themeMode ? window.init.themeMode :  "dark",
        themeColors:window.init.themeColors ? window.init.themeColors :[
            "#043350",
            "#3C42C3",
            "#1d3faa",
            "#166e64",
            "#24AB26",
            "#EA8516",
            "#D71E54",
            "#16206A",
            "#1C1D1E",
        ]
    },

    getters: {
        showSidebar: state => state.showSidebar,
        attributes: state => state.attributes,
        menuMode: state => state.menuMode,
        withoutHeader: state => state.withoutHeader,
        primaryColor: state => state.primaryColor,
        themeColors: state => state.themeColors,
        textColor: state => state.textColor,
        themeMode: state => state.themeMode,
    },

    mutations: mutations,
});
