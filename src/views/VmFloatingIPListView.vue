<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, type Ref } from 'vue';

import {
  makeApiCall,
  fetchVmFloatingIP,
  createVmFloatingIP,
  deleteVmFloatingIP,
  updateVmFloatingIP,
  detachFloatingIP,
  approveFloatingIP,
  rejectFloatingIP,
  fetchK8sClusters,
  makeMultipleApiCalls,
  fetchApplicationList,
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
  MainActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import { getDeepObj } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const {
  uiShowDialog,
  openDeleteDialog,
  triggerSnackbarCopied,
  getIsPilotRegion,
} = useGlobal();
const { projectId, headers, noDataSetting, isAdmin } = useVm(
  PAGE_TYPES.VM_FLOATING_IP_LIST
);
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const vmFloatingIpList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');
const k8sList: Ref<Record<string, any>[]> = ref([]);
const appList: Ref<Record<string, any>[]> = ref([]);
const fetchData = async () => {
  isLoading.value = true;

  await makeApiCall({
    apiCallFn: fetchK8sClusters,
    payload: projectId.value,
    successCallback: res => {
      k8sList.value = res;
    },
    skipProgress: true,
  });
  if (!getIsPilotRegion) {
    await makeApiCall({
      apiCallFn: fetchApplicationList,
      successCallback: res => {
        appList.value = res;
      },
      skipProgress: true,
    });
  }
  await makeApiCall({
    apiCallFn: fetchVmFloatingIP,
    payload: projectId.value,
    successCallback: res => {
      vmFloatingIpList.value = res.map((item: Record<string, any>) => ({
        ...item,
        device_name: remapDeviceName(item),
        reserved: item.reserved ? 'reserved' : 'unreserved',
        name: item.address,
      }));
    },
    skipProgress: true,
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const remapDeviceName = (item: Record<string, any>) => {
  switch (item.device_type) {
    case 'kaas':
      return item.device_id
        ? k8sList.value.find(k8s => k8s.id === item.device_id)?.name
        : '';
    case 'appaas':
      return item.device_id
        ? appList.value.find(app => app.id === item.device_id)?.name
        : '';
    default:
      return item.device_name;
  }
};

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => await fetchData());
});

const createFIP = async () => {
  await makeApiCall({
    apiCallFn: createVmFloatingIP,
    payload: projectId.value,
    successCallback: async () => {
      await fetchData();
    },
  });
};

const updateFIP = async (id: string, body: Record<string, any>) => {
  await makeApiCall({
    apiCallFn: updateVmFloatingIP,
    payload: { floatingIpId: id, body },
    successCallback: async () => {
      await fetchData();
    },
  });
};

const disassociateFIP = (id: string) => {
  return makeApiCall({
    apiCallFn: detachFloatingIP,
    payload: { floatingIpId: id },
    successCallback: async () => {
      await fetchData();
    },
  });
};

const linkUrl = computed(() => {
  return Document.FLOATING_IP;
});

const reviewDialog: Ref<boolean> = ref(false);
const selectedFIP: Ref<Record<string, any>> = ref([]);

const approveFIP = async (id: string) => {
  await makeApiCall({
    apiCallFn: approveFloatingIP,
    payload: { floatingIpId: id },
    successCallback: async () => {
      await fetchData();
    },
  });
};

const rejectFIP = async (id: string) => {
  await makeApiCall({
    apiCallFn: rejectFloatingIP,
    payload: { floatingIpId: id },
    successCallback: async () => {
      await fetchData();
    },
  });
};

const getLink = (type: string) => {
  switch (type) {
    case 'server':
      return PAGE_TYPES.VM_DETAIL;
    case 'lb':
      return PAGE_TYPES.VM_LOAD_BALANCER_DETAIL;
    case 'kaas':
      return PAGE_TYPES.K8S_CLUSTER_DETAIL;
    case 'appaas':
      return PAGE_TYPES.APPLICATION_DETAIL;
    default:
      return '';
  }
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteVmFloatingIP,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const handleCopy = (e: { stopPropagation: () => void }, value: string) => {
  e.stopPropagation();
  void navigator.clipboard.writeText(value);
  triggerSnackbarCopied();
};
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: ` ${$t('vm.network.floating.ip')}`,
          })
        "
        :link-url="linkUrl"
      />

      <GeneralDataTable
        :main-action-list="[
          {
            type: MainActionType.CREATE,
            action: () => createFIP(),
          },
        ]"
        :more-action-list="[
          {
            label: $t('basic.reserved'),
            visible: item => item.reserved === 'unreserved',
            disabled: item => item.status.toLowerCase() === 'pending',
            action: item => {
              uiShowDialog({
                title: $t('vm.floating.ip.reserve.title'),
                resourceInfo: [
                  {
                    title: 'IP',
                    value: item.address,
                  },
                ],
                callback: () => updateFIP(item.id, { reserved: true }),
              });
            },
          },
          {
            label: $t('basic.unreserve'),
            visible: item => item.reserved === 'reserved',
            disabled: item => item.status !== 'ACTIVE',
            action: item => {
              uiShowDialog({
                title: $t('vm.floating.ip.unreserve.title'),
                resourceInfo: [
                  {
                    title: 'IP',
                    value: item.address,
                  },
                ],
                callback: () => updateFIP(item.id, { reserved: false }),
              });
            },
          },
          {
            label: $t('vm.floating.ip.disassociate'),
            visible: item => !!item.device_id,
            disabled: item =>
              item.reserved !== 'reserved' && item.device_type === 'server', // to-do auto-scaling loadbalancer
            action: item => {
              uiShowDialog({
                title: $t('vm.floating.ip.disassociate.title'),
                resourceInfo: [
                  {
                    title: 'IP',
                    value: item.address,
                  },
                  {
                    title: $t('label.name.type', {
                      type: $t('vm.floating.ip.associate'),
                    }),
                    value: item.device_name,
                  },
                ],
                callback: () => disassociateFIP(item.id),
              });
            },
          },
          {
            label: $tc('basic.review', 2),
            visible: item =>
              isAdmin && item.status?.toLowerCase() === 'pending',
            action: item => {
              selectedFIP = item;
              reviewDialog = true;
            },
          },
          {
            label: $t('table.action.delete'),
            action: (item: any) =>
              openDeleteDialog({
                item: item,
                resourceType: $t('vm.network.floating.ip'),
                message: $t('dialog.delete.message.type', {
                  type: $t('vm.network.floating.ip'),
                }),
                deleteAction: async () =>
                  await makeApiCall({
                    apiCallFn: deleteVmFloatingIP,
                    payload: item.id,
                    successCallback: async () => {
                      await fetchData();
                    },
                  }),
              }),
          },
        ]"
        :batch-delete-setting="{
          items: vmFloatingIpList,
          action: batchDeleteAction,
        }"
        :no-data-setting="noDataSetting"
        :items="vmFloatingIpList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'createdAt',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key) || '-'"
            :is-cursor-pointer="false"
            :is-status="header.key === 'status' || header.key === 'reserved'"
            :disable-status-label="header.key === 'reserved'"
            :use-date-filter="header.useDateFilter"
            :text-link="
              header.key === 'device_name' && item.device_id && item.device_name
                ? {
                    name: getLink(item.device_type),
                    params: {
                      id: item.device_id,
                    },
                  }
                : null
            "
            :search="searchStr"
          >
            <v-icon
              v-if="header.key === 'address' && getDeepObj(item, header.key)"
              class="ml-4"
              @click="handleCopy($event, getDeepObj(item, header.key))"
            >
              mdi-content-copy
            </v-icon>
          </TD>
        </template>
      </GeneralDataTable>
    </v-row>
    <VmReviewDialog
      v-model:show="reviewDialog"
      type="fip"
      :item="selectedFIP"
      :submit-callback="
        (approve: any) =>
          approve ? approveFIP(selectedFIP.id) : rejectFIP(selectedFIP.id)
      "
    />
  </UiContainer>
</template>
<style lang="scss" scoped></style>
