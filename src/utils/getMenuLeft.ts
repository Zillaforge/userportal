import type { RouteRecordName } from 'vue-router';

import { getServiceAccess } from './utils';

import { LOG_TYPES } from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import SERVICE_TYPES from '@/constants/ServiceTypes';
import i18n from '@/i18n';

const { t } = i18n.global;

// eslint-disable-next-line require-jsdoc
export default function (
  pageType: string | RouteRecordName | null | undefined
) {
  let menuLeft = null;
  switch (pageType) {
    case PAGE_TYPES.CONTAINER_IMAGE_LIST:
    case PAGE_TYPES.CONTAINER_IMAGE_DETAIL:
      menuLeft = getContainerImageMenuLeft();
      break;

    case PAGE_TYPES.S3_BUCKET_LIST:
    case PAGE_TYPES.S3_OBJECT_LIST:
      menuLeft = getS3BucketListMenuLeft();
      break;

    case PAGE_TYPES.VM_LIST:
    case PAGE_TYPES.VM_CREATE:
    case PAGE_TYPES.VM_DETAIL:
    case PAGE_TYPES.VM_KEYPAIR_LIST:
    case PAGE_TYPES.VM_KEYPAIR_DETAIL:
    case PAGE_TYPES.VM_IMAGE_LIST:
    case PAGE_TYPES.VM_IMAGE_CREATE:
    case PAGE_TYPES.VM_IMAGE_DETAIL:
    case PAGE_TYPES.VM_VOLUME_LIST:
    case PAGE_TYPES.VM_VOLUME_CREATE:
    case PAGE_TYPES.VM_VOLUME_DETAIL:
    case PAGE_TYPES.VM_NETWORK_LIST:
    case PAGE_TYPES.VM_NETWORK_CREATE:
    case PAGE_TYPES.VM_NETWORK_DETAIL:
    case PAGE_TYPES.VM_SECURITY_GROUP_LIST:
    case PAGE_TYPES.VM_SECURITY_GROUP_CREATE:
    case PAGE_TYPES.VM_SECURITY_GROUP_DETAIL:
    case PAGE_TYPES.VM_FLOATING_IP_LIST:
    case PAGE_TYPES.VM_LOAD_BALANCER_LIST:
    case PAGE_TYPES.VM_LOAD_BALANCER_CREATE:
    case PAGE_TYPES.VM_LOAD_BALANCER_DETAIL:
    case PAGE_TYPES.VM_LOAD_BALANCER_LISTENER_DETAIL:
    case PAGE_TYPES.VM_LOAD_BALANCER_POOL_DETAIL:
    case PAGE_TYPES.VM_LOAD_BALANCER_LISTENER_CREATE:
    case PAGE_TYPES.VM_LOAD_BALANCER_POOL_CREATE:
    case PAGE_TYPES.VM_AUTO_SCALING_LIST:
    case PAGE_TYPES.VM_AUTO_SCALING_CREATE:
    case PAGE_TYPES.VM_AUTO_SCALING_DETAIL:
    case PAGE_TYPES.FILE_SHARING_LIST:
    case PAGE_TYPES.FILE_SHARING_CREATE:
    case PAGE_TYPES.FILE_SHARING_DETAIL:
      menuLeft = getVmServiceMenuLeft();
      break;

    case PAGE_TYPES.APPLICATION_LIST:
    case PAGE_TYPES.APPLICATION_CREATE:
    case PAGE_TYPES.APPLICATION_DETAIL:
      menuLeft = getApplicationMenuLeft();
      break;
    case PAGE_TYPES.HPC_REMOTE_TASK_LIST:
    case PAGE_TYPES.HPC_REMOTE_TASK_CREATE:
    case PAGE_TYPES.HPC_REMOTE_TASK_DETAIL:
    case PAGE_TYPES.HPC_REMOTE_IMAGE_LIST:
    case PAGE_TYPES.HPC_REMOTE_IMAGE_CREATE:
    case PAGE_TYPES.HPC_REMOTE_DATA_LIST:
    case PAGE_TYPES.HPC_REMOTE_DATA_CREATE:
      menuLeft = getHpcRemoteTaskMenuLeft();
      break;
    case PAGE_TYPES.DATA_EXCHANGE_LIST:
    case PAGE_TYPES.DATA_EXCHANGE_CONTENT_LIST:
      menuLeft = getDataExchangeMenuLeft();
      break;
    case PAGE_TYPES.DATA_RELEASE_LIST:
      menuLeft = getDataReleaseMenuLeft();
      break;
    case PAGE_TYPES.RESOURCE_TRANSFER_LIST:
    case PAGE_TYPES.RESOURCE_TRANSFER_DETAIL_LIST:
      menuLeft = getResourceTransferMenuLeft();
      break;

    case PAGE_TYPES.K8S_CLUSTER_LIST:
    case PAGE_TYPES.K8S_CLUSTER_CREATE:
    case PAGE_TYPES.K8S_CLUSTER_DETAIL:
      menuLeft = getK8sClusterMenuLeft();
      break;

    case PAGE_TYPES.KEY_S3:
    case PAGE_TYPES.KEY_API:
    case PAGE_TYPES.KEY_PUBLIC:
      menuLeft = getKeyServiceMenuLeft();
      break;
    case PAGE_TYPES.LOGS:
      menuLeft = getLogsServiceMenuLeft();
      break;
    default:
      break;
  }
  if (menuLeft === null) {
    throw new Error('Whoops, you are trying to get menus with unknown type');
  }
  return menuLeft;
}

const getContainerImageMenuLeft = () => {
  return [
    {
      title: t('services.containerImageManage'),
      routeName: PAGE_TYPES.CONTAINER_IMAGE_LIST,
      // icon: 'mdi-docker', // TODO: replace with designer's image later
      iconName: 'menu_icon_image',
      iconSize: '24px',
      relatedPath: ['/user/container/image'],
    },
  ];
};

const getS3BucketListMenuLeft = () => {
  return [
    {
      title: t('services.cloudStorage'),
      routeName: PAGE_TYPES.S3_BUCKET_LIST,
      icon: 'mdi-cloud-upload', // TODO: replace with designer's image later
      iconSize: '24px',
      relatedPath: ['/user/cloudStorage/bucket'],
    },
  ];
};

const getVmServiceMenuLeft = () => {
  return [
    {
      title: t('services.virtualMachine'),
      // routeName: PAGE_TYPES.VM_LIST,
      iconName: 'menu_icon_vm',
      iconSize: '24px',
      group: [
        {
          title: t('services.virtualMachine.manage'),
          routeName: PAGE_TYPES.VM_LIST,
          relatedPath: ['user/vm/list', 'user/vm/detail', 'user/vm/create'],
        },
        {
          title: t('services.keypairs'),
          routeName: PAGE_TYPES.VM_KEYPAIR_LIST,
          relatedPath: ['user/vm/keypair'],
        },
      ],
    },
    {
      title: t('image.virtualMachine'),
      routeName: PAGE_TYPES.VM_IMAGE_LIST,
      relatedPath: ['user/vm/image'],
      iconName: 'menu_icon_vm_image',
      iconSize: '24px',
    },
    {
      title: t('services.virtualVolume'),
      routeName: PAGE_TYPES.VM_VOLUME_LIST,
      relatedPath: [
        'user/vm/volume/list',
        'user/vm/volume/detail',
        'user/vm/volume/create',
      ],
      iconName: 'menu_icon_virtual_volume',
      iconSize: '24px',
    },
    {
      title: t('services.virtualNetwork.interface'),
      routeName: '',
      iconName: 'menu_icon_virtual_network',
      iconSize: '24px',
      group: [
        {
          title: t('services.virtualNetwork'),
          routeName: PAGE_TYPES.VM_NETWORK_LIST,
          relatedPath: [
            'user/vm/network/list',
            'user/vm/network/create',
            'user/vm/network/detail',
          ],
        },
        {
          title: t('services.securityGroup'),
          routeName: PAGE_TYPES.VM_SECURITY_GROUP_LIST,
          iconName: 'menu_icon_security_group',
          iconSize: '24px',
          relatedPath: ['user/vm/securityGroup'],
        },
        {
          title: t('virtualNetwork.floating.ip'),
          routeName: PAGE_TYPES.VM_FLOATING_IP_LIST,
          relatedPath: ['user/vm/floatingIp/list'],
        },
      ],
    },

    {
      title: t('services.loadBalancer'),
      routeName: PAGE_TYPES.VM_LOAD_BALANCER_LIST,
      iconName: 'menu_icon_load_balance',
      iconSize: '24px',
      relatedPath: ['vm/loadBalancer'],
    },
    {
      title: t('services.autoScaling'),
      routeName: PAGE_TYPES.VM_AUTO_SCALING_LIST,
      iconName: 'menu_icon_auto_scaling',
      iconSize: '24px',
      relatedPath: [
        'user/vm/autoScaling/list',
        'user/vm/autoScaling/create',
        'user/vm/autoScaling/detail',
      ],
      hide: !getServiceAccess()?.[SERVICE_TYPES.AUTO_SCALING],
    },
    {
      title: t('services.fileSharing'),
      routeName: PAGE_TYPES.FILE_SHARING_LIST,
      iconName: 'menu_icon_file_sharing',
      iconSize: '24px',
      relatedPath: [
        'user/fileSharing/list',
        'user/fileSharing/detail',
        'user/fileSharing/create',
      ],
    },
  ];
};

const getHpcRemoteTaskMenuLeft = () => {
  return [
    {
      title: t('services.hpc.deliver'),
      routeName: PAGE_TYPES.HPC_REMOTE_TASK_LIST,
      iconName: 'menu_icon_vm',
      iconSize: '24px',
      group: [
        {
          title: t('services.hpc.deliver'),
          routeName: PAGE_TYPES.HPC_REMOTE_TASK_LIST,
          relatedPath: [
            'user/hpcRemote/task/list',
            'user/hpcRemote/task/create',
            'user/hpcRemote/task/detail',
          ],
        },
        {
          title: t('services.hpc.remote.image'),
          routeName: PAGE_TYPES.HPC_REMOTE_IMAGE_LIST,
          relatedPath: [
            'user/hpcRemote/image/list',
            'user/hpcRemote/image/create',
          ],
        },
        {
          title: t('services.hpc.remote.data'),
          routeName: PAGE_TYPES.HPC_REMOTE_DATA_LIST,
          relatedPath: [
            'user/hpcRemote/data/list',
            'user/hpcRemote/data/create',
          ],
        },
      ],
    },
  ];
};

const getApplicationMenuLeft = () => {
  return [
    {
      title: t('services.application'),
      routeName: PAGE_TYPES.APPLICATION_LIST,
      icon: 'mdi-apps',
      iconSize: '24px',
      relatedPath: [
        'user/application/list',
        'user/application/create',
        'user/application/detail',
      ],
    },
  ];
};

const getDataExchangeMenuLeft = () => {
  return [
    {
      title: t('services.dataExchange'),
      routeName: PAGE_TYPES.DATA_EXCHANGE_LIST,
      iconName: 'menu_icon_data_exchange',
      iconSize: '24px',
      relatedPath: ['user/dataExchange'],
    },
  ];
};

const getDataReleaseMenuLeft = () => {
  return [
    {
      title: t('services.dataRelease'),
      routeName: PAGE_TYPES.DATA_RELEASE_LIST,
      iconName: 'menu_icon_data_release',
      iconSize: '24px',
      relatedPath: ['user/dataRelease'],
    },
  ];
};

const getResourceTransferMenuLeft = () => {
  return [
    {
      title: t('services.resourceTransfer'),
      routeName: PAGE_TYPES.RESOURCE_TRANSFER_LIST,
      iconName: 'menu_icon_resource_transfer',
      iconSize: '24px',
      relatedPath: ['user/resourceTransfer'],
    },
  ];
};

const getK8sClusterMenuLeft = () => {
  return [
    {
      title: t('services.k8sCluster'),
      routeName: PAGE_TYPES.K8S_CLUSTER_LIST,
      iconName: 'menu_icon_k8s_cluster_service',
      iconSize: '24px',
      relatedPath: ['user/k8sCluster'],
    },
  ];
};

const getKeyServiceMenuLeft = () => {
  return [
    {
      title: t('keyMgnt.key'),
      icon: 'mdi-key-variant',
      iconSize: '24px',
      group: [
        {
          title: t('keyMgnt.api'),
          routeName: PAGE_TYPES.KEY_API,
          relatedPath: ['account/key/api'],
        },
        {
          title: t('keyMgnt.s3'),
          routeName: PAGE_TYPES.KEY_S3,
          relatedPath: ['account/key/s3'],
        },
        {
          title: t('keyMgnt.public'),
          routeName: PAGE_TYPES.KEY_PUBLIC,
          relatedPath: ['account/key/public'],
          hide: !getServiceAccess()?.[SERVICE_TYPES.PUBLIC_KEY],
        },
      ],
    },
  ];
};

const getLogsServiceMenuLeft = () => {
  return [
    {
      title: t('logMgnt'),
      iconName: 'menu_icon_log',
      iconSize: '24px',
      group: [
        {
          title: t('logMgnt.log'),
          relatedPath: ['account/logs/project'],
          routeName: PAGE_TYPES.LOGS,
          routeParams: { logType: LOG_TYPES.PROJECT },
        },
        {
          title: t('logMgnt.userLog'),
          relatedPath: ['account/logs/user'],
          routeName: PAGE_TYPES.LOGS,
          routeParams: { logType: LOG_TYPES.USER },
        },
      ],
    },
  ];
};
