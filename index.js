import "./appAdmin/bootstrap"
import App from "./App.vue"
import router from './router.js'

import {
    store
} from './appAdmin/store/store'

Vue.prototype.$init = window.init;
Vue.prototype.$user = window.init.user;


new Vue({
    router,
    store,
    extends:App,
    el: '#app',

});
