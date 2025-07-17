<script lang="ts">
import { useProject } from '@/store';
import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  fetchResourceTransferList,
  deleteResourceTransfer,
  makeApiCall,
  RESOURCE_TYPE,
  makeMultipleApiCalls,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  ActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import { getDeepObj } from '@/utils/utils';

export default {
  name: 'ResourceTransferListView',
};
</script>

<script lang="ts" setup>
const { t } = i18n.global;
const router = useRouter();
const projectStore = useProject();

const isLoading: Ref<boolean> = ref(false);
const searchStr: Ref<string> = ref('');
const lastUpdatedTime: Ref<Date | string> = ref('');
const dataList: Ref<TableItem[]> = ref([]);

const linkUrl = computed(() => {
  return Document.RESOURCE_TRANSFER;
});

const headers = computed(() =>
  getTableHeaders(PAGE_TYPES.RESOURCE_TRANSFER_LIST)
);

const noDataSetting = computed(() =>
  getNoDataSetting(PAGE_TYPES.RESOURCE_TRANSFER_LIST)
);

const projectId = computed(() => projectStore.getCurrentProject?.id);

const batchDeleteHeaders = computed(() => {
  return [
    { title: '', key: 'checkbox', width: '48px' },
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('resourceTransfer.owner'),
      key: 'owner.displayName',
    },
  ];
});

onMounted(() => {
  void fetchData();
});

const fetchData = async () => {
  isLoading.value = true;
  dataList.value = await makeApiCall({
    apiCallFn: fetchResourceTransferList,
    skipProgress: true,
    errorResHandlingFn: () => [],
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const deleteAction = async (item: TableItem) => {
  isLoading.value = true;
  await makeApiCall({
    apiCallFn: deleteResourceTransfer,
    payload: {
      resourceType: item.type,
      serverId: item.id,
    },
    skipProgress: true,
    successCallback: fetchData,
    errorCallback: () => {
      isLoading.value = false;
    },
  });
};

const toDetailPage = async (item: TableItem) => {
  return await router.push({
    name: PAGE_TYPES.RESOURCE_TRANSFER_DETAIL_LIST,
    params: {
      resourceType: item.type,
      serverId: item.id,
    },
  });
};

const getTableTdItem = (item: TableItem, headerKey: string) => {
  const value = getDeepObj(item, headerKey);
  if (headerKey === 'type') {
    if (value === RESOURCE_TYPE.VPS) {
      return t('services.virtualMachine');
    } else if (value === RESOURCE_TYPE.APS) {
      return t('services.application');
    }
  }
  return value;
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteResourceTransfer,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => ({
      resourceType: item.type,
      serverId: item.id,
    })),
  });
};

watch(projectId, () => {
  void fetchData();
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', { type: $t('services.resourceTransfer') })
        "
        :link-url="linkUrl"
      />
      <GeneralDataTable
        :more-action-list="[
          {
            type: ActionType.DELETE,
            action: item => deleteAction(item),
          },
        ]"
        :resource-info="[
          {
            title: $t('resourceTransfer.sourceName'),
            keyOfvalue: 'name',
          },
        ]"
        :batch-delete-setting="{
          items: dataList,
          tableHeaders: batchDeleteHeaders,
          action: batchDeleteAction,
        }"
        :items="dataList"
        :last-updated-time="lastUpdatedTime"
        :table-headers="headers"
        :table-item-key="'name'"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'name',
          isDescending: false,
        }"
        @fetch-data="fetchData"
        @on-row-click="toDetailPage($event)"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getTableTdItem(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
</template>
