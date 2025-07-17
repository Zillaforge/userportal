<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, type Ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchLoadBalancerList,
  fetchVmFloatingIP,
  lbAttachFloatingIp,
  detachFloatingIP,
  deleteVmFloatingIP,
  deleteLoadBalancer,
  makeMultipleApiCalls,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import VmAddIpDialog from '@/components/VmAddIpDialog.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
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
const route = useRoute();
const router = useRouter();
const { uiShowDialog, triggerSnackbarCopied } = useGlobal();

const { isFloatingIpReview } = useVm();

const noDataSetting = computed(() => getNoDataSetting(route.name as string));
const headers = computed(() => getTableHeaders());
const { setProjectSwitchCallback } = useProjectSwitch();
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const vmLoadBalancerList: Ref<Record<string, any>[]> = ref([]);
const vmFloatingIpList = ref([]);
const selectedLoadbalancerId = ref<string>('');
const searchStr: Ref<string> = ref('');
const showAddIpDialog = ref(false);

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(fetchData);
});

const fetchData = async () => {
  isLoading.value = true;
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchLoadBalancerList,
    successCallback: res =>
      (vmLoadBalancerList.value = res
        .map((i: any) => ({
          ...i,
          networkName: i.network?.name,
          fipAddress: i.floating_ip?.address,
        }))
        .sort(
          (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )),
  });
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchVmFloatingIP,
    successCallback: res =>
      (vmFloatingIpList.value = res
        .map((item: any) => ({
          ...item,
          reserved: item.reserved ? 'reserved' : 'unreserved',
          name: item.address,
        }))
        .filter((item: any) => item.status.toLowerCase() === 'down')),
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const attachFloatingIp = async ($event: {
  auto: boolean;
  selectedFloatingIp: { id: string };
}) => {
  const { auto, selectedFloatingIp } = $event;
  const body = auto ? {} : { fip_id: selectedFloatingIp.id };
  await makeApiCall({
    apiCallFn: lbAttachFloatingIp,
    payload: {
      loadbalancerId: selectedLoadbalancerId.value,
      body,
    },
    successCallback: () => {
      if (isFloatingIpReview.value) {
        uiShowDialog({
          title: '',
          message: t('vm.network.ip.add.review'),
          hideCancelBtn: true,
        });
      }
      void fetchData();
    },
  });
};

const handleDetachFloatingIp = (item: any) => {
  uiShowDialog({
    title: t('dialog.detach.title', { resource: t('vm.network.floating.ip') }),
    resourceInfo: [
      {
        title: t('vm.network.floating.ip'),
        value: item.fipAddress,
      },
    ],
    callback: () => {
      if (item.floating_ip.reserved) {
        makeApiCall({
          apiCallFn: detachFloatingIP,
          payload: {
            floatingIpId: item.floating_ip.id,
          },
          successCallback: fetchData,
        });
      } else {
        makeApiCall({
          apiCallFn: deleteVmFloatingIP,
          payload: item.floating_ip.id,
          successCallback: fetchData,
        });
      }
    },
  });
};

const toCreatePage = async () => {
  void router.push({ name: PAGE_TYPES.VM_LOAD_BALANCER_CREATE });
};

const toDetailPage = async (id: string) => {
  void router.push({
    name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
    params: { id },
  });
};

const disabledDelete = (item: TableItem) =>
  item.status?.toLowerCase().includes('pending') ||
  item.status?.toLowerCase() === 'deleting';

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteLoadBalancer,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const handleCopy = (e: { stopPropagation: () => void }, value: string) => {
  e.stopPropagation();
  void navigator.clipboard.writeText(value);
  triggerSnackbarCopied();
};

const deletableList = computed(() =>
  vmLoadBalancerList.value.filter((item: TableItem) => !disabledDelete(item))
);

const linkUrl = computed(() => {
  return Document.LOAD_BALANCER;
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: ` ${$t('services.loadBalancer')}`,
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
            label: $t('action.floating.ip.attach'),
            action: item => {
              selectedLoadbalancerId = item.id;
              showAddIpDialog = true;
            },
            disabled: (item: any) => item.status.toLowerCase() !== 'active',
            visible: (item: any) => !item.floating_ip,
          },
          {
            label: $t('basic.detach'),
            action: handleDetachFloatingIp,
            disabled: (item: any) => item.status.toLowerCase() !== 'active',
            visible: (item: any) => item.floating_ip,
          },
          {
            label: $t('action.copyId'),
            action: item => generalCopy(item.id),
          },
          {
            type: ActionType.DELETE,
            resourceType: $t('services.loadBalancer'),
            message: $t('dialog.delete.message.type', {
              type: $t('services.loadBalancer'),
            }),
            disabled: item => disabledDelete(item),
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteLoadBalancer,
                payload: item.id,
                successCallback: fetchData,
              }),
          },
        ]"
        :batch-delete-setting="{
          items: deletableList,
          action: batchDeleteAction,
        }"
        :no-data-setting="noDataSetting"
        :items="vmLoadBalancerList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'udpate_time',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        @on-row-click="
          (item: any) => {
            toDetailPage(item.id);
          }
        "
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key) || '-'"
            :is-cursor-pointer="false"
            :is-status="header.key === 'status'"
            :use-date-filter="header.key === 'createdAt'"
            :search="searchStr"
          >
            <v-icon
              v-if="
                (header.key === 'vip' ||
                  header.key === 'floating_ip.address') &&
                getDeepObj(item, header.key)
              "
              class="ml-4"
              @click="handleCopy($event, getDeepObj(item, header.key))"
            >
              mdi-content-copy
            </v-icon>
          </TD>
        </template>
      </GeneralDataTable>
    </v-row>
    <VmAddIpDialog
      v-model:show="showAddIpDialog"
      :floating-ip-list="vmFloatingIpList"
      @submit="$event => attachFloatingIp($event)"
    />
  </UiContainer>
</template>
<style lang="scss" scoped></style>
