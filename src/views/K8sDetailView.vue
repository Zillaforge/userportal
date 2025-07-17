<script lang="ts" setup>
import { useGlobal, useProject } from '@/store';
import { computed, onBeforeMount, onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';

import download from 'downloadjs';

import {
  CLUSTER_STATUS,
  deleteK8sCluster,
  deleteK8sNodeGroup,
  fetchK8sClusterDetail,
  fetchK8sFlavorList,
  fetchK8sKubeconfig,
  fetchK8sVersionList,
  fetchNgList,
  fetchSgList,
  makeApiCall,
  reviewK8sCluster,
  reviewK8sNodeGroup,
  updateK8sCluster,
  updateK8sNodeGroup,
} from '@/api';
import K8sAddNodeDialog from '@/components/K8sAddNodeDialog.vue';
import K8sLogViewer from '@/components/K8sLogViewer.vue';
import K8sMonitorViewer from '@/components/K8sMonitorViewer.vue';
import K8sUpgradeDialog from '@/components/K8sUpgradeDialog.vue';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';
import TableMainActionBtn from '@/components/common/TableMainActionBtn.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useAutoReload from '@/composables/useAutoReload';
import useK8sCluster from '@/composables/useK8sCluster';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import * as K8s from '@/interfaces/K8sInterface';
import router from '@/router';
import { formatDateSec } from '@/utils/utils';

interface Flavor {
  id: string;
  name: string;
  vcpu: string;
  gpu?: string;
  memory: string;
}

const { setAutoReload } = useAutoReload();
const { setProjectSwitchCallback } = useProjectSwitch();
const { openDeleteDialog, triggerSnackbarCopied, getIsPilotRegion } =
  useGlobal();
const { toListPage, compileApiEndpoint, defaultItem, RANGE } = useK8sCluster(
  PAGE_TYPES.K8S_CLUSTER_CREATE
);
const { t, tc } = i18n.global;
const projectStore = useProject();
const route = useRoute();

const tabs = computed(() =>
  getIsPilotRegion
    ? [t('basic.overview'), t('k8s.workerNode.group')]
    : [t('basic.overview'), t('k8s.workerNode.group'), t('basic.monitoring')]
);

const tabIndex: Ref<number> = ref(0);
const lastUpdatedTime: Ref<Date | string> = ref('');
const clusterDetail = ref<Record<string, any>>({
  id: '',
  clusterStatus: '',
  k8sVersion: '',
});
const sgList = ref<{ id: string; name: string }[]>([]);
const selectedSgs = ref<{ sg: Record<string, any> | undefined }[]>([
  { sg: undefined },
]);
const editingNg = ref<K8s.EditNg>(defaultItem.editNg);
const editingNgCountError = ref('');
const flavorList: Ref<Flavor[]> = ref([]);
const ngList: Ref<Record<string, any>[]> = ref([]);
const k8sVersionList: Ref<{ version: string }[]> = ref([]);
const approve = ref<boolean>(false);
const showAddNgDialog = ref(false);
const showEditSgDialog = ref(false);
const showEditNgDialog = ref(false);
const showUpgradeDialog = ref(false);
const showDownloadConfigDialog = ref(false);
const showViewLogDialog = ref(false);
const kubeconfig = ref('');

lastUpdatedTime.value = new Date();

const isAdmin = computed(() => {
  return projectStore.isTenantAdmin;
});

const isPending = computed(() => {
  return clusterDetail.value.clusterStatus === CLUSTER_STATUS.UNDER_REVIEW;
});

const isRejected = computed(() => {
  return clusterDetail.value.clusterStatus === CLUSTER_STATUS.REJECTED;
});

const isReady = computed(() => {
  return clusterDetail.value.clusterStatus === CLUSTER_STATUS.READY;
});

const checkUpgradeBtn = computed(() => {
  return isReady.value;
});

const checkReviewBtn = computed(() => {
  return isAdmin.value && isPending.value;
});

const checkNgEditCountEnable = (ng: any) => {
  const isMaster = ng.isDefaultNodegroup;
  const isClusterReady =
    clusterDetail.value.clusterStatus === CLUSTER_STATUS.READY;
  const isNgReady = ng.status === CLUSTER_STATUS.READY;
  return !isMaster && isClusterReady && isNgReady;
};

const checkNgReviewEnable = (ng: any) => {
  const isNgUnderReview = ng.reviewStatus === CLUSTER_STATUS.UNDER_REVIEW;
  return isAdmin.value && isNgUnderReview;
};

const checkNgDeleteEnable = (ng: any) => {
  const isMaster = ng.isDefaultNodegroup;
  const isClusterReady =
    clusterDetail.value.clusterStatus === CLUSTER_STATUS.READY;
  const isNgReady = ng.status === CLUSTER_STATUS.READY;
  return !isMaster && isClusterReady && isNgReady;
};

const checkMonitorEnable = computed(() => {
  const disableStatus = [CLUSTER_STATUS.CREATING, CLUSTER_STATUS.DELETING];
  return !disableStatus.includes(clusterDetail.value.clusterStatus as string);
});

const detailBtns = computed(() => {
  const reviewBtn = {
    text: tc('basic.review', 2),
    icon: 'menu_icon_review',
    isSvgIcon: true,
    visible: isAdmin.value,
    disabled: !isAdmin.value,
    action: () => {
      showAdminReviewDialog.value = true;
    },
  };
  return [
    {
      text: t('k8s.upgrade.version'),
      visible: true,
      disabled: !checkUpgradeBtn.value,
      icon: 'mdi-arrow-collapse-up',
      action: async () => {
        k8sVersionList.value = await makeApiCall({
          apiCallFn: fetchK8sVersionList,
          progressMessage: t('k8s.upgrade'),
        });
        showUpgradeDialog.value = true;
      },
    },
    {
      text: t('table.action.log'),
      visible: true,
      disabled: !checkLogEnable(),
      icon: 'menu_icon_log',
      isSvgIcon: true,
      action: () => {
        showViewLogDialog.value = true;
      },
    },
    ...(checkReviewBtn.value ? [reviewBtn] : []),
    {
      text: t('table.action.delete'),
      icon: 'mdi-delete-outline',
      visible: true,
      disabled: !checkDeleteClusterEnable(),
      single: true,
      action: () =>
        openDeleteDialog({
          item: {
            ...clusterDetail,
            name: clusterDetail.value.clusterName,
          },
          resourceType: t('services.k8sCluster'),
          message: t('dialog.delete.message.type', {
            type: t('services.k8sCluster'),
          }),
          deleteAction: () => {
            void handleDeleteCluster();
          },
        }),
    },
    {
      text: t('table.action.refresh'),
      icon: 'mdi-refresh',
      visible: true,
      single: true,
      action: () => {
        void handleReload();
        lastUpdatedTime.value = new Date();
      },
    },
  ];
});

const ngTabBtns = computed(() => {
  return [
    {
      text: t('table.action.refresh'),
      icon: 'mdi-refresh',
      isSvgIcon: false,
      visible: true,
      single: true,
      action: () => {
        void handleReload();
        lastUpdatedTime.value = new Date();
      },
    },
  ];
});

const addNgBtn = computed(() => {
  return [
    {
      disabled: !checkAddNgEnable.value,
      icon: 'mdi-plus',
      label: t('table.action.create'),
      action: () => {
        showAddNgDialog.value = true;
      },
    },
  ];
});

const panelsTab1 = computed(() => {
  return [
    { title: t('label.basicInfo'), value: 'basicInfo' },
    { title: t('label.networkInfo'), value: 'networkInfo' },
  ];
});

const panelsTab2 = computed(() => {
  return [
    { title: t('k8s.workerNode.group'), value: 'workerGroup' },
    { title: t('basic.list.type', { type: t('k8s.review') }), value: 'review' },
  ];
});

const getNgHeaders = (isReview = false) => {
  const reviewCol = {
    title: t('label.serviceState', { type: t('k8s.review') }),
    value: 'reviewStatus',
    isStatus: true,
  };
  return [
    {
      title: t('label.name'),
      value: 'name',
    },
    {
      title: t('basic.type'),
      value: 'flavor.type',
    },
    {
      title: `GPU (${t('flavor.pcs')})`,
      value: 'flavor.gpu.count',
      unit: '(GB)',
    },
    {
      title: `CPU (${t('flavor.cores')})`,
      value: 'flavor.cpu',
      unit: '(GB)',
    },
    {
      title: `${t('creditCalculation.memory')} (GB)`,
      value: 'flavor.mem',
      unit: '(GB)',
    },
    ...(isReview ? [reviewCol] : []),
    {
      title: t('basic.quantity'),
      value: 'nodeCount',
    },
  ];
};

const showNeedReviewDialog: Ref<boolean> = ref(false);
const showAdminReviewDialog: Ref<boolean> = ref(false);
const showAdminReviewNgDialog: Ref<boolean> = ref(false);

const underReviewState: Ref<string[]> = ref([
  CLUSTER_STATUS.REJECTED,
  CLUSTER_STATUS.UNDER_REVIEW,
]);

onBeforeMount(() => {
  if (route.query.defaultTabIndex) {
    tabIndex.value = Number(route.query.defaultTabIndex);
    void router.replace({ query: {} });
  }
});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(() => toListPage());
  setAutoReload(clusterDetail, fetchData, [
    CLUSTER_STATUS.CREATING,
    CLUSTER_STATUS.UPDATING,
    CLUSTER_STATUS.DELETING,
  ]);
});

const fetchData = async (showProgress: boolean = false) => {
  // isLoading.value = true;
  clusterDetail.value = await makeApiCall({
    skipProgress: !showProgress,
    apiCallFn: fetchK8sClusterDetail,
    payload: { clusterId: route.params.id },
    errorCallback: () => {
      toListPage();
    },
  });

  clusterDetail.value.status = clusterDetail.value.clusterStatus;

  clusterDetail.value.clusterStatus =
    clusterDetail.value.reviewStatus || clusterDetail.value.clusterStatus;

  flavorList.value = await makeApiCall({
    skipProgress: !showProgress,
    apiCallFn: fetchK8sFlavorList,
  });

  ngList.value = await makeApiCall({
    skipProgress: !showProgress,
    apiCallFn: fetchNgList,
    payload: { clusterId: route.params.id },
  });

  ngList.value = ngList.value
    .map(ng => {
      const match = flavorList.value.find(flavor => ng.flavorId === flavor.id);
      return {
        ...ng,
        flavor: {
          type: match?.name ?? '',
          cpu: match?.vcpu ?? '',
          gpu: match?.gpu ?? '',
          mem: Number(match?.memory ?? 0) / 1024,
        },
      };
    })
    .filter((ng: any) => {
      return !ng.isDefaultNodegroup;
    });

  lastUpdatedTime.value = new Date();
};

const getNgList = computed(() => {
  return ngList.value
    .filter((ng: { reviewStatus?: string }) => {
      return !underReviewState.value.includes(ng.reviewStatus ?? '');
    })
    .filter((ng: any) => {
      return ng.status === CLUSTER_STATUS.READY;
    });
});

const getNgReviewList = computed(() => {
  return ngList.value.filter((ng: { reviewStatus?: string }) => {
    return underReviewState.value.includes(ng.reviewStatus ?? '');
  });
});

const getVersionList = computed(() => {
  return k8sVersionList.value
    .map(el => el.version)
    .sort((a, b) => (a > b ? 1 : -1))
    .reverse();
});

const getApiEndpoint = computed(() => {
  return compileApiEndpoint(clusterDetail.value);
});

const getClusterSgList = computed(() => {
  if (clusterDetail.value?.securityGroups) {
    return clusterDetail.value.securityGroups;
  } else {
    return [];
  }
});

const getSgList = computed(() => {
  return sgList.value.map(sg => {
    return {
      id: sg.id,
      name: sg.name,
    };
  });
});

// Sg Options. Without duplicated selection.
const getSgOptions = computed(() => {
  return getSgList.value.filter(sg => {
    const match = selectedSgs.value.find(select => {
      return select?.sg?.id === sg.id;
    });
    return !match;
  });
});

const getSelectedSgList = computed(() => {
  const validSgList: any[] = [];
  selectedSgs.value.forEach(sg => {
    if ((sg?.sg?.id ?? '') !== '') {
      validSgList.push(sg.sg);
    }
  });
  return validSgList;
});

const getHostsList = computed(() => {
  return clusterDetail.value?.nodes || [];
});

const checkLogEnable = () => {
  if (!clusterDetail.value?.clusterStatus) {
    return false;
  }

  const disableStatus = [
    CLUSTER_STATUS.UNDER_REVIEW,
    CLUSTER_STATUS.REJECTED,
    CLUSTER_STATUS.CREATING,
    CLUSTER_STATUS.CREATE_FAILED,
    CLUSTER_STATUS.CREATE_REJECTED,
    CLUSTER_STATUS.CREATE_DELETED,
    CLUSTER_STATUS.DELETE_COMPLETE,
    undefined,
  ];
  return !disableStatus.includes(clusterDetail.value.clusterStatus as string);
};

const checkDeleteClusterEnable = () => {
  const disableStatus = [
    CLUSTER_STATUS.CREATING,
    CLUSTER_STATUS.UPDATING,
    CLUSTER_STATUS.DELETING,
    CLUSTER_STATUS.DELETE_COMPLETE,
    CLUSTER_STATUS.CREATE_DELETED,
    undefined,
  ];
  if (
    clusterDetail.value.status === CLUSTER_STATUS.CREATE_DELETED ||
    clusterDetail.value.status === CLUSTER_STATUS.DELETE_COMPLETE
  ) {
    return false;
  } else {
    return !disableStatus.includes(clusterDetail.value.clusterStatus as string);
  }
};

const checkConfigEnable = computed(() => {
  const downloaded = clusterDetail.value?.isKubeconfigDownload ?? true;
  const ready = clusterDetail.value?.clusterStatus === CLUSTER_STATUS.READY;
  return !downloaded && ready;
});

const checkEditSgEnable = computed(() => {
  return clusterDetail.value.clusterStatus === CLUSTER_STATUS.READY;
});

const checkAddSgBtnEnable = computed(() => {
  return (
    getSgOptions.value.length >
    selectedSgs.value.length - getSelectedSgList.value.length
  );
});

const checkSubmitSgBtnEnable = computed(() => {
  const editSgCount: number = getSelectedSgList.value.length;
  return editSgCount > 0;
});

const checkSubmitNgBtnEnable = computed(() => {
  const newCount: number = Number(editingNg.value.newCount);
  return (
    newCount >= RANGE.MIN && newCount <= RANGE.MAX && !editingNgCountError.value
  );
});

const checkAddNgEnable = computed(() => {
  return clusterDetail.value.clusterStatus === CLUSTER_STATUS.READY;
});

const handleReload = async () => {
  await fetchData(true);
};

const handleDeleteCluster = async () => {
  if (isPending.value || isRejected.value) {
    makeApiCall({
      apiCallFn: reviewK8sCluster,
      payload: {
        clusterId: route.params.id,
        body: {
          action: isPending.value ? 'delete-required' : 'delete-rejected',
        },
      },
      successCallback: async () => toListPage(),
    });
  } else {
    await makeApiCall({
      apiCallFn: deleteK8sCluster,
      payload: {
        clusterId: route.params.id,
      },
      successCallback: async () => toListPage(),
    });
  }
};

const handleDeleteNg = async (ng: any) => {
  await makeApiCall({
    apiCallFn: deleteK8sNodeGroup,
    payload: {
      nodeGroupId: ng.id,
    },
    successCallback: async () => await fetchData(),
  });
};

const handleDeleteReviewNg = async (ng: any) => {
  const isNgUnderReview = ng.reviewStatus === CLUSTER_STATUS.UNDER_REVIEW;
  makeApiCall({
    apiCallFn: reviewK8sNodeGroup,
    payload: {
      nodeGroupId: ng.id,
      body: {
        action: isNgUnderReview ? 'delete-required' : 'delete-rejected',
      },
    },
    successCallback: async () => await fetchData(),
  });
};

const handleSubmitReviewCluster = async () => {
  await makeApiCall({
    apiCallFn: reviewK8sCluster,
    payload: {
      clusterId: route.params.id,
      body: {
        action: approve.value ? 'approve' : 'reject',
      },
    },
  });
  await fetchData();
};

const handleSubmitReviewNg = async () => {
  await makeApiCall({
    apiCallFn: reviewK8sNodeGroup,
    payload: {
      nodeGroupId: editingNg.value.id,
      body: {
        action: approve.value ? 'approve' : 'reject',
      },
    },
  });
  await fetchData();
};

const handleDownloadConfig = async () => {
  if (!kubeconfig.value) {
    kubeconfig.value = await makeApiCall({
      apiCallFn: fetchK8sKubeconfig,
      payload: {
        clusterId: route.params.id,
      },
    });
  }
  void download(kubeconfig.value, 'kubeconfig', 'text/plain');
};

const handleCloseDownloadConfig = () => {
  showDownloadConfigDialog.value = false;
  if (kubeconfig.value) {
    clusterDetail.value.isKubeconfigDownload = true;
    kubeconfig.value = '';
    void fetchData();
  }
};

const handleOpenEditNgDialog = async (ng: any) => {
  editingNg.value = {
    name: ng.name,
    id: ng.id,
    count: Number(ng.nodeCount),
    newCount: Number(ng.nodeCount),
  };
  showEditNgDialog.value = true;
};

const handleOpenReviewNgDialog = async (ng: any) => {
  editingNg.value = {
    name: ng.name,
    id: ng.id,
  };
  showAdminReviewNgDialog.value = true;
};

const handleOpenEditSgDialog = async () => {
  selectedSgs.value = [];
  getClusterSgList.value.forEach((sg: any) => {
    selectedSgs.value.push({
      sg: {
        id: sg.id,
        name: sg.name,
      },
    });
  });

  sgList.value = await makeApiCall({
    apiCallFn: fetchSgList,
  });
  showEditSgDialog.value = true;
};

const handleCloseEditSgDialog = () => {
  showEditSgDialog.value = false;
  selectedSgs.value = [];
  void fetchData();
};

const handleCloseEditNgDialog = () => {
  showEditNgDialog.value = false;
  editingNg.value = defaultItem.editNg;
};

const handleSubmitEditSg = async () => {
  const updateSgIdList = selectedSgs.value.map((sg: any) => sg?.sg?.id);
  await makeApiCall({
    apiCallFn: updateK8sCluster,
    payload: {
      clusterId: route.params.id,
      body: {
        securityGroupIds: updateSgIdList,
      },
    },
  });
  handleCloseEditSgDialog();
};

const handleSubmitEditNg = async () => {
  const newCount = Number(editingNg.value.newCount);
  await makeApiCall({
    apiCallFn: updateK8sNodeGroup,
    payload: {
      nodeGroupId: editingNg.value.id,
      body: {
        nodeCount: newCount,
      },
    },
    successCallback: async (res: any) => {
      if (res?.reviewStatus === CLUSTER_STATUS.UNDER_REVIEW) {
        showNeedReviewDialog.value = true;
      }
      void fetchData();
    },
  });
  handleCloseEditNgDialog();
};

const handleCopy = (value: string) => {
  void navigator.clipboard.writeText(value);
  triggerSnackbarCopied();
};
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $tc('basic.detail.type', { type: `${$t('services.k8sCluster')}` })
        "
      />
      <TabsComponent v-model="tabIndex" :tab-names="tabs" :is-card-style="true">
        <template #tab-0>
          <v-card>
            <v-card-title class="pa-2">
              <DetailActionBtn
                v-for="item in detailBtns"
                :key="item.text"
                :btn="item"
                :btn-tips="item.text"
                :btn-icon="item.icon"
                :is-svg-icon="item.isSvgIcon || false"
                :last-updated-time="lastUpdatedTime"
                @item-click="item.action"
              />
              <span class="ocis-last-updated-time pt-4 pr-4">
                {{ $t('label.lastUpdated') }}
                {{ formatDateSec(lastUpdatedTime) }}
              </span>
            </v-card-title>
            <v-card-text class="ocis-detail-scroll-view">
              <DetailPanelGroup v-model="panelsTab1">
                <DetailPanel
                  :title="panelsTab1[0].title"
                  :value="panelsTab1[0].value"
                >
                  <v-row no-gutters>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('label.name')"
                        :content="clusterDetail?.clusterName"
                      />
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('label.serviceState')"
                        :content="clusterDetail.clusterStatus"
                        :is-status="true"
                        :status-hint="clusterDetail.statusReason"
                      />
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('basic.desc')"
                        :content="clusterDetail.description"
                      >
                        <!--                        <OutlinedBtn-->
                        <!--                          :class="sgList.length ? 'ml-2' : ''"-->
                        <!--                          :text="$t('basic.modify.type')"-->
                        <!--                          @click="showDownloadKubeDialog = true"-->
                        <!--                        />-->
                      </DetailItem>
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('label.createdAt')"
                        :content="clusterDetail.createdAt"
                        :is-date-string="true"
                      />
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('k8s.version')"
                        :content="clusterDetail?.k8sVersion"
                      />
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('label.createdBy')"
                        :content="clusterDetail?.user?.name"
                      />
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('k8s.masterNode.number')"
                        :content="clusterDetail.masterCount"
                      />
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('label.lastModified.at')"
                        :content="clusterDetail.updatedAt"
                        :is-date-string="true"
                      />
                    </v-col>
                  </v-row>
                </DetailPanel>
                <DetailPanel
                  :title="panelsTab1[1].title"
                  :value="panelsTab1[1].value"
                >
                  <v-row no-gutters>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('virtualNetwork.name')"
                        :content="clusterDetail.networkName"
                      />
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem :title="t('services.securityGroup')">
                        <v-chip
                          v-for="sg in getClusterSgList"
                          :key="`sg-${sg.name}`"
                          class="mr-2"
                        >
                          <span>{{ sg.name }}</span>
                        </v-chip>
                        <OutlinedBtn
                          :class="getClusterSgList.length ? 'ml-2' : ''"
                          :text="$t('basic.modify.type')"
                          :disabled="!checkEditSgEnable"
                          @click="handleOpenEditSgDialog"
                        />
                      </DetailItem>
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem
                        :title="t('k8s.network.apiServer.endpoint')"
                        :content="getApiEndpoint"
                      >
                        <v-icon
                          v-if="getApiEndpoint"
                          class="ml-4"
                          @click="handleCopy(getApiEndpoint)"
                        >
                          mdi-content-copy
                        </v-icon>
                      </DetailItem>
                    </v-col>
                    <v-col cols="6" class="pb-4">
                      <DetailItem :title="'kubeconfig'">
                        <OutlinedBtn
                          :text="$t('basic.download')"
                          :disabled="!checkConfigEnable"
                          @click="showDownloadConfigDialog = true"
                        />
                      </DetailItem>
                    </v-col>
                  </v-row>
                </DetailPanel>
              </DetailPanelGroup>
            </v-card-text>
          </v-card>
        </template>
        <template #tab-1>
          <v-card>
            <v-card-title class="pa-2">
              <DetailActionBtn
                v-for="item in ngTabBtns"
                :key="item.text"
                :btn="item"
                :btn-tips="item.text"
                :btn-icon="item.icon"
                :is-svg-icon="item.isSvgIcon || false"
                :last-updated-time="lastUpdatedTime"
                @item-click="item.action"
              />

              <span class="ocis-last-updated-time pt-4 pr-4">
                {{ $t('label.lastUpdated') }}
                {{ formatDateSec(lastUpdatedTime) }}
              </span>
            </v-card-title>
            <v-card-text class="ocis-detail-scroll-view">
              <DetailPanelGroup v-model="panelsTab2">
                <DetailPanel
                  :title="panelsTab2[0].title"
                  :value="panelsTab2[0].value"
                >
                  <TableMainActionBtn :btn="addNgBtn[0]" class="mr-3 mb-3" />
                  <DetailTable
                    :items="getNgList"
                    :headers="getNgHeaders()"
                    :actions="[
                      {
                        label: t('basic.modify.type', {
                          type: tc('basic.quantity'),
                        }),
                        disabled: item => !checkNgEditCountEnable(item),
                        action: ng => {
                          void handleOpenEditNgDialog(ng);
                        },
                      },
                      {
                        label: t('table.action.delete'),
                        disabled: item => !checkNgDeleteEnable(item),
                        action: ng => {
                          void handleDeleteNg(ng);
                        },
                      },
                    ]"
                  />
                </DetailPanel>
                <DetailPanel
                  :title="panelsTab2[1].title"
                  :value="panelsTab2[1].value"
                >
                  <DetailTable
                    :items="getNgReviewList"
                    :headers="getNgHeaders(true)"
                    :actions="[
                      {
                        label: t('k8s.review'),
                        visible: item => checkNgReviewEnable(item),
                        action: ng => {
                          void handleOpenReviewNgDialog(ng);
                        },
                      },
                      {
                        label: t('table.action.delete'),
                        disabled: () =>
                          clusterDetail.clusterStatus ===
                          CLUSTER_STATUS.DELETING,
                        action: ng => {
                          void handleDeleteReviewNg(ng);
                        },
                      },
                    ]"
                  />
                </DetailPanel>
              </DetailPanelGroup>
            </v-card-text>
          </v-card>
        </template>
        <template #tab-2>
          <v-card>
            <K8sMonitorViewer
              :cluster-id="clusterDetail.id"
              :hosts="getHostsList"
              :disabled="!checkMonitorEnable"
            />
          </v-card>
        </template>
      </TabsComponent>
    </v-row>
    <K8sUpgradeDialog
      v-model:show="showUpgradeDialog"
      :cluster-id="clusterDetail.id"
      :current-version="clusterDetail.k8sVersion"
      :k8s-versions="getVersionList"
      @upgrade="fetchData"
      @close-dialog="() => (showUpgradeDialog = false)"
    />
    <CommonDialog
      v-model:show="showAdminReviewDialog"
      :title="
        $t('dialog.review.title', { resource: $t('services.k8sCluster') })
      "
      :show-cancel-btn="true"
      :disable-submit="!isAdmin"
      :submit-callback="handleSubmitReviewCluster"
    >
      <v-row no-gutters>
        <v-col cols="3" class="pa-0 ocis-form-title">
          {{ $t('basic.name') }}
        </v-col>
        <v-col cols="9" class="pa-0 align-self-center">
          {{ clusterDetail.clusterName }}
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
    <CommonDialog
      v-model:show="showAdminReviewNgDialog"
      :title="$t('dialog.review.title', { resource: $t('k8s.workerNode') })"
      :show-cancel-btn="true"
      :disable-submit="!isAdmin"
      :submit-callback="handleSubmitReviewNg"
    >
      <v-row no-gutters>
        <v-col cols="3" class="pa-0 ocis-form-title">
          {{ $t('basic.name') }}
        </v-col>
        <v-col cols="9" class="pa-0 align-self-center">
          {{ editingNg.name }}
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
    <CommonDialog
      v-model:show="showNeedReviewDialog"
      :title="$t('application.createed.dialog.msg')"
      :show-cancel-btn="false"
    />
    <CommonDialog
      v-model:show="showDownloadConfigDialog"
      :title="$t('basic.download.type', { type: 'kubeconfig' })"
      :show-cancel-btn="true"
      :submit-btn-text="$t('basic.download')"
      :submit-btn-highlight="true"
      :submit-callback="handleDownloadConfig"
      :cancel-callback="handleCloseDownloadConfig"
      :disable-auto-close-dialog="true"
    >
      <p>{{ $t('k8s.download.kubeconfig.msg') }}</p>
    </CommonDialog>
    <K8sAddNodeDialog
      v-model:show="showAddNgDialog"
      :cluster-name="clusterDetail?.clusterName ?? ''"
      :cluster-id="clusterDetail?.id ?? ''"
      :worker-count="clusterDetail?.workerCount ?? 0"
      @add-node-group="fetchData"
    />
    <CommonDialog
      v-model:show="showEditSgDialog"
      :title="$t('basic.modify.type', { type: $t('services.securityGroup') })"
      :show-cancel-btn="true"
      :disable-submit="!checkSubmitSgBtnEnable"
      :submit-callback="handleSubmitEditSg"
      :cancel-callback="handleCloseEditSgDialog"
    >
      <MultipleInputSetter
        :title="$t('virtualNetwork.securityGroup')"
        :tooltip="$t('k8s.network.sg.tooltip')"
        required
        :params="selectedSgs"
        :disable-add-item="!checkAddSgBtnEnable"
        :column-infos="[
          {
            type: 'select',
            selectItems: getSgOptions,
            colsNumber: 6,
            returnObject: true,
          },
        ]"
        @add-new-item="
          () => {
            selectedSgs.push({ sg: { id: '', name: '' } });
          }
        "
        @delete-item="
          (index: number) => {
            selectedSgs.splice(index, 1);
          }
        "
      />
    </CommonDialog>
    <CommonDialog
      v-model:show="showEditNgDialog"
      v-model:review="showNeedReviewDialog"
      :title="$t('basic.modify.type', { type: $t('k8s.workerNode.number') })"
      :show-cancel-btn="true"
      :submit-btn-highlight="true"
      :disable-submit="!checkSubmitNgBtnEnable"
      :submit-callback="handleSubmitEditNg"
      :cancel-callback="handleCloseEditNgDialog"
    >
      <v-row no-gutters>
        <v-col cols="3" class="pa-0 ocis-form-title">
          {{ $t('k8s.workerNode.name') }}
        </v-col>
        <v-col cols="9" class="pa-0 align-content-center">
          {{ editingNg.name }}
        </v-col>
        <TextFieldWithHint
          v-model="editingNg.newCount"
          required
          :title="$t('k8s.workerNode.number')"
          type="number"
          :text-field-col="9"
          :min-val="RANGE.MIN"
          :max-val="RANGE.MAX"
          @form-error="
            errMsg => {
              editingNgCountError = errMsg[0];
            }
          "
        />
      </v-row>
    </CommonDialog>
    <K8sLogViewer
      v-model:show="showViewLogDialog"
      :cluster-id="clusterDetail.id"
      :hosts="getHostsList"
    />
  </UiContainer>
</template>
