<script lang="ts" setup>
import { useProject } from '@/store';
import { computed, ref, onMounted, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchRemoteTaskList,
  deleteRemoteTask,
  makeMultipleApiCalls,
} from '@/api';
import StartRemoteTaskDialog from '@/components/StartRemoteTaskDialog.vue';
import TD from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  ActionType,
  MainActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import { getDeepObj, generalCopy } from '@/utils/utils';

const { t } = i18n.global;
const { setProjectSwitchCallback } = useProjectSwitch();
const route = useRoute();
const router = useRouter();
const projectStore = useProject();
const headers = computed(() => getTableHeaders());
const noDataSetting = computed(() => getNoDataSetting(route.name as string));
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const HpcRemoteTaskList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');
const showCreateJobDialog = ref(false);

const isTenantAdmin = computed(() => {
  return projectStore.isTenantAdmin;
});

const batchDeleteHeaders = computed(() => {
  const value = [
    { title: '', key: 'checkbox', width: '48px' },
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('label.lastModified'),
      key: 'updatedAt',
      useDateFilter: true,
    },
  ];

  if (isTenantAdmin.value) {
    value.push({
      title: t('label.createdBy'),
      key: 'user.displayName',
    });
  }
  return value;
});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => await fetchData());
});

const fetchData = async (showLoading: boolean = true) => {
  isLoading.value = showLoading;
  HpcRemoteTaskList.value = await makeApiCall({
    apiCallFn: fetchRemoteTaskList,
    skipProgress: true,
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteRemoteTask,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const toCreatePage = async () => {
  await router.push({ name: PAGE_TYPES.HPC_REMOTE_TASK_CREATE });
};
const toDetailPage = (id: string) => {
  void router.push({ name: PAGE_TYPES.HPC_REMOTE_TASK_DETAIL, params: { id } });
};

const selectedTaskId: Ref<string> = ref('');

const linkUrl = computed(() => {
  return Document.HPC_REMOTE;
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: $t('services.hpc.deliver'),
          })
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
            label: $t('table.action.start'),
            action: (item: any) => {
              selectedTaskId = item.id;
              showCreateJobDialog = true;
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
            resourceType: ` ${$t('services.hpc.deliver')}`,
            message: $t('dialog.delete.message.type', {
              type: $t('services.hpc.deliver'),
            }),
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteRemoteTask,
                payload: item.id,
                successCallback: async () => await fetchData(),
              }),
          },
        ]"
        :batch-delete-setting="{
          items: HpcRemoteTaskList,
          tableHeaders: batchDeleteHeaders,
          sortKey: 'updatedAt',
          action: batchDeleteAction,
        }"
        :items="HpcRemoteTaskList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'updatedAt',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
        @on-row-click="
          (item: any) => {
            toDetailPage(item.id);
          }
        "
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'status'"
            :use-date-filter="header.useDateFilter"
            :status-pending-to-review="false"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
  <StartRemoteTaskDialog
    v-model:show="showCreateJobDialog"
    :task-id="selectedTaskId"
    :star-action-callback="fetchData"
  />
</template>
