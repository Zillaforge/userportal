import type { RouteRecordName, RouteLocationRaw } from 'vue-router';

import { LOG_TYPES } from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';

const { t } = i18n.global;

export interface BreadcrumbItem {
  title: string;
  disabled?: boolean;
  to?: RouteLocationRaw;
}

const handleGoToS3ObjectList = (bucketName: string, prefix: string = '') => ({
  name: PAGE_TYPES.S3_OBJECT_LIST,
  params: {
    bucketName,
    pathMatch: prefix,
  },
});

const handleGoToDataContentList = (
  pageType: string,
  bucketName: string,
  prefix: string = ''
) => ({
  name: pageType,
  params: {
    bucketName,
    pathMatch: prefix,
  },
});

// eslint-disable-next-line require-jsdoc
export default function (
  pageType: string | RouteRecordName | null | undefined,
  params = {}
) {
  let breadcrumbs = null;
  switch (pageType) {
    case PAGE_TYPES.CONTAINER_IMAGE_LIST:
      breadcrumbs = getContainerImageMgntBreadcrumbs();
      break;
    case PAGE_TYPES.CONTAINER_IMAGE_DETAIL:
      breadcrumbs = getContainerImageDetailBreadcrumbs(params);
      break;
    case PAGE_TYPES.FILE_SHARING_LIST:
      breadcrumbs = getFileSharingListBreadcrumbs();
      break;
    case PAGE_TYPES.FILE_SHARING_CREATE:
      breadcrumbs = getFileSharingCreateBreadcrumbs();
      break;
    case PAGE_TYPES.FILE_SHARING_DETAIL:
      breadcrumbs = getFileSharingDetailBreadcrumbs();
      break;
    case PAGE_TYPES.S3_BUCKET_LIST:
      breadcrumbs = getS3BucketListBreadcrumbs();
      break;
    case PAGE_TYPES.S3_OBJECT_LIST:
      breadcrumbs = getS3ObjectListBreadcrumbs(params);
      break;
    case PAGE_TYPES.VM_LIST:
      breadcrumbs = getVmListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_CREATE:
      breadcrumbs = getVmCreateBreadcrumbs();
      break;
    case PAGE_TYPES.VM_DETAIL:
      breadcrumbs = getVmDetailBreadcrumbs();
      break;
    case PAGE_TYPES.VM_KEYPAIR_LIST:
      breadcrumbs = getVmKeypairListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_KEYPAIR_DETAIL:
      breadcrumbs = getVmKeypairDetailBreadcrumbs();
      break;
    case PAGE_TYPES.VM_IMAGE_LIST:
      breadcrumbs = getVmImageListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_IMAGE_CREATE:
      breadcrumbs = getVmImageCreateBreadcrumbs();
      break;
    case PAGE_TYPES.VM_IMAGE_DETAIL:
      breadcrumbs = getVmImageDetailBreadcrumbs(params);
      break;
    case PAGE_TYPES.VM_VOLUME_LIST:
      breadcrumbs = getVmVolumeListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_VOLUME_DETAIL:
      breadcrumbs = getVmVolumeDetailBreadcrumbs();
      break;
    case PAGE_TYPES.VM_VOLUME_CREATE:
      breadcrumbs = getVmVolumeCreateBreadcrumbs();
      break;
    case PAGE_TYPES.VM_NETWORK_LIST:
      breadcrumbs = getVmNetworkListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_NETWORK_CREATE:
      breadcrumbs = getVmNetworkCreateBreadcrumbs();
      break;
    case PAGE_TYPES.VM_NETWORK_DETAIL:
      breadcrumbs = getVmNetworkDetailBreadcrumbs();
      break;
    case PAGE_TYPES.VM_SECURITY_GROUP_LIST:
      breadcrumbs = getVmSecurityGroupListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_SECURITY_GROUP_CREATE:
      breadcrumbs = getVmSecurityGroupCreateBreadcrumbs();
      break;
    case PAGE_TYPES.VM_SECURITY_GROUP_DETAIL:
      breadcrumbs = getVmSecurityGroupDetailBreadcrumbs();
      break;
    case PAGE_TYPES.VM_FLOATING_IP_LIST:
      breadcrumbs = getVmFloatingIpListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_LOAD_BALANCER_LIST:
      breadcrumbs = getVmLoadBalancerListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_LOAD_BALANCER_DETAIL:
      breadcrumbs = getVmLoadBalancerDetailBreadcrumbs();
      break;
    case PAGE_TYPES.VM_LOAD_BALANCER_LISTENER_DETAIL:
    case PAGE_TYPES.VM_LOAD_BALANCER_POOL_DETAIL:
      breadcrumbs = getVmLoadBalancerDetailBreadcrumbs(params);
      break;
    case PAGE_TYPES.VM_LOAD_BALANCER_CREATE:
      breadcrumbs = getVmLoadBalancerCreateBreadcrumbs();
      break;
    case PAGE_TYPES.VM_LOAD_BALANCER_LISTENER_CREATE:
      breadcrumbs = getVmLoadBalancerListenerCreateBreadcrumbs(params);
      break;
    case PAGE_TYPES.VM_LOAD_BALANCER_POOL_CREATE:
      breadcrumbs = getVmLoadBalancerPoolCreateBreadcrumbs(params);
      break;
    case PAGE_TYPES.VM_AUTO_SCALING_LIST:
      breadcrumbs = getVmAutoScalingListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_AUTO_SCALING_DETAIL:
      breadcrumbs = getVmAutoScalingDetailBreadcrumbs();
      break;
    case PAGE_TYPES.VM_AUTO_SCALING_CREATE:
      breadcrumbs = getVmAutoScalingCreateBreadcrumbs();
      break;
    case PAGE_TYPES.CHANGE_PASSWORD:
      breadcrumbs = getChangePasswordBreadcrumbs();
      break;

    case PAGE_TYPES.APPLICATION_LIST:
      breadcrumbs = getApplicationListBreadcrumbs();
      break;
    case PAGE_TYPES.APPLICATION_CREATE:
      breadcrumbs = getApplicationCreateBreadcrumbs();
      break;
    case PAGE_TYPES.APPLICATION_DETAIL:
      breadcrumbs = getApplicationDetailBreadcrumbs();
      break;

    case PAGE_TYPES.HPC_REMOTE_TASK_LIST:
      breadcrumbs = getHpcRemoteTaskListBreadcrumbs();
      break;
    case PAGE_TYPES.HPC_REMOTE_TASK_CREATE:
      breadcrumbs = getHpcRemoteTaskCreateBreadcrumbs();
      break;
    case PAGE_TYPES.HPC_REMOTE_TASK_DETAIL:
      breadcrumbs = getHpcRemoteTaskDetailBreadcrumbs();
      break;
    case PAGE_TYPES.HPC_REMOTE_IMAGE_LIST:
      breadcrumbs = getHpcRemoteImageListBreadcrumbs();
      break;
    case PAGE_TYPES.HPC_REMOTE_IMAGE_CREATE:
      breadcrumbs = getHpcRemoteImageCreateBreadcrumbs();
      break;
    case PAGE_TYPES.HPC_REMOTE_DATA_LIST:
      breadcrumbs = getHpcRemoteDataListBreadcrumbs();
      break;
    case PAGE_TYPES.HPC_REMOTE_DATA_CREATE:
      breadcrumbs = getHpcRemoteDataCreateBreadcrumbs();
      break;
    case PAGE_TYPES.DATA_EXCHANGE_LIST:
      breadcrumbs = getDataExchangeListBreadcrumbs();
      break;
    case PAGE_TYPES.DATA_EXCHANGE_CONTENT_LIST:
      breadcrumbs = getDataExchangeContentListBreadcrumbs(params);
      break;
    case PAGE_TYPES.DATA_RELEASE_LIST:
      breadcrumbs = getDataReleaseListBreadcrumbs();
      break;
    case PAGE_TYPES.DATA_RELEASE_CONTENT_LIST:
      breadcrumbs = getDataReleaseContentListBreadcrumbs(params);
      break;
    case PAGE_TYPES.RESOURCE_TRANSFER_LIST:
      breadcrumbs = getResourceTransferListBreadcrumbs();
      break;
    case PAGE_TYPES.RESOURCE_TRANSFER_DETAIL_LIST:
      breadcrumbs = getResourceTransferDetailListBreadcrumbs(params);
      break;

    case PAGE_TYPES.K8S_CLUSTER_LIST:
      breadcrumbs = getK8sClusterListBreadcrumbs();
      break;
    case PAGE_TYPES.K8S_CLUSTER_CREATE:
      breadcrumbs = getK8sClusterCreateBreadcrumbs();
      break;
    case PAGE_TYPES.K8S_CLUSTER_DETAIL:
      breadcrumbs = getK8sClusterDetailBreadcrumbs();
      break;

    case PAGE_TYPES.KEY_S3:
      breadcrumbs = getKeyS3Breadcrumbs();
      break;
    case PAGE_TYPES.KEY_API:
      breadcrumbs = getKeyApiBreadcrumbs();
      break;
    case PAGE_TYPES.KEY_PUBLIC:
      breadcrumbs = getKeyPublicBreadcrumbs();
      break;
    case PAGE_TYPES.LOGS:
      breadcrumbs = getLogsBreadcrumbs(params);
      break;
    case PAGE_TYPES.SIMULATION:
      breadcrumbs = getUserPermissionBreadcrumbs();
      break;
    default:
      break;
  }
  if (breadcrumbs === null) {
    throw new Error(
      'Whoops, you are trying to get breadcrumb with unknown type'
    );
  }
  return disabledThelastBreadcrumb(breadcrumbs);
}

const getContainerImageMgntBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.containerImageManage'),
      disabled: false,
      to: {
        name: PAGE_TYPES.CONTAINER_IMAGE_LIST,
      },
    },
  ];
};

const getContainerImageDetailBreadcrumbs = (
  params: Record<string, any>
): BreadcrumbItem[] => {
  const breadcrumbs = getContainerImageMgntBreadcrumbs();
  if (params.imageName) {
    breadcrumbs.push({
      title: params.imageName,
      disabled: true,
    });
  }
  return breadcrumbs;
};

const getFileSharingListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.fileSharing'),
      disabled: false,
      to: {
        name: PAGE_TYPES.FILE_SHARING_LIST,
      },
    },
  ];
};

const getFileSharingCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getFileSharingListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create'),
      disabled: false,
    },
  ]);
};

const getFileSharingDetailBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getFileSharingListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: '詳細資料',
      disabled: false,
    },
  ]);
};

const getS3BucketListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.cloudStorage'),
      disabled: false,
      to: {
        name: PAGE_TYPES.S3_BUCKET_LIST,
      },
    },
  ];
};

const getS3ObjectListBreadcrumbs = (
  params: Record<string, any>
): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.cloudStorage'),
      disabled: !params.bucketName,
      to: {
        name: PAGE_TYPES.S3_BUCKET_LIST,
      },
    },
  ];
  if (!params.path) {
    if (params.bucketName) {
      breadcrumbs.push({
        title: params.bucketName,
        disabled: true,
      });
    }
  } else {
    breadcrumbs.push({
      title: params.bucketName,
      disabled: false,
      to: handleGoToS3ObjectList(params.bucketName as string),
    });
    const prefixArray: string[] = [];
    let prefix = '';
    const subpath = params.path.split('/');
    subpath.forEach((path: string, index: number) => {
      if (index === subpath.length - 2) {
        breadcrumbs.push({
          title: path,
          disabled: true,
          to: undefined,
        });
      } else if (index !== subpath.length - 1) {
        prefix += `${path}/`;
        prefixArray.push(prefix);
        breadcrumbs.push({
          title: path,
          disabled: false,
          to: handleGoToS3ObjectList(
            params.bucketName as string,
            prefixArray[index]
          ),
        });
      }
    });
  }
  return breadcrumbs;
};

const getVmListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.virtualMachine'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_LIST,
      },
    },
  ];
};

const getVmCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create.type', { type: t('services.virtualMachine') }),
      disabled: false,
    },
  ]);
};

const getVmDetailBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.detail'),
      disabled: false,
    },
  ]);
};

const getVmKeypairListBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('services.keypairs'),
      disabled: false,
    },
  ]);
};
const getVmKeypairDetailBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('services.keypairs'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_KEYPAIR_LIST,
      },
    },
    {
      title: t('basic.detail'),
      disabled: false,
    },
  ]);
};

const getVmImageListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.vmImageManage'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_IMAGE_LIST,
      },
    },
  ];
};

const getVmImageCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmImageListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create'),
      disabled: false,
    },
  ]);
};

const getVmImageDetailBreadcrumbs = (
  params: Record<string, any>
): BreadcrumbItem[] => {
  const breadcrumbs = getVmImageListBreadcrumbs();
  if (params.imageName) {
    breadcrumbs.push({
      title: params.imageName,
      disabled: true,
    });
  }
  return breadcrumbs;
};

const getVmVolumeListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.virtualVolume'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_VOLUME_LIST,
      },
    },
  ];
};

const getVmVolumeDetailBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmVolumeListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.detail'),
      disabled: false,
    },
  ]);
};

const getVmVolumeCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmVolumeListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create'),
      disabled: false,
    },
  ]);
};

const getVmNetworkListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.virtualNetwork'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_NETWORK_LIST,
      },
    },
  ];
};

const getVmNetworkCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmNetworkListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create.type', { type: t('services.virtualNetwork') }),
      disabled: false,
    },
  ]);
};

const getVmNetworkDetailBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmNetworkListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.detail'),
      disabled: false,
    },
  ]);
};

const getVmSecurityGroupListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.securityGroup'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_SECURITY_GROUP_LIST,
      },
    },
  ];
};

const getVmSecurityGroupCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmSecurityGroupListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create'),
      disabled: true,
    },
  ]);
};

const getVmSecurityGroupDetailBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmSecurityGroupListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.rule'),
      disabled: true,
    },
  ]);
};

const getVmFloatingIpListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.securityGroup'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_FLOATING_IP_LIST,
      },
    },
  ];
};

const getVmLoadBalancerListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.loadBalancer'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_LOAD_BALANCER_LIST,
      },
    },
  ];
};

const getVmLoadBalancerCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmLoadBalancerListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create'),
      disabled: false,
    },
  ]);
};

const getVmLoadBalancerPoolCreateBreadcrumbs = (
  params: Record<string, any>
): BreadcrumbItem[] => {
  const breadcrumbs = getVmLoadBalancerListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.detail'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
        params: { id: params.loadBalancerId },
      },
    },
    {
      title: t('basic.create.type', { type: t('vm.lb.target.pool') }),
      disabled: false,
    },
  ]);
};

const getVmLoadBalancerListenerCreateBreadcrumbs = (
  params: Record<string, any>
): BreadcrumbItem[] => {
  const breadcrumbs = getVmLoadBalancerListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.detail'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
        params: { id: params.loadBalancerId },
      },
    },
    {
      title: t('basic.create.type', { type: t('vm.lb.listener') }),
      disabled: false,
    },
  ]);
};

const getVmLoadBalancerDetailBreadcrumbs = (
  params?: Record<string, any>
): BreadcrumbItem[] => {
  const breadcrumbs = getVmLoadBalancerListBreadcrumbs();
  if (params?.itemName) {
    breadcrumbs.push({
      title: t('basic.detail'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
        params: { id: params.loadBalancerId },
      },
    });
    breadcrumbs.push({
      title: params.itemName,
      disabled: true,
    });
  } else {
    return breadcrumbs.concat([
      {
        title: t('basic.detail'),
        disabled: false,
      },
    ]);
  }
  return breadcrumbs;
};

const getVmAutoScalingListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.autoScaling'),
      disabled: false,
      to: {
        name: PAGE_TYPES.VM_AUTO_SCALING_LIST,
      },
    },
  ];
};

const getVmAutoScalingCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmAutoScalingListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create'),
      disabled: false,
    },
  ]);
};

const getVmAutoScalingDetailBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getVmAutoScalingListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.detail'),
      disabled: false,
    },
  ]);
};

const getChangePasswordBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('appBar.account.changePw'),
      disabled: true,
    },
  ];
};

const getApplicationListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('basic.management.type', {
        type: `${t('services.application')} `,
      }),
      to: {
        name: PAGE_TYPES.APPLICATION_LIST,
      },
    },
  ];
};

const getApplicationCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getApplicationListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create.type', { type: t('services.application') }),
    },
  ]);
};
const getApplicationDetailBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getApplicationListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.detail.type', { type: `${t('services.application')} ` }),
    },
  ]);
};

const getHpcRemoteTaskListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.hpc.deliver'),
      to: {
        name: PAGE_TYPES.HPC_REMOTE_TASK_LIST,
      },
    },
  ];
};

const getHpcRemoteTaskCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getHpcRemoteTaskListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create.type', { type: ` ${t('services.hpc.deliver')}` }),
    },
  ]);
};

const getHpcRemoteTaskDetailBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getHpcRemoteTaskListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.detail.type', { type: t('services.hpc.deliver') }),
    },
  ]);
};

const getHpcRemoteImageListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.hpc.remote.image'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HPC_REMOTE_IMAGE_LIST,
      },
    },
  ];
};

const getHpcRemoteImageCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getHpcRemoteImageListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create'),
      disabled: false,
    },
  ]);
};

const getHpcRemoteDataListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.hpc.remote.data'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HPC_REMOTE_DATA_LIST,
      },
    },
  ];
};

const getHpcRemoteDataCreateBreadcrumbs = (): BreadcrumbItem[] => {
  const breadcrumbs = getHpcRemoteDataListBreadcrumbs();
  return breadcrumbs.concat([
    {
      title: t('basic.create'),
      disabled: false,
    },
  ]);
};

const getDataExchangeListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.dataExchange'),
      disabled: false,
      to: {
        name: PAGE_TYPES.DATA_EXCHANGE_LIST,
      },
    },
  ];
};

const getDataContentBreadcrumbs = (
  pageType: string,
  params: Record<string, any>
): BreadcrumbItem[] => {
  const breadcrumbs = [];
  if (!params.path) {
    if (params.bucketName) {
      breadcrumbs.push({
        title: params.bucketName,
        disabled: true,
      });
    }
  } else {
    breadcrumbs.push({
      title: params.bucketName,
      disabled: false,
      to: handleGoToDataContentList(pageType, params.bucketName as string),
    });
    const prefixArray: string[] = [];
    let prefix = '';
    const subpath = params.path.split('/');
    subpath.forEach((path: string, index: number) => {
      if (index === subpath.length - 2) {
        breadcrumbs.push({
          title: path,
          disabled: true,
        });
      } else if (index !== subpath.length - 1) {
        prefix += `${path}/`;
        prefixArray.push(prefix);
        breadcrumbs.push({
          title: path,
          disabled: false,
          to: handleGoToDataContentList(
            pageType,
            params.bucketName as string,
            prefixArray[index]
          ),
        });
      }
    });
  }
  return breadcrumbs;
};

const getDataExchangeContentListBreadcrumbs = (
  params: Record<string, any>
): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.dataExchange'),
      disabled: false,
      to: {
        name: PAGE_TYPES.DATA_EXCHANGE_LIST,
      },
    },
  ];

  breadcrumbs.push(
    ...getDataContentBreadcrumbs(PAGE_TYPES.DATA_EXCHANGE_CONTENT_LIST, params)
  );
  return breadcrumbs;
};

const getDataReleaseListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.dataRelease'),
      disabled: false,
      to: {
        name: PAGE_TYPES.DATA_RELEASE_LIST,
      },
    },
  ];
};

const getDataReleaseContentListBreadcrumbs = (
  params: Record<string, any>
): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.dataRelease'),
      disabled: false,
      to: {
        name: PAGE_TYPES.DATA_RELEASE_LIST,
      },
    },
  ];

  breadcrumbs.push(
    ...getDataContentBreadcrumbs(PAGE_TYPES.DATA_RELEASE_CONTENT_LIST, params)
  );
  return breadcrumbs;
};

const getResourceTransferListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.resourceTransfer'),
      disabled: false,
      to: {
        name: PAGE_TYPES.RESOURCE_TRANSFER_LIST,
      },
    },
  ];
};

const getResourceTransferDetailListBreadcrumbs = (
  params: Record<string, any>
): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.resourceTransfer'),
      disabled: false,
      to: {
        name: PAGE_TYPES.RESOURCE_TRANSFER_LIST,
      },
    },
    {
      title: params.name,
      disabled: false,
      to: {
        name: PAGE_TYPES.RESOURCE_TRANSFER_DETAIL_LIST,
        params: { name: params.name },
      },
    },
  ];
};

const getK8sClusterListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.k8sCluster'),
      disabled: false,
      to: {
        name: PAGE_TYPES.K8S_CLUSTER_LIST,
      },
    },
  ];
};

const getK8sClusterCreateBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.k8sCluster'),
      disabled: false,
      to: {
        name: PAGE_TYPES.K8S_CLUSTER_LIST,
      },
    },
    {
      title: t('basic.create'),
      disabled: false,
    },
  ];
};

const getK8sClusterDetailBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('services.k8sCluster'),
      disabled: false,
      to: {
        name: PAGE_TYPES.K8S_CLUSTER_LIST,
      },
    },
    {
      title: t('basic.detail'),
      disabled: false,
    },
  ];
};

const getKeyS3Breadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('keyMgnt.s3'),
      disabled: false,
    },
  ];
};

const getKeyApiBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('keyMgnt.api'),
      disabled: false,
    },
  ];
};

const getKeyPublicBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('keyMgnt.public'),
      disabled: false,
    },
  ];
};

const getLogsBreadcrumbs = (params: Record<string, any>): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title:
        params.logType === LOG_TYPES.USER
          ? t('logMgnt.userLog')
          : t('logMgnt.log'),
      disabled: false,
    },
  ];
};

const getUserPermissionBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      title: t('basic.home'),
      disabled: false,
      to: {
        name: PAGE_TYPES.HOME,
      },
    },
    {
      title: t('simulated.user'),
      disabled: false,
    },
  ];
};

const disabledThelastBreadcrumb = (breadcrumbs: BreadcrumbItem[]) => {
  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  lastBreadcrumb.disabled = true;
  return breadcrumbs;
};
