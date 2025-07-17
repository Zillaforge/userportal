<script lang="ts" setup>
import { useGlobal } from '@/store';
import { computed, ref, type Ref, onMounted } from 'vue';

import {
  makeApiCall,
  fetchVmVolumes,
  fetchVmSnapshotsAll,
  makeMultipleApiCalls,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import VmVolumeAttachDialog from '@/components/VmVolumeAttachDialog.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
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
import { type Snapshot } from '@/interfaces/VmInterface';
import { getDeepObj, generalCopy } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const {
  t,
  router,
  headers,
  noDataSetting,
  deletable,
  doVolumeActions,
  doDeleteVmVolume,
  doCreateVolumeSnapshot,
  vmVolumeDeletableStatus,
} = useVm(PAGE_TYPES.VM_VOLUME_LIST);
const { uiShowDialog, openDeleteDialog } = useGlobal();
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const volumeList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');
const showSnapshotDialog = ref(false);
const showAttachDialog = ref(false);
const snapshotItem: Ref<Snapshot> = ref({ name: '' });
const snapshotList = ref([]);
const selectedVolume: Ref<Record<string, any>> = ref({});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => {
    await fetchData();
  });
});

const fetchData = async () => {
  isLoading.value = true;

  await makeApiCall({
    apiCallFn: fetchVmSnapshotsAll,
    successCallback: res => {
      snapshotList.value = res;
    },
    skipProgress: true,
  });
  await makeApiCall({
    apiCallFn: fetchVmVolumes,
    successCallback: res => {
      volumeList.value = res.map((item: any) => {
        return {
          ...item,
          hasSnapshot: snapshotList.value.some(
            (snapshot: any) => snapshot.volume_id === item.id
          ),
          attachment:
            item.attachments.length > 0 ? { ...item.attachments[0] } : {},
        };
      });
    },
    skipProgress: true,
  });

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const linkUrl = computed(() => {
  return Document.VOLUME;
});

const deletableList = computed(() =>
  volumeList.value.filter((item: TableItem) => !disabledDelete(item))
);

const disabledDelete = (item: TableItem) =>
  !deletable(item?.user?.id as string) ||
  !vmVolumeDeletableStatus.includes(item.status.toLowerCase() as string) ||
  item.hasSnapshot;

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: doDeleteVmVolume,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

const toDetailPage = (id: number) => {
  void router.push({ name: PAGE_TYPES.VM_VOLUME_DETAIL, params: { id } });
};

const createSnapshot = async () => {
  await doCreateVolumeSnapshot(snapshotItem.value, fetchData);
};

const openDetachDialog = (item: TableItem) => {
  uiShowDialog({
    title: t('vm.volume.detach.title'),
    message: t('vm.volume.detach.message', {
      link: Document.VOLUME[i18n.global.locale],
    }),
    messageWithLink: true,
    showWarningIcon: true,
    callback: async () => {
      await doVolumeActions({ action: 'detach' }, item.id as string, fetchData);
    },
  });
};

const openAttachDialog = async (item: any) => {
  selectedVolume.value = item;
  showAttachDialog.value = true;
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', { type: $t('services.virtualVolume') })
        "
        :link-url="linkUrl"
      />

      <GeneralDataTable
        :main-action-list="[
          {
            type: MainActionType.CREATE,
            action: () => router.push({ name: PAGE_TYPES.VM_VOLUME_CREATE }),
          },
        ]"
        :more-action-list="[
          {
            label: $t('basic.connect'),
            action: (item: TableItem) => openAttachDialog(item),
            visible: (item: TableItem) =>
              item.status.toLowerCase() === 'available',
          },
          {
            label: $t('action.detach'),
            action: (item: TableItem) => openDetachDialog(item),
            visible: (item: TableItem) =>
              item.status.toLowerCase() === 'in-use',
          },
          {
            label: $t('virtualVolume.snapshot'),
            action: (item: TableItem) => {
              snapshotItem = {
                volume_id: item.id,
                name: 'sn' + Math.floor(Date.now() / 1000),
                description: '',
              };
              showSnapshotDialog = true;
            },
          },
          {
            label: $t('action.copyId'),
            action: (item: TableItem) => {
              generalCopy(item.id);
            },
          },
          {
            label: $t('table.action.delete'),
            disabled: (item: TableItem) => disabledDelete(item),
            action: (item: TableItem) => {
              openDeleteDialog({
                item: item,
                resourceType: t('services.virtualVolume'),
                message: t('dialog.delete.message.type', {
                  type: t('services.virtualVolume'),
                }),
                deleteAction: async () =>
                  await doDeleteVmVolume(item.id, fetchData),
              });
            },
          },
        ]"
        :batch-delete-setting="{
          items: deletableList,
          action: batchDeleteAction,
        }"
        :items="volumeList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'createdAt',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        @update-search="searchStr = $event"
        @on-row-click="
          (item: any) => {
            toDetailPage(item.id);
          }
        "
        @fetch-data="fetchData"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key) || '-'"
            :search="searchStr"
            :is-status="header.key === 'status'"
            :use-date-filter="header.useDateFilter"
            :is-highlight="true"
            :text-link="
              header.key === 'attachment.name' && item.attachment?.id
                ? {
                    name: PAGE_TYPES.VM_DETAIL,
                    params: { id: item.attachment?.id },
                  }
                : null
            "
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <CommonDialog
      v-model:show="showSnapshotDialog"
      :title="$t('basic.create.type', { type: $t('virtualVolume.snapshot') })"
      :submit-callback="createSnapshot"
    >
      <template #info>
        <span class="pa-4">
          {{ $t('vm.volume.snapshot.hint') }}
        </span>
      </template>
      <TextFieldWithHint
        v-model="snapshotItem.name"
        :title="$t('label.name')"
        required
      />
      <TextFieldWithHint
        v-model="snapshotItem.description"
        :title="$t('basic.desc')"
      />
    </CommonDialog>
    <VmVolumeAttachDialog
      v-model:show="showAttachDialog"
      :volume="selectedVolume"
      :submit-callback="fetchData"
    />
  </UiContainer>
</template>
