<script lang="ts">
import { useProject } from '@/store';
import { ref, watch, computed, onMounted, type Ref } from 'vue';

import { fetchApiKeyList, deleteApiKey, makeApiCall } from '@/api';
import CreateApiKeyDialog from '@/components/CreateApiKeyDialog.vue';
import TD from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  ActionType,
  MainActionType,
  type TableHeader,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import { getDeepObj } from '@/utils/utils';

export default {
  name: 'ApiKeyView',
};
</script>

<script lang="ts" setup>
const projectStore = useProject();
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const searchStr: Ref<string> = ref('');
const showCreateDialog: Ref<boolean> = ref(false);
const apiKeyList: Ref<Record<string, any>[]> = ref([]);
const headers = ref<TableHeader[]>([]);

const projectId = computed(() => projectStore.getCurrentProject?.id);
const linkUrl = computed(() => {
  return Document.KEY;
});

const noDataSetting = computed(() => ({
  ...getNoDataSetting(PAGE_TYPES.KEY_API),
  action: openCreateDialog,
}));

onMounted(() => {
  init();
  void fetchData();
});

const init = () => {
  headers.value = getTableHeaders(PAGE_TYPES.KEY_API);
};

const fetchData = async () => {
  isLoading.value = true;
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchApiKeyList,
    successCallback: res => {
      apiKeyList.value = res;
      lastUpdatedTime.value = new Date();
    },
  });
  isLoading.value = false;
};

const openCreateDialog = () => {
  showCreateDialog.value = true;
};

const deleteAction = (id: string) => {
  isLoading.value = true;
  makeApiCall({
    skipProgress: true,
    apiCallFn: deleteApiKey,
    payload: id,
    successCallback: () => {
      void fetchData();
    },
    errorCallback: () => {
      isLoading.value = false;
    },
  });
};

watch(projectId, () => {
  void fetchData();
});

watch(
  () => i18n.global.locale,
  () => {
    init();
  }
);

watch(showCreateDialog, val => {
  if (!val) {
    void fetchData();
  }
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="$t('basic.management.type', { type: $t('keyMgnt.api') })"
        :link-url="linkUrl"
      />
      <GeneralDataTable
        :main-action-list="[
          {
            type: MainActionType.CREATE,
            action: openCreateDialog,
          },
        ]"
        :more-action-list="[
          {
            type: ActionType.DELETE,
            action: item => deleteAction(String(item.id)),
          },
        ]"
        :resource-info="[
          {
            title: $t('label.name'),
            keyOfvalue: 'description',
          },
        ]"
        :items="apiKeyList"
        :last-updated-time="lastUpdatedTime"
        :table-headers="headers"
        :table-item-key="'id'"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'createdAt',
          isDescending: true,
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
            :use-date-filter="header.useDateFilter"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
  <CreateApiKeyDialog v-model:show="showCreateDialog" />
</template>
