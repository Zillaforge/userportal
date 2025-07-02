import { useRoute } from 'vue-router';

import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import { type TableHeader } from '@/interfaces/InfraDataTableInterface';

const { t } = i18n.global;

export const TABLE_TYPE = {
  FLAVOR: 'flavor',
};

export default (
  type?: string,
  extra?: TableHeader[],
  removeKeys?: string[]
) => {
  const pageType = type ?? useRoute().name;
  let headers: TableHeader[] = [];
  switch (pageType) {
    case PAGE_TYPES.CONTAINER_IMAGE_LIST:
      headers = getContainerImageListHeaders();
      break;
    case PAGE_TYPES.CONTAINER_IMAGE_DETAIL:
      headers = getContainerImageDetailHeaders();
      break;
    case PAGE_TYPES.FILE_SHARING_LIST:
      headers = getFileSharingListHeaders();
      break;
    case PAGE_TYPES.S3_BUCKET_LIST:
    case PAGE_TYPES.DATA_EXCHANGE_LIST:
    case PAGE_TYPES.DATA_RELEASE_LIST:
      headers = getS3BucketListHeaders();
      break;
    case PAGE_TYPES.S3_OBJECT_LIST:
    case PAGE_TYPES.DATA_EXCHANGE_CONTENT_LIST:
    case PAGE_TYPES.DATA_RELEASE_CONTENT_LIST:
      headers = getS3ObjectListHeaders();
      break;
    case PAGE_TYPES.VM_LIST:
      headers = getVmListHeaders();
      break;
    case PAGE_TYPES.VM_KEYPAIR_LIST:
      headers = getVmKeypairListHeaders();
      break;
    case PAGE_TYPES.VM_IMAGE_LIST:
      headers = getVmImageListHeaders();
      break;
    case PAGE_TYPES.VM_IMAGE_DETAIL:
      headers = getVmImageDetailHeaders();
      break;
    case PAGE_TYPES.VM_VOLUME_LIST:
      headers = getVmVolumeListHeaders();
      break;
    case PAGE_TYPES.VM_NETWORK_LIST:
      headers = getVmNetworkListHeaders();
      break;
    case PAGE_TYPES.VM_SECURITY_GROUP_LIST:
      headers = getVmSecurityGroupListHeaders();
      break;
    case PAGE_TYPES.VM_SECURITY_GROUP_DETAIL:
      headers = getVmSecurityGroupDetailHeaders();
      break;
    case PAGE_TYPES.VM_FLOATING_IP_LIST:
      headers = getVmFloatingIpListHeaders();
      break;
    case PAGE_TYPES.VM_LOAD_BALANCER_LIST:
      headers = getVmLoadBalancerListHeaders();
      break;
    case PAGE_TYPES.VM_AUTO_SCALING_LIST:
      headers = getVmAutoScalingListHeaders();
      break;
    case PAGE_TYPES.HPC_REMOTE_TASK_LIST:
      headers = getHpcRemoteTaskListHeaders();
      break;
    case PAGE_TYPES.HPC_REMOTE_IMAGE_LIST:
      headers = getHpcRemoteImageListHeaders();
      break;
    case PAGE_TYPES.HPC_REMOTE_DATA_LIST:
      headers = getHpcRemoteDataListHeaders();
      break;
    case PAGE_TYPES.APPLICATION_LIST:
      headers = getApplicationListHeaders();
      break;
    case PAGE_TYPES.RESOURCE_TRANSFER_LIST:
      headers = getResourceTransferListHeaders();
      break;
    case PAGE_TYPES.RESOURCE_TRANSFER_DETAIL_LIST:
      headers = getResourceTransferDetailListHeaders();
      break;
    case PAGE_TYPES.K8S_CLUSTER_LIST:
      headers = getK8sClusterListHeaders();
      break;
    case PAGE_TYPES.KEY_API:
      headers = getApiKeyListHeaders();
      break;
    case PAGE_TYPES.LOGS:
      headers = getLogsHeaders();
      break;
    case TABLE_TYPE.FLAVOR:
      headers = getFlavorHeaders(extra, removeKeys);
      break;
    default:
      break;
  }
  if (headers === null) {
    throw new Error(
      'Whoops, you are trying to get table headers with unknown type'
    );
  }
  return headers;
};

const getContainerImageListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('basic.desc'),
      key: 'description',
    },
    {
      title: t('label.number.type', { type: t('label.version') }),
      key: 'artifactCount',
    },
  ];
  return headers;
};

const getContainerImageDetailHeaders = () => {
  const headers = [
    {
      title: t('label.version'),
      key: 'name',
    },
    {
      title: t('label.volume.size'),
      key: 'tagSize',
    },
    {
      title: 'Push-Command',
      key: 'pushCommand',
    },
    {
      title: 'Pull-Command',
      key: 'pullCommand',
    },
    {
      title: t('label.lastPush'),
      key: 'pushAt',
    },
    // {
    //   title: t('label.lastPull'),
    //   key: 'pullAt',
    // },
  ];
  return headers;
};

const getFileSharingListHeaders = () => {
  return [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('services.virtualNetwork'),
      key: 'network.name',
    },
    {
      title: t('vm.volume.size'),
      key: 'size',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
    },
    {
      title: t('label.createdBy'),
      key: 'user.name',
    },
  ];
};

const getS3BucketListHeaders = () => {
  return [
    {
      title: t('label.name'),
      key: 'Name',
    },
  ];
};

const getS3ObjectListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
      width: '45%',
    },
    {
      title: t('label.size'),
      align: 'left',
      key: 'size',
    },
    {
      title: t('label.lastModified.at'),
      align: 'left',
      key: 'lastModified',
    },
  ];

  return headers;
};

const getVmListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('vm.network.private.ip'),
      key: 'private_ips',
    },
    {
      title: t('vm.network.floating.ip'),
      key: 'public_ips',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
    {
      title: t('label.createdBy'),
      key: 'user.name',
    },
  ];
  return headers;
};

const getApplicationListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('application.type'),
      key: 'moduleCategory.name',
    },
    {
      title: t('label.version'),
      key: 'module.name',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
    {
      title: t('label.createdBy'),
      key: 'creator.name',
    },
  ];
  return headers;
};

const getVmKeypairListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
  ];
  return headers;
};

const getVmImageListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('basic.desc'),
      key: 'description',
    },
    {
      title: t('label.number.type', { type: t('label.version') }),
      key: 'count',
    },
    {
      title: t('label.createdBy'),
      key: 'creator.displayName',
    },
  ];
  return headers;
};

const getVmImageDetailHeaders = () => {
  const headers = [
    {
      title: t('label.version'),
      key: 'name',
    },
    {
      title: t('label.type'),
      key: 'type',
    },
    {
      title: t('image.diskFormat'),
      key: 'diskFormat',
    },
    {
      title: t('label.volume.size'),
      key: 'tagSize',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
  ];
  return headers;
};

const getVmVolumeListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('label.type'),
      key: 'type',
    },
    {
      title: t('vm.volume.size'),
      key: 'size',
    },
    {
      title: t('vm.associated.service'),
      key: 'attachment.name',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
    {
      title: t('label.createdBy'),
      key: 'user.name',
    },
  ];
  return headers;
};

const getVmNetworkListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('basic.cidr'),
      key: 'cidr',
    },
    {
      title: t('basic.gateway'),
      key: 'gateway',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.serviceState', { type: t('basic.external.network') }),
      key: 'external_status',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
    {
      title: t('label.createdBy'),
      key: 'user.name',
    },
  ];
  return headers;
};

const getVmSecurityGroupListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('basic.desc'),
      key: 'description',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
    {
      title: t('label.createdBy'),
      key: 'user.name',
    },
  ];
  return headers;
};

const getVmSecurityGroupDetailHeaders = () => {
  const headers = [
    {
      title: t('vm.sg.traffic'),
      key: 'direction',
    },
    {
      title: t('vm.sg.network.type'),
      key: 'network_type',
    },
    {
      title: t('vm.sg.port.range.min'),
      key: 'port_min',
    },
    {
      title: t('vm.sg.port.range.max'),
      key: 'port_max',
    },
    {
      title: t('basic.protocol'),
      key: 'protocol',
    },
    {
      title: t('basic.cidr'),
      key: 'remote_cidr',
    },
  ];
  return headers;
};

const getVmFloatingIpListHeaders = () => {
  const headers = [
    {
      title: 'IP',
      key: 'address',
    },
    {
      title: t('vm.associated.service'),
      key: 'device_name',
    },
    {
      title: t('basic.reserved'),
      key: 'reserved',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
    {
      title: t('label.createdBy'),
      key: 'user.name',
    },
  ];
  return headers;
};

const getVmLoadBalancerListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('vm.network'),
      key: 'networkName',
    },
    {
      title: t('vm.network.private.ip'),
      key: 'vip',
    },
    {
      title: t('vm.network.floating.ip'),
      key: 'floating_ip.address',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
    },
    {
      title: t('label.createdBy'),
      key: 'user.name',
    },
  ];
  return headers;
};

const getVmAutoScalingListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('vm.network'),
      key: 'networkName',
    },
    {
      title: 'Metric',
      key: 'metric',
    },
    {
      title: t('label.upperThreshold'),
      key: 'threshold_up',
    },
    {
      title: t('label.lowerThreshold'),
      key: 'threshold_down',
    },
    {
      title: t('vm.as.vmUpperLimit'),
      key: 'max_size',
    },
    {
      title: t('vm.as.vmLowerLimit'),
      key: 'min_size',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
    },
    {
      title: t('label.createdBy'),
      key: 'creator',
    },
  ];
  return headers;
};

const getHpcRemoteTaskListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('label.env'),
      key: 'provider',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.count'),
      key: 'count',
    },
    {
      title: t('label.lastModified'),
      key: 'updatedAt',
      useDateFilter: true,
    },
    {
      title: t('label.createdBy'),
      key: 'user.displayName',
    },
  ];
  return headers;
};

const getHpcRemoteImageListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('label.env'),
      key: 'provider',
    },
    {
      title: t('image.source'),
      key: 'source',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.size'),
      key: 'size',
    },
    {
      title: t('label.expirationTime'),
      key: 'expiredAt',
      useDateFilter: true,
    },
    {
      title: t('label.lastSync'),
      key: 'lastSyncAt',
      useDateFilter: true,
    },
  ];
  return headers;
};

const getHpcRemoteDataListHeaders = () => {
  const headers = [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('label.env'),
      key: 'provider',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
    },
    {
      title: t('label.size'),
      key: 'size',
    },
    {
      title: t('label.expirationTime'),
      key: 'expiredAt',
      useDateFilter: true,
    },
    {
      title: t('label.lastSync'),
      key: 'lastSyncAt',
      useDateFilter: true,
    },
  ];
  return headers;
};

const getResourceTransferListHeaders = () => {
  return [
    {
      title: t('resourceTransfer.sourceName'),
      key: 'name',
    },
    {
      title: t('resourceTransfer.source'),
      key: 'type',
    },
    {
      title: t('resourceTransfer.owner'),
      key: 'owner.displayName',
    },
  ];
};

const getResourceTransferDetailListHeaders = () => {
  return [
    {
      title: t('resourceTransfer.name'),
      key: 'serverName',
    },
    {
      title: t('resourceTransfer.version'),
      key: 'tagName',
    },
    {
      title: t('resourceTransfer.creator'),
      key: 'creator.displayName',
    },
  ];
};

const getK8sClusterListHeaders = () => {
  return [
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('label.serviceState'),
      key: 'status',
      isStatus: true,
    },
    {
      title: t('label.version'),
      key: 'k8sVersion',
    },
    {
      title: t('k8s.network.apiServer.endpoint'),
      key: 'apiEndpoint',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
    {
      title: t('label.createdBy'),
      key: 'createdBy',
    },
  ];
};

const getApiKeyListHeaders = () => {
  return [
    {
      title: t('label.name'),
      key: 'description',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
  ];
};

const getLogsHeaders = () => {
  return [
    {
      title: t('logMgnt.serviceType'),
      key: 'uiType',
    },
    {
      title: t('logMgnt.region'),
      key: 'meta.ad',
    },
    // {
    //   title: t('label.name'),
    //   key: 'resource.name',
    // },
    {
      title: t('logMgnt.action'),
      key: 'uiAction',
    },
    {
      title: t('logMgnt.user'),
      key: 'userName',
    },
    // {
    //   title: t('logMgnt.sourceIp'),
    //   key: 'source.ip',
    // },
    {
      title: t('logMgnt.time'),
      key: 'action.time',
      useDateFilter: true,
    },
  ];
};

const getFlavorHeaders = (extra?: TableHeader[], removeKeys: string[] = []) => {
  const headers = [
    {
      title: t('flavor.name'),
      key: 'name',
    },
    { title: 'GPU', key: 'gpu_count', subTitle: `(${t('flavor.pcs')})` },
    { title: 'CPU', key: 'vcpu', subTitle: '(Cores)' },
    { title: t('flavor.memory'), key: 'memory', subTitle: '(GB)' },
    ...(extra ?? []),
  ];
  for (const key of removeKeys) {
    const removeIndex = headers.findIndex(header => header.key === key);
    if (removeIndex > -1) {
      headers.splice(removeIndex, 1);
    }
  }
  return headers;
};
