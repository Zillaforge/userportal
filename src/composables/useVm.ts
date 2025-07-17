import { useProject, useUser } from '@/store';
import { ref, computed, watch } from 'vue';

import { makeApiCall } from '@/api';
import * as api from '@/api/vmApis';
import i18n from '@/i18n';
import router from '@/router';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';

const { t } = i18n.global;
const projectStore = useProject();
const userStore = useUser();
const headers = ref<any>([]);
const noDataSetting = ref<any>({});

let currentPage = '';
watch(
  () => i18n.global.locale,
  () => {
    headers.value = getTableHeaders(currentPage);
    noDataSetting.value = getNoDataSetting(currentPage);
  }
);
const doFetchVmList = async (
  skipProgress?: boolean,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    skipProgress,
    apiCallFn: api.fetchVmList,
    successCallback: res => {
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};

const doDeleteVm = async (
  serverId: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.deleteVm,
    payload: {
      serverId,
    },
    successCallback: res => {
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};

const doServerAction = async (
  action: Record<string, any>,
  serverId: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.vmActions,
    payload: {
      serverId,
      action,
    },
    successCallback: successCallback ?? (() => {}),
    errorCallback: errorCallback ?? (() => {}),
  });
};

const doFetchVmFlavors = async (
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.fetchVmFlavors,
    successCallback: res => {
      res = res.map((item: any) => {
        return {
          ...item,
          memory: item?.memory / 1024,
          gpu_count: item?.gpu?.count ?? 0,
        };
      });
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};

const doFetchVmSecurityGroups = async (
  skipProgress?: boolean,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    skipProgress,
    apiCallFn: api.fetchVmSecurityGroups,
    successCallback: res => {
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};

const doFetchVmFloatingIp = async (
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.fetchVmFloatingIP,
    successCallback: res => {
      res = res.map((item: any) => ({
        ...item,
        reserved: item.reserved ? 'reserved' : 'unreserved',
        name: item.address,
      }));
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};
// keypair api
const doFetchVmKeypairs = async (
  skipProgress?: boolean,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    skipProgress,
    apiCallFn: api.fetchVmKeypairs,
    successCallback: res => {
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};

const doDeleteVmKeypair = async (
  keypairId: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.deleteVmKeypair,
    payload: {
      keypairId,
    },
    successCallback: res => {
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};

// volume api
const vmVolumeDeletableStatus = ['available', 'error'];

const doVolumeActions = async (
  action: Record<string, any>,
  volumeId: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.volumeActions,
    payload: {
      volumeId,
      action,
    },
    successCallback: successCallback ?? (() => {}),
    errorCallback: errorCallback ?? (() => {}),
  });
};

const doDeleteVmVolume = async (
  volumeId: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.deleteVmVolume,
    payload: {
      volumeId,
    },
    successCallback: res => {
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};

const doCreateVolumeSnapshot = async (
  snapshotItem: Record<string, any>,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.createVolumeSnapShot,
    payload: {
      snapshotItem,
    },
    successCallback: res => {
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};

// network api
const doDeleteVmNetwork = async (
  networkId: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.deleteVmNetwork,
    payload: {
      networkId,
    },
    successCallback: res => {
      successCallback?.(res);
    },
    errorCallback: res => {
      errorCallback?.(res);
    },
  });
};

const doVmRouterActions = async (
  action: Record<string, any>,
  routerId: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  return makeApiCall({
    apiCallFn: api.vmRouterActions,
    payload: {
      action,
      routerId,
    },
    successCallback: successCallback ?? (() => {}),
    errorCallback: errorCallback ?? (() => {}),
  });
};

// eslint-disable-next-line require-jsdoc
export default function (pageType?: string) {
  if (pageType) {
    currentPage = pageType;
    headers.value = getTableHeaders(pageType);
    noDataSetting.value = getNoDataSetting(pageType);
  }
  const projectId = computed(() => projectStore.getCurrentProject?.id);
  const isFloatingIpReview = computed(
    () =>
      projectStore.getCurrentProject?.extra?.resourceReview?.floatingIp &&
      !projectStore.isTenantAdmin
  );
  const isOwner = (id: string) => {
    return userStore.getUserInfo.userId === id;
  };
  const deletable = (id: string) => {
    return projectStore.isTenantAdmin || userStore.getUserInfo.userId === id;
  };
  const isAdmin = computed(() => projectStore.isTenantAdmin);
  return {
    t,
    doFetchVmList,
    doDeleteVm,
    doServerAction,
    doFetchVmFlavors,
    doFetchVmSecurityGroups,
    doFetchVmFloatingIp,
    doFetchVmKeypairs,
    doDeleteVmKeypair,
    doVolumeActions,
    doDeleteVmVolume,
    doCreateVolumeSnapshot,
    doDeleteVmNetwork,
    doVmRouterActions,
    deletable,
    isAdmin,
    isOwner,
    isFloatingIpReview,
    headers,
    noDataSetting,
    router,
    projectId,
    vmVolumeDeletableStatus,
  };
}
