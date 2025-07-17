<script lang="ts" setup>
import { useUser, useGlobal } from '@/store';
import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchAutoScalingDetail,
  fetchVmFloatingIP,
  updateAutoScaling,
  deleteAutoScaling,
  detachFloatingIP,
  deleteVmFloatingIP,
  asVmAttachFloatingIp,
  fetchAsVmConsoleUrl,
  approveAutoScaling,
  rejectAutoScaling,
  asVmActions,
} from '@/api';
import VmAddIpDialog from '@/components/VmAddIpDialog.vue';
import VmConsolePasswordDialog from '@/components/VmConsolePasswordDialog.vue';
import VmReviewDialog from '@/components/VmReviewDialog.vue';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';
import EditValueDialog from '@/components/common/EditValueDialog.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import { formatDateSec } from '@/utils/utils';

const route = useRoute();
const router = useRouter();
const { openDeleteDialog, uiShowDialog } = useGlobal();
const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;
const userStore = useUser();
const { isFloatingIpReview, isAdmin } = useVm();

const timer = ref(0);
const tabs = computed(() => [t('basic.overview'), t('creation.step.vm.spec')]);

const autoScalingItem = ref<Record<string, any>>({ status: '', rules: [] });
const lastUpdatedTime: Ref<Date | string> = ref('');

const showEditDescriptionDialog = ref(false);
const showReviewDialog = ref(false);
const showConsolePasswordDialog = ref(false);
const selectedVmItem: Record<string, any> = ref({});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(backToList);
});
onBeforeUnmount(() => cancelAutoReload());

const fetchData = async (skipProgress: boolean = false) => {
  const autoScalingItemCall = makeApiCall({
    skipProgress,
    apiCallFn: fetchAutoScalingDetail,
    payload: route.params.id,
    successCallback: res => {
      res.servers =
        res.servers?.sort(
          (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) || [];
      return res;
    },
    errorResHandlingFn: () => ({}),
    errorCallback: backToList,
  });

  const floatingIpApiCall = makeApiCall({
    skipProgress: true,
    apiCallFn: fetchVmFloatingIP,
    successCallback: res =>
      res
        .map((item: any) => ({
          ...item,
          reserved: item.reserved ? 'reserved' : 'unreserved',
          name: item.address,
        }))
        .filter((item: any) => item.status.toLowerCase() === 'down'),
  });
  autoScalingItem.value = await autoScalingItemCall;
  vmFloatingIpList.value = await floatingIpApiCall;

  const hasNeededReloadItem = autoScalingItem.value.status
    .toLowerCase()
    .includes('progress');
  if (hasNeededReloadItem) {
    if (!timer.value) {
      timer.value = window.setInterval(() => {
        void fetchData(true);
      }, 10000);
    }
  } else {
    if (timer.value) cancelAutoReload();
  }
  lastUpdatedTime.value = new Date();
};
const cancelAutoReload = () => {
  clearInterval(timer.value);
  timer.value = 0;
};

const updateDescription = ($event: string) => {
  return makeApiCall({
    apiCallFn: updateAutoScaling,
    payload: {
      id: autoScalingItem.value.id,
      valuesToUpdate: { description: $event },
    },
    successCallback: fetchData,
  });
};
const showEditValueDialog = ref(false);
const editingKey = ref('');
const editingLabel = ref('');
const editingValue = ref('');

const updateAutoScalingValue = ($event: number | string, type: string) => {
  const numberConvertKeys = [
    'max_size',
    'min_size',
    'threshold_up',
    'threshold_down',
  ];
  const item = {
    [type]: numberConvertKeys.includes(type) ? Number($event) : $event,
  };
  if (item) {
    return makeApiCall({
      apiCallFn: updateAutoScaling,
      payload: {
        id: autoScalingItem.value.id,
        valuesToUpdate: item,
      },
      successCallback: fetchData,
    });
  }
};

const detailItems = computed(() => [
  { text: t('label.name'), key: 'name' },
  {
    text: t('label.serviceState'),
    key: 'status',
    isStatus: true,
  },
  {
    text: t('basic.desc'),
    key: 'description',
    button: {
      label: t('table.action.edit'),
      callback: () => (showEditDescriptionDialog.value = true),
    },
  },
  { text: t('vm.network'), key: 'networkName' },
  {
    text: t('vm.as.vmUpperLimit'),
    key: 'max_size',
    button: {
      label: t('table.action.edit'),
      callback: () => {
        editingKey.value = 'max_size';
        editingLabel.value = t('vm.as.vmUpperLimit');
        editingValue.value = autoScalingItem.value.max_size.toString();
        showEditValueDialog.value = true;
      },
    },
  },
  {
    text: t('vm.as.vmLowerLimit'),
    key: 'min_size',
    button: {
      label: t('table.action.edit'),
      callback: () => {
        editingKey.value = 'min_size';
        editingLabel.value = t('vm.as.vmLowerLimit');
        editingValue.value = autoScalingItem.value.min_size.toString();
        showEditValueDialog.value = true;
      },
    },
  },
  { text: t('label.createdAt'), key: 'createdAt' },
  { text: 'Metric', key: 'metric' },
  { text: t('label.createdBy'), key: 'creator' },
  {
    text: t('label.upperThreshold'),
    key: 'threshold_up',
    button: {
      label: t('table.action.edit'),
      callback: () => {
        editingKey.value = 'threshold_up';
        editingLabel.value = t('label.upperThreshold');
        editingValue.value = autoScalingItem.value.threshold_up.toString();
        showEditValueDialog.value = true;
      },
    },
  },
  { text: t('label.lastModified.at'), key: 'updatedAt' },
  {
    text: t('label.lowerThreshold'),
    key: 'threshold_down',
    button: {
      label: t('table.action.edit'),
      callback: () => {
        editingKey.value = 'threshold_down';
        editingLabel.value = t('label.lowerThreshold');
        editingValue.value = autoScalingItem.value.threshold_down.toString();
        showEditValueDialog.value = true;
      },
    },
  },
  { text: t('label.lastModified.by'), key: 'creator' },
]);

const panelsTab1 = computed(() => [
  { title: t('label.basicInfo'), value: 'basicInfo' },
]);
const panelsTab2 = computed(() => [
  { title: t('label.detailInfo'), value: 'detailInfo' },
  { title: t('label.initialization'), value: 'initialization' },
  { title: t('label.managementList'), value: 'managementList' },
]);

const showAddIpDialog = ref(false);
const selectedServer = ref<Record<string, any> | undefined>(undefined);
const vmFloatingIpList = ref([]);

const openUrl = (url: string) => {
  if (url !== '') {
    window.open(url, '_blank');
  }
};

const attachFloatingIp = async ($event: {
  auto: boolean;
  selectedFloatingIp: { id: string };
}) => {
  const { auto, selectedFloatingIp } = $event;
  const body = auto ? {} : { fip_id: selectedFloatingIp.id };
  await makeApiCall({
    apiCallFn: asVmAttachFloatingIp,
    payload: {
      autoScalingId: autoScalingItem.value.id,
      serverId: selectedServer.value?.id,
      body,
    },
    successCallback: res => {
      if (isFloatingIpReview.value) {
        uiShowDialog({
          title: '',
          message: t('vm.network.ip.add.review'),
          hideCancelBtn: true,
        });
      }
      void fetchData();
    },
  });
};
const backToList = () => {
  void router.push({
    name: PAGE_TYPES.VM_AUTO_SCALING_LIST,
  });
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="$tc('basic.detail.type', { type: $t('services.autoScaling') })"
      />
      <TabsComponent :tab-names="tabs" is-card-style>
        <template #tab-0>
          <v-card>
            <v-card-title class="pa-2">
              <v-row no-gutters>
                <v-col cols="12">
                  <DetailActionBtn
                    v-for="(item, index) in [
                      {
                        text: $tc('basic.review', 2),
                        icon: 'menu_icon_review',
                        isSvgIcon: true,
                        visible:
                          isAdmin &&
                          autoScalingItem.status?.toLowerCase() === 'pending',
                        action: () => {
                          showReviewDialog = true;
                        },
                      },
                      {
                        text: t('table.action.delete'),
                        icon: 'mdi-delete-outline',
                        visible: true,
                        action: () =>
                          openDeleteDialog({
                            item: autoScalingItem,
                            resourceType: $t('services.autoScaling'),
                            message: $t('dialog.delete.message.type', {
                              type: $t('services.autoScaling'),
                            }),
                            deleteAction: () =>
                              makeApiCall({
                                apiCallFn: deleteAutoScaling,
                                payload: route.params.id,
                                successCallback: backToList,
                              }),
                          }),
                      },
                      {
                        text: t('table.action.refresh'),
                        icon: 'mdi-refresh',
                        visible: true,
                        action: fetchData,
                      },
                    ].filter(item => item.visible)"
                    :key="index"
                    :btn="item"
                    :btn-tips="item.text"
                    :btn-icon="item.icon"
                    :is-svg-icon="item.isSvgIcon"
                    :last-updated-time="lastUpdatedTime"
                    @item-click="item.action"
                  />

                  <span class="ocis-last-updated-time pt-4 pr-4">
                    {{ $t('label.lastUpdated') }}
                    {{ formatDateSec(lastUpdatedTime) }}
                  </span>
                </v-col>
              </v-row>
            </v-card-title>
            <v-card-text class="ocis-detail-scroll-view">
              <v-row>
                <v-col cols="12" class="pa-4">
                  <DetailPanelGroup v-model="panelsTab1">
                    <DetailPanel
                      :title="panelsTab1[0].title"
                      :value="panelsTab1[0].value"
                    >
                      <v-row no-gutters class="text-body-2">
                        <v-col
                          v-for="item in detailItems"
                          :key="item.text"
                          cols="6"
                          class="pb-4 d-flex align-center"
                        >
                          <DetailItem
                            :title="item.text"
                            :content="autoScalingItem[item.key]"
                            :is-date-string="
                              item.key === 'createdAt' ||
                              item.key === 'updatedAt'
                            "
                            :is-status="item.isStatus"
                            :status-hint="autoScalingItem.status_reason"
                          >
                            <OutlinedBtn
                              v-if="item.button"
                              :class="{
                                'ml-4': !!autoScalingItem[item.key],
                              }"
                              :text="item.button?.label || ''"
                              @click="item.button?.callback"
                            />
                          </DetailItem>
                        </v-col>
                      </v-row>
                    </DetailPanel>
                  </DetailPanelGroup>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
        <template #tab-1>
          <v-card>
            <v-card-title class="pa-2">
              <v-row no-gutters>
                <v-col cols="12">
                  <DetailActionBtn
                    v-for="(item, index) in [
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

                  <span class="ocis-last-updated-time pt-4 pr-4">
                    {{ $t('label.lastUpdated') }}
                    {{ formatDateSec(lastUpdatedTime) }}
                  </span>
                </v-col>
              </v-row>
            </v-card-title>
            <v-card-text class="ocis-detail-scroll-view">
              <v-row>
                <v-col cols="12" class="pa-4">
                  <DetailPanelGroup v-model="panelsTab2">
                    <DetailPanel
                      :title="panelsTab2[0].title"
                      :value="panelsTab2[0].value"
                    >
                      <v-row no-gutters class="text-body-2">
                        <v-col
                          v-for="item in [
                            {
                              text: t('image.source'),
                              key: 'imageName',
                            },
                            {
                              text: t('flavor.title'),
                              key: 'flavorName',
                            },
                            {
                              text: t('image.tag'),
                              key: 'imageTagName',
                            },
                            {
                              text: t('virtualNetwork.securityGroup'),
                              key: 'securityGroupNames',
                            },
                            {
                              text: t('label.login.account'),
                              key: 'imageLoginUser',
                            },
                            {
                              text: t('services.keypairs'),
                              key: 'keypairName',
                            },
                          ]"
                          :key="item.text"
                          cols="6"
                          class="pb-4"
                        >
                          <DetailItem
                            :title="item.text"
                            :content="autoScalingItem[item.key]"
                          />
                        </v-col>
                      </v-row>
                    </DetailPanel>
                    <DetailPanel
                      :title="panelsTab2[1].title"
                      :value="panelsTab2[1].value"
                    >
                      <v-row>
                        <v-col cols="2">
                          <span class="text-body-2">
                            {{ $t('label.initialization.script') }}
                          </span>
                        </v-col>
                        <v-col>
                          <v-textarea
                            class="input-field"
                            variant="plain"
                            no-resize
                            rows="1"
                            auto-grow
                            bg-color="#F5F5F5"
                            density="compact"
                            readonly
                            :model-value="autoScalingItem?.boot_script"
                          />
                        </v-col>
                      </v-row>
                    </DetailPanel>
                    <DetailPanel
                      :title="panelsTab2[2].title"
                      :value="panelsTab2[2].value"
                    >
                      <v-row>
                        <v-col cols="2">
                          <span class="text-body-2">
                            {{ $t('services.virtualMachine') }}
                          </span>
                        </v-col>
                        <v-col>
                          <DetailTable
                            :items="autoScalingItem?.servers || []"
                            :headers="[
                              {
                                title: $t('label.name'),
                                value: 'name',
                              },
                              {
                                title: $t('vm.network.private.ip'),
                                value: 'private_ips',
                              },
                              {
                                title: $t('vm.network.floating.ip'),
                                value: 'floating_ip.address',
                              },
                              {
                                title: $t('label.serviceState'),
                                value: 'status',
                                isStatus: true,
                              },
                              {
                                title: $t('label.createdAt'),
                                value: 'createdAt',
                                useDateFilter: true,
                              },
                            ]"
                            :actions="[
                              {
                                label: $t('table.action.start'),
                                visible: vmItem =>
                                  vmItem.status.toLowerCase() === 'shutoff',
                                action: vmItem => {
                                  makeApiCall({
                                    apiCallFn: asVmActions,
                                    payload: {
                                      autoScalingId: autoScalingItem.id,
                                      serverId: vmItem.id,
                                      action: { action: 'start' },
                                    },
                                    successCallback: fetchData,
                                  });
                                },
                              },
                              {
                                label: $t('table.action.stop'),
                                visible: vmItem =>
                                  vmItem.status.toLowerCase() === 'active',
                                action: vmItem => {
                                  makeApiCall({
                                    apiCallFn: asVmActions,
                                    payload: {
                                      autoScalingId: autoScalingItem.id,
                                      serverId: vmItem.id,
                                      action: { action: 'stop' },
                                    },
                                    successCallback: fetchData,
                                  });
                                },
                              },
                              {
                                label: $t('table.action.restart'),
                                visible: vmItem =>
                                  vmItem.status.toLowerCase() === 'active',
                                action: vmItem => {
                                  makeApiCall({
                                    apiCallFn: asVmActions,
                                    payload: {
                                      autoScalingId: autoScalingItem.id,
                                      serverId: vmItem.id,
                                      action: {
                                        action: 'reboot',
                                        reboot_type: 'soft',
                                      },
                                    },
                                    successCallback: fetchData,
                                  });
                                },
                              },
                              {
                                label: $t('vm.console.password'),
                                visible: () => !!autoScalingItem.keypair,
                                action: vmItem => {
                                  selectedVmItem = vmItem;
                                  showConsolePasswordDialog = true;
                                },
                              },
                              {
                                label: 'Console',
                                disabled: () =>
                                  userStore.getUserInfo.userId !==
                                  autoScalingItem.user_id,
                                action: vmItem => {
                                  makeApiCall({
                                    apiCallFn: fetchAsVmConsoleUrl,
                                    payload: {
                                      autoScalingId: autoScalingItem.id,
                                      serverId: vmItem.id,
                                    },
                                    successCallback: openUrl,
                                  });
                                },
                              },
                              {
                                label: $t('action.floating.ip.attach'),
                                visible: vmItem => !vmItem.floating_ip,
                                action: vmItem => {
                                  selectedServer = vmItem;
                                  showAddIpDialog = true;
                                },
                              },
                              {
                                label: $t('action.floating.ip.detach'),
                                visible: vmItem => vmItem.floating_ip,
                                action: vmItem => {
                                  if (vmItem.floating_ip.reserved) {
                                    makeApiCall({
                                      apiCallFn: detachFloatingIP,
                                      payload: {
                                        floatingIpId: vmItem.floating_ip.id,
                                      },
                                      successCallback: fetchData,
                                    });
                                  } else {
                                    makeApiCall({
                                      apiCallFn: deleteVmFloatingIP,
                                      payload: vmItem.floating_ip.id,
                                      successCallback: fetchData,
                                    });
                                  }
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
    </v-row>

    <EditDescriptionDialog
      v-model:show="showEditDescriptionDialog"
      :item-name="autoScalingItem.name"
      :description="autoScalingItem.description"
      @update-value="updateDescription"
    />
    <EditValueDialog
      v-model:show="showEditValueDialog"
      :label="editingLabel"
      :value="editingValue"
      :input-type="'number'"
      :min-val="['max_size', 'min_size'].includes(editingKey) ? 1 : 0"
      :max-val="editingKey === 'min_size' ? autoScalingItem.max_size : 100"
      @update-value="$event => updateAutoScalingValue($event, editingKey)"
    />
    <VmAddIpDialog
      v-model:show="showAddIpDialog"
      :floating-ip-list="vmFloatingIpList"
      @submit="$event => attachFloatingIp($event)"
    />
    <VmReviewDialog
      v-model:show="showReviewDialog"
      type="asg"
      :item="autoScalingItem"
      :submit-callback="
        (approve: boolean) => {
          makeApiCall({
            apiCallFn: approve ? approveAutoScaling : rejectAutoScaling,
            payload: autoScalingItem.id,
            successCallback: () => fetchData(true),
          });
        }
      "
    />
    <VmConsolePasswordDialog
      v-model:show="showConsolePasswordDialog"
      :api-call-fn="asVmActions"
      :api-payload="{
        autoScalingId: autoScalingItem.id,
        serverId: selectedVmItem.id,
      }"
    />
  </UiContainer>
</template>
<style lang="scss" scoped>
.input-field {
  :deep(.v-field__input) {
    padding-top: 4px;
    padding-left: 4px;
  }
}
</style>
