<script lang="ts" setup>
import { computed, onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchFileSharingList,
  deleteFileSharing,
  makeMultipleApiCalls,
} from '@/api';
import TdHighlight from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {
  MainActionType,
  ActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import { getDeepObj, generalCopy } from '@/utils/utils';

const route = useRoute();
const router = useRouter();
const { setProjectSwitchCallback } = useProjectSwitch();
const headers = computed(() => getTableHeaders());
const noDataSetting = computed(() => getNoDataSetting(route.name as string));
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const fileSharingList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => await fetchData());
});
const fetchData = async () => {
  isLoading.value = true;
  fileSharingList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchFileSharingList,
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const toCreatePage = async () =>
  await router.push({ name: PAGE_TYPES.FILE_SHARING_CREATE });

const toDetailPage = async (id: string | number) => {
  await router.push({ name: PAGE_TYPES.FILE_SHARING_DETAIL, params: { id } });
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteFileSharing,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const disabledDelete = (item: TableItem) => item.status === 'creating';

const deletableList = computed(() =>
  fileSharingList.value.filter((item: TableItem) => !disabledDelete(item))
);

const linkUrl = computed(() => {
  return Document.FILE_SHARING;
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', { type: $t('services.fileSharing') })
        "
        :link-url="linkUrl"
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
            label: $t('action.copyId'),
            action: (item: any) => generalCopy(item.id),
          },
          {
            type: ActionType.DELETE,
            resourceType: $t('services.fileSharing'),
            message: $t('dialog.delete.message.type', {
              type: $t('services.fileSharing'),
            }),
            disabled: (item: any) => item.status === 'creating',
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteFileSharing,
                payload: item.id,
                successCallback: fetchData,
              }),
          },
        ]"
        :batch-delete-setting="{
          items: deletableList,
          action: batchDeleteAction,
        }"
        :items="fileSharingList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'create_time',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
        @on-row-click="(item: any) => toDetailPage(item.id)"
      >
        <template #item="{ item }">
          <TdHighlight
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :search="searchStr"
            :is-status="header.key === 'status'"
            :use-date-filter="header.key === 'createdAt'"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
</template>
