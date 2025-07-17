<script lang="ts" setup>
import { computed, ref, onMounted, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchAutoScalingList,
  deleteAutoScaling,
  makeMultipleApiCalls,
  approveAutoScaling,
  rejectAutoScaling,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import VmReviewDialog from '@/components/VmReviewDialog.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {
  ActionType,
  MainActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import { getDeepObj, generalCopy } from '@/utils/utils';
const route = useRoute();
const router = useRouter();
const noDataSetting = computed(() => getNoDataSetting(route.name as string));
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const autoScalingList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');
const headers = computed(() => getTableHeaders());
const { setProjectSwitchCallback } = useProjectSwitch();
const { isAdmin } = useVm(PAGE_TYPES.VM_AUTO_SCALING_LIST);
const selectedASG = ref<TableItem>({});
const showReviewDialog = ref(false);

const fetchData = async () => {
  isLoading.value = true;
  autoScalingList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchAutoScalingList,
    successCallback: res =>
      res.sort(
        (a: { createdAt: string }, b: { createdAt: string }) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
  });

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(fetchData);
});

const linkUrl = computed(() => {
  return Document.AUTO_SCALING;
});

const toDetailPage = (id: number) => {
  void router.push({ name: PAGE_TYPES.VM_AUTO_SCALING_DETAIL, params: { id } });
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteAutoScaling,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', { type: $t('services.autoScaling') })
        "
        :link-url="linkUrl"
      />

      <GeneralDataTable
        :main-action-list="[
          {
            type: MainActionType.CREATE,
            action: () =>
              router.push({ name: PAGE_TYPES.VM_AUTO_SCALING_CREATE }),
          },
        ]"
        :more-action-list="[
          {
            label: $tc('basic.review', 2),
            action: (item: any) => {
              selectedASG = item;
              showReviewDialog = true;
            },
            visible: (item: any) =>
              isAdmin && item.status.toLowerCase() === 'pending',
          },
          {
            label: $t('action.copyId'),
            action: item => generalCopy(item.id),
          },
          {
            type: ActionType.DELETE,
            resourceType: $t('services.autoScaling'),
            message: $t('dialog.delete.message.type', {
              type: $t('services.autoScaling'),
            }),
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteAutoScaling,
                payload: item.id,
                successCallback: fetchData,
              }),
          },
        ]"
        :batch-delete-setting="{
          items: autoScalingList,
          action: batchDeleteAction,
        }"
        :items="autoScalingList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        table-item-key="id"
        :sorting-options="{
          sortBy: 'createAt',
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
            :use-date-filter="header.key === 'createdAt'"
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <VmReviewDialog
      v-model:show="showReviewDialog"
      type="asg"
      :item="selectedASG"
      :submit-callback="
        (approve: boolean) => {
          makeApiCall({
            apiCallFn: approve ? approveAutoScaling : rejectAutoScaling,
            payload: selectedASG.id,
            successCallback: fetchData,
          });
        }
      "
    />
  </UiContainer>
</template>
