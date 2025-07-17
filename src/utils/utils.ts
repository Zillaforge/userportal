import { useGlobal, useUser, usePortalConfig } from '@/store';
import { ref, computed } from 'vue';

import dayjs, { extend } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import get from 'lodash/get';

import type serviceItem from '@/interfaces/ServiceItemInterface';

import useSvgIcons from '@/composables/useSvgIcons';
import {
  UUIDRegex,
  COOKIE_CONFIG,
  OS,
  LOCAL_DOMAIN,
} from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import SERVICE_TYPES from '@/constants/ServiceTypes';
import { PROTOCOL } from '@/constants/VmConstants';
import i18n from '@/i18n';
import { S3ServiceTypeName } from '@/interfaces/CloudStorageInterface';
import { type Flavor } from '@/interfaces/VmInterface';

extend(isSameOrBefore);
extend(isSameOrAfter);
const { IconKeys, ServiceIcons } = useSvgIcons();
const expireTime = ref<Date | undefined>();

export const SERVICE_TYPE = {
  STORAGE: 'storage',
  NETWORK_SECURITY: 'networkSecurity',
  PRIVACY_CUSTOM: 'privacyCustom',
  VM: 'vm',
  K8S: 'k8s',
  TRUSTY_CLOUD: 'trustyCloud',
  TEST: 'test',
};

const { t, tc } = i18n.global;

let globaleStore: any;
let userStore: any;
type serviceGroup = Record<string, serviceItem[]>;
const serviceList = computed(() => {
  const serviceAccess = getServiceAccess();
  return {
    [SERVICE_TYPE.VM]: [
      {
        text: t('services.virtualMachine'),
        routeName: PAGE_TYPES.VM_LIST,
        icon: ServiceIcons[IconKeys.vm].svg,
        menuIcon: 'menu_icon_vm',
      },
      {
        text: t('services.virtualVolume'),
        routeName: PAGE_TYPES.VM_VOLUME_LIST,
        icon: ServiceIcons[IconKeys.virtual_volume].svg,
        menuIcon: 'menu_icon_virtual_volume',
      },
      {
        text: t('services.virtualNetwork'),
        routeName: PAGE_TYPES.VM_NETWORK_LIST,
        icon: ServiceIcons[IconKeys.virtual_network].svg,
        menuIcon: 'menu_icon_virtual_network',
      },
      {
        text: t('services.loadBalancer'),
        routeName: PAGE_TYPES.VM_LOAD_BALANCER_LIST,
        icon: ServiceIcons[IconKeys.load_balance].svg,
        menuIcon: 'menu_icon_load_balance',
      },
      {
        text: t('services.autoScaling'),
        routeName: PAGE_TYPES.VM_AUTO_SCALING_LIST,
        icon: ServiceIcons[IconKeys.auto_scaling].svg,
        menuIcon: 'menu_icon_auto_scaling',
        hide: !serviceAccess[SERVICE_TYPES.AUTO_SCALING],
      },
      {
        text: t('services.fileSharing'),
        icon: ServiceIcons[IconKeys.file_sharing].svg,
        menuIcon: 'menu_icon_file_sharing',
        routeName: PAGE_TYPES.FILE_SHARING_LIST,
      },
      {
        text: t('services.securityGroup'),
        routeName: PAGE_TYPES.VM_SECURITY_GROUP_LIST,
        icon: ServiceIcons[IconKeys.security_group].svg,
        menuIcon: 'menu_icon_security_group',
      },
    ],
    [SERVICE_TYPE.TRUSTY_CLOUD]: [
      {
        text: t('services.vmImageManage'),
        icon: ServiceIcons[IconKeys.vm_image].svg,
        menuIcon: 'menu_icon_vm_image',
        routeName: PAGE_TYPES.VM_IMAGE_LIST,
      },
      {
        text: t('services.containerImageManage'),
        icon: ServiceIcons[IconKeys.ctr_image].svg,
        menuIcon: 'menu_icon_ctr_image',
        routeName: PAGE_TYPES.CONTAINER_IMAGE_LIST,
        hide: !serviceAccess[SERVICE_TYPES.CONTAINER_IMAGE],
      },
      {
        text: t('services.dataExchange'),
        icon: ServiceIcons[IconKeys.data_exchange].svg,
        menuIcon: 'menu_icon_data_exchange',
        routeName: PAGE_TYPES.DATA_EXCHANGE_LIST,
        hide: !serviceAccess[SERVICE_TYPES.DATA_EXCHANGE],
      },
      {
        text: t('services.dataRelease'),
        icon: ServiceIcons[IconKeys.data_release].svg,
        menuIcon: 'menu_icon_data_release',
        routeName: PAGE_TYPES.DATA_RELEASE_LIST,
        hide: !serviceAccess[SERVICE_TYPES.DATA_RELEASE],
      },
      {
        text: t('services.resourceTransfer'),
        icon: ServiceIcons[IconKeys.resource_transfer].svg,
        menuIcon: 'menu_icon_resource_transfer',
        routeName: PAGE_TYPES.RESOURCE_TRANSFER_LIST,
        hide: !serviceAccess[SERVICE_TYPES.RESOURCE_TRANSFER],
      },
    ],
    [SERVICE_TYPE.K8S]: [
      {
        text: t('services.k8sCluster'),
        icon: ServiceIcons[IconKeys.k8s_cluster].svg,
        menuIcon: 'menu_icon_k8s_cluster_service',
        routeName: PAGE_TYPES.K8S_CLUSTER_LIST,
      },
      {
        text: t('services.application'),
        icon: ServiceIcons[IconKeys.application].svg,
        menuIcon: 'menu_icon_app',
        routeName: PAGE_TYPES.APPLICATION_LIST,
        hide: !serviceAccess[SERVICE_TYPES.APPLICATION],
      },
      {
        text: t('services.hpc.deliver'),
        icon: ServiceIcons[IconKeys.hpc_deliver].svg,
        menuIcon: 'menu_icon_HPC_delivery',
        routeName: PAGE_TYPES.HPC_REMOTE_TASK_LIST,
        hide: !serviceAccess[SERVICE_TYPES.HPC_DELIVER],
      },
      {
        text: t('services.pilot.redirect'),
        icon: ServiceIcons[IconKeys.pilot].svg,
        menuIcon: 'menu_icon_pilot',
        hide: true,
      },
      {
        text: t('services.cloudStorage'),
        routeName: PAGE_TYPES.S3_BUCKET_LIST,
        icon: ServiceIcons[IconKeys.storage].svg,
        menuIcon: 'menu_icon_storage',
      },
    ],
  };
});

export const getServices = (): serviceGroup => serviceList.value;

export const getServiceAccess = (text?: string) => {
  if (!globaleStore) {
    globaleStore = useGlobal();
  }
  if (!userStore) {
    userStore = useUser();
  }

  const publicSite = isPublicSite();
  const pilotRegion = globaleStore.getIsPilotRegion;
  return {
    [SERVICE_TYPES.CONTAINER_IMAGE]: !pilotRegion,
    [SERVICE_TYPES.DATA_EXCHANGE]: !pilotRegion,
    [SERVICE_TYPES.DATA_RELEASE]: !publicSite,
    [SERVICE_TYPES.RESOURCE_TRANSFER]: publicSite && !pilotRegion,
    [SERVICE_TYPES.APPLICATION]: !pilotRegion,
    [SERVICE_TYPES.HPC_DELIVER]: !pilotRegion,
    [SERVICE_TYPES.PILOT]: publicSite && !pilotRegion,
    [SERVICE_TYPES.PUBLIC_KEY]: !pilotRegion,
    [SERVICE_TYPES.CLOUDINFRA]: userStore.isCloudinfraUser,
    [SERVICE_TYPES.AUTO_SCALING]: !pilotRegion,
  };
};

export const formatDate = (
  date: Date | string | number | undefined,
  noTime = false
) => {
  if (!date || date === '-' || date === '0001-01-01T00:00:00Z') return '-';

  return dayjs(date).format(noTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
};

export const formatDateSec = (date: Date | string, noTime = false) => {
  if (!date || date === '-' || date === '0001-01-01T00:00:00Z') return '-';

  return dayjs(date).format(noTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
};

export const formatHourMin = (date: Date | string, noTime = false) => {
  if (!date || date === '-' || date === '0001-01-01T00:00:00Z') return '-';

  return dayjs(date).format(noTime ? 'YYYY-MM-DD' : 'HH:mm');
};

export const getDeepObj = (obj: Record<string, any>, path: string) => {
  return get(obj, path);
};

export const stringSlice = (str: string, length = 32) => {
  if (str && str.length > length) {
    return str.slice(0, length) + '...';
  }
  return str;
};

export const handleString = (
  content: string | any,
  sliceLength = 32,
  isDescription = false
) => {
  if (UUIDRegex.test(content as string) && typeof content === 'string') {
    content = `${content.slice(0, 6)}...`;
  } else if (isDescription) {
    content = stringSlice(content as string, sliceLength);
  }
  return content;
};

export const isEmptyObject = (obj: Record<string, any>) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes || bytes === 0) {
    return '0 Byte';
  }
  const k = 1024;
  const dm = decimals <= 0 ? 0 : decimals;
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const setToken2Cookie = (token: string) => {
  if (!token) {
    return;
  }
  const userStore = useUser();
  const decoded = jwtDecode<JwtPayload>(token);
  expireTime.value = decoded.exp ? new Date(decoded.exp * 1000) : undefined;
  const tokenConf = COOKIE_CONFIG.TOKEN;
  const domain = getDomain();

  userStore.getCookiesInstance?.set(
    tokenConf.NAME,
    token,
    expireTime.value,
    undefined,
    domain,
    undefined,
    'Strict'
  );
};

export const setValue2Cookie = (key: string, value: string) => {
  const userStore = useUser();
  userStore.getCookiesInstance?.set(
    key,
    value,
    expireTime.value,
    undefined,
    getDomain(),
    undefined,
    'Strict'
  );
};

export const removeAllCookies = () => {
  const userStore = useUser();
  const cookiesInstance = userStore.getCookiesInstance;

  if (!cookiesInstance) {
    return;
  }

  const domain = getDomain();
  cookiesInstance.remove(COOKIE_CONFIG.TOKEN.NAME, undefined, domain);
  cookiesInstance.remove(COOKIE_CONFIG.PROJECT.ID, undefined, domain);
  cookiesInstance.remove(COOKIE_CONFIG.ADMIN_TOKEN.NAME, undefined, domain);
};

/*
 * osName variable as follows:
 * "Windows"    for all versions of Windows (Win)
 * "MacOS"      for all versions of Macintosh OS (Mac)
 * "Linux"      for all versions of Linux (Linux)
 * "UNIX"       for all other UNIX flavors (X11)
 * "Unknown OS" indicates failure to detect the OS
 */
export const getOS = () => {
  const appVer = navigator.appVersion;
  if (appVer.includes('Win')) {
    return OS.win;
  } else if (appVer.includes('Mac')) {
    return OS.mac;
  } else if (appVer.includes('X11')) {
    return OS.linux;
  } else if (appVer.includes('Linux')) {
    return OS.linux;
  }

  return OS.win;
};

export const ONE_MINUTE = 60 * 1000;
export const ONE_HOUR = 3600 * 1000;
export const THREE_HOUR = 3 * 3600 * 1000;
export const SIX_HOUR = 6 * 3600 * 1000;
export const TWELVE_HOUR = 12 * 3600 * 1000;
export const ONE_DAY = 86400 * 1000;
export const SEVEN_DAY = 7 * 86400 * 1000;
export const FOURTEEN_DAY = 14 * 86400 * 1000;
export const THIRTY_DAY = 30 * 86400 * 1000;
export const THREE_MONTH = 3 * 30 * 86400 * 1000;
export const SIX_MONTH = 6 * 30 * 86400 * 1000;
export const ONE_YEAR = 365 * 86400 * 1000;

export const getTimePeriodOptions = () => {
  return [
    {
      title: tc('usage.time.hour', 1, { n: 1 }),
      value: ONE_HOUR,
    },
    {
      title: tc('usage.time.hour', 2, { n: 6 }),
      value: SIX_HOUR,
    },
    {
      title: tc('usage.time.hour', 2, { n: 12 }),
      value: TWELVE_HOUR,
    },
    {
      title: tc('usage.time.day', 1, { n: 1 }),
      value: ONE_DAY,
    },
    {
      title: tc('usage.time.day', 2, { n: 7 }),
      value: SEVEN_DAY,
    },
    {
      title: tc('usage.time.day', 2, { n: 30 }),
      value: THIRTY_DAY,
    },
    {
      title: t('usage.custom'),
      value: -1,
    },
  ];
};

export const getTimeOptions = () => {
  const timeSelectItem = [];
  for (let i = 0; i <= 23; i++) {
    if (i < 10) {
      timeSelectItem.push({
        title: `0${i}:00`,
        value: i * 60 * 60 * 1000,
      });
    } else {
      timeSelectItem.push({
        title: `${i}:00`,
        value: i * 60 * 60 * 1000,
      });
    }
  }
  timeSelectItem.push({
    title: `23:59`,
    value: 23 * 60 * 60 * 1000 + 59 * 60 * 1000,
  });
  return timeSelectItem;
};

// v-date-picker: allowed-dates
// https://vuetifyjs.com/en/api/v-date-picker/#props-allowed-dates
// Allowed dates: unknown[] | ((date: unknown) => boolean)
// Specify allowed dates using objects or functions.
// When using objects, accepts a date string in the format of YYYY-MM-DD.
// When using functions, accepts a date object as a parameter and should return a boolean.
export const getAllowedDatesFn =
  ({
    allowedMinDate,
    allowedMaxDate,
  }: {
    allowedMinDate?: string;
    allowedMaxDate?: string;
  }) =>
  (val: unknown) => {
    // val: 預期會是 Date 但是文件中定義的 type 為 unknown
    const date = dayjs(val as Date);
    if (allowedMinDate && allowedMaxDate) {
      return (
        date.isSameOrAfter(allowedMinDate) &&
        date.isSameOrBefore(allowedMaxDate)
      );
    }
    if (allowedMinDate) {
      return date.isSameOrAfter(allowedMinDate);
    }
    if (allowedMaxDate) {
      return date.isSameOrBefore(allowedMaxDate);
    }
    return true;
  };

export const generalCopy = (target: string) => {
  if (!globaleStore) {
    globaleStore = useGlobal();
  }
  void navigator.clipboard.writeText(target);
  globaleStore.triggerSnackbar({ content: t('basic.copied') });
};

export const compareArrayDiff = <T>(params: {
  newArray: T[];
  originalArray: T[];
  objValueKey?: string;
}) => {
  const { newArray, originalArray, objValueKey } = params;
  if (objValueKey) {
    // object type
    const newValues = newArray.map((item: any) => item[objValueKey]);
    const originalValues = originalArray.map((item: any) => item[objValueKey]);
    const toAddValues = newValues.filter(x => !originalValues.includes(x));
    const toRemoveValues = originalValues.filter(x => !newValues.includes(x));
    return {
      toAdd: newArray.filter((item: any) =>
        toAddValues.includes(item[objValueKey])
      ),
      toRemove: originalArray.filter((item: any) =>
        toRemoveValues.includes(item[objValueKey])
      ),
    };
  }
  // other types (string, number, boolean)
  return {
    toAdd: newArray.filter(x => !originalArray.includes(x)),
    toRemove: originalArray.filter(x => !newArray.includes(x)),
  };
};

export const toAdminPanel = () => {
  const { portalConfig } = usePortalConfig();
  const { getToken } = useUser();
  window.location.href = `${portalConfig.ADMIN_PANEL}?token=${getToken}`;
};

export const getDomain = (): string | undefined => {
  const domain: string = location.hostname.toLowerCase();
  if (domain === LOCAL_DOMAIN) {
    return undefined;
  }

  /*
  handle www.trusted-cloud.nchc.org.stg & admin.trusted-cloud.nchc.org.stg to .trusted-cloud.nchc.org
  */
  const REPLACE_PREFIX = ['www', 'admin'];
  let replacedDomain;
  REPLACE_PREFIX.forEach(replacer => {
    if (domain.startsWith(replacer)) {
      replacedDomain = domain.replace(replacer, '');
    }
  });
  return replacedDomain;
};

export const isPublicSite = () =>
  import.meta.env.VITE_APP_PUBLIC_SITE === 'true';

export const getS3Services = (): Record<S3ServiceTypeName, string> => {
  return {
    [S3ServiceTypeName.STORAGE]: isPublicSite() ? 'dss-public' : 'dss-private',
    [S3ServiceTypeName.EXCHANGE]: 'des',
    [S3ServiceTypeName.RELEASE]: 'drs',
  };
};

export const getDataStorageSchema = () => {
  return getS3Services()?.[S3ServiceTypeName.STORAGE];
};

export const getFilteredFlavor = (
  flavorList: Flavor[],
  vGPUType: string | undefined
) => {
  return vGPUType
    ? flavorList.filter((flavor: Flavor) => {
        return flavor.tags?.includes(vGPUType);
      })
    : flavorList.filter((flavor: Flavor) => {
        return !flavor.tags?.includes('vgpu');
      });
};

export const getPoolProtocol = (
  listenerProtocol: (typeof PROTOCOL)[keyof typeof PROTOCOL]
) => {
  switch (listenerProtocol) {
    case PROTOCOL.HTTP:
    case PROTOCOL.TERMINATED_HTTPS:
      return PROTOCOL.HTTP;
    case PROTOCOL.HTTPS:
      return PROTOCOL.HTTPS;
    case PROTOCOL.TCP:
      return PROTOCOL.TCP;
    case PROTOCOL.UDP:
      return PROTOCOL.UDP;
  }
};

export const sortByKey = (itemArray: any, key: string = 'name') => {
  if (!Array.isArray(itemArray)) {
    return [];
  }
  return itemArray.sort((a, b) => {
    if (a[key] < b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
    return 0;
  });
};
