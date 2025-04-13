import { defineStore } from 'pinia';
import { computed } from 'vue';

import i18n from '@/i18n';

const enableTheme = computed(() => {
  return import.meta.env.VITE_APP_ENABLE_THEME === 'true';
});

const initTheme = () => {
  // return true if dark theme is enabled, false if light theme is enabled
  const theme = localStorage.getItem('theme');

  if (theme) {
    return theme === 'dark';
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    localStorage.setItem('theme', 'dark');
    return true;
  }

  localStorage.setItem('theme', 'light');
  return false;
};

const useConfig = defineStore('config', {
  state: () => ({
    theme: enableTheme.value ? initTheme() : false,
  }),
  actions: {
    toggleTheme() {
      this.theme = !this.theme;
      localStorage.setItem('theme', this.theme ? 'dark' : 'light');
    },
    setLocale(newLocale: 'en' | 'tw') {
      i18n.global.locale = newLocale;
      localStorage.setItem('locale', newLocale);
    },
  },
  // persist: {
  //   key: import.meta.env.VITE_APP_WEBSTORAGE_NAMESPACE ?? 'vuetify',
  //   storage: window.sessionStorage,
  // },
});

export default useConfig;
