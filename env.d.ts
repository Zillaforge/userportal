/// <reference types="vite/client" />
/// <reference types="vitest" />

// if use color
// declare module 'vuetify/lib/util/colors.mjs';

interface ImportMetaEnv {
  // see https://vitejs.dev/guide/env-and-mode.html#env-files
  // add .env variables.
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_WEBSTORAGE_NAMESPACE: string;
  readonly VITE_APP_GRAFANA_ENDPOINT: string;
  readonly VITE_APP_PUBLIC_SITE: string;
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_ENABLE_THEME: string;
  readonly VITE_APP_DATA_STORAGE: string;
  readonly VITE_APP_DATA_EXCHANGE: string;
  readonly VITE_APP_DATA_RELEASE: string;
  readonly VITE_APP_IMAGE_REGISTRY: string;
  readonly VITE_APP_BASE_DOMAIN: string;
  readonly VITE_APP_ADMIN_PANEL: string;
  readonly VITE_APP_DOCUMENT_URL: string;
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
