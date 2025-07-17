<script lang="ts" setup>
import { useGlobal, useProject } from '@/store';
import { computed, ref, type Ref, onMounted } from 'vue';

import { makeMultipleApiCalls, RESOURCE_TYPE } from '@/api';
import TD from '@/components/TdHighlight.vue';
import TransferDialog from '@/components/TransferDialog.vue';
import VmCreateImageDialog from '@/components/VmCreateImageDialog.vue';
import VmLogDialog from '@/components/VmLogDialog.vue';
import VmReviewDialog from '@/components/VmReviewDialog.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  MainActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import { SERVER_ACTION, REBOOT_TYPE } from '@/interfaces/VmInterface';
import { getDeepObj, generalCopy, isPublicSite } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const {
  t,
  router,
  headers,
  noDataSetting,
  deletable,
  isAdmin,
  isOwner,
  doFetchVmList,
  doDeleteVm,
  doServerAction,
} = useVm(PAGE_TYPES.VM_LIST);
const { uiShowDialog, openDeleteDialog, getIsPilotRegion } = useGlobal();
const projectStore = useProject();
const $isPublicSite = isPublicSite();

const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const searchStr: Ref<string> = ref('');

const vmList: Ref<Record<string, any>[]> = ref([]);
const logs = ref<string[]>();
const selectedVm = ref<TableItem>();
const showLogDialog = ref(false);
const showReviewDialog = ref(false);
const showCreateImageDialog = ref(false);
const showTransferDialog = ref(false);
const selectedItem = ref<TableItem>({ id: '' });
const selectedResourceId = ref<string>('');
const selectedResourceName = ref<string>('');
const selectedResourceKeypairId = ref<string>();

const fetchData = async () => {
  isLoading.value = true;
  await doFetchVmList(true, res => {
    vmList.value = res;
  });

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => await fetchData());
});

const linkUrl = computed(() => {
  return Document.VM;
});

const deletableList = computed(() =>
  vmList.value.filter((item: TableItem) => deletable(item.user?.id as string))
);

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
      title: t('vm.network.private.ip'),
      key: 'private_ips',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
  ];
  if (isTenantAdmin.value) {
    value.push({
      title: t('label.createdBy'),
      key: 'user.name',
    });
  }
  return value;
});

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: doDeleteVm,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const showRebootDialog = (item: TableItem) => {
  uiShowDialog({
    title: t('vm.reboot.dialog.title'),
    resourceInfo: [
      {
        title: t('label.name'),
        value: item.name,
      },
    ],
    message: t('vm.reboot.dialog.message', {
      link: Document.VM[i18n.global.locale],
    }),
    messageWithLink: true,
    showWarningIcon: true,
    callback: async () => {
      await doServerAction(
        { action: SERVER_ACTION.REBOOT, reboot_type: REBOOT_TYPE.SOFT },
        item.id as string,
        fetchData
      );
    },
  });
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', { type: $t('services.virtualMachine') })
        "
        :link-url="linkUrl"
      />
      <GeneralDataTable
        :main-action-list="[
          {
            type: MainActionType.CREATE,
            action: () => router.push({ name: PAGE_TYPES.VM_CREATE }),
          },
        ]"
        :more-action-list="[
          {
            label: $t('table.action.start'),
            visible: (item: any) => item.status.toLowerCase() === 'shutoff',
            action: (item: any) => {
              uiShowDialog({
                title: $t('dialog.start.title', {
                  resource: $t('services.virtualMachine'),
                }),
                resourceInfo: [
                  {
                    title: $t('label.name'),
                    value: item.name,
                  },
                ],
                callback: async () => {
                  await doServerAction(
                    { action: SERVER_ACTION.START },
                    item.id,
                    fetchData
                  );
                },
              });
            },
          },
          {
            label: $t('table.action.stop'),
            visible: (item: any) => item.status.toLowerCase() === 'active',
            action: (item: any) => {
              uiShowDialog({
                title: $t('dialog.stop.title', {
                  resource: $t('services.virtualMachine'),
                }),
                resourceInfo: [
                  {
                    title: $t('label.name'),
                    value: item.name,
                  },
                ],
                callback: async () => {
                  await doServerAction(
                    { action: SERVER_ACTION.STOP },
                    item.id,
                    fetchData
                  );
                },
              });
            },
          },
          {
            label: $t('action.reboot'),
            disabled: (item: any) => item.status.toLowerCase() !== 'active',
            action: (item: TableItem) => showRebootDialog(item),
          },
          {
            label: $t('action.createImage'),
            disabled: (item: any) =>
              (item.status.toLowerCase() !== 'active' &&
                item.status.toLowerCase() !== 'shutoff') ||
              (!isOwner(item.user?.id) && !isAdmin),
            action: (item: TableItem) => {
              selectedItem = item;
              showCreateImageDialog = true;
            },
          },
          {
            label: $tc('basic.review', 2),
            action: (item: any) => {
              selectedVm = item;
              showReviewDialog = true;
            },
            visible: (item: any) =>
              isAdmin && item.status.toLowerCase() === 'pending',
          },
          {
            label: $t('basic.transfer'),
            action: item => {
              selectedResourceId = item.id;
              selectedResourceName = item.name;
              selectedResourceKeypairId = item.keypair_id;
              showTransferDialog = true;
            },
            disabled: item => item.status.toLowerCase() !== 'active',
            visible: () => $isPublicSite && !getIsPilotRegion,
          },
          {
            label: $t('action.copyId'),
            action: item => generalCopy(item.id),
          },
          {
            label: $t('table.action.delete'),
            disabled: item => !deletable(item.user.id),
            action: (item: any) =>
              openDeleteDialog({
                item: item,
                resourceType: $t('services.virtualMachine'),
                message: $t('dialog.delete.message.type', {
                  type: $t('services.virtualMachine'),
                }),
                deleteAction: async () => doDeleteVm(item.id, fetchData),
                // await makeApiCall({
                //   apiCallFn: deleteVm,
                //   payload: { serverId: item.id },
                //   successCallback: () => fetchData(),
                // }),
              }),
          },
        ]"
        :batch-delete-setting="{
          items: deletableList,
          tableHeaders: batchDeleteHeaders,
          action: batchDeleteAction,
        }"
        :items="vmList"
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
            router.push({
              name: PAGE_TYPES.VM_DETAIL,
              params: { id: item.id },
            });
          }
        "
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key) || '-'"
            :is-cursor-pointer="false"
            :use-date-filter="header.useDateFilter"
            :search="searchStr"
            :is-status="header.key === 'status'"
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <VmLogDialog v-model:show="showLogDialog" :logs="logs" />
    <VmReviewDialog
      v-model:show="showReviewDialog"
      type="vm"
      :item="selectedVm"
      :submit-callback="
        (approve: boolean) => {
          doServerAction(
            { action: approve ? SERVER_ACTION.APPROVE : SERVER_ACTION.REJECT },
            selectedVm?.id,
            fetchData
          );
        }
      "
    />
    <TransferDialog
      v-model:show="showTransferDialog"
      :resource-id="selectedResourceId"
      :resource-name="selectedResourceName"
      :resource-type="RESOURCE_TYPE.VPS"
      :keypair-id="selectedResourceKeypairId"
    />
    <VmCreateImageDialog
      v-model:show="showCreateImageDialog"
      :server-id="selectedItem.id"
    />
  </UiContainer>
</template>
