<script setup lang="ts">
import { computed, type Ref, ref, watch } from 'vue';

import { fetchK8sClusterDetail, fetchK8sLog, makeApiCall } from '@/api';
import Pagination from '@/components/PaginationComponment.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';

const LOG_TYPE = {
  API_SERVER: 'apiserver',
  SCHEDULER: 'scheduler',
  CONTROLLER: 'controller',
  AUDIT: 'audit',
};

const props = defineProps({
  clusterId: {
    type: String,
    required: true,
  },
  hosts: {
    type: Array<string>,
    default: () => [],
  },
});
const selectedHost = ref('');
const selectedLogType = ref('');
const raw = ref([]);
const totalLines = ref(0);
const totalPages = ref(0);
const SIZE = 500;
const abortController = ref(new AbortController());
const parsedLog = ref('');
const showDialog = defineModel<boolean>('show', { required: true });
const pagination = ref({ totalItems: 0, rowsPerPage: SIZE, page: 1 });
const hosts: Ref<string[]> = ref([]);
const isHideDetails = ref(true);

const handleFetchHosts = async () => {
  let hostList: any[];

  const getMasterNodes = (nodes: any) =>
    nodes
      .filter((node: any) => node.nodeType === 'master')
      .map((node: any) => node.name)
      .sort();

  if (props?.hosts?.length === 0) {
    // fetch cluster detail
    const cluster = await makeApiCall({
      apiCallFn: fetchK8sClusterDetail,
      payload: {
        clusterId: props.clusterId,
      },
    });
    hostList = cluster.nodes;
  } else {
    hostList = props.hosts;
  }

  hosts.value = getMasterNodes(hostList);
};

const handleConditionChange = () => {
  // reset pagination
  pagination.value.totalItems = 0;
  pagination.value.page = 1;
  totalPages.value = 0;

  // fetch log
  void handleFetchLogs();
};

const handleFetchLogs = async () => {
  if (selectedLogType.value && selectedHost.value) {
    raw.value = [];
    parsedLog.value = 'loading ...';

    abortController.value.abort();
    abortController.value = new AbortController();

    await makeApiCall({
      skipProgress: true,
      apiCallFn: fetchK8sLog,
      payload: {
        clusterId: props.clusterId,
        hostName: selectedHost.value,
        type: LOG_TYPE[selectedLogType.value as keyof typeof LOG_TYPE],
        query: {
          size: SIZE,
          offset: pagination.value.rowsPerPage * (pagination.value.page - 1),
        },
        controller: abortController.value,
      },
    })
      .then((res: any) => {
        if (res?.isCancel) {
          parsedLog.value = 'loading ...';
          return;
        }

        totalLines.value = res?.total || 0;
        totalPages.value = Math.ceil(totalLines.value / SIZE);
        pagination.value.totalItems = totalLines.value;

        if (res?.total && res?.logs) {
          raw.value = res.logs;
          parsedLog.value = raw.value
            .map((el: any) => {
              return el.message;
            })
            .join('\n');
        } else {
          parsedLog.value = 'no content';
        }
      })
      .catch((err: any) => {
        console.error(err);
      })
      .finally(() => {});
  }
};

const handlePageChange = (newPage: any) => {
  pagination.value.page = newPage;
};

const handleReset = async () => {
  hosts.value = [];
  selectedHost.value = '';
  selectedLogType.value = '';
  totalLines.value = 0;
  totalPages.value = 0;
  parsedLog.value = '';
  pagination.value.totalItems = 0;
  pagination.value.page = 1;
};

const handleCloseDialog = () => {
  abortController.value.abort();
};

const getHosts = computed(() => {
  return hosts.value;
});

const logTypes = () => {
  return Object.keys(LOG_TYPE);
};

watch(
  () => pagination.value.page,
  val => {
    void handleFetchLogs();
  }
);

watch(showDialog, val => {
  void handleReset();
  if (val) {
    // open behavior
    // get node groups;
    void handleFetchHosts();
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('k8s.log.title')"
    :show-cancel-btn="false"
    :submit-btn-text="$t('basic.close')"
    :submit-callback="handleCloseDialog"
    width="70vw"
  >
    <v-row no-gutters class="mb-6">
      <v-col cols="6">
        <v-select
          v-model="selectedHost"
          class="mr-2"
          :items="getHosts"
          :placeholder="$t('label.nodeName')"
          density="compact"
          variant="outlined"
          :hide-details="isHideDetails"
          @update:model-value="() => handleConditionChange()"
        />
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="selectedLogType"
          class="ml-2"
          :items="logTypes()"
          :placeholder="$t('label.logType')"
          density="compact"
          variant="outlined"
          :hide-details="isHideDetails"
          @update:model-value="() => handleConditionChange()"
        />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12" class="mb-4">
        <div class="pa-4 log-view">
          <pre>{{ parsedLog }}</pre>
        </div>
      </v-col>
      <v-col cols="12">
        <Pagination
          class="text-center footer"
          :pagination="pagination"
          :item-title="`${$tc('basic.pages', pagination.totalItems, { number: totalPages })}`"
          @update-current-page="page => handlePageChange(page)"
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>

<style lang="scss" scoped>
.footer {
  background-color: var(--v-thmem-bg-default) !important;
}

.log-view {
  height: 500px;
  border: 1px solid rgba(var(--v-theme-border), var(--v-border-opacity)) !important;
  white-space: pre-line;
  overflow-wrap: break-word;
  overflow-y: auto;
}
</style>
