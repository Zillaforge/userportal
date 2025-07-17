import { defineStore } from 'pinia';

import axios from 'axios';

import { COOKIE_CONFIG, DOMAIN, LOCAL_DOMAIN } from '@/constants/Constants';

const usePortalConfigStore = defineStore('portalConfig', {
  state: () => ({
    hasGottenConfigFromJson: false,
    portalConfig: {
      API_URL: import.meta.env.VITE_APP_API_URL,
      DATA_STORAGE: import.meta.env.VITE_APP_DATA_STORAGE,
      DATA_EXCHANGE: import.meta.env.VITE_APP_DATA_EXCHANGE,
      DATA_RELEASE: import.meta.env.VITE_APP_DATA_RELEASE,
      IMAGE_REGISTRY: import.meta.env.VITE_APP_IMAGE_REGISTRY,
      BASE_DOMAIN: import.meta.env.VITE_APP_BASE_DOMAIN,
      ADMIN_PANEL: import.meta.env.VITE_APP_ADMIN_PANEL,
      DOCUMENT_URL: import.meta.env.VITE_APP_DOCUMENT_URL,
    },
  }),
  getters: {
    getHasGottenConfigFromJson: state => state.hasGottenConfigFromJson,
  },
  actions: {
    async getPortalConfig() {
      const configPath =
        window.location.origin + '/portalConfig.json?time=' + Date.now();
      await axios.get(configPath).then(async (response: any) => {
        this.hasGottenConfigFromJson = true;
        if (import.meta.env.PROD) {
          this.portalConfig = JSON.parse(JSON.stringify(response.data));
        }

        this.setPortalConstant();
        this.setPortalCookie();
        await Promise.resolve();
      });
    },

    setPortalConstant() {
      DOMAIN.LOCAL = LOCAL_DOMAIN;
      DOMAIN.BASE = this.portalConfig.BASE_DOMAIN || LOCAL_DOMAIN;
    },

    setPortalCookie() {
      COOKIE_CONFIG.TOKEN = {
        NAME: 'trusted-cloud-token',
        DOMAIN: this.portalConfig.BASE_DOMAIN
          ? /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(
              this.portalConfig.BASE_DOMAIN
            )
            ? DOMAIN.BASE
            : `.${DOMAIN.BASE}`
          : DOMAIN.LOCAL,
      };
    },
  },
});

export default usePortalConfigStore;
