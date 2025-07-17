import { defineStore } from 'pinia';
import { computed } from 'vue';

import i18n from '@/i18n';

const enableTheme = computed(() => {
  return import.meta.env.VITE_APP_ENABLE_THEME === 'true';
});

const useConfig = defineStore('config', {
  state: () => ({
    theme: enableTheme.value
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches as boolean)
      : (false as boolean),
  }),
  actions: {
    toggleTheme() {
      this.theme = !this.theme;
    },
    setLocale(newLocale: 'en' | 'tw') {
      i18n.global.locale = newLocale;
      localStorage.setItem('locale', newLocale);
    },
  },
  persist: {
    key: import.meta.env.VITE_APP_WEBSTORAGE_NAMESPACE ?? 'vuetify',
    storage: window.sessionStorage,
  },
});

export default useConfig;
