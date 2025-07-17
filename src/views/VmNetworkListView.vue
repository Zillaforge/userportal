<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, type Ref } from 'vue';

import { makeApiCall, fetchVmNetworks, makeMultipleApiCalls } from '@/api';
import TD from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {
  MainActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import { getDeepObj, generalCopy } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const { uiShowDialog, openDeleteDialog, triggerSnackbarCopied } = useGlobal();
const {
  router,
  noDataSetting,
  headers,
  isAdmin,
  doDeleteVmNetwork,
  doVmRouterActions,
} = useVm(PAGE_TYPES.VM_NETWORK_LIST);
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const vmNetworkList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');
const fetchData = async () => {
  isLoading.value = true;
  await makeApiCall({
    apiCallFn: fetchVmNetworks,
    successCallback: res => {
      vmNetworkList.value = res.map((item: Record<string, any>) => {
        return {
          ...item,
          external_status: item?.router?.state ? 'connect' : 'disconnect',
        };
      });
    },
    skipProgress: true,
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(() => {
    void fetchData();
  });
});

const toCreatePage = async () => {
  void router.push({ name: PAGE_TYPES.VM_NETWORK_CREATE });
};

const toDetailPage = (id: number) => {
  void router.push({ name: PAGE_TYPES.VM_NETWORK_DETAIL, params: { id } });
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: doDeleteVmNetwork,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const handleCopy = (e: { stopPropagation: () => void }, value: string) => {
  e.stopPropagation();
  void navigator.clipboard.writeText(value);
  triggerSnackbarCopied();
};

const linkUrl = computed(() => {
  return Document.NETWORK;
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: ` ${$t('services.virtualNetwork')}`,
          })
        "
        :link-url="linkUrl"
      />

      <GeneralDataTable
        :main-action-list="
          isAdmin
            ? [
                {
                  type: MainActionType.CREATE,
                  action: toCreatePage,
                },
              ]
            : []
        "
        :more-action-list="
          isAdmin
            ? [
                {
                  label: $t('vm.network.connect'),
                  visible: item => item.external_status === 'disconnect',
                  disabled: item => !item.router,
                  action: item => {
                    uiShowDialog({
                      title: $t('vm.network.router.enable.title'),
                      resourceInfo: [
                        {
                          title: $t('label.name'),
                          value: item.name,
                        },
                      ],
                      callback: async () => {
                        await doVmRouterActions(
                          {
                            action: 'set_state',
                            state: true,
                          },
                          item?.router?.id,
                          fetchData
                        );
                      },
                    });
                  },
                },
                {
                  label: $t('vm.network.disconnect'),
                  visible: item => item.external_status === 'connect',
                  disabled: item => !item.router,
                  action: item => {
                    uiShowDialog({
                      title: $t('vm.network.router.disable.title'),
                      resourceInfo: [
                        {
                          title: $t('label.name'),
                          value: item.name,
                        },
                      ],
                      callback: async () => {
                        await doVmRouterActions(
                          {
                            action: 'set_state',
                            state: false,
                          },
                          item?.router?.id,
                          fetchData
                        );
                      },
                    });
                  },
                },
                {
                  label: $t('action.copyId'),
                  action: (item: TableItem) => generalCopy(item.id),
                },
                {
                  label: $t('table.action.delete'),
                  action: (item: any) => {
                    openDeleteDialog({
                      item: item,
                      resourceType: $t('vm.network'),
                      message: $t('dialog.delete.message.type', {
                        type: $t('vm.network'),
                      }),
                      deleteAction: async () =>
                        await doDeleteVmNetwork(item.id, fetchData),
                    });
                  },
                },
              ]
            : []
        "
        :batch-delete-setting="
          isAdmin
            ? {
                items: vmNetworkList,
                action: batchDeleteAction,
              }
            : undefined
        "
        :items="vmNetworkList"
        :last-updated-time="lastUpdatedTime"
        :no-data-setting="noDataSetting"
        :loading="isLoading"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'createdAt',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        :has-click-row-handler="isAdmin"
        @on-row-click="
          (item: any) => {
            toDetailPage(item.id);
          }
        "
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :is-status="
              header.key === 'status' || header.key === 'external_status'
            "
            :use-date-filter="header.useDateFilter"
            :search="searchStr"
          >
            <v-icon
              v-if="
                (header.key === 'cidr' || header.key === 'gateway') &&
                getDeepObj(item, header.key)
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
  </UiContainer>
</template>
<style lang="scss" scoped></style>
