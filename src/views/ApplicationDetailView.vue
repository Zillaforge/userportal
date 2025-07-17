<script lang="ts" setup>
import { useProject, useGlobal } from '@/store';
import { ref, computed, onMounted, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  makeApiCall,
  fetchApplicationDetail,
  fetchAppInstanceList,
  approveApplication,
  rejectApplication,
  deleteApplication,
  fetchAppLogs,
  fetchVmFloatingIP,
  associateFloatingIpOfAppInstance,
  disassociateFloatingIpOfAppInstance,
  RESOURCE_TYPE,
} from '@/api';
import AppReviewDialog from '@/components/AppReviewDialog.vue';
import TransferDialog from '@/components/TransferDialog.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useAutoReload from '@/composables/useAutoReload';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import router from '@/router';
import { formatDateSec, isPublicSite } from '@/utils/utils';

interface Answer {
  default?: any;
  description?: string;
  displayName: any;
  group: string;
  label: string;
  options?: any;
  required: boolean;
  type: string;
  rawValues: any;
  values: any;
  variable: string;
  order?: number;
}

const projectStore = useProject();
const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;
const route = useRoute();
const { setAutoReload } = useAutoReload();
const $isPublicSite = isPublicSite();
const { openDeleteDialog, uiShowDialog, uiShowProgressDlg, uiHideProgressDlg } =
  useGlobal();

const tabs = computed(() => [
  t('basic.overview'),
  t('application.instance.list'),
]);
const tabIndex: Ref<number> = ref(0);
const lastUpdatedTime: Ref<Date | string> = ref('');
const showLogDialog: Ref<boolean> = ref(false);
const logDetail: Ref<string> = ref('');
const showReviewDialog: Ref<boolean> = ref(false);
const showTransferDialog: Ref<boolean> = ref(false);

lastUpdatedTime.value = new Date();

const isAdmin = computed(() => {
  return projectStore.isTenantAdmin;
});

const getAppId = computed(() => {
  return (route.params.id as string) ?? '';
});

const detailButton = computed(() => {
  const btns = [
    {
      text: t('table.action.log'),
      visible: true,
      icon: 'menu_icon_log',
      isSvgIcon: true,
      action: () => {
        void (async () => {
          logDetail.value = await makeApiCall({
            apiCallFn: fetchAppLogs,
            payload: getAppId.value,
            errorResHandlingFn: () => '',
            successCallback: () => {
              showLogDialog.value = true;
            },
          });
          if (!logDetail.value) {
            logDetail.value = 'no content';
          }
        })();
      },
    },
    {
      text: t('application.review'),
      icon: 'menu_icon_review',
      isSvgIcon: true,
      visible: isAdmin.value && detail.value.state?.toLowerCase() === 'review',
      action: () => {
        showReviewDialog.value = true;
      },
    },
    {
      text: t('basic.transfer'),
      icon: 'menu_icon_resource_transfer',
      isSvgIcon: true,
      visible: $isPublicSite && detail.value.shiftable,
      action: () => {
        showTransferDialog.value = true;
      },
    },
    {
      text: t('table.action.delete'),
      icon: 'mdi-delete-outline',
      visible: true,
      single: true,
      action: () =>
        openDeleteDialog({
          item: detail.value,
          resourceType: t('services.application'),
          message: t('dialog.delete.message.type', {
            type: t('services.application'),
          }),
          deleteAction: () =>
            makeApiCall({
              apiCallFn: deleteApplication,
              payload: getAppId.value,
              successCallback: async () =>
                await router.push({ name: PAGE_TYPES.APPLICATION_LIST }),
            }),
        }),
    },
    {
      text: t('table.action.refresh'),
      icon: 'mdi-refresh',
      visible: true,
      single: true,
      action: () => {
        void fetchData();
      },
    },
  ];
  const currentTabBtns = tabIndex.value === 0 ? btns : [btns[4]];
  return currentTabBtns.filter(btn => btn.visible);
});

const reviewAction = async (appId: string, approve: boolean) => {
  if (approve) {
    await makeApiCall({
      apiCallFn: approveApplication,
      payload: appId,
      successCallback: async () => await fetchData(),
    });
  } else {
    await makeApiCall({
      apiCallFn: rejectApplication,
      payload: appId,
      successCallback: async () => await fetchData(),
    });
  }
};

const panelsTab1 = computed(() => [
  { title: t('label.basicInfo'), value: 'basicInfo' },
  { title: t('label.hardwareInfo'), value: 'hardwareInfo' },
  { title: t('label.networkInfo'), value: 'networkInfo' },
  { title: t('form.storageInfo'), value: 'storageInfo' },
  { title: t('vm.certification.info'), value: 'certificationInfo' },
  { title: t('label.otherInfo'), value: 'otherInfo' },
]);
const panelsTab2 = computed(() => [
  { title: t('application.instance.info'), value: 'individuals' },
]);

const detail: Ref<Record<string, any>> = ref({});
const detailItems = computed(() => [
  {
    text: t('label.name'),
    value: detail.value.name ?? '',
  },
  {
    text: t('label.serviceState'),
    value: detail.value.state ?? '',
    isStatus: true,
    statusHint: detail.value.extra?.error ?? '',
  },
  {
    text: t('basic.desc'),
    value: detail.value.description ?? '',
  },
  {
    text: t('label.createdAt'),
    value: detail.value.createdAt ?? '',
    isDate: true,
  },
  {
    text: t('application.type'),
    value: detail.value.moduleCategory?.name ?? '',
  },
  {
    text: t('label.createdBy'),
    value: detail.value.creator?.name ?? '',
  },
  {
    text: t('label.version'),
    value: detail.value.module?.name ?? '',
  },
]);

const instanceList: Ref<Record<string, any>[]> = ref([]);
const selectrdInstance: Ref<Record<string, any> | undefined> = ref(undefined);
const virtualInstanceHeader = computed(() => [
  {
    title: t('label.name'),
    value: 'name',
  },
  {
    title: t('label.login.account'),
    value: 'extra.instance.default_account',
  },
  {
    title: t('vm.network.private.ip'),
    value: 'extra.instance.ip',
  },
  {
    title: t('vm.network.floating.ip'),
    value: 'floatingIpAddress',
  },
]);
const showFloatingDialog: Ref<boolean> = ref(false);
const floatingIps: Ref<Record<string, any>[]> = ref([]);
const selectedFloatingIp: Ref<Record<string, any> | undefined> = ref(undefined);
const virtualInstanceActions = computed(() => [
  {
    label: t('vm.network.ip.add'),
    visible: (item: any) => !item.floatingIpAddress,
    action: (item: any) => {
      selectrdInstance.value = item;
      void (async () => {
        floatingIps.value = await makeApiCall({
          apiCallFn: fetchVmFloatingIP,
          errorResHandlingFn: () => [],
        });
        floatingIps.value = floatingIps.value
          .map(fIp => {
            return {
              name: fIp.address,
              value: fIp.id,
              id: fIp.id,
              status: fIp.status,
            };
          })
          .filter(fIp => fIp.status?.toLowerCase() === 'down');
        selectedFloatingIp.value = floatingIps.value[0] ?? undefined;
        showFloatingDialog.value = true;
      })();
    },
  },
  {
    label: t('vm.network.ip.unbind'),
    visible: (item: any) => item.floatingIpAddress,
    action: (item: any) => {
      uiShowDialog({
        title: t('dialog.detach.title', {
          resource: t('vm.network.floating.ip'),
        }),
        resourceInfo: [
          {
            title: t('label.name'),
            value: item.floatingIpAddress,
          },
        ],
        callback: async () => {
          await makeApiCall({
            apiCallFn: disassociateFloatingIpOfAppInstance,
            payload: item.id,
            successCallback: () => {
              void fetchData();
            },
          });
        },
      });
    },
  },
]);

const associateFloatingIp = () => {
  makeApiCall({
    apiCallFn: associateFloatingIpOfAppInstance,
    payload: {
      instanceId: selectrdInstance.value?.id ?? '',
      floatingIpId: selectedFloatingIp.value?.id ?? '',
    },
    successCallback: () => {
      void fetchData();
    },
  });
};

const PANEL_GROUP = {
  HARDWARE: 'hardware',
  NETWORK: 'network',
  STORAGE: 'storage',
  AUTHENTICATION: 'authentication',
  OTHERS: 'others',
};

const formattedAnswers: Ref<Record<string, any>> = ref({});

const getPanels = computed(() => {
  const panelArr = [];
  if (formattedAnswers.value[PANEL_GROUP.HARDWARE]) {
    panelArr.push({ key: PANEL_GROUP.HARDWARE, panelIndex: 1 });
  }
  if (formattedAnswers.value[PANEL_GROUP.NETWORK]) {
    panelArr.push({ key: PANEL_GROUP.NETWORK, panelIndex: 2 });
  }
  if (formattedAnswers.value[PANEL_GROUP.STORAGE]) {
    panelArr.push({ key: PANEL_GROUP.STORAGE, panelIndex: 3 });
  }
  if (formattedAnswers.value[PANEL_GROUP.AUTHENTICATION]) {
    panelArr.push({ key: PANEL_GROUP.AUTHENTICATION, panelIndex: 4 });
  }
  if (formattedAnswers.value[PANEL_GROUP.OTHERS]) {
    panelArr.push({ key: PANEL_GROUP.OTHERS, panelIndex: 5 });
  }
  return panelArr;
});

const formatAnswers = (answers: Record<string, any>[]): Record<string, any> => {
  const genAnswers: any = {};
  answers.forEach(answer => {
    if (!genAnswers[answer.group]?.[answer.type]) {
      if (!genAnswers[answer.group]) {
        genAnswers[answer.group] = {};
      }
      genAnswers[answer.group][answer.type] = [answer];
    } else {
      genAnswers[answer.group][answer.type].push(answer);
    }
  });
  return genAnswers;
};

const getAnswersByGroup = (stepGroup: string) => {
  const answerArray: Answer[] = [];
  if (formattedAnswers.value[stepGroup]) {
    Object.keys(
      formattedAnswers.value[stepGroup] as Record<string, any>
    ).forEach(type => {
      answerArray.push(
        ...(formattedAnswers.value[stepGroup][type] as Answer[])
      );
    });
  }
  return answerArray;
};

const getKeypairId = computed(() => {
  const keypairAnswer = detail.value?.answers?.answers?.find(
    (answer: { type: string }) => {
      return answer.type === 'vpsKeypair';
    }
  );
  return keypairAnswer?.rawValues ?? '';
});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(() => {
    void router.push({ name: PAGE_TYPES.APPLICATION_LIST });
  });
  // application state: "Review", "Reject", "Processing", "Ready", "Failed".
  setAutoReload(detail, async () => await fetchData(true), ['Processing']);
});

const fetchData = async (disableProgress: boolean = false) => {
  if (!disableProgress) {
    uiShowProgressDlg();
  }
  detail.value = await makeApiCall({
    apiCallFn: fetchApplicationDetail,
    payload: getAppId.value,
    errorResHandlingFn: () => {},
    skipProgress: true,
    errorCallback: () => {
      void router.push({ name: PAGE_TYPES.APPLICATION_LIST });
    },
  });
  const answers: Record<any, string>[] = detail.value.answers?.answers ?? [];
  // hide password
  formattedAnswers.value = formatAnswers(
    answers.filter(answer => answer.type !== 'password')
  );
  instanceList.value = await makeApiCall({
    apiCallFn: fetchAppInstanceList,
    payload: getAppId.value,
    errorResHandlingFn: () => {},
    skipProgress: true,
  });
  lastUpdatedTime.value = new Date();
  uiHideProgressDlg();
};

watch(
  () => i18n.global.locale,
  async () => {
    await fetchData();
  }
);
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $tc('basic.detail.type', { type: `${$t('services.application')} ` })
        "
      />
      <TabsComponent v-model="tabIndex" :tab-names="tabs" :is-card-style="true">
        <template #tab-0>
          <v-card>
            <v-card-title class="pa-2">
              <DetailActionBtn
                v-for="item in detailButton"
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
                    <v-col
                      v-for="item in detailItems"
                      :key="item.text"
                      cols="6"
                      class="pb-4"
                    >
                      <DetailItem
                        :title="item.text"
                        :content="item.value"
                        :is-status="item.isStatus"
                        :status-hint="item.statusHint"
                        :is-date-string="item.isDate"
                      />
                    </v-col>
                  </v-row>
                </DetailPanel>

                <DetailPanel
                  v-for="(panelItem, index) in getPanels"
                  :key="index"
                  :title="panelsTab1[panelItem.panelIndex].title"
                  :value="panelsTab1[panelItem.panelIndex].value"
                >
                  <v-row no-gutters>
                    <v-col
                      v-for="item in getAnswersByGroup(panelItem.key).filter(
                        (answer: any) => !Array.isArray(answer.displayName)
                      )"
                      :key="item.variable"
                      cols="6"
                      class="pb-4"
                    >
                      <DetailItem
                        :title="item.label"
                        :content="
                          item.type !== 'sshPort'
                            ? item.displayName
                            : item.displayName
                              ? `${t('basic.portNumber')}: ${item.displayName}`
                              : $t('basic.close')
                        "
                      />
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col
                      v-for="item in getAnswersByGroup(panelItem.key).filter(
                        (answer: any) => Array.isArray(answer.displayName)
                      )"
                      :key="item.variable"
                      cols="12"
                      class="pb-4"
                    >
                      <DetailItem :title="item.label" fill-layout>
                        <v-chip
                          v-for="(arrItem, index) in item.displayName"
                          :key="index"
                          class="mr-2"
                        >
                          {{ arrItem }}
                        </v-chip>
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
                v-for="item in detailButton"
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
                  <DetailTable
                    :items="instanceList"
                    :headers="virtualInstanceHeader"
                    :actions="virtualInstanceActions"
                  />
                </DetailPanel>
              </DetailPanelGroup>
            </v-card-text>
          </v-card>
        </template>
      </TabsComponent>
    </v-row>
    <AppReviewDialog
      v-model:show="showReviewDialog"
      :item="detail"
      :submit-callback="
        (approve: boolean) => {
          reviewAction(getAppId, approve);
        }
      "
    />
    <CommonDialog
      v-model:show="showLogDialog"
      :title="$t('application.creation.log')"
      :show-cancel-btn="false"
    >
      <div class="pa-4 log-view">
        <pre>{{ logDetail }}</pre>
      </div>
    </CommonDialog>
    <CommonDialog
      v-model:show="showFloatingDialog"
      :title="$t('vm.network.ip.add')"
      :disable-submit="!selectedFloatingIp"
      :cancel-btn-text="$t('basic.cancel')"
      :submit-callback="associateFloatingIp"
    >
      <SelectWithHint
        v-model="selectedFloatingIp"
        class="pt-4"
        required
        return-object
        :title="$t('vm.network.floating.ip')"
        :items="floatingIps"
      />
    </CommonDialog>
    <!-- TODO: update resource id and name -->
    <TransferDialog
      v-model:show="showTransferDialog"
      :resource-id="getAppId"
      :resource-name="detail.name"
      :resource-type="RESOURCE_TYPE.APS"
      :keypair-id="getKeypairId"
    />
  </UiContainer>
</template>
<style lang="scss" scoped>
.log-view {
  height: 400px;
  border: 1px solid rgba(var(--v-theme-border), var(--v-border-opacity)) !important;
  white-space: pre-line;
  overflow-wrap: break-word;
  overflow-y: auto;
}
</style>
