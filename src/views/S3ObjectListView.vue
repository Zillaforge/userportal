<script lang="ts">
import { useProject } from '@/store';
import { computed, ref, watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';

import type {
  S3DeleteObject,
  S3DownloadParams,
} from '@/interfaces/CloudStorageInterface';

import ContentListComponent from '@/components/DataContentListComponent.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import getNoDataSetting from '@/utils/getNoDataSetting';

export default {
  name: 'S3ObjectListView',
};
</script>

<script lang="ts" setup>
const {
  headers,
  allocatedBytes,
  usedBytes,
  s3ObjectList,
  isTruncated,
  execFetchS3ObjectList,
  execCreateS3Folder,
  execDeleteS3Objects,
  execDownloadS3Object,
  execFetchS3UsageInfo,
  resetValue,
} = useCloudStorage(PAGE_TYPES.S3_OBJECT_LIST);

const projectStore = useProject();
const router = useRouter();
const bucketName: Ref<string> = ref('');

const noDataSetting = computed(() =>
  getNoDataSetting(PAGE_TYPES.S3_OBJECT_LIST)
);

const projectId = computed(() => projectStore.getCurrentProject?.id);

const fetchData = async (
  params: { bucketName: string; prefix: string; isFetchMoreAction: boolean },
  callback?: () => void
) => {
  await execFetchS3UsageInfo();
  await execFetchS3ObjectList(
    params.bucketName,
    params.prefix,
    params.isFetchMoreAction
  ).finally(callback);
};

const gotoObjectDetail = (item: any) => {
  void router.push({
    name: 'S3ObjectList',
    params: {
      bucketName: bucketName.value,
      pathMatch: item.Prefix,
    },
  });
};

const createFolderAction = (
  bucketName: string,
  path: string,
  successCallback?: () => void,
  errorCallback?: () => void
) => {
  void execCreateS3Folder(bucketName, path, successCallback, errorCallback);
};

const deleteAction = (
  bucketName: string,
  deleteObjects: S3DeleteObject[],
  successCallback?: () => void,
  errorCallback?: () => void
) => {
  void execDeleteS3Objects(
    bucketName,
    deleteObjects,
    successCallback,
    errorCallback
  );
};

const downloadAction = (
  downloadParams: S3DownloadParams,
  successCallback?: () => void
) => {
  void execDownloadS3Object(downloadParams, successCallback);
};

const getUsage = (callback?: () => void) => {
  void execFetchS3UsageInfo(true, callback);
};

const gotoListPage = async () => {
  await router.push({
    name: PAGE_TYPES.S3_BUCKET_LIST,
  });
};

watch(projectId, () => {
  resetValue();
  void gotoListPage();
});
</script>

<template>
  <ContentListComponent
    :content-list="s3ObjectList"
    :headers="headers"
    :no-data-setting="noDataSetting"
    :allocated-bytes="allocatedBytes"
    :used-bytes="usedBytes"
    :is-truncated="isTruncated"
    @fetch-data="fetchData"
    @create-folder-action="createFolderAction"
    @delete-action="deleteAction"
    @download-action="downloadAction"
    @to-detail-page="gotoObjectDetail"
    @get-usage="getUsage"
  />
</template>
