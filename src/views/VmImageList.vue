<script lang="ts" setup>
import { useUser, useProject } from '@/store';
import { storeToRefs } from 'pinia';
import { computed, ref, type Ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchVmImageRegistry,
  fetchVirtualImages,
  updateVirtualImage,
  deleteVirtualImage,
  makeMultipleApiCalls,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import UsageDialog from '@/components/common/UsageDialog.vue';
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
import { getDeepObj } from '@/utils/utils';

const { t } = i18n.global;

const route = useRoute();
const router = useRouter();
const userStore = useUser();
const { isTenantAdmin } = storeToRefs(useProject());
const { setProjectSwitchCallback } = useProjectSwitch();

const headers = computed(() => getTableHeaders());
const noDataSetting = computed(() => getNoDataSetting(route.name as string));

const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const vmImageList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');

const showUsageDialog = ref(false);
const usedBytes = ref(0);
const allocatedBytes = ref(0);
const usedCount = ref(0);
const allocatedCount = ref(0);

const showEditDescriptionDialog = ref(false);
const editingImage = ref({ id: '', name: '' });
const editingImageDesc = ref('');

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => await fetchData());
});

const fetchData = async () => {
  isLoading.value = true;
  vmImageList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchVirtualImages,
    errorResHandlingFn: () => [],
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const toCreatePage = async () =>
  await router.push({ name: PAGE_TYPES.VM_IMAGE_CREATE });

const updateDescription = ($event: Record<string, unknown>) => {
  return makeApiCall({
    apiCallFn: updateVirtualImage,
    payload: { imageId: editingImage.value.id, description: $event },
    successCallback: fetchData,
  });
};

const deletable = (item: Record<string, any>) =>
  item.creator.id === userStore.getUserInfo.userId || isTenantAdmin;

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteVirtualImage,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const linkUrl = computed(() => {
  return Document.VM_IMAGE;
});

const deletableList = computed(() =>
  vmImageList.value.filter((image: Record<string, any>) => deletable(image))
);

const batchDeleteHeaders = computed(() => {
  const value = [
    { title: '', key: 'checkbox', width: '48px' },
    {
      title: t('label.name'),
      key: 'name',
    },
  ];
  if (isTenantAdmin.value) {
    value.push({
      title: t('label.createdBy'),
      key: 'creator.displayName',
    });
  }
  return value;
});

const toDetailPage = async (imageId: string) => {
  await router.push({
    name: PAGE_TYPES.VM_IMAGE_DETAIL,
    params: { repoId: imageId },
  });
};
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: $t('image.virtualMachine'),
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
            label: $t('action.edit.type', { type: $t('basic.desc') }),
            action: (item: any) => {
              editingImage = item;
              editingImageDesc = item.description;
              showEditDescriptionDialog = true;
            },
            disabled: item =>
              item.creator.id !== userStore.getUserInfo.userId &&
              !isTenantAdmin,
          },
          {
            type: ActionType.DELETE,
            resourceType: $t('services.vmImageManage'),
            message: $t('dialog.delete.message.type', {
              type: $t('services.vmImageManage'),
            }),
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteVirtualImage,
                payload: item.id,
                successCallback: fetchData,
              }),
            disabled: item =>
              item.creator.id !== userStore.getUserInfo.userId &&
              !isTenantAdmin,
          },
        ]"
        :custom-btn="{
          label: $t('s3.usage'),
          action: async () => {
            const registry = await makeApiCall({
              apiCallFn: fetchVmImageRegistry,
            });
            usedBytes = registry.usedSize;
            allocatedBytes = registry.softLimitSize;
            usedCount = registry.usedCount;
            allocatedCount = registry.softLimitCount;
            showUsageDialog = true;
          },
        }"
        :batch-delete-setting="{
          items: deletableList,
          tableHeaders: batchDeleteHeaders,
          action: batchDeleteAction,
        }"
        :items="vmImageList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'udpate_time',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
        @on-row-click="(item: any) => toDetailPage(item.id)"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'status'"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
  <EditDescriptionDialog
    v-model:show="showEditDescriptionDialog"
    :item-name="editingImage.name"
    :description="editingImageDesc"
    @update-value="updateDescription"
  />
  <UsageDialog
    v-model:show="showUsageDialog"
    :used-bytes="usedBytes"
    :allocated-bytes="allocatedBytes"
    :used-count="usedCount"
    :allocated-count="allocatedCount"
    show-count-info
  />
</template>
