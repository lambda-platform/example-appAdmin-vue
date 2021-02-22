import Vue from 'vue';
import iView from 'iview';
import locale from 'iview/dist/locale/mn-MN';
import axios from 'axios';
axios.interceptors.request.use(function (config) {

    config.headers['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    return config;
});
import moqupView from './pages/moqup/moqup';


window.Vue = Vue;


window.axios = axios;
Vue.config.productionTip = false;
Vue.use(iView, { locale });

new Vue({
    el: '#moqup',
    extends: moqupView,
});
