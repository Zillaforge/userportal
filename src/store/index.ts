import { createPinia, type Pinia } from 'pinia';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Pinia Stores
import useNavigationDrawerStore from './NavigationDrawerStore';

import useConfig from '@/store/ConfigStore';
import useGlobal from '@/store/GlobalStore';
import usePortalConfig from '@/store/PortalConfig';
import useProject from '@/store/ProjectStore';
import useStorage from '@/store/StorageStore';
import useUser from '@/store/UserStore';

/** Pinia Store */
const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export {
  useConfig,
  useGlobal,
  useNavigationDrawerStore,
  usePortalConfig,
  useUser,
  useStorage,
  useProject,
};
