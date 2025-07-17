import { useGlobal, useUser, useProject, usePortalConfig } from '@/store';
import { inject } from 'vue';
import {
  createRouter,
  createWebHistory,
  type Router,
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from 'vue-router';

import type { VueCookies } from 'vue-cookies';

import { COOKIE_CONFIG } from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import SERVICE_TYPES from '@/constants/ServiceTypes';
import {
  getServiceAccess,
  toAdminPanel,
  removeAllCookies,
} from '@/utils/utils';
// Components
import HomeView from '@/views/HomeView.vue';
// Pinia Store

// Unimplemented in Vuetify 3.5.6
// import { goTo } from 'vuetify/services';

/** Router Rules */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: PAGE_TYPES.LOGIN,
    component: async () => await import('@/views/LoginView.vue'),
    meta: {
      disableBars: true,
      disableMenu: true,
      disableBreadcrumbs: true,
    },
  },
  {
    path: '/dashboard',
    name: PAGE_TYPES.HOME,
    component: HomeView,
    meta: {
      disableMenu: true,
      disableBreadcrumbs: true,
    },
  },
  {
    path: '/notification',
    name: PAGE_TYPES.NOTIFICATION_REDIRECT,
    component: async () => await import('@/views/NotificationRedirectView.vue'),
    meta: {
      disableBars: true,
      disableMenu: true,
      disableBreadcrumbs: true,
    },
  },
  {
    path: `/account`,
    children: [
      {
        path: 'changepassword',
        name: PAGE_TYPES.CHANGE_PASSWORD,
        component: async () => await import('@/views/ChangePasswordView.vue'),
        meta: {
          disableMenu: true,
          serviceType: SERVICE_TYPES.CLOUDINFRA,
        },
      },
      {
        path: 'key/s3',
        name: PAGE_TYPES.KEY_S3,
        component: async () => await import('@/views/S3PluginView.vue'),
      },
      {
        path: 'key/api',
        name: PAGE_TYPES.KEY_API,
        component: async () => await import('@/views/ApiKeyView.vue'),
      },
      {
        path: 'key/public',
        name: PAGE_TYPES.KEY_PUBLIC,
        component: async () => await import('@/views/PublicKeyView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.PUBLIC_KEY,
        },
      },
      {
        name: PAGE_TYPES.LOGS,
        path: 'logs/:logType',
        component: async () => await import('@/views/LogsView.vue'),
        props: true,
      },
      {
        path: 'simulation',
        name: PAGE_TYPES.SIMULATION,
        component: async () => await import('@/views/SimulationView.vue'),
        meta: {
          disableMenu: true,
        },
      },
    ],
  },
  {
    path: `/user`,
    children: [
      {
        path: 'container/image/list',
        name: PAGE_TYPES.CONTAINER_IMAGE_LIST,
        component: async () =>
          await import('@/views/ContainerImageListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.CONTAINER_IMAGE,
        },
      },
      {
        path: 'container/image/detail/:imageName',
        name: PAGE_TYPES.CONTAINER_IMAGE_DETAIL,
        component: async () =>
          await import('@/views/ContainerImageDetailView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.CONTAINER_IMAGE,
        },
      },
      {
        path: 'cloudStorage/bucket/list',
        name: PAGE_TYPES.S3_BUCKET_LIST,
        component: async () => await import('@/views/S3BucketListView.vue'),
      },
      {
        path: 'cloudStorage/bucket/:bucketName/detail/:pathMatch(.*)*',
        name: PAGE_TYPES.S3_OBJECT_LIST,
        component: async () => await import('@/views/S3ObjectListView.vue'),
      },
      {
        path: 'vm/list',
        name: PAGE_TYPES.VM_LIST,
        component: async () => await import('@/views/VmListView.vue'),
      },
      {
        path: 'vm/create',
        name: PAGE_TYPES.VM_CREATE,
        component: async () => await import('@/views/VmCreateView.vue'),
      },
      {
        path: 'vm/detail/:id',
        name: PAGE_TYPES.VM_DETAIL,
        component: async () => await import('@/views/VmDetailView.vue'),
      },
      {
        path: 'vm/keypair/list',
        name: PAGE_TYPES.VM_KEYPAIR_LIST,
        component: async () => await import('@/views/VmKeypairListView.vue'),
      },
      {
        path: 'vm/keypair/detail/:id',
        name: PAGE_TYPES.VM_KEYPAIR_DETAIL,
        component: async () => await import('@/views/VmKeypairDetailView.vue'),
      },
      {
        path: 'vm/image/list',
        name: PAGE_TYPES.VM_IMAGE_LIST,
        component: async () => await import('@/views/VmImageList.vue'),
      },
      {
        path: 'vm/image/create',
        name: PAGE_TYPES.VM_IMAGE_CREATE,
        component: async () => await import('@/views/VmImageCreate.vue'),
      },
      {
        path: 'vm/image/:repoId',
        name: PAGE_TYPES.VM_IMAGE_DETAIL,
        component: async () => await import('@/views/VmImageDetail.vue'),
      },
      {
        path: 'vm/volume/list',
        name: PAGE_TYPES.VM_VOLUME_LIST,
        component: async () => await import('@/views/VmVolumeListView.vue'),
      },
      {
        path: 'vm/volume/create',
        name: PAGE_TYPES.VM_VOLUME_CREATE,
        component: async () => await import('@/views/VmVolumeCreateView.vue'),
      },
      {
        path: 'vm/volume/detail/:id',
        name: PAGE_TYPES.VM_VOLUME_DETAIL,
        component: async () => await import('@/views/VmVolumeDetailView.vue'),
      },
      {
        path: 'vm/network/list',
        name: PAGE_TYPES.VM_NETWORK_LIST,
        component: async () => await import('@/views/VmNetworkListView.vue'),
      },
      {
        path: 'vm/network/create',
        name: PAGE_TYPES.VM_NETWORK_CREATE,
        component: async () => await import('@/views/VmNetworkCreateView.vue'),
      },
      {
        path: 'vm/network/detail/:id',
        name: PAGE_TYPES.VM_NETWORK_DETAIL,
        component: async () => await import('@/views/VmNetworkDetailView.vue'),
      },
      {
        path: 'vm/securityGroup/list',
        name: PAGE_TYPES.VM_SECURITY_GROUP_LIST,
        component: async () =>
          await import('@/views/VmSecurityGroupListView.vue'),
      },
      {
        path: 'vm/securityGroup/create',
        name: PAGE_TYPES.VM_SECURITY_GROUP_CREATE,
        component: async () =>
          await import('@/views/VmSecurityGroupCreateView.vue'),
      },
      {
        path: 'vm/securityGroup/:id/rules/:sgName',
        name: PAGE_TYPES.VM_SECURITY_GROUP_DETAIL,
        component: async () =>
          await import('@/views/VmSecurityGroupDetailView.vue'),
      },
      {
        path: 'vm/floatingIp/list',
        name: PAGE_TYPES.VM_FLOATING_IP_LIST,
        component: async () => await import('@/views/VmFloatingIPListView.vue'),
      },
      {
        path: 'vm/loadBalancer/list',
        name: PAGE_TYPES.VM_LOAD_BALANCER_LIST,
        component: async () =>
          await import('@/views/VmLoadBalancerListView.vue'),
      },
      {
        path: 'vm/loadBalancer/create',
        name: PAGE_TYPES.VM_LOAD_BALANCER_CREATE,
        component: async () =>
          await import('@/views/VmLoadBalancerCreateView.vue'),
      },
      {
        path: 'vm/loadBalancer/:loadBalancerId/listener/create',
        name: PAGE_TYPES.VM_LOAD_BALANCER_LISTENER_CREATE,
        component: async () =>
          await import('@/views/VmLoadBalancerListenerCreateView.vue'),
      },
      {
        path: 'vm/loadBalancer/:loadBalancerId/pool/create',
        name: PAGE_TYPES.VM_LOAD_BALANCER_POOL_CREATE,
        component: async () =>
          await import('@/views/VmLoadBalancerPoolCreateView.vue'),
      },
      {
        path: 'vm/loadBalancer/detail/:id',
        name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
        component: async () =>
          await import('@/views/VmLoadBalancerDetailView.vue'),
      },
      {
        path: 'vm/loadBalancer/:loadBalancerId/listener/:listenerId',
        name: PAGE_TYPES.VM_LOAD_BALANCER_LISTENER_DETAIL,
        component: async () =>
          await import('@/views/VmLoadBalancerListenerDetailView.vue'),
      },
      {
        path: 'vm/loadBalancer/:loadBalancerId/pool/:poolId',
        name: PAGE_TYPES.VM_LOAD_BALANCER_POOL_DETAIL,
        component: async () =>
          await import('@/views/VmLoadBalancerPoolDetailView.vue'),
      },
      {
        path: 'vm/autoScaling/list',
        name: PAGE_TYPES.VM_AUTO_SCALING_LIST,
        component: async () =>
          await import('@/views/VmAutoScalingListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.AUTO_SCALING,
        },
      },
      {
        path: 'vm/autoScaling/create',
        name: PAGE_TYPES.VM_AUTO_SCALING_CREATE,
        component: async () =>
          await import('@/views/VmAutoScalingCreateView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.AUTO_SCALING,
        },
      },
      {
        path: 'vm/autoScaling/detail/:id',
        name: PAGE_TYPES.VM_AUTO_SCALING_DETAIL,
        component: async () =>
          await import('@/views/VmAutoScalingDetailView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.AUTO_SCALING,
        },
      },
      {
        path: 'fileSharing/list',
        name: PAGE_TYPES.FILE_SHARING_LIST,
        component: async () => await import('@/views/FileSharingListView.vue'),
      },
      {
        path: 'fileSharing/create',
        name: PAGE_TYPES.FILE_SHARING_CREATE,
        component: async () =>
          await import('@/views/FileSharingCreateView.vue'),
      },
      {
        path: 'fileSharing/detail/:id',
        name: PAGE_TYPES.FILE_SHARING_DETAIL,
        component: async () =>
          await import('@/views/FileSharingDetailView.vue'),
      },
      {
        path: 'application/list',
        name: PAGE_TYPES.APPLICATION_LIST,
        component: async () => await import('@/views/ApplicationListView.vue'),
      },
      {
        path: 'application/create',
        name: PAGE_TYPES.APPLICATION_CREATE,
        component: async () =>
          await import('@/views/ApplicationCreateView.vue'),
      },
      {
        path: 'application/detail/:id',
        name: PAGE_TYPES.APPLICATION_DETAIL,
        component: async () =>
          await import('@/views/ApplicationDetailView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.APPLICATION,
        },
      },
      {
        path: 'hpcRemote/task/list',
        name: PAGE_TYPES.HPC_REMOTE_TASK_LIST,
        component: async () =>
          await import('@/views/HpcRemoteTaskListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.HPC_DELIVER,
        },
      },
      {
        path: 'hpcRemote/task/create',
        name: PAGE_TYPES.HPC_REMOTE_TASK_CREATE,
        component: async () =>
          await import('@/views/HpcRemoteTaskCreateView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.HPC_DELIVER,
        },
      },
      {
        path: 'hpcRemote/task/detail/:id',
        name: PAGE_TYPES.HPC_REMOTE_TASK_DETAIL,
        component: async () =>
          await import('@/views/HpcRemoteTaskDetailView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.HPC_DELIVER,
        },
      },
      {
        path: 'hpcRemote/image/list',
        name: PAGE_TYPES.HPC_REMOTE_IMAGE_LIST,
        component: async () =>
          await import('@/views/HpcRemoteImageListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.HPC_DELIVER,
        },
      },
      {
        path: 'hpcRemote/image/create',
        name: PAGE_TYPES.HPC_REMOTE_IMAGE_CREATE,
        component: async () =>
          await import('@/views/HpcRemoteImageCreateView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.HPC_DELIVER,
        },
      },
      {
        path: 'hpcRemote/data/list',
        name: PAGE_TYPES.HPC_REMOTE_DATA_LIST,
        component: async () =>
          await import('@/views/HpcRemoteDataListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.HPC_DELIVER,
        },
      },
      {
        path: 'hpcRemote/data/create',
        name: PAGE_TYPES.HPC_REMOTE_DATA_CREATE,
        component: async () =>
          await import('@/views/HpcRemoteDataCreateView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.HPC_DELIVER,
        },
      },
      {
        path: 'dataExchange/list',
        name: PAGE_TYPES.DATA_EXCHANGE_LIST,
        component: async () => await import('@/views/DataExchangeListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.DATA_EXCHANGE,
        },
      },
      {
        path: 'dataExchange/:bucketName/detail/:pathMatch(.*)*',
        name: PAGE_TYPES.DATA_EXCHANGE_CONTENT_LIST,
        component: async () =>
          await import('@/views/DataExchangeContentListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.DATA_EXCHANGE,
        },
      },
      {
        path: 'dataRelease/list',
        name: PAGE_TYPES.DATA_RELEASE_LIST,
        component: async () => await import('@/views/DataReleaseListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.DATA_RELEASE,
        },
      },
      {
        path: 'dataRelease/:bucketName/detail/:pathMatch(.*)*',
        name: PAGE_TYPES.DATA_RELEASE_CONTENT_LIST,
        component: async () =>
          await import('@/views/DataReleaseContentListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.DATA_RELEASE,
        },
      },
      {
        path: 'resourceTransfer/list',
        name: PAGE_TYPES.RESOURCE_TRANSFER_LIST,
        component: async () =>
          await import('@/views/ResourceTransferListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.RESOURCE_TRANSFER,
        },
      },
      {
        path: 'resourceTransfer/:resourceType/:serverId/list',
        name: PAGE_TYPES.RESOURCE_TRANSFER_DETAIL_LIST,
        component: async () =>
          await import('@/views/ResourceTransferDetailListView.vue'),
        meta: {
          serviceType: SERVICE_TYPES.RESOURCE_TRANSFER,
        },
      },
      {
        path: 'k8sCluster/list',
        name: PAGE_TYPES.K8S_CLUSTER_LIST,
        component: async () => await import('@/views/K8sListView.vue'),
      },
      {
        path: 'k8sCluster/create',
        name: PAGE_TYPES.K8S_CLUSTER_CREATE,
        component: async () => await import('@/views/K8sCreateView.vue'),
      },
      {
        path: 'k8sCluster/detail/:id',
        name: PAGE_TYPES.K8S_CLUSTER_DETAIL,
        component: async () => await import('@/views/K8sDetailView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: PAGE_TYPES.PAGE_NOT_FOUND,
    component: async () => await import('@/views/PageNotFoundView.vue'),
    meta: {
      disableBars: true,
      disableMenu: true,
      disableBreadcrumbs: true,
    },
  },
];

/** Vue Router */
const router: Router = createRouter({
  /**
   * History Mode
   *
   * @see {@link https://router.vuejs.org/guide/essentials/history-mode.html }
   */
  history: createWebHistory(import.meta.env.BASE_URL), // createWebHashHistory(import.meta.env.BASE_URL)
  /*
  scrollBehavior: (to, _from, savedPosition) => {
    let scrollTo: number | string = 0;

    if (to.hash) {
      scrollTo = to.hash;
    } else if (savedPosition) {
      scrollTo = savedPosition.top;
    }
    return goTo(scrollTo);
  },
  */
  routes,
});

// Global before guards
// https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards}
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    if (to.name === PAGE_TYPES.NOTIFICATION_REDIRECT) {
      next();
      return;
    }

    const globalStore = useGlobal();
    const userStore = useUser();
    const projectStore = useProject();

    if (!userStore.getCookiesInstance) {
      const $cookies = inject<VueCookies>('$cookies');
      userStore.setCookiesInstance($cookies);
    }

    const portalConfigStore = usePortalConfig();
    if (!portalConfigStore.getHasGottenConfigFromJson) {
      await portalConfigStore.getPortalConfig();
    }

    if (to.name === PAGE_TYPES.LOGIN) {
      if (to.query?.token) {
        await userStore.login({ token: to.query.token as string });
      } else if (to.query?.saat_token) {
        try {
          // 驗證 token
          await userStore.verifyToken(to.query.saat_token as string);
        } catch {
          // 如果驗證失敗，重新導向登入頁面
          removeAllCookies();
          next({ name: PAGE_TYPES.LOGIN });
          return;
        }
      }

      if (to.query?.project) {
        userStore.getCookiesInstance?.set(
          COOKIE_CONFIG.PROJECT.ID,
          to.query.project
        );
      }

      if (to.query?.mfa_token) {
        next();
        return;
      }
    }

    userStore.token = userStore.cookiesInstance?.get(COOKIE_CONFIG.TOKEN.NAME);

    if (!userStore.token) {
      if (to.name === PAGE_TYPES.LOGIN) {
        next();
        return;
      }

      next({ name: PAGE_TYPES.LOGIN });
      return;
    }

    if (!userStore.userInfo?.account) {
      await userStore.fetchUserSelfInfo(userStore.token);
    }

    if (userStore.userInfo?.account) {
      if (to.name === PAGE_TYPES.LOGIN) {
        next({ name: PAGE_TYPES.HOME });
        return;
      }
    }

    if (to.name !== PAGE_TYPES.LOGIN && !projectStore.getProjectList?.length) {
      await projectStore.fetchMyProjectList();

      const projectList = projectStore.getProjectList;

      if (projectList.length === 0) {
        await userStore.logout();
        next({ name: PAGE_TYPES.LOGIN });
        return;
      } else if (
        projectList.length === 1 &&
        projectList[0].name === 'administrator'
      ) {
        toAdminPanel();
      }
    }

    // Hide snack bar
    globalStore.setMessage('');

    if (sessionStorage.length) {
      next({ name: PAGE_TYPES.NOTIFICATION_REDIRECT });
      return;
    }

    const serviceAccess = getServiceAccess();
    const serviceType = to.meta.serviceType as string;
    const access = (serviceType && serviceAccess?.[serviceType]) ?? true;
    if (!access) {
      next({ name: PAGE_TYPES.HOME });
      return;
    }
    next();
  }
);

// Global After Hooks
// https://router.vuejs.org/guide/advanced/navigation-guards.html#global-after-hooks}
router.afterEach(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    const globalStore = useGlobal();
    const projectStore = useProject();
    if (
      to.name === PAGE_TYPES.HOME &&
      from.name &&
      from.name !== PAGE_TYPES.LOGIN
    ) {
      await projectStore.fetchMyProjectList();
    }
    // Hide Loading
    globalStore.setLoading(false);
  }
);

/*
const scrollBehavior = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  savedPosition: RouteLocation
): Promise<any> => {
  let scrollpos = {};
  if (to.hash) {
    scrollpos = {
      el: to.hash,
      behavior: 'smooth',
    };
  } else if (savedPosition) {
    scrollpos = savedPosition;
  } else {
    scrollpos = { top: 0 };
  }
  return await new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(scrollpos);
    }, 600);
  });
};
*/

export default router;
