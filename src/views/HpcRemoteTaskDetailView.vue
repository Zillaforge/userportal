<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  makeApiCall,
  makeMultipleApiCalls,
  fetchRemoteTaskDetail,
  editRemoteTask,
  deleteRemoteTask,
  bindRemoteResourcesToTask,
  unbindRemoteResourceToTask,
  fetchRemoteJobList,
  terminateRemoteJob,
  deleteRemoteJob,
  fetchRemoteJobLogFiles,
  fetchRemoteJobLogs,
  fetchRemoteResourceList,
} from '@/api';
import StartRemoteTaskDialog from '@/components/StartRemoteTaskDialog.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import EditCommandDialog from '@/components/common/EditCommandDialog.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';
import EditEnvVariablesDialog from '@/components/common/EditEnvVariablesDialog.vue';
import EditRemoteDataSourceDialog from '@/components/common/EditRemoteDataSourceDialog.vue';
import EditRemoteOutputsDialog from '@/components/common/EditRemoteOutputsDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import router from '@/router';
import { formatDateSec, generalCopy } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;
const route = useRoute();
const timer = ref(0);
const tabs = computed(() => [t('basic.overview'), t('basic.trial.list')]);
const tabIndex: Ref<number> = ref(0);
const lastUpdatedTime: Ref<Date | string> = ref('');
lastUpdatedTime.value = new Date();
const showImageDialog = ref(false);
const remoteImageList = ref<Record<string, any>[]>([]);
const selectedRemoteImage = ref<Record<string, any>>();

const {
  openDeleteDialog,
  openStopDialog,
  uiShowProgressDlg,
  uiHideProgressDlg,
} = useGlobal();
const detailButton = computed(() => {
  const btns = [
    {
      text: t('table.action.start'),
      visible: true,
      icon: 'mdi-play',
      action: () => (showCreateJobDialog.value = true),
    },
    {
      text: t('table.action.delete'),
      icon: 'mdi-delete-outline',
      visible: true,
      single: true,
      action: () =>
        openDeleteDialog({
          item: detail.value,
          resourceType: ` ${t('services.hpc.deliver')}`,
          message: t('dialog.delete.message.type', {
            type: t('services.hpc.deliver'),
          }),
          deleteAction: () =>
            makeApiCall({
              apiCallFn: deleteRemoteTask,
              payload: getTaskId.value,
              successCallback: async () =>
                await router.push({ name: PAGE_TYPES.HPC_REMOTE_TASK_LIST }),
            }),
        }),
    },
    {
      text: t('table.action.refresh'),
      icon: 'mdi-refresh',
      visible: true,
      single: true,
      action: () => {
        void fetchData();
      },
    },
  ];
  return tabIndex.value === 0 ? btns : [btns[2]];
});

const panelsTab1 = computed(() => [
  { title: t('label.basicInfo'), value: 'basicInfo' },
  {
    title: t('basic.info', { type: t('services.hpc.remote.data') }),
    value: 'remoteDataset',
  },
  { title: t('label.env.variable'), value: 'variable' },
  { title: t('basic.info', { type: t('label.script') }), value: 'script' },
]);

const panelsTab2 = computed(() => [
  { title: t('basic.trial.list'), value: 'jobs' },
]);

const detail: Ref<Record<string, any>> = ref({});
const detailItems = computed(() => [
  {
    text: t('label.name'),
    value: detail.value.name ?? '',
  },
  {
    text: t('label.computingNode.number'),
    value: detail.value.flavor?.metadata?.nodes ?? '',
  },
  {
    text: t('basic.desc'),
    value: detail.value.description ?? '',
    button: t('basic.edit'),
    callback: () => {
      showDescDialog.value = true;
    },
  },
  {
    text: t('label.serviceState'),
    value: detail.value.status ?? '',
    isStatus: true,
  },
  {
    text: t('label.env'),
    value: detail.value.provider ?? '',
  },
  {
    text: t('label.createdAt'),
    value: detail.value.createdAt ?? '',
    isDate: true,
  },
  {
    text: t('services.hpc.remote.image'),
    value: getImage.value,
    button: t('basic.edit'),
    callback: () => {
      void getRemoteImageInfo();
      showImageDialog.value = true;
    },
  },
  {
    text: t('label.createdBy'),
    value: detail.value.user?.displayName ?? '',
  },
  {
    text: t('flavor.title'),
    value: detail.value.flavor?.name ?? '',
  },
  {
    text: t('label.lastModified.at'),
    value: detail.value.updatedAt ?? '',
    isDate: true,
  },
]);

const showDescDialog = ref(false);
const updateDesc = async (description: string) => {
  await makeApiCall({
    apiCallFn: editRemoteTask,
    payload: {
      taskId: getTaskId.value,
      body: {
        description,
      },
    },
    successCallback: () => {
      void fetchData();
    },
  });
};

const resImage = computed(() =>
  detail.value.resources?.find((res: any) => res.type === 'image')
);

const getImage = computed(() => {
  return resImage.value?.name ?? '';
});

const dataSourceHeaders = computed(() => [
  {
    title: t('HpcRemoteTask.remoteData.bucket'),
    value: 'remoteBucket',
    width: '50%',
  },
  {
    title: t('content.mountPath'),
    value: 'mountPath',
    width: '50%',
  },
]);
const getDataSource = computed(() => {
  const resDataSource =
    detail.value.resources?.filter((res: any) => res.type === 'dataset') ?? [];
  return resDataSource.map((dataSourceInfo: any) => {
    // example of dataSourceInfo.path 'dss-public://{projectId}/{buckt}{subpath}:{mountPath}'
    const indexOfDatasetPath =
      dataSourceInfo.path?.split('/', 3).join('/').length ?? 0;
    const pathInfo =
      dataSourceInfo.path?.substring(indexOfDatasetPath + 1) ?? '';

    return {
      id: dataSourceInfo.resourceId ?? '',
      remoteBucket: dataSourceInfo.name ?? '',
      mountPath: pathInfo.split(':')[1],
    };
  });
});

const showEditDataSourceDialog = ref(false);
const updateRemoteDataSource = async (
  newDataSources: {
    remoteDataset: Record<string, any> | undefined;
    path: string;
  }[]
) => {
  const formatNewDataSources = newDataSources.map(data => {
    return {
      id: data.remoteDataset?.value ?? '',
      remoteBucket: data.remoteDataset?.name ?? '',
      mountPath: data.path ?? '',
    };
  });
  const addItems = formatNewDataSources.filter(newItem => {
    const hasSameItem = getDataSource.value.find(
      (oldItem: { id: any; mountPath: string }) =>
        oldItem.id === newItem.id && oldItem.mountPath === newItem.mountPath
    );
    return !hasSameItem;
  });
  const removeItems = getDataSource.value.filter(
    (oldItem: { id: any; mountPath: string }) => {
      const hasSameItem = formatNewDataSources.find(
        newItem =>
          oldItem.id === newItem.id && oldItem.mountPath === newItem.mountPath
      );
      return !hasSameItem;
    }
  );
  if (removeItems.length > 0) {
    await makeMultipleApiCalls({
      apiCallFn: unbindRemoteResourceToTask,
      apiCallFnName: 'unbindRemoteResourceToTask',
      payloads: removeItems.map((removeItem: { id: any }) => {
        return { taskId: getTaskId.value, resId: removeItem.id };
      }),
      successCallback: () => {
        void fetchData();
      },
    });
  }
  if (addItems.length > 0) {
    await makeApiCall({
      apiCallFn: bindRemoteResourcesToTask,
      payload: {
        taskId: getTaskId.value,
        mountPaths: addItems.map(addItem => {
          return { resourceId: addItem.id, path: addItem.mountPath };
        }),
      },
      successCallback: () => {
        void fetchData();
      },
    });
  }
};

const showEditRemoteOutputDialog = ref(false);
const updateRemoteOutputDir = async (
  newOutputPaths: { outputPath: string }[]
) => {
  await makeApiCall({
    apiCallFn: editRemoteTask,
    payload: {
      taskId: getTaskId.value,
      body: {
        outputMountPaths: newOutputPaths.map(output => output.outputPath),
      },
    },
    successCallback: () => {
      void fetchData();
    },
  });
};

const variableHeaders = computed(() => [
  {
    title: t('label.name'),
    value: 'name',
    width: '50%',
  },
  {
    title: t('label.value'),
    value: 'value',
    width: '50%',
  },
]);

const variables = computed(() => {
  // remove default env variables generated by system
  const vars =
    detail.value.environments?.filter(
      (item: string) => item !== 'SLURM_GET_USER_ENV=1'
    ) ?? [];
  return vars.map((env: string) => {
    return {
      name: env.split('=')[0] ?? '',
      value: env.split('=')[1] ?? '',
    };
  });
});

const showEditEnvVariablesDialog = ref(false);
const updateEnvVariables = async (
  variables: { name: string; value: string }[]
) => {
  await makeApiCall({
    apiCallFn: editRemoteTask,
    payload: {
      taskId: getTaskId.value,
      body: {
        environments: variables.map(
          variable => `${variable.name}=${variable.value}`
        ),
      },
    },
    successCallback: () => {
      void fetchData();
    },
  });
};

const showEditCommandDialog = ref(false);
const updateCommand = async (command: string) => {
  await makeApiCall({
    apiCallFn: editRemoteTask,
    payload: {
      taskId: getTaskId.value,
      body: {
        command,
      },
    },
    successCallback: () => {
      void fetchData();
    },
  });
};

const scriptHeaders = computed(() => [
  {
    title: t('s3.bucket'),
    value: 'bucket',
  },
  {
    title: t('label.subpath'),
    value: 'subpath',
  },
]);

const isNextflow = computed(() => {
  return detail.value.skeleton?.type === 'nextflow';
});

const nextflowPath = computed(() => {
  const command = detail.value.command ?? '';
  if (detail.value.skeleton?.type !== 'nextflow' || !command) {
    return [];
  }
  // example 'dss-public://{projectId}/{bucket}{subpath}'
  const indexOfPath = command.split('/', 3).join('/').length;
  const path = command.substring(indexOfPath + 1);
  const indexOfSubpath =
    path.indexOf('/') > 0 ? path.indexOf('/') : path.length;
  return [
    {
      bucket: path.substring(0, indexOfSubpath),
      subpath: path.substring(indexOfSubpath),
    },
  ];
});

const getTaskId = computed(() => {
  return (route.params.id as string) ?? '';
});

const jobHeaders = computed(() => [
  {
    title: t('label.job.startTime'),
    value: 'startedAt',
    sortable: true,
    useDateFilter: true,
  },
  {
    title: t('label.job.endTime'),
    value: 'endedAt',
    sortable: true,
    useDateFilter: true,
  },
  {
    title: t('label.serviceState'),
    value: 'status',
    isStatus: true,
  },
]);

const showCreateJobDialog = ref(false);

const jobList: Ref<Record<string, any>[]> = ref([]);
const showJobOutputPath = ref(false);
const selectedJobOutputPath: Ref<string> = ref('');

const showDownloadLog = ref(false);
const selectedJobIdForLog: Ref<string> = ref('');
const logFiles: Ref<string[]> = ref([]);
const selectedLogFile: Ref<string> = ref('');
const downloadLog = async () => {
  const logs: string = await makeApiCall({
    apiCallFn: fetchRemoteJobLogs,
    payload: {
      taskId: getTaskId.value,
      jobId: selectedJobIdForLog.value,
      logFile: selectedLogFile.value,
    },
    errorResHandlingFn: () => '',
  });
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(logs)
  );
  element.setAttribute('download', selectedLogFile.value);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(() => {
    void router.push({ name: PAGE_TYPES.HPC_REMOTE_TASK_LIST });
  });
});
onBeforeUnmount(() => cancelAutoReload());

const fetchData = async (disableProgress: boolean = false) => {
  detail.value = await makeApiCall({
    apiCallFn: fetchRemoteTaskDetail,
    payload: getTaskId.value,
    errorResHandlingFn: () => {},
    skipProgress: disableProgress,
  });
  jobList.value = await makeApiCall({
    apiCallFn: fetchRemoteJobList,
    payload: getTaskId.value,
    errorResHandlingFn: () => [],
    skipProgress: disableProgress,
  });
  // auto reload
  const hasNeededReloadItems = jobList.value.find(
    job => job.status === 'pending' || job.status === 'running'
  );
  if (
    (hasNeededReloadItems ?? detail.value.status === 'pending') ||
    detail.value.status === 'running'
  ) {
    if (!timer.value) {
      timer.value = window.setInterval(() => {
        void fetchData(true);
      }, 10000);
    }
  } else {
    if (timer.value) cancelAutoReload();
  }
  lastUpdatedTime.value = new Date();
};
const cancelAutoReload = () => {
  clearInterval(timer.value);
  timer.value = 0;
};

const getRemoteImageInfo = async () => {
  const remoteResources = await makeApiCall({
    apiCallFn: fetchRemoteResourceList,
    errorResHandlingFn: () => [],
  });
  remoteImageList.value = remoteResources.filter(
    (res: Record<string, any>) =>
      res.provider === detail.value.provider &&
      res.type === 'image' &&
      res.status === 'finished'
  );

  selectedRemoteImage.value = remoteImageList.value.find(
    image => image.id === resImage.value?.resourceId
  );
};
const updateRemoteImage = async () => {
  if (selectedRemoteImage.value?.id !== resImage.value?.resourceId) {
    uiShowProgressDlg();
    if (resImage.value?.resourceId) {
      // delete origin image
      await makeMultipleApiCalls({
        apiCallFn: unbindRemoteResourceToTask,
        apiCallFnName: 'unbindRemoteResourceToTask',
        payloads: [
          { taskId: getTaskId.value, resId: resImage.value.resourceId },
        ],
        skipProgress: true,
      });
    }
    //  post new image
    await makeApiCall({
      apiCallFn: bindRemoteResourcesToTask,
      payload: {
        taskId: getTaskId.value,
        mountPaths: [
          {
            resourceId: selectedRemoteImage.value?.id,
          },
        ],
      },
      skipProgress: true,
      successCallback: () => {
        void fetchData();
      },
      errorCallback: () => {
        uiHideProgressDlg();
      },
    });
  }
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $tc('basic.detail.type', { type: `${$t('services.hpc.deliver')}` })
        "
      />
      <TabsComponent v-model="tabIndex" :tab-names="tabs" :is-card-style="true">
        <template #tab-0>
          <v-card>
            <v-card-title class="pa-2">
              <DetailActionBtn
                v-for="item in detailButton"
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
            </v-card-title>
            <v-card-text class="ocis-detail-scroll-view">
              <DetailPanelGroup v-model="panelsTab1">
                <DetailPanel
                  :title="panelsTab1[0].title"
                  :value="panelsTab1[0].value"
                >
                  <v-row no-gutters>
                    <v-col
                      v-for="item in detailItems"
                      :key="item.text"
                      cols="6"
                      class="pb-4"
                    >
                      <DetailItem
                        :title="item.text"
                        :content="item.value"
                        :is-status="item.isStatus"
                        :is-date-string="item.isDate"
                        :status-pending-to-review="false"
                      >
                        <OutlinedBtn
                          v-if="item.button"
                          :class="{ 'ml-2': item.value }"
                          :text="item.button"
                          @click="item.callback"
                        />
                      </DetailItem>
                    </v-col>
                  </v-row>
                </DetailPanel>

                <DetailPanel
                  :title="panelsTab1[1].title"
                  :value="panelsTab1[1].value"
                >
                  <v-row no-gutters>
                    <v-col cols="2">
                      <span>
                        {{ $t('HpcRemoteTask.remoteData.source') }}
                      </span>
                    </v-col>
                    <v-col cols="10">
                      <OutlinedBtn
                        class="mb-6"
                        :text="
                          $t('action.edit.type', {
                            type: $t('HpcRemoteTask.remoteData.source'),
                          })
                        "
                        @click="showEditDataSourceDialog = true"
                      />
                      <DetailTable
                        :items="getDataSource"
                        :headers="dataSourceHeaders"
                      />
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <DetailItem
                      class="pt-6"
                      :title="$t('HpcRemoteTask.outputDirectory')"
                      fill-layout
                    >
                      <v-chip
                        v-for="(output, index) in detail.outputMountPaths"
                        :key="index"
                        class="mr-2"
                      >
                        {{ output }}
                      </v-chip>
                      <OutlinedBtn
                        class="ml-6"
                        :text="
                          $t('action.edit.type', {
                            type: $t('HpcRemoteTask.outputDirectory'),
                          })
                        "
                        @click="showEditRemoteOutputDialog = true"
                      />
                    </DetailItem>
                  </v-row>
                </DetailPanel>

                <DetailPanel
                  :title="panelsTab1[2].title"
                  :value="panelsTab1[2].value"
                >
                  <v-row no-gutters>
                    <v-col cols="2">
                      <span>
                        {{ $t('label.env.variable') }}
                      </span>
                    </v-col>
                    <v-col>
                      <OutlinedBtn
                        class="mb-6"
                        :text="
                          $t('action.edit.type', {
                            type: $t('label.env.variable'),
                          })
                        "
                        @click="showEditEnvVariablesDialog = true"
                      />
                      <DetailTable
                        :items="variables"
                        :headers="variableHeaders"
                      />
                    </v-col>
                  </v-row>
                </DetailPanel>
                <DetailPanel
                  :title="panelsTab1[3].title"
                  :value="panelsTab1[3].value"
                >
                  <v-row no-gutters>
                    <v-col cols="6">
                      <DetailItem
                        :title="$t('label.script')"
                        :content="isNextflow ? 'Nextflow' : $t('label.normal')"
                      />
                    </v-col>
                  </v-row>
                  <v-row v-if="isNextflow" no-gutters class="mt-8">
                    <v-col cols="2">
                      <span>
                        {{ 'Nextflow' }}
                      </span>
                    </v-col>
                    <v-col>
                      <DetailTable
                        :items="nextflowPath"
                        :headers="scriptHeaders"
                      />
                    </v-col>
                  </v-row>
                  <v-row v-else no-gutters class="mt-8">
                    <v-col cols="2">
                      <span>
                        {{ $t('label.cmd') }}
                      </span>
                    </v-col>
                    <v-col cols="10">
                      <TextareaComponent
                        :model-value="detail.command"
                        :placeholder="'CMD'"
                        readonly
                      />
                      <OutlinedBtn
                        class="mt-3"
                        :text="
                          $t('action.edit.type', {
                            type: $t('label.cmd'),
                          })
                        "
                        @click="showEditCommandDialog = true"
                      />
                    </v-col>
                  </v-row>
                </DetailPanel>
              </DetailPanelGroup>
            </v-card-text>
          </v-card>
        </template>
        <template #tab-1>
          <v-card>
            <v-card-title class="pa-2">
              <DetailActionBtn
                v-for="item in detailButton"
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
            </v-card-title>
            <v-card-text class="ocis-detail-scroll-view">
              <DetailPanelGroup v-model="panelsTab2">
                <DetailPanel
                  :title="$t('basic.trial.list')"
                  :value="panelsTab2[0].value"
                >
                  <DetailTable
                    :items="jobList"
                    :headers="jobHeaders"
                    :status-pending-to-review="false"
                    :actions="[
                      {
                        label: $t('table.action.stop'),
                        disabled: (item: any) =>
                          (item.status !== 'pending' &&
                            item.status !== 'running') ||
                          item.is_terminated,
                        action: (item: any) =>
                          openStopDialog({
                            item: item,
                            stopAction: () =>
                              makeApiCall({
                                apiCallFn: terminateRemoteJob,
                                payload: {
                                  taskId: getTaskId,
                                  jobId: item.id,
                                },
                                successCallback: () => {
                                  void fetchData();
                                },
                              }),
                          }),
                      },
                      {
                        label: $t('action.showOutputDir'),
                        action: (item: any) => {
                          selectedJobOutputPath = item?.outputUri ?? '';
                          showJobOutputPath = true;
                        },
                      },
                      {
                        label: $t('logMgnt.copy'),
                        action: (item: any) => generalCopy(item.id),
                      },
                      {
                        label: $t('action.downloadLog'),
                        disabled: (item: any) =>
                          item.status !== 'completed' &&
                          item.status !== 'failed',
                        action: async (item: any) => {
                          selectedJobIdForLog = item.id;
                          logFiles = await makeApiCall({
                            apiCallFn: fetchRemoteJobLogFiles,
                            payload: {
                              taskId: getTaskId,
                              jobId: selectedJobIdForLog,
                            },
                            errorResHandlingFn: () => [],
                          });
                          showDownloadLog = true;
                        },
                      },
                      {
                        label: $t('table.action.delete'),
                        disabled: (item: any) =>
                          item.status !== 'cancelled' &&
                          item.status !== 'failed' &&
                          item.status !== 'completed',
                        action: (item: any) =>
                          openDeleteDialog({
                            item: item,
                            resourceType: $t('HpcRemoteTask.job'),
                            message: $t('dialog.delete.message.type', {
                              type: $t('HpcRemoteTask.job'),
                            }),
                            deleteAction: () =>
                              makeApiCall({
                                apiCallFn: deleteRemoteJob,
                                payload: {
                                  taskId: getTaskId,
                                  jobId: item.id,
                                },
                                successCallback: () => {
                                  void fetchData();
                                },
                              }),
                          }),
                      },
                    ]"
                  />
                </DetailPanel>
              </DetailPanelGroup>
            </v-card-text>
          </v-card>
        </template>
      </TabsComponent>
    </v-row>
  </UiContainer>
  <EditDescriptionDialog
    v-model:show="showDescDialog"
    :item-name="detail.name"
    :description="detail.description"
    @update-value="updateDesc"
  />
  <EditRemoteDataSourceDialog
    v-model:show="showEditDataSourceDialog"
    :resource-list="getDataSource"
    :provider="detail.provider"
    @update-value="updateRemoteDataSource"
  />
  <EditRemoteOutputsDialog
    v-model:show="showEditRemoteOutputDialog"
    :outputs="detail.outputMountPaths"
    @update-value="updateRemoteOutputDir"
  />
  <EditEnvVariablesDialog
    v-model:show="showEditEnvVariablesDialog"
    :variables="variables"
    @update-value="updateEnvVariables"
  />
  <EditCommandDialog
    v-model:show="showEditCommandDialog"
    :command="detail.command"
    @update-value="updateCommand"
  />
  <StartRemoteTaskDialog
    v-model:show="showCreateJobDialog"
    :task-id="getTaskId"
    :star-action-callback="fetchData"
  />
  <CommonDialog
    v-model:show="showJobOutputPath"
    :title="$t('label.outputDirectory')"
    :show-cancel-btn="false"
  >
    <v-row no-gutters>
      <v-col :cols="3" class="ocis-form-title">
        {{ $t('label.outputDirectory.path') }}
      </v-col>
      <v-col :cols="8" class="ocis-form-title x-scroll">
        {{ selectedJobOutputPath }}
      </v-col>
    </v-row>
  </CommonDialog>
  <CommonDialog
    v-model:show="showDownloadLog"
    :title="$t('action.downloadLog')"
    :submit-callback="() => downloadLog()"
    :disable-submit="!selectedLogFile"
  >
    <SelectWithHint
      v-model="selectedLogFile"
      :title="$t('s3.upload.selectFile')"
      :items="logFiles"
      required
    />
  </CommonDialog>

  <CommonDialog
    v-model:show="showImageDialog"
    :title="$t('services.hpc.remote.image')"
    :submit-callback="updateRemoteImage"
    :disable-submit="!selectedRemoteImage?.id"
  >
    <SelectWithHint
      v-model="selectedRemoteImage"
      :title="$t('services.hpc.remote.image')"
      :items="remoteImageList"
      item-value="id"
      return-object
      required
    />
  </CommonDialog>
</template>
<style lang="scss" scoped>
.x-scroll {
  overflow-x: auto;
  white-space: nowrap;
}
</style>
