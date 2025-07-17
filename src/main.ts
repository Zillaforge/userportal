/**
 * Vue3 Main script
 */

// Load vue core
import store from '@/store';
import { createApp, type Component } from 'vue';

import VueChartkick from 'vue-chartkick';
import vueCookies from 'vue-cookies';

import App from '@/App.vue';
import i18n from '@/i18n';
import vuetify from '@/plugins/vuetify';
import '@/styles/main.scss';
import router from '@/router';

import 'chartkick/chart.js';

import 'virtual:svg-icons-register';

/** Register Vue */
const vue = createApp(App as Component);

vue.use(router);
vue.use(store);
vue.use(i18n);
vue.use(vuetify);
vue.use(vueCookies);
vue.use(VueChartkick);

// Run!
router
  .isReady()
  .then(() => vue.mount('#app'))
  .catch(e => console.error(e));
