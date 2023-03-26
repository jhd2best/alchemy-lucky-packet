import Vue from 'vue'
import Vant from 'vant';
import 'vant/lib/index.css';
import App from './App.vue'
import router from './router'
import webUtil from './utils.js'
import i18n from './i18n'
import { contractConfig } from './config.js'
import '@vant/touch-emulator';

Vue.use(Vant);
Vue.prototype.webUtil = webUtil;
Vue.prototype.contractConfig = contractConfig;

Vue.config.productionTip = false

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount('#app')
