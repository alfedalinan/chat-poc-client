import { route } from 'quasar/wrappers';
import VueRouter from 'vue-router';
import { Store } from "vuex";
import { StateInterface } from '../store';
import routes from './routes';
import { constants } from "../utils/constants";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default route<Store<StateInterface>>(function ({ Vue }) {
  Vue.use(VueRouter);

  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    // mode: 'history',
    base: process.env.VUE_ROUTER_BASE
  });

  Router.beforeEach((to, from, next) => {
    
    const restricted = constants.RESTRICTED_PATHS;

    // if not logged in
    if (restricted.indexOf(to.path) >= 0 && localStorage.getItem(process.env.USER_PREF_KEY) == null) {

      console.log(`Restricted access, going back to login..`);

      next({ name: 'Login' });

      return;
    }

    next();
  //   if (localStorage.getItem(process.env.USER_PREF_KEY) == null && to.path != "/login") {
  //     next({
  //       path: '/login'
  //     });

  //     return;
  //   }

  //   if (localStorage.getItem(process.env.USER_PREF_KEY) != null && to.path == "/login") {
  //     next({
  //       path: '/'
  //     });

  //     return;
  //   }

    
  })

  return Router;
})
