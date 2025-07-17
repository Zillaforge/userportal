<script lang="ts">
import { useProject, useGlobal } from '@/store';
import { ref, watch, computed, onMounted, type Ref, type PropType } from 'vue';

import AccessControlDialog from '@/components/S3BucketAccessControlDialog.vue';
import CreateDialog from '@/components/S3BucketCreateDialog.vue';
import UsageDialog from '@/components/S3UsageDialog.vue';
import TD from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import { showStorageFullDialog } from '@/composables/useCloudStorage';
import i18n from '@/i18n';
import {
  ActionType,
  MainActionType,
  type NoDataSetting,
  type TableItem,
  type MoreAction,
  type MainAction,
} from '@/interfaces/InfraDataTableInterface';
import { getDeepObj } from '@/utils/utils';

export default {
  name: 'DataListPageComponent',
};
</script>

<script lang="ts" setup>
const { t } = i18n.global;
const globalStore = useGlobal();
const projectStore = useProject();

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  headers: {
    type: Array<any>,
    default: () => [],
  },
  linkUrl: {
    type: Object as PropType<{ tw: string; en: string }>,
    default: undefined,
  },
  dataList: {
    type: Array<TableItem>,
    default: () => [],
  },
  noDataSetting: {
    type: Object as PropType<NoDataSetting>,
    default: null,
  },
  endpoint: {
    type: String,
    default: '',
  },
  allocatedBytes: {
    type: Number,
    default: 0,
  },
  usedBytes: {
    type: Number,
    default: 0,
  },
  moreActionList: {
    type: Array<MoreAction>,
    default: undefined,
  },
  mainActionList: {
    type: Array<MainAction>,
    default: undefined,
  },
  endpointTooltip: {
    type: String,
    default: undefined,
  },
});

const emits = defineEmits([
  'createAction',
  'deleteAction',
  'getUsage',
  'toDetailPage',
  'fetchData',
]);

const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const searchStr: Ref<string> = ref('');
const showCreateDialog: Ref<boolean> = ref(false);
const showUsageDialog: Ref<boolean> = ref(false);
const showAccessControlDialog: Ref<boolean> = ref(false);
const selectedName: Ref<string> = ref('');

const projectId = computed(() => projectStore.getCurrentProject?.id);

const filterS3Endpoint = computed(() => {
  const urlReg = /(http(s)?:\/\/)*/g;
  let value = props.endpoint;
  if (urlReg.test(value)) {
    value = value.substring(urlReg.lastIndex);
  }

  if (value.endsWith('/')) {
    value = value.slice(0, value.length - 1);
  }
  return value;
});

const isQuotaFull = computed(() => {
  if (props.allocatedBytes === -1) {
    return false;
  } else if (props.usedBytes >= props.allocatedBytes) {
    return true;
  }
  return false;
});

onMounted(() => {
  void fetchData();
});

const fetchData = async () => {
  isLoading.value = true;
  emits('fetchData', () => {
    lastUpdatedTime.value = new Date();
    isLoading.value = false;
  });
};

const openCreateDialog = () => {
  if (isQuotaFull.value) {
    showStorageFullDialog();
  } else {
    showCreateDialog.value = true;
  }
};

const createAction = (name: string) => {
  isLoading.value = true;
  emits('createAction', name, () => (isLoading.value = false));
};

const deleteAction = (name: string) => {
  isLoading.value = true;
  emits('deleteAction', name, () => (isLoading.value = false));
};

const getUsage = () => {
  emits('getUsage', () => (showUsageDialog.value = true));
};

const copyString = (value: string) => {
  void navigator.clipboard.writeText(value);
  globalStore.triggerSnackbar({ content: t('basic.copied') });
};

watch(projectId, (newVal, oldVal) => {
  if (oldVal) {
    void fetchData();
  }
});

watch(showAccessControlDialog, val => {
  if (!val) {
    selectedName.value = '';
  }
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp :title="title" :link-url="linkUrl" />
      <GeneralDataTable
        :main-action-list="
          mainActionList ?? [
            {
              type: MainActionType.CREATE,
              action: openCreateDialog,
            },
          ]
        "
        :more-action-list="
          moreActionList ?? [
            {
              label: $t('s3.accessControl'),
              action: item => {
                selectedName = item.Name;
                showAccessControlDialog = true;
              },
            },
            {
              type: ActionType.DELETE,
              action: item => deleteAction(String(item.Name)),
            },
          ]
        "
        :resource-info="[
          {
            title: $t('label.name'),
            keyOfvalue: 'Name',
          },
        ]"
        :custom-btn="{
          label: $t('s3.usage'),
          action: getUsage,
        }"
        :items="dataList"
        :last-updated-time="lastUpdatedTime"
        :table-headers="headers"
        :table-item-key="'Name'"
        :loading="isLoading"
        :no-data-setting="{ ...noDataSetting, action: openCreateDialog }"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'Name',
          isDescending: false,
        }"
        @fetch-data="fetchData"
        @on-row-click="item => emits('toDetailPage', item)"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
          />
        </template>
        <template #message>
          <span
            class="text-end message"
            :class="{ 'pb-6': mainActionList?.length === 0 }"
          >
            {{ $t('s3.plugin.service.endpoint') }}
            <InfoTooltip
              v-if="endpointTooltip"
              :tooltip="endpointTooltip"
              location="bottom"
            />
            :
            <span>{{ filterS3Endpoint }}</span>
            <v-icon class="ml-2" @click="copyString(filterS3Endpoint)">
              mdi-content-copy
            </v-icon>
          </span>
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
  <AccessControlDialog
    v-model:show="showAccessControlDialog"
    :bucket-name="selectedName"
    :submit-callback="fetchData"
  />

  <CreateDialog v-model:show="showCreateDialog" @create-bucket="createAction" />

  <UsageDialog
    v-model:show="showUsageDialog"
    :used-bytes="usedBytes"
    :allocated-bytes="allocatedBytes"
  />
</template>

<style scoped>
.message {
  font-size: 16px !important;
}
</style>
