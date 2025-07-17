<script lang="ts" setup>
import { useGlobal, useProject } from '@/store';
import { computed, onMounted, ref, type Ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  CLUSTER_STATUS,
  deleteK8sCluster,
  fetchK8sClusters,
  fetchK8sVersionList,
  makeApiCall,
  reviewK8sCluster,
} from '@/api';
import K8sAddNodeDialog from '@/components/K8sAddNodeDialog.vue';
import K8sLogViewer from '@/components/K8sLogViewer.vue';
import K8sUpgradeDialog from '@/components/K8sUpgradeDialog.vue';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import TD from '@/components/TdHighlight.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useK8sCluster from '@/composables/useK8sCluster';
import useProjectSwitch from '@/composables/useProjectSwitch';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  ActionType,
  MainActionType,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import { getDeepObj } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const { toDetailPage, compileApiEndpoint } = useK8sCluster(
  PAGE_TYPES.K8S_CLUSTER_LIST
);
const { t } = i18n.global;
const { triggerSnackbarCopied } = useGlobal();
const router = useRouter();
const projectStore = useProject();

const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const searchStr: Ref<string> = ref('');
const clusterList: Ref<Record<string, any>[]> = ref([]);
const versionList: Ref<string[]> = ref([]);
const clusterName: Ref<string> = ref('');
const clusterId: Ref<string> = ref('');
const clusterVersion: Ref<string> = ref('');
const workerCount: Ref<number> = ref(0);
const showAddNodeDialog = ref(false);
const showViewLogDialog = ref(false);
const showUpgradeDialog = ref(false);
const showAdminReviewDialog = ref(false);
const approve = ref(false);
const projectId = computed(() => projectStore.getCurrentProject?.id);

const isAdmin = computed(() => {
  return projectStore.isTenantAdmin;
});

const getClusterList = computed(() => {
  clusterList.value.forEach((cluster: any) => {
    cluster.apiEndpoint = getApiEndpoint(cluster);
  });
  return clusterList.value;
});

const getApiEndpoint = (cluster: any) => {
  return compileApiEndpoint(cluster);
};

const linkUrl = computed(() => {
  return Document.K8S_CLUSTER;
});

const noDataSetting = computed(() =>
  getNoDataSetting(PAGE_TYPES.K8S_CLUSTER_LIST)
);

const headers = computed(() => getTableHeaders(PAGE_TYPES.K8S_CLUSTER_LIST));

const toCreatePage = async () =>
  await router.push({ name: PAGE_TYPES.K8S_CLUSTER_CREATE });

onMounted(async () => {
  await fetchData();
});

const fetchData = async () => {
  isLoading.value = true;
  clusterList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchK8sClusters,
  });
  clusterList.value.forEach((cluster: any) => {
    cluster.status = cluster.clusterStatus =
      cluster.reviewStatus || cluster.clusterStatus;
  });

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const checkDeleteActionEnable = (item: any) => {
  const disableStatus = [
    CLUSTER_STATUS.CREATING,
    CLUSTER_STATUS.UPDATING,
    CLUSTER_STATUS.DELETING,
    CLUSTER_STATUS.CREATE_DELETED,
  ];
  return !disableStatus.includes(item.clusterStatus as string);
};

const checkLogActionEnable = (item: any) => {
  const disableStatus = [
    CLUSTER_STATUS.UNDER_REVIEW,
    CLUSTER_STATUS.REJECTED,
    CLUSTER_STATUS.CREATING,
    CLUSTER_STATUS.CREATE_FAILED,
    CLUSTER_STATUS.CREATE_REJECTED,
    CLUSTER_STATUS.CREATE_DELETED,
  ];
  return !disableStatus.includes(item.clusterStatus as string);
};

const handleOpenUpgradeDialog = async (item: any) => {
  clusterVersion.value = item.k8sVersion;
  clusterId.value = item.id;

  const vList: [{ version: string }] = await makeApiCall({
    apiCallFn: fetchK8sVersionList,
    progressMessage: t('k8s.upgrade'),
  });
  versionList.value = vList.map(v => v.version);

  showUpgradeDialog.value = true;
};

const handleDeleteCluster = async (item: any) => {
  const isPending = item.clusterStatus === CLUSTER_STATUS.UNDER_REVIEW;
  const isRejected = item.clusterStatus === CLUSTER_STATUS.REJECTED;

  if (isPending || isRejected) {
    makeApiCall({
      skipProgress: true,
      apiCallFn: reviewK8sCluster,
      payload: {
        clusterId: item.id,
        body: {
          action: isPending ? 'delete-required' : 'delete-rejected',
        },
      },
      successCallback: async () => await fetchData(),
    });
  } else {
    await makeApiCall({
      skipProgress: true,
      apiCallFn: deleteK8sCluster,
      payload: {
        clusterId: item.id,
      },
      successCallback: async () => await fetchData(),
    });
  }
};

const handleAdminReview = async () => {
  await makeApiCall({
    apiCallFn: reviewK8sCluster,
    payload: {
      clusterId: clusterId.value,
      body: {
        action: approve.value ? 'approve' : 'reject',
      },
    },
  });
  await fetchData();
};

const copyId = (id: string) => {
  void navigator.clipboard.writeText(id);
  triggerSnackbarCopied();
};

const handleCopy = (e: { stopPropagation: () => void }, value: string) => {
  e.stopPropagation();
  void navigator.clipboard.writeText(value);
  triggerSnackbarCopied();
};

watch(projectId, () => {
  void fetchData();
  setProjectSwitchCallback(async () => await fetchData());
});

watch(showAddNodeDialog, newVal => {
  if (!newVal) {
    clusterName.value = '';
    clusterId.value = '';
    workerCount.value = 0;
  }
});

watch(showAdminReviewDialog, newVal => {
  if (!newVal) {
    approve.value = false;
    clusterName.value = '';
  }
});

watch(showUpgradeDialog, newVal => {
  if (!newVal) {
    clusterName.value = '';
    clusterId.value = '';
    clusterVersion.value = '';
  }
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', { type: $t('services.k8sCluster') })
        "
        :link-url="linkUrl"
      />
      <GeneralDataTable
        :main-action-list="[
          {
            type: MainActionType.CREATE,
            action: toCreatePage,
          },
        ]"
        :more-action-list="[
          {
            label: $t('k8s.addNode'),
            visible: item => {
              return item.clusterStatus === CLUSTER_STATUS.READY;
            },
            action: item => {
              clusterName = item.name;
              clusterId = item.id;
              workerCount = item.workerCount;
              showAddNodeDialog = true;
            },
          },
          {
            label: $t('k8s.upgrade'),
            disabled: item => {
              return item.clusterStatus !== CLUSTER_STATUS.READY;
            },
            action: item => {
              void handleOpenUpgradeDialog(item);
            },
          },
          {
            label: $t('action.copyId'),
            action: item => copyId(item.id),
          },
          {
            label: $t('k8s.viewLog'),
            disabled: item => !checkLogActionEnable(item),
            action: item => {
              clusterId = item.id;
              showViewLogDialog = true;
            },
          },
          {
            label: $t('k8s.review'),
            visible: item => {
              const isPending =
                item.clusterStatus === CLUSTER_STATUS.UNDER_REVIEW;
              return isAdmin && isPending;
            },
            action: item => {
              clusterId = item.id;
              clusterName = item.clusterName;
              showAdminReviewDialog = true;
            },
          },
          {
            type: ActionType.DELETE,
            resourceType: $t('services.k8sCluster'),
            message: $t('dialog.delete.message.type', {
              type: $t('services.k8sCluster'),
            }),
            disabled: item => !checkDeleteActionEnable(item),
            action: item => handleDeleteCluster(item),
          },
        ]"
        :resource-info="[
          {
            title: $t('label.name'),
            keyOfvalue: 'clusterName',
          },
        ]"
        :items="getClusterList"
        :last-updated-time="lastUpdatedTime"
        :table-headers="headers"
        :table-item-key="'clusterName'"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :disable-batch="true"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'createdAt',
          isDescending: true,
        }"
        @fetch-data="fetchData"
        @on-row-click="item => toDetailPage(item.id)"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :search="searchStr"
            :is-status="header.isStatus"
            :use-date-filter="header.useDateFilter"
          >
            <v-icon
              v-if="
                header.key === 'apiEndpoint' && getDeepObj(item, header.key)
              "
              class="ml-4"
              @click="handleCopy($event, getDeepObj(item, header.key))"
            >
              mdi-content-copy
            </v-icon>
          </TD>
        </template>
      </GeneralDataTable>
    </v-row>
    <K8sAddNodeDialog
      v-model:show="showAddNodeDialog"
      :cluster-name="clusterName"
      :cluster-id="clusterId"
      :worker-count="workerCount"
      @add-node-group="fetchData"
    />
    <K8sLogViewer v-model:show="showViewLogDialog" :cluster-id="clusterId" />
    <K8sUpgradeDialog
      v-model:show="showUpgradeDialog"
      :cluster-id="clusterId"
      :current-version="clusterVersion"
      :k8s-versions="versionList"
      @upgrade="fetchData"
      @close-dialog="() => (showUpgradeDialog = false)"
    />
    <CommonDialog
      v-model:show="showAdminReviewDialog"
      :title="$t('dialog.review.title', { resource: t('services.k8sCluster') })"
      :show-cancel-btn="true"
      :disable-submit="!isAdmin"
      :submit-callback="handleAdminReview"
    >
      <v-row no-gutters>
        <v-col cols="3" class="pa-0 ocis-form-title">
          {{ $t('basic.name') }}
        </v-col>
        <v-col cols="9" class="pa-0 align-self-center">
          {{ clusterName }}
        </v-col>
      </v-row>
      <RadioButtonSwitch
        :title="$t('k8s.review.resource')"
        :options="[
          { label: $t('basic.accept'), value: true },
          { label: $t('basic.reject'), value: false },
        ]"
        :init-value="approve"
        is-required
        @selected="value => (approve = value)"
      />
    </CommonDialog>
  </UiContainer>
</template>
