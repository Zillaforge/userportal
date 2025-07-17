<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchLoadBalancerDetail,
  fetchLoadBalancerPoolList,
  updateLoadBalancer,
  deleteLoadBalancer,
  deleteLoadBalancerListener,
  deleteLoadBalancerPool,
  fetchVmFloatingIP,
  lbAttachFloatingIp,
  detachFloatingIP,
  deleteVmFloatingIP,
} from '@/api';
import VmAddIpDialog from '@/components/VmAddIpDialog.vue';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import { formatDateSec } from '@/utils/utils';

const route = useRoute();
const router = useRouter();
const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;
const { openDeleteDialog, uiShowDialog, triggerSnackbarCopied } = useGlobal();
const { isFloatingIpReview } = useVm();

const timer = ref(0);
const tabIndex = ref(0);
const tabs = computed(() => [
  t('basic.overview'),
  t('vm.lb.listener'),
  t('vm.lb.target.pool'),
]);

const loadBalancerItem = ref<Record<string, any>>({});
const poolList = ref<Record<string, any>[]>([]);
const floatingIpList = ref<any[]>([]);
const lastUpdatedTime: Ref<Date | string> = ref('');

const showEditDescriptionDialog = ref(false);
const showAddIpDialog = ref(false);

const isStatusActive = computed(
  () => loadBalancerItem.value?.status?.toLowerCase() === 'active'
);
const expansionPanels = computed(() => {
  return [{ title: t('label.basicInfo'), value: 'basicInfo' }];
});

const expansionPanelsListener = computed(() => {
  return [
    { title: t('vm.lb.listener') + t('basic.info'), value: 'listenerInfo' },
  ];
});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_LOAD_BALANCER_LIST })
  );
  if (route.query?.tab === 'pool') {
    tabIndex.value = 2;
  }
});
onBeforeUnmount(() => cancelAutoReload());

const fetchData = async () => {
  const loadBalancerCall = makeApiCall({
    apiCallFn: fetchLoadBalancerDetail,
    payload: route.params.id,
    successCallback: res => ({
      ...res,
      fipAddress: res.floating_ip?.address,
    }),
    errorCallback: backToList,
  });
  const poolListCall = makeApiCall({
    skipProgress: true,
    apiCallFn: fetchLoadBalancerPoolList,
    payload: route.params.id,
  });
  const floatingIpListCall = makeApiCall({
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
  loadBalancerItem.value = await loadBalancerCall;
  poolList.value = await poolListCall;
  floatingIpList.value = await floatingIpListCall;

  const hasNeededReloadItem = loadBalancerItem.value.status
    .toLowerCase()
    .includes('pending');
  if (hasNeededReloadItem) {
    if (!timer.value) {
      timer.value = window.setInterval(() => {
        void fetchData();
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

const updateDescription = ($event: Record<string, unknown>) => {
  return makeApiCall({
    apiCallFn: updateLoadBalancer,
    payload: { id: loadBalancerItem.value.id, description: $event },
    successCallback: fetchData,
  });
};
const attachFloatingIp = async ($event: {
  auto: boolean;
  selectedFloatingIp: { id: string };
}) => {
  const { auto, selectedFloatingIp } = $event;
  const body = auto ? {} : { fip_id: selectedFloatingIp.id };
  await makeApiCall({
    apiCallFn: lbAttachFloatingIp,
    payload: {
      loadbalancerId: route.params.id,
      body,
    },
    successCallback: () => {
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
const handleDetachFloatingIp = () => {
  uiShowDialog({
    title: t('dialog.detach.title', { resource: t('vm.network.floating.ip') }),
    resourceInfo: [
      {
        title: t('vm.network.floating.ip'),
        value: loadBalancerItem.value.fipAddress,
      },
    ],
    callback: () => {
      if (loadBalancerItem.value.floating_ip.reserved) {
        makeApiCall({
          apiCallFn: detachFloatingIP,
          payload: {
            floatingIpId: loadBalancerItem.value.floating_ip.id,
          },
          successCallback: fetchData,
        });
      } else {
        makeApiCall({
          apiCallFn: deleteVmFloatingIP,
          payload: loadBalancerItem.value.floating_ip.id,
          successCallback: fetchData,
        });
      }
    },
  });
};

const handleCopy = (value: string) => {
  void navigator.clipboard.writeText(value);
  triggerSnackbarCopied();
};

const backToList = () => {
  void router.push({
    name: PAGE_TYPES.VM_LOAD_BALANCER_LIST,
  });
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="$tc('basic.detail.type', { type: $t('services.loadBalancer') })"
      />
      <TabsComponent v-model="tabIndex" :tab-names="tabs" is-card-style>
        <template #tab-0>
          <v-card>
            <v-card-title class="pa-2">
              <v-row no-gutters>
                <v-col cols="12">
                  <DetailActionBtn
                    v-for="(item, index) in [
                      {
                        text: $t('table.action.delete'),
                        icon: 'mdi-delete-outline',
                        visible: true,
                        disabled:
                          loadBalancerItem.status
                            ?.toLowerCase()
                            .includes('pending') ||
                          loadBalancerItem.status?.toLowerCase() === 'deleting',
                        action: () =>
                          openDeleteDialog({
                            item: loadBalancerItem,
                            resourceType: $t('services.loadBalancer'),
                            message: $t('dialog.delete.message.type', {
                              type: $t('services.loadBalancer'),
                            }),
                            deleteAction: () =>
                              makeApiCall({
                                apiCallFn: deleteLoadBalancer,
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
                  <DetailPanelGroup v-model="expansionPanels">
                    <DetailPanel
                      :title="expansionPanels[0].title"
                      :value="expansionPanels[0].value"
                    >
                      <v-row no-gutters class="text-body-2">
                        <v-col
                          v-for="item in [
                            { text: $t('label.name'), key: 'name' },
                            {
                              text: $t('label.serviceState'),
                              key: 'status',
                              isStatus: true,
                            },
                            {
                              text: t('basic.desc'),
                              key: 'description',
                              button: {
                                label: $t('table.action.edit'),
                                disabled: !isStatusActive,
                                callback: () =>
                                  (showEditDescriptionDialog = true),
                              },
                            },
                            {
                              text: $t('vm.network.floating.ip'),
                              key: 'fipAddress',
                              button: loadBalancerItem.fipAddress
                                ? {
                                    label: $t('basic.detach'),
                                    disabled: !isStatusActive,
                                    callback: handleDetachFloatingIp,
                                  }
                                : {
                                    label: $t('basic.configurations'),
                                    disabled: !isStatusActive,
                                    callback: () => {
                                      showAddIpDialog = true;
                                    },
                                  },
                              copy: true,
                            },
                            {
                              text: $t('label.createdAt'),
                              key: 'createdAt',
                              isDateString: true,
                            },
                            { text: $t('label.createdBy'), key: 'creator' },
                            { text: $t('vm.network'), key: 'networkName' },
                            {
                              text: $t('vm.network.private.ip'),
                              key: 'vip',
                              copy: true,
                            },
                          ]"
                          :key="item.key"
                          cols="6"
                          class="pb-4 d-flex align-center"
                        >
                          <DetailItem
                            :title="item.text"
                            :content="loadBalancerItem[item.key] || ''"
                            :is-status="item.isStatus"
                            :status-hint="loadBalancerItem.status_reason"
                          >
                            <v-icon
                              v-if="item.copy && loadBalancerItem[item.key]"
                              class="ml-4"
                              @click="handleCopy(loadBalancerItem[item.key])"
                            >
                              mdi-content-copy
                            </v-icon>
                            <OutlinedBtn
                              v-if="item.button"
                              :class="{
                                'ml-4': !!loadBalancerItem[item.key],
                              }"
                              :text="item.button?.label || ''"
                              :disabled="item.button?.disabled"
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
                    v-for="item in [
                      {
                        text: t('table.action.refresh'),
                        icon: 'mdi-refresh',
                        visible: true,
                        action: fetchData,
                      },
                    ]"
                    :key="item.text"
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
                  <DetailPanelGroup v-model="expansionPanelsListener">
                    <DetailPanel
                      :title="expansionPanelsListener[0].title"
                      :value="expansionPanelsListener[0].value"
                    >
                      <ContainedBtn
                        class="mb-4"
                        :text="$t('table.action.create')"
                        :disabled="!isStatusActive"
                        @click="
                          () => {
                            void router.push({
                              name: PAGE_TYPES.VM_LOAD_BALANCER_LISTENER_CREATE,
                              params: {
                                loadBalancerId: route.params.id,
                              },
                            });
                          }
                        "
                      />
                      <DetailTable
                        :headers="[
                          { title: $t('basic.name'), key: 'name' },
                          { title: $t('basic.protocol'), key: 'protocol' },
                          { title: $t('content.port'), key: 'protocol_port' },
                          { title: $t('vm.lb.target.pool'), key: 'pool.name' },
                          {
                            title: $t('label.serviceState'),
                            key: 'status',
                            isStatus: true,
                          },
                        ]"
                        :items="loadBalancerItem.listeners"
                        :actions="[
                          {
                            label: $t('table.action.delete'),
                            action: (listenerItem: any) =>
                              openDeleteDialog({
                                item: listenerItem,
                                resourceType: $t('vm.lb.listener'),
                                message: $t('dialog.delete.message.type', {
                                  type: $t('vm.lb.listener'),
                                }),
                                deleteAction: () =>
                                  makeApiCall({
                                    apiCallFn: deleteLoadBalancerListener,
                                    payload: {
                                      loadBalancerId: route.params.id,
                                      listenerId: listenerItem.id,
                                    },
                                    successCallback: fetchData,
                                  }),
                              }),
                          },
                        ]"
                        :no-row-hover="false"
                        :click-row-event="
                          (item: any) => {
                            void router.push({
                              name: PAGE_TYPES.VM_LOAD_BALANCER_LISTENER_DETAIL,
                              params: {
                                loadBalancerId: route.params.id,
                                listenerId: item.id,
                              },
                            });
                          }
                        "
                      />
                    </DetailPanel>
                  </DetailPanelGroup>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
        <template #tab-2>
          <v-card>
            <v-card-title class="pa-2">
              <v-row no-gutters>
                <v-col cols="12">
                  <DetailActionBtn
                    v-for="item in [
                      {
                        text: t('table.action.refresh'),
                        icon: 'mdi-refresh',
                        visible: true,
                        action: fetchData,
                      },
                    ]"
                    :key="item.text"
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
                  <DetailPanelGroup v-model="expansionPanelsListener">
                    <DetailPanel
                      :title="
                        $t('basic.info', { type: $t('vm.lb.target.pool') })
                      "
                      :value="expansionPanelsListener[0].value"
                    >
                      <ContainedBtn
                        class="mb-4"
                        :text="$t('basic.create')"
                        :disabled="!isStatusActive"
                        @click="
                          () => {
                            void router.push({
                              name: PAGE_TYPES.VM_LOAD_BALANCER_POOL_CREATE,
                              params: {
                                loadBalancerId: route.params.id,
                              },
                            });
                          }
                        "
                      />
                      <DetailTable
                        :headers="[
                          { title: $t('basic.name'), key: 'name' },
                          { title: $t('basic.protocol'), key: 'protocol' },
                          { title: $t('content.port'), key: 'member_port' },
                          { title: $t('vm.lb.listener'), key: 'listener.name' },
                          {
                            title: $t('label.serviceState'),
                            key: 'status',
                            isStatus: true,
                          },
                        ]"
                        :items="
                          poolList.map(item => ({
                            ...item,
                            listener: {
                              name:
                                item.listeners?.length > 0
                                  ? item.listeners?.map(
                                      (listener: any) => listener.name
                                    )
                                  : null,
                            },
                          }))
                        "
                        :actions="[
                          {
                            label: $t('table.action.delete'),
                            action: (poolItem: any) =>
                              openDeleteDialog({
                                item: poolItem,
                                resourceType: $t('vm.lb.target.pool'),
                                message: $t('dialog.delete.message.type', {
                                  type: $t('vm.lb.target.pool'),
                                }),
                                deleteAction: () =>
                                  makeApiCall({
                                    apiCallFn: deleteLoadBalancerPool,
                                    payload: {
                                      loadBalancerId: route.params.id,
                                      poolId: poolItem.id,
                                    },
                                    successCallback: fetchData,
                                  }),
                              }),
                          },
                        ]"
                        :no-row-hover="false"
                        :click-row-event="
                          (item: any) => {
                            void router.push({
                              name: PAGE_TYPES.VM_LOAD_BALANCER_POOL_DETAIL,
                              params: {
                                loadBalancerId: route.params.id,
                                poolId: item.id,
                              },
                            });
                          }
                        "
                      />
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
      :item-name="loadBalancerItem.name"
      :description="loadBalancerItem.description"
      @update-value="updateDescription"
    />
    <VmAddIpDialog
      v-model:show="showAddIpDialog"
      :floating-ip-list="floatingIpList"
      @submit="$event => attachFloatingIp($event)"
    />
  </UiContainer>
</template>
<style lang="scss" scoped></style>
