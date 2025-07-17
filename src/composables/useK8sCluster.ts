import { ref, computed } from 'vue';

import { CLUSTER_STATUS } from '@/api';
import useSvgIcons from '@/composables/useSvgIcons';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import * as K8s from '@/interfaces/K8sInterface';
import router from '@/router';
import getTableHeaders from '@/utils/getTableHeaders';

const { t } = i18n.global;
const headers = ref<any[]>([]);
const { IconKeys, ServiceIcons } = useSvgIcons();

const defaultItem = {
  flavor: {
    id: '',
    name: '',
    vcpu: 0,
    gpu_count: 0,
    memory: 0,
  },
  ip: {
    id: '',
    address: '',
  },
  editNg: {
    name: '',
    id: '',
    count: 0,
    newCount: 0,
  },
};

// const CLUSTER_STATUS = {
// Creating: 'PRIVATE',
// FLOATING: 'FLOATING',
// STATIC: 'STATIC',
// };

const RANGE = {
  MIN: 1,
  MAX: 32,
};

const IP_TYPE = {
  PRIVATE: 'PRIVATE',
  FLOATING: 'FLOATING',
  STATIC: 'STATIC',
};

const toListPage = () => {
  void router.push({ name: PAGE_TYPES.K8S_CLUSTER_LIST });
};

const toCreatePage = () => {
  void router.push({ name: PAGE_TYPES.K8S_CLUSTER_CREATE });
};

const toCreateStep = () => {
  void router.push({ name: PAGE_TYPES.K8S_CLUSTER_CREATE });
};

const toDetailPage = (id: number) => {
  void router.push({ name: PAGE_TYPES.K8S_CLUSTER_DETAIL, params: { id } });
};

const filterK8sFlavor = (flavors: K8s.Flavor[]) => {
  return flavors.map(flavor => {
    return {
      id: flavor.id,
      name: flavor.name,
      vcpu: flavor.vcpu,
      gpu_count: flavor.gpu_count,
      memory: Number((flavor.memory / 1024).toFixed(2)),
    };
  });
};

const compileApiEndpoint = (cluster: any) => {
  const enableStatus = [
    CLUSTER_STATUS.READY,
    CLUSTER_STATUS.UPDATING,
    CLUSTER_STATUS.UPDATE_FAILED,
    CLUSTER_STATUS.DELETING,
    CLUSTER_STATUS.DELETE_FAILED,
  ];
  const checkApiEndpointEnable = enableStatus.includes(
    cluster?.clusterStatus as string
  );

  const bad = 'https://:6443';
  if (checkApiEndpointEnable) {
    switch (cluster.publicIpType) {
      case IP_TYPE.STATIC:
      case IP_TYPE.FLOATING:
        return cluster.publicEndpoint === bad ? '' : cluster.publicEndpoint;
      case IP_TYPE.PRIVATE:
        return cluster.privateEndpoint === bad ? '' : cluster.privateEndpoint;
      default:
        return '';
    }
  } else {
    return '-';
  }
};

// eslint-disable-next-line require-jsdoc
export default function (pageType?: string) {
  headers.value = getTableHeaders(pageType);
  const noDataSetting = computed(() => {
    return {
      svgIcon: ServiceIcons[IconKeys.k8s_cluster].svg,
      message1: t('basic.noData.type', { type: t('services.k8sCluster') }),
      message2: t('label.noData'),
      buttonTitle: t('basic.create.type', {
        type: t('services.k8sCluster'),
      }),
      action: toCreatePage,
    };
  });
  return {
    defaultItem,
    headers,
    noDataSetting,
    IP_TYPE,
    RANGE,
    filterK8sFlavor,
    compileApiEndpoint,
    toListPage,
    toCreatePage,
    toCreateStep,
    toDetailPage,
  };
}
