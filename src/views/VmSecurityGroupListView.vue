<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, type Ref } from 'vue';

import {
  makeApiCall,
  deleteVmSecurityGroup,
  makeMultipleApiCalls,
} from '@/api';
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
const { openDeleteDialog } = useGlobal();
const { setProjectSwitchCallback } = useProjectSwitch();
const { router, noDataSetting, headers, doFetchVmSecurityGroups } = useVm(
  PAGE_TYPES.VM_SECURITY_GROUP_LIST
);
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const vmSecurityGroupList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');

const fetchData = async () => {
  isLoading.value = true;
  await doFetchVmSecurityGroups(true, res => {
    vmSecurityGroupList.value = res;
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};
onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => await fetchData());
});

const toCreatePage = async () => {
  void router.push({ name: PAGE_TYPES.VM_SECURITY_GROUP_CREATE });
};

const toDetailPage = (id: number, sgName: string) => {
  void router.push({
    name: PAGE_TYPES.VM_SECURITY_GROUP_DETAIL,
    params: { id, sgName },
  });
};

const linkUrl = computed(() => {
  return Document.SECURITY_GROUP;
});

const deleteSg = async (id: number) => {
  await makeApiCall({
    apiCallFn: deleteVmSecurityGroup,
    payload: {
      securityGroupId: id,
    },
    successCallback: async () => {
      await fetchData();
    },
  });
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteVmSecurityGroup,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => ({
      securityGroupId: item.id,
    })),
  });
};
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: ` ${$t('services.securityGroup')}`,
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
            label: $t('action.copyId'),
            action: item => generalCopy(item.id),
          },
          {
            label: $t('table.action.delete'),
            action: (item: any) => {
              openDeleteDialog({
                item: item,
                resourceType: $t('services.securityGroup'),
                message: $t('dialog.delete.message.type', {
                  type: $t('services.securityGroup'),
                }),
                deleteAction: () => deleteSg(item.id),
              });
            },
          },
        ]"
        :batch-delete-setting="{
          items: vmSecurityGroupList,
          action: batchDeleteAction,
        }"
        :no-data-setting="noDataSetting"
        :items="vmSecurityGroupList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'createdAt',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        @on-row-click="
          (item: any) => {
            toDetailPage(item.id, item.name);
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
            :search="searchStr"
            :use-date-filter="header.useDateFilter"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
</template>
<style lang="scss" scoped></style>
