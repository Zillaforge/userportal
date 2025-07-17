<script lang="ts">
import { useGlobal, useProject } from '@/store';
import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchResourceTransferHistoryList,
  deleteResourceTransferHistory,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
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
  name: 'ResourceTransferDetailListView',
};
</script>

<script lang="ts" setup>
const { t } = i18n.global;
const route = useRoute();
const router = useRouter();
const globalStore = useGlobal();
const projectStore = useProject();

const isLoading: Ref<boolean> = ref(false);
const searchStr: Ref<string> = ref('');
const lastUpdatedTime: Ref<Date | string> = ref('');
const historyList: Ref<TableItem[]> = ref([]);
const serverName: Ref<string> = ref('');

const headers = computed(() =>
  getTableHeaders(PAGE_TYPES.RESOURCE_TRANSFER_DETAIL_LIST)
);

const noDataSetting = computed(() =>
  getNoDataSetting(PAGE_TYPES.RESOURCE_TRANSFER_DETAIL_LIST)
);

const projectId = computed(() => projectStore.getCurrentProject?.id);

const title = computed(() => serverName.value || String(route.params.serverId));

onMounted(() => {
  void fetchData();
});

const fetchData = async () => {
  isLoading.value = true;
  const response = await makeApiCall({
    apiCallFn: fetchResourceTransferHistoryList,
    payload: {
      resourceType: route.params.resourceType,
      serverId: route.params.serverId,
    },
    skipProgress: true,
    errorResHandlingFn: () => {},
  });
  historyList.value = response.histories ?? [];
  serverName.value = response.server?.name ?? '';
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const deleteAction = async (item: TableItem) => {
  isLoading.value = true;
  await makeApiCall({
    apiCallFn: deleteResourceTransferHistory,
    payload: {
      resourceType: route.params.resourceType,
      serverId: route.params.serverId,
      historyId: item.id,
    },
    skipProgress: true,
    successCallback: fetchData,
    errorCallback: () => (isLoading.value = false),
  });
};

const handleCopy = (value: string) => {
  void navigator.clipboard.writeText(value);
  globalStore.triggerSnackbar({ content: t('basic.copied') });
};

const gotoListPage = async () => {
  await router.push({
    name: PAGE_TYPES.RESOURCE_TRANSFER_LIST,
  });
};

watch(
  title,
  () => {
    globalStore.setBreadcrumbsParams({
      name: title.value,
    });
  },
  { immediate: true }
);

watch(projectId, () => {
  void gotoListPage();
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp :title="title" />
      <GeneralDataTable
        :more-action-list="[
          {
            label: $t('action.copyId'),
            action: item => handleCopy(String(item.id)),
          },
          {
            type: ActionType.DELETE,
            action: item => deleteAction(item),
          },
        ]"
        :resource-info="[
          {
            title: $t('resourceTransfer.name'),
            keyOfvalue: 'serverName',
          },
          {
            title: $t('resourceTransfer.version'),
            keyOfvalue: 'tagName',
          },
        ]"
        :items="historyList"
        :last-updated-time="lastUpdatedTime"
        :table-headers="headers"
        :table-item-key="'name'"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :has-click-row-handler="false"
        :sorting-options="{
          sortBy: 'name',
          isDescending: false,
        }"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
</template>
