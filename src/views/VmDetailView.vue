<script lang="ts" setup>
import { Buffer } from 'buffer';

import { useGlobal } from '@/store';
import { ref, computed, type Ref, onMounted } from 'vue';

import {
  makeApiCall,
  fetchVmDetail,
  fetchResizeFlavors,
  fetchVmVolumes,
  fetchVmNetworks,
  fetchServerNics,
  fetchServerVolumes,
  fetchVncConsole,
  updateServer,
  vmAttachFIP,
  vmUpdateSecurityGroup,
  vmActions,
  attachServerVolume,
  attachNic,
  detachFloatingIP,
  removeNic,
  RESOURCE_TYPE,
} from '@/api';
import NetworkSettingDialog from '@/components/NetworkSettingDialog.vue';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import TransferDialog from '@/components/TransferDialog.vue';
import VmConsolePasswordDialog from '@/components/VmConsolePasswordDialog.vue';
import VmCreateImageDialog from '@/components/VmCreateImageDialog.vue';
import VmLogDialog from '@/components/VmLogDialog.vue';
import VmMonitorViewer from '@/components/VmMonitorViewer.vue';
import VmReviewDialog from '@/components/VmReviewDialog.vue';
import VolumeSettingDialog from '@/components/VolumeSettingDialog.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import DialogAlert from '@/components/common/DialogAlert.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';
import FlavorTableSelection from '@/components/common/FlavorTableSelection.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useAutoReload from '@/composables/useAutoReload';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  SERVER_ACTION,
  REBOOT_TYPE,
  type Flavor,
  type Network,
  type Volume,
} from '@/interfaces/VmInterface';
import getTableHeaders, { TABLE_TYPE } from '@/utils/getTableHeaders';
import { formatDateSec, isPublicSite } from '@/utils/utils';
const { setProjectSwitchCallback } = useProjectSwitch();
const { setAutoReload } = useAutoReload();
const {
  t,
  projectId,
  router,
  isAdmin,
  isFloatingIpReview,
  isOwner,
  doServerAction,
  doFetchVmSecurityGroups,
  doFetchVmFloatingIp,
  doDeleteVm,
  doVolumeActions,
} = useVm(PAGE_TYPES.VM_DETAIL);

const { openDeleteDialog, uiShowDialog, getIsPilotRegion } = useGlobal();
const $isPublicSite = isPublicSite();

const tabs = computed(() =>
  getIsPilotRegion
    ? [t('basic.overview')]
    : [t('basic.overview'), t('basic.monitoring')]
);

const vmItem = ref<Record<string, any>>({});
const lastUpdatedTime: Ref<Date | string> = ref('');
const logs = ref<string[]>();
const showConsolePasswordDialog = ref(false);
const showLogDialog = ref(false);
const showReviewDialog = ref(false);
const showCreateImageDialog = ref(false);
const showTransferDialog = ref(false);
const showFloatingIpDialog = ref(false);
const showDescDialog = ref(false);
const showFlavorDialog = ref(false);
const showVolumeDialog = ref(false);
const showNetworkDialog = ref(false);

const volumeList: Ref<Volume[]> = ref([]);
const networkList: Ref<Network[]> = ref([]);

const selectedNIC = ref<Network>({});

const selectedFIPOption = ref(true);
const selectedFIP: Record<string, any> = ref({});
const floatingIps = ref([]);

const selectedFlavor: Record<string, any> = ref({});
const flavorList: Ref<Flavor[]> = ref([]);
const virtualNetwork: Ref<Network[]> = ref([]);
const storageList: Ref<Volume[]> = ref([]);

const attachDisableState = ref([
  'reboot',
  'rejected',
  'error',
  'build',
  'pending',
  'deleting',
]);

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_LIST })
  );
  setAutoReload(vmItem, async () => await fetchData(true), [
    'stopping',
    'starting',
    'build',
  ]);
});

const enum DATA {
  NICS,
  VOLUMES,
}

const fetchData = async (skipProgress: boolean = false) => {
  vmItem.value = await makeApiCall({
    skipProgress,
    apiCallFn: fetchVmDetail,
    payload: {
      projectId: projectId.value,
      serverId: router.currentRoute.value.params.id,
    },
    successCallback: res => {
      return {
        ...res,
        boot_script: Buffer.from(
          res.boot_script as string,
          'base64'
        )?.toString(),
      };
    },
    errorResHandlingFn: () => undefined,
    errorCallback: () => {
      void router.push({ name: PAGE_TYPES.VM_LIST });
    },
  });

  if (!vmItem.value) {
    return;
  }

  const apiCall = [fetchServerNics, fetchServerVolumes];
  const apiCallPromise = apiCall.map(item => {
    return makeApiCall({
      skipProgress,
      apiCallFn: item,
      payload: {
        projectId: projectId.value,
        serverId: router.currentRoute.value.params.id,
      },
    });
  });
  await Promise.allSettled(apiCallPromise).then(res => {
    res.forEach((item, index) => {
      if (item.status === 'fulfilled') {
        switch (index) {
          case DATA.NICS:
            virtualNetwork.value = item.value.map((item: any) => ({
              ...item,
              name: item.network?.name ?? 'Provider Network',
              isProviderNetwork: !item.network,
              floating_ip: item.floating_ip
                ? {
                    ...item.floating_ip,
                    address: item.floating_ip?.address
                      ? item.floating_ip?.address
                      : 'under review',
                  }
                : {},
              security_groups: item.network
                ? {
                    id: item.security_groups.map((el: any) => el.id),
                    name: item.security_groups.map((el: any) => el.name),
                  }
                : {},
              private_ip: item.addresses,
              createdAt: formatDateSec(vmItem.value.createdAt as string),
            }));
            break;
          case DATA.VOLUMES:
            storageList.value = item.value
              .filter((item: any) => !item.system)
              .map((item: any) => ({
                id: item.volume?.id,
                name: item.volume?.name,
                size: item.volume?.size,
                type: item.volume?.type,
                status: item.volume?.status,
                createdAt: formatDateSec(item.volume?.createdAt as string),
              }));
            break;
        }
      }
    });
  });
  lastUpdatedTime.value = new Date();
};

const basicInfo = computed(() => [
  {
    text: t('label.name'),
    value: vmItem.value.name,
  },
  {
    text: t('flavor.title'),
    value: vmItem.value?.flavor_detail?.name,
    disabled: vmItem.value.status?.toLowerCase() !== 'shutoff',
    button: t('basic.change'),
    callback: async () => {
      await makeApiCall({
        apiCallFn: fetchResizeFlavors,
        payload: {
          serverId: vmItem.value.id,
        },
        successCallback: res => {
          flavorList.value = res.map((item: any) => ({
            ...item,
            memory: item?.memory / 1024,
            gpu_count: item?.gpu?.count ?? 0,
          }));
        },
      });
      selectedFlavor.value = flavorList.value?.find(
        (item: any) => item.id === vmItem.value.flavor_id
      );
      showFlavorDialog.value = true;
    },
  },
  {
    text: t('basic.desc'),
    value: vmItem.value.description,
    button: t('basic.edit'),
    callback: () => {
      showDescDialog.value = true;
    },
  },
  {
    text: t('label.serviceState'),
    value: vmItem.value.status,
    isStatus: true,
    statusHint: vmItem.value.status_reason,
  },

  {
    text: t('image.source'),
    value: vmItem.value.metadatas?.vrm_image_name?.split(':')?.[0],
  },
  {
    text: t('label.createdAt'),
    value: formatDateSec(vmItem.value.createdAt as string),
  },

  {
    text: t('image.tag'),
    value: vmItem.value.metadatas?.vrm_image_name?.split(':')?.[1],
  },
  {
    text: t('label.createdBy'),
    value: vmItem.value.user?.name,
  },
  {
    text: t('label.login.account'),
    value: vmItem.value.metadatas?.vrm_extras_defaultUser,
  },
  {
    text: t('label.lastModified.at'),
    value: formatDateSec(vmItem.value.updatedAt as string),
  },
]);

const expansionPanels = computed(() => [
  { title: t('label.basicInfo'), value: 'basicInfo' },
  { title: t('virtualNetwork.info'), value: 'virtualNetwork' },
  { title: t('form.storageInfo'), value: 'storage' },
  { title: t('vm.certification.info'), value: 'certification' },
  { title: t('label.initialization'), value: 'initialization' },
  { title: t('vm.console.info'), value: 'console' },
]);

const showRebootDialog = () => {
  uiShowDialog({
    title: t('vm.reboot.dialog.title'),
    resourceInfo: [
      {
        title: t('label.name'),
        value: vmItem.value?.name,
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
        vmItem.value?.id as string,
        fetchData
      );
    },
  });
};

const showFIPDetachDialog = (item: any) => {
  uiShowDialog({
    title: t('dialog.detach.title', {
      resource: t('vm.network.floating.ip'),
    }),
    resourceInfo: [
      {
        title: t('label.name'),
        value: item.floating_ip.address,
      },
    ],
    callback: async () => {
      await makeApiCall({
        apiCallFn: detachFloatingIP,
        payload: {
          floatingIpId: item.floating_ip.id,
        },
        successCallback: () => {
          void fetchData();
        },
      });
    },
  });
};

const selectFIPOption = async (option: boolean) => {
  selectedFIPOption.value = option;
  if (!option) {
    await doFetchVmFloatingIp(res => {
      floatingIps.value = res.filter(
        (item: any) => item.status.toLowerCase() === 'down'
      );
      selectedFIP.value = floatingIps.value.length
        ? floatingIps.value[0]
        : null;
    });
  }
};

const attachFIP = async () => {
  const body = selectedFIPOption.value ? {} : { fip_id: selectedFIP.value.id };
  await makeApiCall({
    apiCallFn: vmAttachFIP,
    payload: {
      serverId: vmItem.value.id,
      nicId: selectedNIC.value.id,
      body,
    },
    successCallback: () => {
      if (isFloatingIpReview.value) {
        uiShowDialog({
          title: '',
          message: t('vm.network.ip.add.review'),
          hideCancelBtn: true,
          callback: () => {
            void fetchData();
          },
        });
      } else {
        void fetchData();
      }
    },
  });
};

const updateVm = async (description: string) => {
  await makeApiCall({
    apiCallFn: updateServer,
    payload: {
      serverId: vmItem.value.id,
      body: {
        description,
      },
    },
    successCallback: () => {
      void fetchData();
    },
  });
};

const vmFlavorHeaders = computed(() =>
  getTableHeaders(TABLE_TYPE.FLAVOR, [
    {
      title: t('flavor.disk'),
      key: 'disk',
      subTitle: '(GB)',
    },
  ])
);

const detachVolume = (item: any) => {
  uiShowDialog({
    title: t('dialog.detach.title', {
      resource: t('services.virtualVolume'),
    }),
    resourceInfo: [
      {
        title: t('label.name'),
        value: item.name,
      },
    ],
    callback: async () => {
      await doVolumeActions({ action: 'detach' }, item.id as string, () =>
        setTimeout(() => {
          void fetchData();
        }, 3000)
      );
    },
  });
};
const openVNC = async () => {
  await makeApiCall({
    apiCallFn: fetchVncConsole,
    payload: {
      serverId: vmItem.value.id,
    },
    successCallback: res => {
      window.open(res.url as string, '_blank');
    },
  });
};
const showUpdateSecurityGroupDialog = ref(false);
const sgList: Ref<Network[]> = ref([]);
const openUpdateSecurityGroupDialog = async (item: any) => {
  await doFetchVmSecurityGroups(false, res => {
    sgList.value = res;
    showUpdateSecurityGroupDialog.value = true;
    selectedNIC.value = item;
  });
};

const updateSecurityGroup = async (item: any) => {
  await makeApiCall({
    apiCallFn: vmUpdateSecurityGroup,
    payload: {
      serverId: vmItem.value.id,
      nicId: item.id,
      body: {
        sg_ids: item.security_groups.id,
      },
    },
    successCallback: () => {
      showUpdateSecurityGroupDialog.value = false;
      void fetchData();
    },
  });
};

const openVolumeDialog = async () => {
  await makeApiCall({
    apiCallFn: fetchVmVolumes,
    successCallback: res => {
      volumeList.value = res;
    },
  });
  showVolumeDialog.value = true;
};

const attachVolume = async (volumeItems: Volume[]) => {
  volumeItems.forEach(volume => {
    makeApiCall({
      apiCallFn: attachServerVolume,
      payload: {
        serverId: vmItem.value.id,
        volumeId: volume.id,
      },
    });
  });
  setTimeout(() => {
    void fetchData();
  }, 3000);
};

const openNicDialog = async () => {
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchVmNetworks,
    successCallback: res => {
      networkList.value = res;
    },
  });
  await doFetchVmSecurityGroups(false, res => {
    sgList.value = res;
    showNetworkDialog.value = true;
  });
};

const attachNetwork = async (network: Network) => {
  await makeApiCall({
    apiCallFn: attachNic,
    payload: {
      serverId: vmItem.value.id,
      body: {
        network_id: network.id,
        sg_ids: network?.security_groups?.id,
      },
    },
    successCallback: () => {
      showNetworkDialog.value = false;
      void fetchData();
    },
  });
};

const detachNetwork = async (network: Network) => {
  await makeApiCall({
    apiCallFn: removeNic,
    payload: {
      serverId: vmItem.value.id,
      nicId: network.id,
    },
    successCallback: () => {
      void fetchData();
    },
  });
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $tc('basic.detail.type', { type: $t('services.virtualMachine') })
        "
      />
      <TabsComponent :tab-names="tabs" is-card-style>
        <template #tab-0>
          <v-card>
            <v-card-title
              class="pa-2 d-flex justify-space-between align-center"
            >
              <div>
                <DetailActionBtn
                  v-for="item in [
                    {
                      text: t('table.action.start'),
                      visible: vmItem.status?.toLowerCase() === 'shutoff',
                      icon: 'mdi-play',
                      action: () =>
                        uiShowDialog({
                          title: $t('dialog.start.title', {
                            resource: $t('services.virtualMachine'),
                          }),
                          resourceInfo: [
                            {
                              title: $t('label.name'),
                              value: vmItem.name,
                            },
                          ],
                          callback: () => {
                            doServerAction(
                              { action: SERVER_ACTION.START },
                              vmItem.id,
                              fetchData
                            );
                          },
                        }),
                    },
                    {
                      text: t('table.action.stop'),
                      visible: vmItem.status?.toLowerCase() === 'active',
                      icon: 'mdi-stop',
                      action: () =>
                        uiShowDialog({
                          title: $t('dialog.stop.title', {
                            resource: $t('services.virtualMachine'),
                          }),
                          resourceInfo: [
                            {
                              title: $t('label.name'),
                              value: vmItem.name,
                            },
                          ],
                          callback: () => {
                            doServerAction(
                              { action: SERVER_ACTION.STOP },
                              vmItem.id,
                              fetchData
                            );
                          },
                        }),
                    },
                    {
                      text: t('action.reboot'),
                      icon: 'mdi-play-circle-outline',
                      visible: true,
                      disabled: vmItem.status?.toLowerCase() !== 'active',
                      action: showRebootDialog,
                    },
                    {
                      text: t('action.createImage'),
                      icon: 'mdi-cube-scan',
                      visible: true,
                      disabled:
                        (vmItem.status?.toLowerCase() !== 'active' &&
                          vmItem.status?.toLowerCase() !== 'shutoff') ||
                        (!isOwner(vmItem.user?.id) && !isAdmin),
                      action: () => {
                        showCreateImageDialog = true;
                      },
                    },
                    {
                      text: $tc('basic.review', 2),
                      icon: 'menu_icon_review',
                      isSvgIcon: true,
                      visible:
                        isAdmin && vmItem.status?.toLowerCase() === 'pending',
                      action: () => {
                        showReviewDialog = true;
                      },
                    },
                    {
                      text: t('basic.transfer'),
                      icon: 'menu_icon_resource_transfer',
                      isSvgIcon: true,
                      visible: $isPublicSite && !getIsPilotRegion,
                      disabled: vmItem.status?.toLowerCase() !== 'active',
                      action: () => {
                        showTransferDialog = true;
                      },
                    },
                    {
                      text: t('table.action.delete'),
                      icon: 'mdi-delete-outline',
                      visible: true,
                      action: () =>
                        openDeleteDialog({
                          item: vmItem,
                          resourceType: $t('services.virtualMachine'),
                          message: t('dialog.delete.message.type', {
                            type: t('services.virtualMachine'),
                          }),
                          deleteAction: async () => {
                            await doDeleteVm(vmItem.id, () => {
                              void router.push({ name: PAGE_TYPES.VM_LIST });
                            });
                          },
                        }),
                    },
                    {
                      text: t('table.action.refresh'),
                      icon: 'mdi-refresh',
                      visible: true,
                      action: () => {
                        void fetchData();
                      },
                    },
                  ].filter(item => item.visible)"
                  :key="item.text"
                  :btn="item"
                  :btn-tips="item.text"
                  :btn-icon="item.icon"
                  :is-svg-icon="item.isSvgIcon"
                  :last-updated-time="lastUpdatedTime"
                  @item-click="item.action"
                />
              </div>

              <span class="ocis-last-updated-time mr-4">
                {{ $t('label.lastUpdated') }}
                {{ formatDateSec(lastUpdatedTime) }}
              </span>
            </v-card-title>
            <v-card-text class="ocis-detail-scroll-view px-4">
              <DetailPanelGroup v-model="expansionPanels">
                <DetailPanel
                  :title="expansionPanels[0].title"
                  :value="expansionPanels[0].value"
                >
                  <v-row no-gutters class="text-body-2">
                    <v-col
                      v-for="(item, index) in basicInfo"
                      :key="index"
                      cols="6"
                      class="pb-4 d-flex align-center"
                    >
                      <DetailItem
                        :title="item.text"
                        :content="item.value"
                        :is-status="item.isStatus"
                        :status-hint="item.statusHint"
                      >
                        <OutlinedBtn
                          v-if="item.button"
                          :disabled="item.disabled"
                          :class="{ 'ml-2': item.value }"
                          :text="item.button"
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
                  <v-row no-gutters>
                    <v-col cols="2">
                      <span class="text-body-2">
                        {{ $t('vm.network') }}
                      </span>
                    </v-col>
                    <v-col cols="10">
                      <OutlinedBtn
                        class="mb-2 mt-n2"
                        :text="$t('vm.network.add')"
                        :disabled="
                          attachDisableState.includes(
                            vmItem.status?.toLowerCase()
                          )
                        "
                        @click="openNicDialog"
                      />
                      <DetailTable
                        :items="virtualNetwork"
                        :headers="[
                          { title: $t('label.name'), key: 'name' },
                          {
                            title: $t('vm.network.private.ip'),
                            key: 'private_ip',
                          },
                          {
                            title: $t('vm.network.floating.ip'),
                            key: 'floating_ip.address',
                            copy: true,
                          },
                          {
                            title: $t('virtualNetwork.securityGroup'),
                            key: 'security_groups.name',
                          },
                          {
                            title: $t('label.createdAt'),
                            key: 'createdAt',
                          },
                        ]"
                        :actions="[
                          {
                            label: $t('action.floating.ip.detach'),
                            visible: item =>
                              item.floating_ip?.address ? true : false,
                            disabled: item =>
                              !item.floating_ip?.reserved ||
                              item.isProviderNetwork,
                            action: (item: any) => showFIPDetachDialog(item),
                          },
                          {
                            label: $t('action.floating.ip.attach'),

                            visible: item =>
                              item.floating_ip.address ? false : true,
                            disabled: item => item.isProviderNetwork,
                            action: (item: any) => {
                              selectedNIC = item;
                              showFloatingIpDialog = true;
                            },
                          },
                          {
                            label: $t('action.edit.type', {
                              type: $t('virtualNetwork.securityGroup'),
                            }),
                            disabled: item => item.isProviderNetwork,
                            action: (item: any) => {
                              openUpdateSecurityGroupDialog(item);
                            },
                          },
                          {
                            label: $t('vm.network.remove'),
                            disabled: item =>
                              item.isProviderNetwork ||
                              virtualNetwork.length === 1,
                            action: (item: any) => {
                              detachNetwork(item);
                            },
                          },
                        ]"
                      />
                    </v-col>
                  </v-row>
                </DetailPanel>

                <DetailPanel
                  :title="expansionPanels[2].title"
                  :value="expansionPanels[2].value"
                >
                  <v-row no-gutters>
                    <v-col cols="2">
                      <span class="text-body-2">
                        {{ $t('services.virtualVolume') }}
                      </span>
                    </v-col>
                    <v-col cols="10">
                      <OutlinedBtn
                        class="mb-2 mt-n2"
                        :text="$t('vm.volume.add')"
                        :disabled="
                          attachDisableState.includes(
                            vmItem.status?.toLowerCase()
                          )
                        "
                        @click="openVolumeDialog"
                      />
                      <DetailTable
                        :items="storageList"
                        :headers="[
                          {
                            title: $t('label.name'),
                            key: 'name',
                            align: 'start',
                          },
                          {
                            title: $t('label.volume.size.unit'),
                            key: 'size',
                            align: 'start',
                          },
                          {
                            title: $t('label.type'),
                            key: 'type',
                            align: 'start',
                          },
                          {
                            title: $t('label.createdAt'),
                            key: 'createdAt',
                            align: 'start',
                          },
                        ]"
                        :actions="[
                          {
                            label: $t('action.detach'),
                            disabled: item =>
                              item.status?.toLowerCase() !== 'in-use',
                            action: (item: any) => {
                              detachVolume(item);
                            },
                          },
                        ]"
                      />
                    </v-col>
                  </v-row>
                </DetailPanel>
                <DetailPanel
                  :title="expansionPanels[3].title"
                  :value="expansionPanels[3].value"
                >
                  <v-row no-gutters>
                    <v-col cols="6">
                      <DetailItem
                        :title="$t('services.keypairs')"
                        :content="vmItem.keypair?.name ?? $t('basic.no.data')"
                      />
                    </v-col>
                  </v-row>
                </DetailPanel>
                <DetailPanel
                  :title="expansionPanels[4].title"
                  :value="expansionPanels[4].value"
                >
                  <v-row no-gutters>
                    <v-col cols="2">
                      <span class="text-body-2">
                        {{ $t('label.initialization.script') }}
                      </span>
                    </v-col>
                    <v-col>
                      <TextareaComponent
                        :model-value="vmItem.boot_script"
                        :rows="1"
                        auto-grow
                        readonly
                      />
                    </v-col>
                  </v-row>
                </DetailPanel>
                <DetailPanel
                  :title="expansionPanels[5].title"
                  :value="expansionPanels[5].value"
                >
                  <v-row no-gutters>
                    <v-col cols="6">
                      <DetailItem :title="$t('vm.console')">
                        <OutlinedBtn
                          :text="$t('basic.open')"
                          :disabled="
                            vmItem.status?.toLowerCase() !== 'active' ||
                            !isOwner(vmItem.user?.id)
                          "
                          @click="openVNC"
                        />
                      </DetailItem>
                    </v-col>
                    <v-col v-if="vmItem.keypair?.name" cols="6">
                      <DetailItem :title="$t('vm.console.password')">
                        <OutlinedBtn
                          :text="$t('action.getConsolePassword')"
                          :disabled="!isOwner(vmItem.user?.id)"
                          @click="showConsolePasswordDialog = true"
                        />
                      </DetailItem>
                    </v-col>
                  </v-row>
                </DetailPanel>
              </DetailPanelGroup>
            </v-card-text>
          </v-card>
        </template>
        <template #tab-1>
          <VmMonitorViewer
            :server-id="vmItem.id"
            :vgpu="vmItem.flavor_detail?.gpu?.is_vgpu"
          />
        </template>
      </TabsComponent>
    </v-row>
    <EditDescriptionDialog
      v-model:show="showDescDialog"
      :item-name="vmItem.name"
      :description="vmItem.description"
      @update-value="updateVm"
    />
    <VmConsolePasswordDialog
      v-model:show="showConsolePasswordDialog"
      :api-call-fn="vmActions"
      :api-payload="{ serverId: vmItem.id }"
    />
    <VmLogDialog v-model:show="showLogDialog" :logs="logs" />
    <VmReviewDialog
      v-model:show="showReviewDialog"
      type="vm"
      :item="vmItem"
      :submit-callback="
        (approve: boolean) => {
          doServerAction(
            { action: approve ? SERVER_ACTION.APPROVE : SERVER_ACTION.REJECT },
            vmItem?.id,
            fetchData
          );
        }
      "
    />
    <TransferDialog
      v-model:show="showTransferDialog"
      :resource-id="vmItem.id"
      :resource-name="vmItem.name"
      :resource-type="RESOURCE_TYPE.VPS"
      :keypair-id="vmItem.keypair_id"
    />
    <VmCreateImageDialog
      v-model:show="showCreateImageDialog"
      :server-id="vmItem.id"
    />
    <CommonDialog
      v-model:show="showFloatingIpDialog"
      :title="$t('action.floating.ip.attach')"
      :submit-callback="attachFIP"
      :disable-submit="!selectedFIPOption && !selectedFIP"
    >
      <RadioButtonSwitch
        :title="$t('action.floating.ip.attach')"
        :options="[
          { label: $t('vm.floating.ip.attach.auto'), value: true },
          { label: $t('vm.floating.ip.attach.prebuilt'), value: false },
        ]"
        :init-value="selectedFIPOption"
        is-required
        @selected="value => selectFIPOption(value)"
      />
      <SelectWithHint
        v-if="!selectedFIPOption"
        v-model="selectedFIP"
        :title="$t('vm.floating.ip.prebuilt')"
        :items="floatingIps"
        item-text="name"
        return-object
        required
      />
    </CommonDialog>
    <CommonDialog
      v-model:show="showFlavorDialog"
      :title="$t('flavor.change')"
      :submit-callback="
        () => {
          doServerAction(
            { action: SERVER_ACTION.RESIZE, flavor_id: selectedFlavor.id },
            vmItem.id,
            fetchData
          );
        }
      "
      width="1000"
    >
      <template #info>
        <DialogAlert class="ml-4" :message="$t('flavor.change.hint')" />
      </template>
      <FlavorTableSelection
        v-model="selectedFlavor"
        :headers="vmFlavorHeaders"
        :items="flavorList"
      />
    </CommonDialog>
    <NetworkSettingDialog
      v-model:show="showUpdateSecurityGroupDialog"
      :editing-network="selectedNIC"
      :security-group-options="sgList"
      @add-new-network="updateSecurityGroup"
      @close-dialog="showUpdateSecurityGroupDialog = false"
    />
    <NetworkSettingDialog
      v-model:show="showNetworkDialog"
      :network-options="
        networkList.filter(
          (network: any) =>
            !virtualNetwork.find((item: any) => item.network_id === network.id)
        )
      "
      :security-group-options="sgList"
      @add-new-network="attachNetwork"
      @close-dialog="showNetworkDialog = false"
    />
    <VolumeSettingDialog
      v-model:show="showVolumeDialog"
      :volume-list="
        volumeList.filter(
          volume => volume.status?.toLowerCase() === 'available'
        )
      "
      @update-volume="attachVolume"
    />
  </UiContainer>
</template>
