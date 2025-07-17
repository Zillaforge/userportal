<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, type Ref } from 'vue';

import { makeApiCall, fetchVmNetworkDetail } from '@/api';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { formatDateSec } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const { uiShowDialog, openDeleteDialog, triggerSnackbarCopied } = useGlobal();
const { router, t, doVmRouterActions, doDeleteVmNetwork } = useVm(
  PAGE_TYPES.VM_NETWORK_DETAIL
);
const tabs = computed(() => [t('basic.overview')]);
const lastUpdatedTime: Ref<Date | string> = ref('');
lastUpdatedTime.value = new Date();
const networkDetail: Record<string, any> = ref({});
const fetchData = async () => {
  await makeApiCall({
    apiCallFn: fetchVmNetworkDetail,
    payload: {
      networkId: router.currentRoute.value.params.id,
    },
    successCallback: res => {
      networkDetail.value = res;
      networkDetail.value.basicInfo = computed(() => [
        {
          text: t('label.name'),
          value: networkDetail.value.name,
        },
        {
          text: t('label.serviceState', { type: t('basic.external.network') }),
          value: networkDetail.value?.router?.state ? 'connect' : 'disconnect',
          isStatus: true,
          statusHint: networkDetail.value.status_reason,
        },
        {
          text: t('basic.cidr'),
          value: networkDetail.value.cidr,
          copy: true,
        },
        {
          text: t('label.createdAt'),
          value: formatDateSec(networkDetail.value.createdAt as string),
        },
        {
          text: t('basic.gateway'),
          value: networkDetail.value.gateway,
          copy: true,
        },
        {
          text: t('label.createdBy'),
          value: networkDetail.value.user.name,
        },
        {
          text: t('label.serviceState'),
          value: networkDetail.value.status,
          isStatus: true,
        },
      ]);
      lastUpdatedTime.value = new Date();
    },
  });
};
onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => {
    await router.push({ name: PAGE_TYPES.VM_NETWORK_LIST });
  });
});

const deleteNetwork: any = async () => {
  await doDeleteVmNetwork(
    router.currentRoute.value.params.id as string,
    async () => {
      await router.push({ name: PAGE_TYPES.VM_NETWORK_LIST });
    }
  );
};

const handleCopy = (value: string) => {
  void navigator.clipboard.writeText(value);
  triggerSnackbarCopied();
};

const detailButton = computed(() => [
  {
    text: t('basic.connect'),
    icon: 'mdi-link',
    visible: networkDetail.value?.router?.state === false,
    action: () => {
      uiShowDialog({
        title: t('vm.network.router.enable.title'),
        resourceInfo: [
          {
            title: t('label.name'),
            value: networkDetail.value.name,
          },
        ],
        callback: async () => {
          await doVmRouterActions(
            {
              action: 'set_state',
              state: true,
            },
            networkDetail.value?.router?.id as string,
            fetchData
          );
        },
      });
    },
  },
  {
    text: t('basic.disconnect'),
    icon: 'mdi-link-off',
    visible: networkDetail.value?.router?.state === true,
    action: () => {
      uiShowDialog({
        title: t('vm.network.router.disable.title'),
        resourceInfo: [
          {
            title: t('label.name'),
            value: networkDetail.value.name,
          },
        ],
        callback: async () => {
          await doVmRouterActions(
            {
              action: 'set_state',
              state: false,
            },
            networkDetail.value?.router?.id as string,
            fetchData
          );
        },
      });
    },
  },
  {
    text: t('table.action.delete'),
    icon: 'mdi-delete-outline',
    visible: true,
    action: () => {
      openDeleteDialog({
        item: networkDetail.value,
        resourceType: t('vm.network'),
        message: t('dialog.delete.message.type', {
          type: t('vm.network'),
        }),
        deleteAction: deleteNetwork,
      });
    },
  },
  {
    text: t('table.action.refresh'),
    icon: 'mdi-refresh',
    visible: true,
    action: () => {
      void fetchData();
    },
  },
]);

const expansionPanels = computed(() => [
  { title: t('label.basicInfo'), value: 'basicInfo' },
]);
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $tc('basic.detail.type', { type: $t('services.virtualNetwork') })
        "
      />
      <v-card width="100%" min-height="50vh" class="mt-4">
        <TabsComponent :tab-names="tabs">
          <template #tab-0>
            <v-card>
              <v-card-title class="pa-2">
                <v-row no-gutters>
                  <v-col cols="12">
                    <DetailActionBtn
                      v-for="item in detailButton.filter(item => item.visible)"
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
                    <DetailPanelGroup v-model="expansionPanels">
                      <DetailPanel
                        :title="expansionPanels[0].title"
                        :value="expansionPanels[0].value"
                      >
                        <v-row no-gutters>
                          <v-col
                            v-for="item in networkDetail.basicInfo"
                            :key="item.text"
                            cols="6"
                            class="pb-4"
                          >
                            <DetailItem
                              :title="item.text"
                              :content="item.value"
                              :is-status="item.isStatus"
                              :status-hint="item.statusHint"
                            >
                              <v-icon
                                v-if="item.copy && item.value"
                                class="ml-4"
                                @click="handleCopy(item.value)"
                              >
                                mdi-content-copy
                              </v-icon>
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
        </TabsComponent>
      </v-card>
    </v-row>
  </UiContainer>
</template>
