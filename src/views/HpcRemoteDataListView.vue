<script lang="ts" setup>
import { ref, computed, onMounted, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchRemoteResourceList,
  syncRemoteResource,
  deleteRemoteResource,
  makeMultipleApiCalls,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  ActionType,
  MainActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import { getDeepObj, generalCopy, formatBytes } from '@/utils/utils';

const { t } = i18n.global;
const { setProjectSwitchCallback } = useProjectSwitch();
const route = useRoute();
const router = useRouter();
const headers = computed(() => getTableHeaders());
const noDataSetting = computed(() => getNoDataSetting(route.name as string));
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const hpcRemoteDataaetList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');
const showDialog: Ref<boolean> = ref(false);
const selectedItemDataPath: Ref<string> = ref('');

const batchDeleteHeaders = computed(() => {
  return [
    { title: '', key: 'checkbox', width: '48px' },
    {
      title: t('label.name'),
      key: 'name',
    },
    { title: t('label.lastSync'), key: 'lastSyncAt', useDateFilter: true },
  ];
});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => await fetchData());
});

const fetchData = async (showLoading: boolean = true) => {
  isLoading.value = showLoading;
  hpcRemoteDataaetList.value = await makeApiCall({
    apiCallFn: fetchRemoteResourceList,
    payload: 'dataset',
    skipProgress: true,
  });

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const getTdItem = (item: Record<string, any>, header: string) => {
  if (header === 'size') {
    const size: number =
      typeof item?.capacity?.bytes === 'number' ? item?.capacity?.bytes : 0;
    return formatBytes(size);
  } else {
    return getDeepObj(item, header);
  }
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteRemoteResource,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const toCreatePage = async () =>
  await router.push({ name: PAGE_TYPES.HPC_REMOTE_DATA_CREATE });
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: $t('services.hpc.remote.data'),
          })
        "
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
            label: $t('action.sync'),
            disabled: (item: any) => item.status === 'migrating',
            action: (item: any) => {
              makeApiCall({
                apiCallFn: syncRemoteResource,
                payload: item.id,
                successCallback: async () => await fetchData(),
              });
            },
          },
          {
            label: $t('action.dataPath'),
            action: (item: any) => {
              selectedItemDataPath = item?.uri ?? '';
              showDialog = true;
            },
          },
          {
            label: $t('action.copyId'),
            action: (item: any) => {
              generalCopy(item.id);
            },
          },
          {
            type: ActionType.DELETE,
            resourceType: $t('services.hpc.remote.data'),
            message: $t('dialog.delete.message.type', {
              type: $t('services.hpc.remote.data'),
            }),
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteRemoteResource,
                payload: item.id,
                successCallback: async () => await fetchData(),
              }),
          },
        ]"
        :batch-delete-setting="{
          items: hpcRemoteDataaetList,
          tableHeaders: batchDeleteHeaders,
          sortKey: 'lastSyncAt',
          action: batchDeleteAction,
        }"
        :items="hpcRemoteDataaetList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'lastSyncAt',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        :has-click-row-handler="false"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getTdItem(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'status'"
            :use-date-filter="header.useDateFilter"
            :status-pending-to-review="false"
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <CommonDialog
      v-model:show="showDialog"
      :title="$t('action.dataPath')"
      :show-cancel-btn="false"
    >
      <v-row no-gutters>
        <v-col :cols="3" class="ocis-form-title">
          {{ $t('action.dataPath') }}
        </v-col>
        <v-col :cols="8" class="ocis-form-title x-scroll">
          {{ selectedItemDataPath }}
        </v-col>
      </v-row>
    </CommonDialog>
  </UiContainer>
</template>
<style lang="scss" scoped>
.x-scroll {
  overflow-x: auto;
  white-space: nowrap;
}
</style>
