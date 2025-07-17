<template>
  <v-container class="login-view d-flex justify-center align-center" fluid />
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('notification.warning.title')"
    :show-cancel-btn="false"
    :submit-btn-text="$t('basic.ok')"
    :submit-callback="() => userStore.logout()"
  >
    {{ $t('notification.warning.message') }}
  </CommonDialog>
</template>

<script lang="ts" setup>
import { useGlobal, useProject, useUser } from '@/store';
import { onMounted, onBeforeMount, onBeforeUnmount, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import CommonDialog from '@/components/common/CommonDialog.vue';
import {
  NOTIFICATION_SERVICE_TYPE,
  SESSION_STORAGE_KEY,
} from '@/constants/Notification';
import PAGE_TYPES from '@/constants/PAGE_TYPES';

const route = useRoute();
const router = useRouter();
const globalStore = useGlobal();
const userStore = useUser();
const projectStore = useProject();

const showDialog = ref(false);

onBeforeMount(() => {
  const {
    service_type: serviceType,
    project_id: projectId,
    ad,
    service_id: serviceId,
  } = route.query;

  if (serviceType) {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY.SERVICE_TYPE,
      serviceType as string
    );
  }
  if (projectId) {
    sessionStorage.setItem(SESSION_STORAGE_KEY.PROJECT_ID, projectId as string);
  }
  if (ad) {
    sessionStorage.setItem(SESSION_STORAGE_KEY.AD, ad as string);
  }
  if (serviceId) {
    sessionStorage.setItem(SESSION_STORAGE_KEY.SERVICE_ID, serviceId as string);
  }
});

onMounted(() => {
  globalStore.uiShowProgressDlg();
  void checkAccess();
});

onBeforeUnmount(() => {
  globalStore.uiHideProgressDlg();
});

const checkAccess = async () => {
  if (!userStore.token || !userStore.userInfo?.account) {
    // 尚未登入
    void router.push({ name: PAGE_TYPES.LOGIN });
    return;
  }

  const projectId = sessionStorage.getItem(SESSION_STORAGE_KEY.PROJECT_ID);
  const serviceType = sessionStorage.getItem(SESSION_STORAGE_KEY.SERVICE_TYPE);
  const serviceId = sessionStorage.getItem(SESSION_STORAGE_KEY.SERVICE_ID);
  const ad = sessionStorage.getItem(SESSION_STORAGE_KEY.AD);

  let routerName = PAGE_TYPES.HOME;
  let params;
  let query;

  if (projectId && serviceType) {
    globalStore.updateResourceRegion(ad ?? '');

    await projectStore.fetchMyProjectList();

    const matchProject = projectStore.getProjectList.find(
      prj => prj.id === projectId
    );

    if (matchProject) {
      projectStore.setCurrentProject(matchProject);
    }

    if (!matchProject || !projectStore.isTenantAdmin) {
      // 已登入, 但帳號權限不符 (不具此專案的專案管理者身分)
      globalStore.uiHideProgressDlg();
      showDialog.value = true;
      return;
    }

    // 已登入且帳號符合權限 => 跳轉至相對應的服務頁面
    switch (serviceType?.toUpperCase()) {
      case NOTIFICATION_SERVICE_TYPE.CKS:
        routerName = PAGE_TYPES.K8S_CLUSTER_DETAIL;
        params = { id: serviceId };
        break;
      case NOTIFICATION_SERVICE_TYPE.CKS_ADD_NODE:
        routerName = PAGE_TYPES.K8S_CLUSTER_DETAIL;
        params = { id: serviceId };
        query = { defaultTabIndex: 1 };
        break;
      case NOTIFICATION_SERVICE_TYPE.APS:
        routerName = PAGE_TYPES.APPLICATION_DETAIL;
        params = { id: serviceId };
        break;
      case NOTIFICATION_SERVICE_TYPE.VPS_ASG:
        routerName = PAGE_TYPES.VM_AUTO_SCALING_DETAIL;
        params = { id: serviceId };
        break;
      case NOTIFICATION_SERVICE_TYPE.VPS_VM:
        routerName = PAGE_TYPES.VM_DETAIL;
        params = { id: serviceId };
        break;
      case NOTIFICATION_SERVICE_TYPE.VPS_FIP:
        routerName = PAGE_TYPES.VM_FLOATING_IP_LIST;
        break;
    }
  }
  sessionStorage.clear();
  void router.push({ name: routerName, params, query });
};

watch(route, () => {
  void checkAccess();
});
</script>

<style scoped>
.login-view {
  height: 100%;
  background-image: url('../assets/images/loading_page_bg.png');
  background-size: cover;
}
</style>
