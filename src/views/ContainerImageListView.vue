<script lang="ts" setup>
import { useProject, usePortalConfig } from '@/store';
import { computed, ref, onMounted, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  fetchContainerRegistry,
  fetchContainerImageList,
  updateContainerImage,
  deleteContainerImage,
  makeApiCall,
  makeMultipleApiCalls,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import CmdReferenceBtn from '@/components/common/CmdReferenceBtn.vue';
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
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import { getDeepObj, generalCopy, isPublicSite } from '@/utils/utils';

const route = useRoute();
const router = useRouter();
const { portalConfig } = usePortalConfig();
const projectStore = useProject();
const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;
const $isPublicSite = isPublicSite();

const headers = computed(() => getTableHeaders());
const noDataSetting = computed(() => getNoDataSetting(route.name as string));

const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const cntrImageList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');

const showEditDescriptionDialog = ref(false);

const showUsageDialog = ref(false);
const usedBytes = ref(0);
const allocatedBytes = ref(0);

const editingImage = ref({ name: '' });
const editingImageDesc = ref('');

const projectSysCode = computed(() =>
  projectStore.getCurrentProject?.projectSysCode?.toLowerCase()
);

const command = computed(() =>
  $isPublicSite
    ? {
        title: t('image.docker.push.title'),
        items: [
          {
            name: t('image.docker.tagCommand'),
            content: `docker tag {Source Image Name}:{Tag} ${portalConfig.IMAGE_REGISTRY}/${projectSysCode.value}/{Image Name}:{Tag}`,
          },
          {
            name: t('image.docker.pushCommand'),
            content: `docker push ${portalConfig.IMAGE_REGISTRY}/${projectSysCode.value}/{Image Name}:{Tag}`,
          },
        ],
      }
    : {
        title: t('image.docker.pull.title'),
        items: [
          {
            name: t('image.docker.pullCommand'),
            content: `docker pull ${portalConfig.IMAGE_REGISTRY}/${projectSysCode.value}/{Image Name}:{Tag}`,
          },
        ],
      }
);

const batchDeleteHeaders = computed(() => {
  return [
    { title: '', key: 'checkbox', width: '48px' },
    {
      title: t('label.name'),
      key: 'name',
    },
  ];
});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => await fetchData());
});

const fetchData = async () => {
  isLoading.value = true;
  cntrImageList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchContainerImageList,
    errorResHandlingFn: () => [],
  });

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const updateDescription = ($event: Record<string, unknown>) => {
  return makeApiCall({
    apiCallFn: updateContainerImage,
    payload: { imageName: editingImage.value.name, description: $event },
    successCallback: fetchData,
  });
};

const linkUrl = computed(() => {
  return Document.CONTAINER_IMAGE;
});
const toDetailPage = async (imageName: string) => {
  await router.push({
    name: PAGE_TYPES.CONTAINER_IMAGE_DETAIL,
    params: { imageName },
  });
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: deleteContainerImage,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.name),
  });
};
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: $t('services.containerImageManage'),
          })
        "
        :link-url="linkUrl"
      />
      <v-col cols="12" class="px-0 d-flex align-end justify-space-between">
        <CmdReferenceBtn
          :title="command.title"
          :description="$t('image.docker.command.message')"
          :items="command.items"
        />
        <div class="message">
          {{ `${$t('image.serviceEndpoint')}: ${portalConfig.IMAGE_REGISTRY}` }}
          <v-icon
            class="ml-2"
            @click="generalCopy(portalConfig.IMAGE_REGISTRY)"
          >
            mdi-content-copy
          </v-icon>
        </div>
      </v-col>

      <GeneralDataTable
        :more-action-list="[
          {
            label: $t('action.edit.type', { type: $t('basic.desc') }),
            action: (item: any) => {
              editingImage = item;
              editingImageDesc = item.desc;
              showEditDescriptionDialog = true;
            },
            visible: (_item: any) => $isPublicSite,
            // disabled: (item: any) => item.status !== 'InActive',
          },
          {
            type: ActionType.DELETE,
            resourceType: $t('services.containerImageManage'),
            message: $t('dialog.delete.message.type', {
              type: $t('services.containerImageManage'),
            }),
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteContainerImage,
                payload: item.name,
                successCallback: fetchData,
              }),
            visible: (_item: any) => $isPublicSite,
          },
        ]"
        :batch-delete-setting="
          $isPublicSite
            ? {
                items: cntrImageList,
                tableHeaders: batchDeleteHeaders,
                tableItemKey: 'name',
                action: batchDeleteAction,
              }
            : undefined
        "
        :custom-btn="{
          label: $t('s3.usage'),
          action: async () => {
            const registry = await makeApiCall({
              apiCallFn: fetchContainerRegistry,
            });
            usedBytes = registry.storageUsed;
            allocatedBytes = registry.storageLimit;
            showUsageDialog = true;
          },
        }"
        :items="cntrImageList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'udpate_time',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        :no-data-setting="noDataSetting"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
        @on-row-click="(item: any) => toDetailPage(item.name)"
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
  />
</template>

<style lang="scss" scoped>
.message {
  font-size: 16px !important;
}
</style>
