<script lang="ts" setup>
import { useProject } from '@/store';
import { computed, onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { TableItem } from '@/interfaces/InfraDataTableInterface';

import {
  RESOURCE_TYPE,
  makeApiCall,
  fetchApplicationList,
  deleteApplication,
  approveApplication,
  rejectApplication,
  makeMultipleApiCalls,
} from '@/api';
import AppReviewDialog from '@/components/AppReviewDialog.vue';
import TD from '@/components/TdHighlight.vue';
import TransferDialog from '@/components/TransferDialog.vue';
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
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import { getDeepObj, generalCopy, isPublicSite } from '@/utils/utils';

const projectStore = useProject();
const { t } = i18n.global;
const { setProjectSwitchCallback } = useProjectSwitch();
const route = useRoute();
const router = useRouter();
const $isPublicSite = isPublicSite();
const headers = computed(() => getTableHeaders());
const noDataSetting = computed(() => getNoDataSetting(route.name as string));
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const appList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');
const showReviewDialog = ref(false);
const showTransferDialog = ref(false);
const selectedApp = ref<Record<string, any>>();

const isAdmin = computed(() => {
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
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
  ];

  if (isAdmin.value) {
    value.push({
      title: t('label.createdBy'),
      key: 'creator.name',
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
  const rawAppList = await makeApiCall({
    apiCallFn: fetchApplicationList,
    skipProgress: true,
  });
  appList.value = rawAppList.map((app: { state: string }) => {
    return {
      ...app,
      status: app.state,
    };
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const linkUrl = computed(() => {
  return Document.APPLICATION;
});

const getKeypairId = computed(() => {
  const keypairAnswer = selectedApp.value?.answers?.answers?.find(
    (answer: { type: string }) => {
      return answer.type === 'vpsKeypair';
    }
  );
  return keypairAnswer?.rawValues ?? '';
});

const reviewAction = async (appId: string, approve: boolean) => {
  if (approve) {
    await makeApiCall({
      apiCallFn: approveApplication,
      payload: appId,
      successCallback: async () => await fetchData(),
    });
  } else {
    await makeApiCall({
      apiCallFn: rejectApplication,
      payload: appId,
      successCallback: async () => await fetchData(),
    });
  }
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteApplication,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const toCreatePage = async () => {
  void router.push({ name: PAGE_TYPES.APPLICATION_CREATE });
};

const toDetailPage = (id: string) => {
  void router.push({ name: PAGE_TYPES.APPLICATION_DETAIL, params: { id } });
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: `${$t('services.application')} `,
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
            label: t('action.copyId'),
            action: (item: any) => {
              generalCopy(item.id);
            },
          },
          {
            label: t('application.review'),
            action: (item: any) => {
              selectedApp = item;
              showReviewDialog = true;
            },
            visible: (item: any) =>
              isAdmin && item.status?.toLowerCase() === 'review',
          },
          {
            label: t('basic.transfer'),
            action: (item: any) => {
              selectedApp = item;
              showTransferDialog = true;
            },
            visible: (item: any) => $isPublicSite && item.shiftable,
          },
          {
            type: ActionType.DELETE,
            resourceType: `${t('services.application')} `,
            message: t('dialog.delete.message.type', {
              type: `${t('services.application')} `,
            }),
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteApplication,
                payload: item.id,
                successCallback: async () => await fetchData(),
              }),
          },
        ]"
        :batch-delete-setting="{
          items: appList,
          tableHeaders: batchDeleteHeaders,
          action: batchDeleteAction,
        }"
        :items="appList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        table-item-key="id"
        :sorting-options="{
          sortBy: 'createdAt',
          isDescending: true,
        }"
        :table-headers="headers"
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
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <AppReviewDialog
      v-model:show="showReviewDialog"
      :item="selectedApp"
      :submit-callback="
        (approve: boolean) => {
          reviewAction(selectedApp?.id ?? '', approve);
        }
      "
    />
    <TransferDialog
      v-model:show="showTransferDialog"
      :resource-id="selectedApp?.id ?? ''"
      :resource-name="selectedApp?.name ?? ''"
      :resource-type="RESOURCE_TYPE.APS"
      :keypair-id="getKeypairId"
    />
  </UiContainer>
</template>
