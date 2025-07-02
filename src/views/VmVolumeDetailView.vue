<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, type Ref, onBeforeUnmount } from 'vue';

import dayjs from 'dayjs';

import {
  makeApiCall,
  fetchVmVolumeDetail,
  fetchVmSnapshots,
  deleteVmSnapshot,
  createVmVolume,
  updateVmVolume,
} from '@/api';
import VmVolumeAttachDialog from '@/components/VmVolumeAttachDialog.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useAutoReload from '@/composables/useAutoReload';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {
  snapShotDetailHeader,
  VM_VOLUME_MAX_SIZE,
} from '@/constants/VmConstants';
import i18n from '@/i18n';
import { type Snapshot } from '@/interfaces/VmInterface';
import { formatDateSec } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const { openDeleteDialog, uiShowDialog } = useGlobal();
const { setAutoReload } = useAutoReload();
const {
  t,
  router,
  projectId,
  doFetchVmList,
  doDeleteVmVolume,
  doCreateVolumeSnapshot,
  doVolumeActions,
  vmVolumeDeletableStatus,
} = useVm(PAGE_TYPES.VM_VOLUME_DETAIL);
const tabs = computed(() => [t('basic.overview')]);
const lastUpdatedTime: Ref<Date | string> = ref(new Date());
const showSnapshotDialog = ref(false);
const showAttachDialog = ref(false);
const showExtendDialog = ref(false);
const showDescDialog = ref(false);
const showCreateVolumeDialog = ref(false);
const snapshotItem: Ref<Snapshot> = ref({ name: '' });
const extendSize = ref(0);
const vmList: Ref<Record<string, any>[]> = ref([]);
const selectedVm: Ref<Record<string, any>> = ref({});
const selectedSnapshot: Ref<Record<string, any>> = ref({});
const volumeInfo: Ref<Record<string, any>> = ref({});

const volumeDetail: Ref<Record<string, any>> = ref({ basicInfo: [] });
const volumeSnapShotDetail: Ref<Record<string, any>[]> = ref([]);

const interval: Ref<number> = ref(0);

const extendDialogFormError = ref();

const expansionPanels = computed(() => [
  { title: t('label.basicInfo'), value: 'basicInfo' },
  {
    title: t('basic.info', { type: t('virtualVolume.snapshot') }),
    value: 'detailInfo',
  },
]);

onBeforeUnmount(() => {
  clearInterval(interval.value);
  interval.value = 0;
});

const fetchDetail = async (skipProgress: boolean = false) => {
  await makeApiCall({
    skipProgress,
    apiCallFn: fetchVmVolumeDetail,
    payload: {
      projectId: projectId.value,
      volumeId: router.currentRoute.value.params.id,
    },
    successCallback: res => {
      volumeDetail.value = res;
    },
  });
  volumeDetail.value.basicInfo = computed(() => [
    {
      text: t('label.name'),
      value: volumeDetail.value.name,
    },
    {
      text: t('vm.associated.service'),
      value: volumeDetail.value.attachments?.length
        ? volumeDetail.value.attachments[0].name
        : '',
      linkTo: volumeDetail.value.attachments?.length
        ? {
            name: PAGE_TYPES.VM_DETAIL,
            params: { id: volumeDetail.value.attachments[0].id },
          }
        : undefined,
    },
    {
      text: t('basic.desc'),
      value: volumeDetail.value.description,
      button: t('basic.edit'),
      callback: () => {
        showDescDialog.value = true;
      },
    },
    {
      text: t('label.serviceState'),
      value: volumeDetail.value.status,
      isStatus: true,
      statusHint: volumeDetail.value.status_reason,
    },
    {
      text: t('vm.volume.size'),
      value: volumeDetail.value.size,
      button: t('basic.extend'),
      callback: () => {
        openExtendDialog();
      },
      disabled: volumeDetail.value.status?.toLowerCase() !== 'available',
    },
    {
      text: t('label.createdAt'),
      value: formatDateSec(volumeDetail.value.createdAt as string),
    },
    {
      text: t('label.type'),
      value: volumeDetail.value.type,
    },
    {
      text: t('label.createdBy'),
      value: volumeDetail.value.user.name,
    },
  ]);
};

const fetchSnapshotDetail = async () => {
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchVmSnapshots,
    payload: {
      projectId: projectId.value,
      volumeId: router.currentRoute.value.params.id,
    },
    successCallback: res => {
      volumeSnapShotDetail.value = res.map((item: any) => ({
        ...item,
        createdAt: formatDateSec(item.createdAt as string),
      }));
      const needAutoReload = volumeSnapShotDetail.value.some(
        (item: any) =>
          item.status.toLowerCase() === 'creating' ||
          item.status.toLowerCase() === 'deleting'
      );
      if (needAutoReload) {
        if (!interval.value) {
          interval.value = window.setInterval(() => {
            void fetchSnapshotDetail();
          }, 5000);
        }
      } else {
        clearInterval(interval.value);
        interval.value = 0;
      }
    },
  });
};

const fetchData = async () => {
  await fetchDetail();
  await fetchSnapshotDetail();
  lastUpdatedTime.value = new Date();
};

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => {
    await router.push({ name: PAGE_TYPES.VM_VOLUME_LIST });
  });
  setAutoReload(volumeDetail, async () => await fetchDetail(true), [
    'attaching',
    'detaching',
    'creating',
    'reserved',
    'extending',
  ]);
});

const isTheLastestSnapshot = (time: Date) => {
  const snapshotTime = dayjs(time).unix();
  return volumeSnapShotDetail.value.every(
    (item: any) => snapshotTime >= dayjs(item.createdAt as Date).unix()
  );
};

const deleteVolume: any = async () => {
  await doDeleteVmVolume(
    router.currentRoute.value.params.id as string,
    async () => {
      await router.push({ name: PAGE_TYPES.VM_VOLUME_LIST });
    }
  );
};

const detailButton = computed(() => [
  {
    text: t('basic.connect'),
    visible: volumeDetail.value.attachments?.length === 0,
    disabled: volumeDetail.value.status?.toLowerCase() !== 'available',
    icon: 'mdi-link',
    action: () => {
      void openAttachDialog();
    },
  },
  {
    text: t('basic.disconnect'),
    visible: volumeDetail.value.attachments?.length > 0,
    disabled: volumeDetail.value.status?.toLowerCase() === 'detaching',
    icon: 'mdi-link-off',
    action: () => {
      openDetachDialog();
    },
  },
  {
    text: t('virtualVolume.snapshot'),
    icon: 'mdi-cube-scan',
    visible: true,
    disabled: volumeDetail.value.status?.toLowerCase() === 'reserved',
    action: () => {
      snapshotItem.value = {
        name: 'sn' + Math.floor(Date.now() / 1000),
      };
      showSnapshotDialog.value = true;
    },
  },
  {
    text: t('table.action.delete'),
    icon: 'mdi-delete-outline',
    visible: true,
    disabled:
      !vmVolumeDeletableStatus.includes(
        volumeDetail.value.status?.toLowerCase() as string
      ) || volumeSnapShotDetail.value.length > 0,
    action: () => {
      openDeleteDialog({
        item: volumeDetail.value,
        resourceType: t('services.virtualVolume'),
        message: t('dialog.delete.message.type', {
          type: t('services.virtualVolume'),
        }),
        deleteAction: deleteVolume,
      });
    },
  },
  {
    text: t('table.action.refresh'),
    icon: 'mdi-refresh',
    visible: true,
    action: () => {
      void fetchData();
      lastUpdatedTime.value = new Date();
    },
  },
]);

const snapShotDetailAction = computed(() => [
  {
    label: t('basic.create.type', { type: t('services.virtualVolume') }),
    disabled: (item: any) => item.status !== 'available',
    action: (item: any) => {
      selectedSnapshot.value = item;
      volumeInfo.value = {
        name: 'vol' + Math.floor(Date.now() / 1000),
        description: '',
      };
      showCreateVolumeDialog.value = true;
    },
  },
  {
    label: t('vm.volume.revert'),
    disabled: (item: any) =>
      !isTheLastestSnapshot(item.createdAt as Date) ||
      item.status !== 'available',
    action: (item: any) => {
      uiShowDialog({
        title: t('vm.volume.revert.title'),
        resourceInfo: [
          {
            title: t('basic.name', { type: t('virtualVolume.snapshot') }),
            value: item.name,
          },
          {
            title: t('basic.name', { type: t('services.virtualVolume') }),
            value: volumeDetail.value.name,
          },
        ],
        showWarningIcon: true,
        message: t('vm.volume.revert.message'),
        callback: async () => {
          await doVolumeActions(
            {
              action: 'revert',
              snapshot_id: item.id,
            },
            router.currentRoute.value.params.id as string,
            fetchData
          );
        },
      });
    },
  },
  {
    label: t('table.action.delete'),
    disabled: (item: any) => item.status?.toLowerCase() === 'deleting',
    action: (item: any) => {
      openDeleteDialog({
        item,
        resourceType: t('virtualVolume.snapshot'),
        message: t('dialog.delete.message.type', {
          type: t('virtualVolume.snapshot'),
        }),
        deleteAction: () => {
          makeApiCall({
            apiCallFn: deleteVmSnapshot,
            payload: {
              projectId: projectId.value,
              snapshotId: item.id,
            },
            successCallback: async res => {
              await fetchData();
            },
          });
        },
      });
    },
  },
]);

const createSnapshot = async () => {
  await doCreateVolumeSnapshot(
    {
      name: snapshotItem.value.name,
      description: snapshotItem.value.description,
      volume_id: router.currentRoute.value.params.id,
    },
    fetchData
  );
};

const openAttachDialog = async () => {
  await doFetchVmList(true, (res: any) => {
    vmList.value = res;
    selectedVm.value = vmList.value[0];
  });

  showAttachDialog.value = true;
};

const openExtendDialog = () => {
  extendSize.value = 0;
  extendDialogFormError.value = undefined;
  showExtendDialog.value = true;
};

const openDetachDialog = () => {
  uiShowDialog({
    title: t('vm.volume.detach.title'),
    message: t('vm.volume.detach.message', {
      link: Document.VOLUME[i18n.global.locale],
    }),
    showWarningIcon: true,
    messageWithLink: true,
    callback: async () => {
      await doVolumeActions(
        {
          action: 'detach',
        },
        router.currentRoute.value.params.id as string,
        fetchData
      );
    },
  });
};

const createVolume = async () => {
  await makeApiCall({
    apiCallFn: createVmVolume,
    payload: {
      projectId: projectId.value,
      volumeItem: {
        name: volumeInfo.value.name,
        snapshot_id: selectedSnapshot.value.id,
        description: volumeInfo.value.description,
        size: selectedSnapshot.value.size,
        type: volumeDetail.value.type,
      },
    },
    successCallback: async res => {
      await fetchData();
    },
  });
};

const updateVolume = async (desc: string) => {
  await makeApiCall({
    apiCallFn: updateVmVolume,
    payload: {
      projectId: projectId.value,
      volumeId: router.currentRoute.value.params.id,
      volumeItem: {
        description: desc,
        name: volumeDetail.value.name,
      },
    },
    successCallback: async res => {
      await fetchData();
    },
  });
};

const extendVolume = async () => {
  await doVolumeActions(
    {
      action: 'extend',
      new_size: Number(extendSize.value) + Number(volumeDetail.value.size),
    },
    router.currentRoute.value.params.id as string,
    fetchData
  );
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $tc('basic.detail.type', { type: $t('services.virtualVolume') })
        "
      />
      <TabsComponent :tab-names="tabs" is-card-style>
        <template #tab-0>
          <v-card>
            <v-card-title class="pa-2">
              <v-row no-gutters>
                <v-col cols="12">
                  <DetailActionBtn
                    v-for="item in detailButton.filter(item => item.visible)"
                    :key="item.text"
                    :btn="item"
                    :btn-tips="item.text"
                    :btn-icon="item.icon"
                    :last-updated-time="lastUpdatedTime"
                    @item-click="item.action"
                  />

                  <span class="ocis-last-updated-time pt-4 pr-4">
                    {{ $t('label.lastUpdated') }}
                    {{ formatDateSec(lastUpdatedTime) }}
                  </span>
                </v-col>
              </v-row>
            </v-card-title>
            <v-card-text class="ocis-detail-scroll-view">
              <v-row>
                <v-col cols="12" class="pa-4">
                  <DetailPanelGroup v-model="expansionPanels">
                    <DetailPanel
                      :title="expansionPanels[0].title"
                      :value="expansionPanels[0].value"
                    >
                      <v-row no-gutters>
                        <v-col
                          v-for="item in volumeDetail.basicInfo"
                          :key="item.text"
                          cols="6"
                          class="pb-4 d-flex align-center"
                        >
                          <DetailItem
                            :title="item.text"
                            :content="item.value"
                            :is-status="item.isStatus"
                            :link-to="item.linkTo"
                            :status-hint="item.statusHint"
                          >
                            <OutlinedBtn
                              v-if="item.button"
                              :class="{ 'ml-2': item.value }"
                              :text="item.button"
                              :disabled="item.disabled"
                              @click="item.callback"
                            />
                          </DetailItem>
                        </v-col>
                      </v-row>
                    </DetailPanel>

                    <DetailPanel
                      :title="expansionPanels[1].title"
                      :value="expansionPanels[1].value"
                    >
                      <DetailTable
                        :items="volumeSnapShotDetail"
                        :headers="snapShotDetailHeader"
                        :actions="snapShotDetailAction"
                      />
                    </DetailPanel>
                  </DetailPanelGroup>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
      </TabsComponent>
    </v-row>
    <CommonDialog
      v-model:show="showSnapshotDialog"
      :title="$t('basic.create', { type: $t('virtualVolume.snapshot') })"
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
      :volume="volumeDetail"
      :submit-callback="fetchData"
    />
    <CommonDialog
      v-model:show="showExtendDialog"
      :title="$t('vm.volume.extend')"
      :submit-callback="extendVolume"
      :disable-submit="!!extendDialogFormError"
    >
      <TextFieldWithHint
        v-model="volumeDetail.name"
        :title="$t('basic.name')"
        plain-text
      />
      <TextFieldWithHint
        v-model="volumeDetail.size"
        :title="$t('vm.volume.size')"
        plain-text
      />
      <TextFieldWithHint
        v-model="extendSize"
        :title="`${$t('vm.volume.extend')} (GiB)`"
        :max-val="VM_VOLUME_MAX_SIZE - volumeDetail.size"
        type="number"
        required
        @form-error="
          event => {
            extendDialogFormError = event[0];
          }
        "
      />
      <TextFieldWithHint
        :model-value="Number(volumeDetail.size) + Number(extendSize)"
        :title="$t('vm.volume.expected.size')"
        plain-text
      />
    </CommonDialog>
    <EditDescriptionDialog
      v-model:show="showDescDialog"
      :item-name="volumeDetail.name"
      :description="volumeDetail.description"
      @update-value="updateVolume"
    />
    <CommonDialog
      v-model:show="showCreateVolumeDialog"
      :title="$t('basic.create', { type: $t('services.virtualVolume') })"
      :submit-callback="createVolume"
    >
      <TextFieldWithHint
        v-model="volumeInfo.name"
        :title="$t('basic.name')"
        required
      />
      <TextFieldWithHint
        v-model="volumeInfo.description"
        :title="$t('basic.desc')"
      />
      <TextFieldWithHint
        :model-value="$t('vm.volume.from.snapshot')"
        :title="$t('vm.volume.create.from')"
        plain-text
      />
      <TextFieldWithHint
        :model-value="selectedSnapshot.name"
        :title="$t('virtualVolume.snapshot')"
        plain-text
      />
    </CommonDialog>
  </UiContainer>
</template>
