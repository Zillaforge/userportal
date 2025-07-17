import useSvgIcons from '@/composables/useSvgIcons';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import { type NoDataSetting } from '@/interfaces/InfraDataTableInterface';
import router from '@/router';

const { IconKeys, ServiceIcons } = useSvgIcons();

const { t } = i18n.global;

export default (tableType: string, btnAction?: () => void): NoDataSetting => {
  const action = btnAction ?? (() => {});
  switch (tableType) {
    case PAGE_TYPES.CONTAINER_IMAGE_LIST:
    case PAGE_TYPES.CONTAINER_IMAGE_DETAIL:
      return getContainerImageListNoDataSetting();

    case PAGE_TYPES.FILE_SHARING_LIST:
      return getFileSharingListNoDataSetting();

    case PAGE_TYPES.HPC_REMOTE_TASK_LIST:
      return getHpcTaskListNoDataSetting();
    case PAGE_TYPES.HPC_REMOTE_IMAGE_LIST:
      return getHpcImageListNoDataSetting();
    case PAGE_TYPES.HPC_REMOTE_DATA_LIST:
      return getHpcDataListNoDataSetting();

    case PAGE_TYPES.VM_LIST:
      return getVmListNoDataSetting();
    case PAGE_TYPES.VM_IMAGE_LIST:
      return getVmImageListNoDataSetting();
    case PAGE_TYPES.VM_KEYPAIR_LIST:
      return getVmKeyPairListNoDataSetting(action);
    case PAGE_TYPES.VM_VOLUME_LIST:
      return getVmVolumeListNoDataSetting();
    case PAGE_TYPES.VM_NETWORK_LIST:
      return getVmNetworkListNoDataSetting();
    case PAGE_TYPES.VM_SECURITY_GROUP_LIST:
      return getVmSecurityGroupListNoDataSetting();
    case PAGE_TYPES.VM_FLOATING_IP_LIST:
      return getVmFloatingIPListNoDataSetting();
    case PAGE_TYPES.VM_LOAD_BALANCER_LIST:
      return getVmLoadBalancerListNoDataSetting();
    case PAGE_TYPES.VM_AUTO_SCALING_LIST:
      return getVmAutoScalingListNoDataSetting();
    case PAGE_TYPES.S3_BUCKET_LIST:
      return getS3BucketListNoDataSetting();
    case PAGE_TYPES.S3_OBJECT_LIST:
      return getS3ObjectListNoDataSetting();
    case PAGE_TYPES.DATA_EXCHANGE_LIST:
      return getDataExchangeListNoDataSetting();
    case PAGE_TYPES.DATA_EXCHANGE_CONTENT_LIST:
      return getDataExchangeContentListNoDataSetting();
    case PAGE_TYPES.DATA_RELEASE_LIST:
      return getDataReleaseListNoDataSetting();
    case PAGE_TYPES.DATA_RELEASE_CONTENT_LIST:
      return getDataReleaseContentListNoDataSetting();
    case PAGE_TYPES.RESOURCE_TRANSFER_LIST:
    case PAGE_TYPES.RESOURCE_TRANSFER_DETAIL_LIST:
      return getResourceTransferListNoDataSetting();
    case PAGE_TYPES.KEY_API:
      return getApiKeyListNoDataSetting();
    case PAGE_TYPES.LOGS:
      return getLogsListNoDataSetting();

    case PAGE_TYPES.K8S_CLUSTER_LIST:
      return getK8sClusterListNoDataSetting();

    case PAGE_TYPES.APPLICATION_LIST:
      return getApplicarionListNoDataSetting();

    case PAGE_TYPES.VM_IMAGE_DETAIL:
    default:
      return getDefaultNoDataSetting();
  }
};

const getContainerImageListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.ctr_image].svg,
  message1: t('basic.noData.less.type', {
    type: t('services.containerImageManage'),
  }),
});

const getFileSharingListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.file_sharing].svg,
  message1: t('basic.noData.less.type', { type: t('services.fileSharing') }),
  buttonTitle: t('basic.create.type', {
    type: t('services.fileSharing'),
  }),
  action: () => {
    void router.push({ name: PAGE_TYPES.FILE_SHARING_CREATE });
  },
});

const getHpcTaskListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.hpc_deliver].svg,
  message1: t('basic.noData.less.type', {
    type: ` ${t('services.hpc.deliver')}`,
  }),
  buttonTitle: t('basic.create.type', {
    type: ` ${t('services.hpc.deliver')}`,
  }),
  action: () => {
    void router.push({ name: PAGE_TYPES.HPC_REMOTE_TASK_CREATE });
  },
});

const getHpcImageListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.hpc_deliver].svg,
  message1: t('basic.noData.less.type', {
    type: t('services.hpc.remote.image'),
  }),
  buttonTitle: t('basic.create.type', {
    type: t('services.hpc.remote.image'),
  }),
  action: () => {
    void router.push({ name: PAGE_TYPES.HPC_REMOTE_IMAGE_CREATE });
  },
});

const getHpcDataListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.hpc_deliver].svg,
  message1: t('basic.noData.less.type', {
    type: t('services.hpc.remote.data'),
  }),
  buttonTitle: t('basic.create.type', {
    type: t('services.hpc.remote.data'),
  }),
  action: () => {
    void router.push({ name: PAGE_TYPES.HPC_REMOTE_DATA_CREATE });
  },
});

const getVmListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.vm].svg,
  message1: t('basic.noData.type', { type: t('services.virtualMachine') }),
  message2: t('basic.noData.create.type', {
    type: t('services.virtualMachine'),
  }),
  buttonTitle: t('basic.create.type', {
    type: t('services.virtualMachine'),
  }),
  action: () => {
    void router.push({ name: PAGE_TYPES.VM_CREATE });
  },
});

const getVmImageListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.vm_image].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.vmImageManage'),
  }),
  message1: t('basic.noData.less.type', { type: t('services.vmImageManage') }),
  action: async () => await router.push({ name: PAGE_TYPES.VM_IMAGE_CREATE }),
});

const getS3BucketListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.storage].svg,
  message1: t('basic.noData.less.type', { type: t('s3.bucket') }),
  message2: t('noData.msg2.s3.bucket'),
  buttonTitle: t('basic.create.type', {
    type: t('services.cloudStorage'),
  }),
});

const getS3ObjectListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.storage].svg,
  message1: t('basic.noData.less.type', { type: t('s3.object') }),
  message2: t('noData.msg2.s3.object'),
});

const getResourceTransferListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.resource_transfer].svg,
  message1: t('basic.noData.less.type', {
    type: t('services.resourceTransfer'),
  }),
});

const getDataExchangeListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.data_exchange].svg,
  message1: t('basic.noData.less.type', { type: t('services.dataExchange') }),
  buttonTitle: t('basic.create.type', {
    type: t('services.dataExchange'),
  }),
});

const getDataExchangeContentListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.data_exchange].svg,
  message1: t('basic.noData.less.type', { type: t('services.dataExchange') }),
});

const getDataReleaseListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.data_release].svg,
  message1: t('basic.noData.less.type', { type: t('services.dataRelease') }),
  buttonTitle: t('basic.create.type', {
    type: t('services.cloudStorage'),
  }),
});

const getDataReleaseContentListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.data_release].svg,
  message1: t('basic.noData.less.type', { type: t('services.dataRelease') }),
});

const getApiKeyListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.api_key].svg,
  message1: t('basic.noData.less.type', { type: t('keyMgnt.api') }),
  buttonTitle: t('basic.create.type', {
    type: t('keyMgnt.api'),
  }),
});

const getLogsListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.log].svg,
  message1: t('basic.noData.less.type', { type: t('logMgnt') }),
});

const getVmNetworkListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.virtual_network].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.virtualNetwork'),
  }),
  message1: t('basic.noData.less.type', { type: t('services.virtualNetwork') }),
  message2: t('basic.noData.create.type', {
    type: t('services.virtualNetwork'),
  }),
  action: async () => await router.push({ name: PAGE_TYPES.VM_NETWORK_CREATE }),
});

const getVmVolumeListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.virtual_volume].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.virtualVolume'),
  }),
  message1: t('basic.noData.less.type', {
    type: t('services.virtualVolume'),
  }),
  message2: t('volume.noData.msg2'),
  action: async () => await router.push({ name: PAGE_TYPES.VM_VOLUME_CREATE }),
});

const getVmKeyPairListNoDataSetting = (btnAction: () => void) => ({
  svgIcon: ServiceIcons[IconKeys.keypair].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.keypairs'),
  }),
  message1: t('basic.noData.less.type', { type: t('services.keypairs') }),
  message2: t('basic.noData.create.type', { type: t('services.keypairs') }),
  action: btnAction,
});
const getVmSecurityGroupListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.security_group].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.securityGroup'),
  }),
  message1: t('basic.noData.less.type', {
    type: t('services.securityGroup'),
  }),
  message2: t('basic.noData.create.type', {
    type: t('services.securityGroup'),
  }),
  action: async () =>
    await router.push({ name: PAGE_TYPES.VM_SECURITY_GROUP_CREATE }),
});

const getVmFloatingIPListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.floating_ip].svg,
  buttonTitle: t('basic.create.type', {
    type: t('virtualNetwork.floating.ip'),
  }),
  message1: t('basic.noData.less.type', {
    type: t('virtualNetwork.floating.ip'),
  }),
  message2: t('basic.noData.create.type', {
    type: t('virtualNetwork.floating.ip'),
  }),
});

const getVmLoadBalancerListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.load_balance].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.loadBalancer'),
  }),
  message1: t('basic.noData.less.type', {
    type: t('services.loadBalancer'),
  }),
  message2: t('basic.noData.create.type', {
    type: t('services.loadBalancer'),
  }),
  action: async () =>
    await router.push({ name: PAGE_TYPES.VM_LOAD_BALANCER_CREATE }),
});

const getVmAutoScalingListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.auto_scaling].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.autoScaling'),
  }),
  message1: t('basic.noData.less.type', {
    type: t('services.autoScaling'),
  }),
  message2: t('basic.noData.create.type', {
    type: t('services.autoScaling'),
  }),
  action: async () =>
    await router.push({ name: PAGE_TYPES.VM_AUTO_SCALING_CREATE }),
});

const getK8sClusterListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.k8s_cluster].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.k8sCluster'),
  }),
  message1: t('basic.noData.less.type', {
    type: t('services.k8sCluster'),
  }),
  action: async () =>
    await router.push({ name: PAGE_TYPES.K8S_CLUSTER_CREATE }),
});

const getApplicarionListNoDataSetting = () => ({
  svgIcon: ServiceIcons[IconKeys.application].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.application'),
  }),
  message1: t('basic.noData.less.type', {
    type: t('services.application'),
  }),
  action: async () =>
    await router.push({ name: PAGE_TYPES.APPLICATION_CREATE }),
});

const getDefaultNoDataSetting = () => ({
  icon: 'mdi-layers',
  message1: t('basic.noData.less.type', { type: t('label.service') }),
});
