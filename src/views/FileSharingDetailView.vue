<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchFileSharingDetail,
  updateFileSharing,
  deleteFileSharing,
  extendFileSharing,
  createFileSharingRule,
  deleteFileSharingRule,
} from '@/api';
import FsCreatePermissionDialog from '@/components/FsCreatePermissionDialog.vue';
import FsExtendSizeDialog from '@/components/FsExtendSizeDialog.vue';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import { formatDateSec } from '@/utils/utils';

const route = useRoute();
const router = useRouter();
const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;
const { openDeleteDialog, triggerSnackbarCopied } = useGlobal();

const tabs = computed(() => [t('basic.overview')]);

const timer = ref(0);
const fileSharingItem = ref<Record<string, any>>({ status: '', rules: [] });
const lastUpdatedTime: Ref<Date | string> = ref('');

const showEditDescriptionDialog = ref(false);
const showAddPermissionDialog = ref(false);
const showExtendSizeDialog = ref(false);

const hasCidrFourZeroRule = computed(() =>
  fileSharingItem.value?.rules.some(
    (rule: { cidr: string }) => rule.cidr.slice(0, 7) === '0.0.0.0'
  )
);

onMounted(() => {
  fetchData();
  setProjectSwitchCallback(backToList);
});
onBeforeUnmount(() => cancelAutoReload());

const getPermission = (level: string) => {
  let permissionStr = '';
  switch (level) {
    case 'rw':
      permissionStr = t('label.permission.readAndWrite');
      break;
    case 'ro':
      permissionStr = t('label.permission.onlyRead');
      break;
  }
  return permissionStr;
};

const fetchData = () => {
  makeApiCall({
    apiCallFn: fetchFileSharingDetail,
    payload: route.params.id,
  }).then((res: any) => {
    fileSharingItem.value = res;
    fileSharingItem.value.rules = fileSharingItem.value.rules.map(
      (rule: { level: string }) => ({
        ...rule,
        permission: getPermission(rule.level),
      })
    );
    // TODO: add rule status for auto-reload
    const hasNeededReloadItems =
      ['creating', 'extending'].includes(`${fileSharingItem.value.status}`) ||
      fileSharingItem.value.rules.some((rule: { status: string }) =>
        ['denying', 'applying'].includes(rule.status)
      );
    if (hasNeededReloadItems) {
      if (!timer.value) {
        timer.value = window.setInterval(() => fetchData(), 10000);
      }
    } else {
      if (timer.value) cancelAutoReload();
    }
    lastUpdatedTime.value = new Date();
  });
};
const cancelAutoReload = () => {
  clearInterval(timer.value);
  timer.value = 0;
};
const updateDescription = ($event: string) => {
  return makeApiCall({
    apiCallFn: updateFileSharing,
    payload: { shareId: route.params.id, description: $event },
    successCallback: () => {
      fetchData();
    },
  });
};
const addNewPermission = (ruleItem: any) => {
  return makeApiCall({
    apiCallFn: createFileSharingRule,
    payload: { shareId: route.params.id, ruleItem },
    successCallback: () => {
      fetchData();
      showAddPermissionDialog.value = false;
    },
  });
};
const extendFsSize = (newSize: string) => {
  makeApiCall({
    apiCallFn: extendFileSharing,
    payload: {
      shareId: route.params.id,
      body: { new_size: fileSharingItem.value.size + Number(newSize) },
    },
    successCallback: () => {
      fetchData();
      showExtendSizeDialog.value = false;
    },
  });
};

const handleCopy = (value: string) => {
  void navigator.clipboard.writeText(value);
  triggerSnackbarCopied();
};

const expansionPanels = computed(() => [
  { title: t('label.basicInfo'), value: 'basicInfo' },
  { title: t('label.managementList'), value: 'managementList' },
]);

const detailItems = computed((): any[] => [
  { text: t('label.name'), key: 'name' },
  { text: t('label.serviceState'), key: 'status', isStatus: true },
  {
    text: t('basic.desc'),
    key: 'description',
    button: {
      label: t('table.action.edit'),
      callback: () => (showEditDescriptionDialog.value = true),
    },
  },
  { text: t('fileSharing.sharingPath'), key: 'path', copy: true },
  { text: t('services.virtualNetwork'), key: 'networkName' },
  { text: t('label.createdAt'), key: 'createdAt', isDateString: true },
  {
    text: t('label.volume.size.unit'),
    key: 'size',
    button: {
      label: t('action.extend'),
      callback: () => (showExtendSizeDialog.value = true),
      disabled:
        fileSharingItem.value.status !== 'available' ||
        hasCidrFourZeroRule.value,
    },
  },
  { text: t('label.createdBy'), key: 'userName' },
  { text: t('label.lastModified.at'), key: 'updatedAt', isDateString: true },
]);
const backToList = () => {
  void router.push({ name: PAGE_TYPES.FILE_SHARING_LIST });
};
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="$tc('basic.detail.type', { type: $t('services.fileSharing') })"
      />
      <v-card width="100%" min-height="50vh" class="mt-4">
        <v-card-text class="pa-0">
          <TabsComponent :tab-names="tabs">
            <template #tab-0>
              <v-card>
                <v-card-title
                  class="pa-2 d-flex justify-space-between align-center"
                >
                  <div>
                    <DetailActionBtn
                      v-for="(item, index) in [
                        {
                          text: t('table.action.delete'),
                          icon: 'mdi-delete-outline',
                          disabled: fileSharingItem.status === 'creating',
                          visible: true,
                          action: () =>
                            openDeleteDialog({
                              item: fileSharingItem,
                              resourceType: $t('services.fileSharing'),
                              message: $t('dialog.delete.message.type', {
                                type: $t('services.fileSharing'),
                              }),
                              deleteAction: () =>
                                makeApiCall({
                                  apiCallFn: deleteFileSharing,
                                  payload: route.params.id,
                                  successCallback: () =>
                                    router.push({
                                      name: PAGE_TYPES.FILE_SHARING_LIST,
                                    }),
                                }),
                            }),
                        },
                        {
                          text: t('table.action.refresh'),
                          icon: 'mdi-refresh',
                          visible: true,
                          action: fetchData,
                        },
                      ]"
                      :key="index"
                      :btn="item"
                      :btn-tips="item.text"
                      :btn-icon="item.icon"
                      :last-updated-time="lastUpdatedTime"
                      @item-click="item.action"
                    />
                  </div>

                  <span class="ocis-last-updated-time mr-4">
                    {{ $t('label.lastUpdated') }}
                    {{ formatDateSec(lastUpdatedTime) }}
                  </span>
                </v-card-title>
                <v-card-text class="ocis-detail-scroll-view">
                  <v-row>
                    <v-col cols="12" class="pa-4">
                      <DetailPanelGroup v-model="expansionPanels">
                        <DetailPanel
                          :title="expansionPanels[0].title"
                          :value="expansionPanels[0].value"
                        >
                          <v-row no-gutters class="text-body-2">
                            <v-col
                              v-for="item in detailItems"
                              :key="item.key"
                              cols="6"
                              class="pb-4 d-flex align-center"
                            >
                              <DetailItem
                                :title="item.text"
                                :content="fileSharingItem[item.key]"
                                :is-status="item.isStatus"
                                :status-hint="fileSharingItem['status_reason']"
                                :is-date-string="item.isDateString"
                              >
                                <OutlinedBtn
                                  v-if="item.button"
                                  :class="{
                                    'ml-4': fileSharingItem[item.key] !== '',
                                  }"
                                  :text="item.button?.label || ''"
                                  :disabled="item.button.disabled"
                                  @click="item.button?.callback"
                                />

                                <v-icon
                                  v-if="item.copy && fileSharingItem[item.key]"
                                  class="ml-4"
                                  @click="handleCopy(fileSharingItem[item.key])"
                                >
                                  mdi-content-copy
                                </v-icon>
                              </DetailItem>
                            </v-col>
                          </v-row>
                        </DetailPanel>

                        <DetailPanel
                          :title="expansionPanels[1].title"
                          :value="expansionPanels[1].value"
                        >
                          <v-row>
                            <v-col cols="2">
                              <span class="text-body-2">
                                {{ $t('label.permission') }}
                              </span>
                            </v-col>
                            <v-col>
                              <OutlinedBtn
                                class="mb-6"
                                :text="
                                  $t('action.add.type', {
                                    type: $t('basic.setting.type', {
                                      type: $t('label.permission'),
                                    }),
                                  })
                                "
                                :disabled="
                                  fileSharingItem.status !== 'available'
                                "
                                @click="showAddPermissionDialog = true"
                              />
                              <DetailTable
                                :items="fileSharingItem.rules"
                                :headers="[
                                  {
                                    title: 'CIDR',
                                    value: 'cidr',
                                    align: 'start',
                                    copy: true,
                                  },
                                  {
                                    title: t('label.serviceState'),
                                    value: 'status',
                                    align: 'start',
                                    isStatus: true,
                                  },
                                  {
                                    title: t('label.permission'),
                                    value: 'permission',
                                    align: 'start',
                                  },
                                ]"
                                :actions="[
                                  {
                                    label: t('table.action.delete'),
                                    action: ruleItem => {
                                      openDeleteDialog({
                                        item: {
                                          ...ruleItem,
                                          name: ruleItem.id,
                                        },
                                        resourceInfo: [
                                          {
                                            title: 'CIDR',
                                            keyOfvalue: 'cidr',
                                          },
                                          {
                                            title: $t('label.permission'),
                                            keyOfvalue: 'permission',
                                          },
                                        ],
                                        resourceType: $t('basic.setting.type', {
                                          type: $t('label.permission'),
                                        }),
                                        deleteAction: () =>
                                          makeApiCall({
                                            apiCallFn: deleteFileSharingRule,
                                            payload: {
                                              shareId: route.params.id,
                                              ruleId: ruleItem.id,
                                            },
                                            successCallback: () => fetchData(),
                                          }),
                                      });
                                    },
                                  },
                                ]"
                              />
                            </v-col>
                          </v-row>
                        </DetailPanel>
                      </DetailPanelGroup>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </template>
          </TabsComponent>
        </v-card-text>
      </v-card>
    </v-row>
  </UiContainer>
  <EditDescriptionDialog
    v-model:show="showEditDescriptionDialog"
    :item-name="fileSharingItem.name"
    :description="fileSharingItem.description"
    @update-value="updateDescription"
  />
  <FsCreatePermissionDialog
    v-model:show="showAddPermissionDialog"
    @submit="addNewPermission"
  />
  <FsExtendSizeDialog
    v-model:show="showExtendSizeDialog"
    :fs-name="fileSharingItem.name"
    :original-size="fileSharingItem.size"
    @submit="extendFsSize"
  />
</template>
