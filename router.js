import Router from 'vue-router'
import {routes} from "./appAdmin/router"

Vue.use(Router)

let base = '/';

if (location.pathname && location.pathname != '/') {
    base = location.pathname.split('/').slice(0, -1).join('/');
}
import Home from './pages/home/index.vue';

let AppRoutes = [
    {
        path: '/',
        component: Home,
    },
    ...routes,

];

export default new Router({
    base,
    routes: AppRoutes,
    history: true,
    linkActiveClass: 'active'
})
