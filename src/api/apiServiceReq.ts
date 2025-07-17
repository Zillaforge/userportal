import { useUser, useGlobal, usePortalConfig } from '@/store';

import axios, { type AxiosInstance } from 'axios';

import { DEFAULT_RESOURCE_REGION } from '@/constants/Constants';

const apiService: AxiosInstance = axios.create();
apiService.defaults.headers.common['Content-Type'] = 'application/json';

let userStore: any;
let globalStore: any;
let portalConfigStore: any;
apiService.interceptors.request.use(
  (request: any) => {
    if (!userStore) {
      userStore = useUser();
    }
    if (!globalStore) {
      globalStore = useGlobal();
    }
    if (!portalConfigStore) {
      portalConfigStore = usePortalConfig();
    }
    request.baseURL = portalConfigStore.portalConfig.API_URL;
    const token = userStore.getToken;
    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    request.headers['X-Availability-District'] =
      globalStore.getCurrentRegion ?? DEFAULT_RESOURCE_REGION;

    return request;
  },
  async (err: any) => {
    await Promise.reject(err);
  }
);

export default apiService;
