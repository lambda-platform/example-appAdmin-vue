import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import numeral from 'numeral'
import lodash from 'lodash'
import PortalVue from 'portal-vue'

import iView from 'iview';
import locale from './mn-MN';


import VueSlimScroll from 'vue-slimscroll'

import "./scss/style.scss";
import {getDate} from "./utils/date";

Vue.config.productionTip = false;

axios.interceptors.request.use(function (config) {
    config.headers['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    return config;
});

window.Vue = Vue;
window._ = lodash;
Vue.config.productionTip = false;
window.axios = axios;
Vue.use(VueAxios, axios)
Vue.use(iView, { locale });

Vue.use(VueSlimScroll)
Vue.use(PortalVue)
// Vue.use(VcRibbon)
// Vue.use(VcRibbon)

Vue.filter("date", (value) => {
    return getDate(value);
});
Vue.filter("number", (value) => {
    let value2 = numeral(value);

    return value2.format('0,0');
});
Vue.filter("money", (value) => {
    let value2 = numeral(value);

    return value2.format('0,0.00');
});