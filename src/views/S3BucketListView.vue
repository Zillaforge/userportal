<script lang="ts">
import { useProject, useStorage } from '@/store';
import { computed, watch } from 'vue';

import ListPageComponent from '@/components/DataListPageComponent.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import getNoDataSetting from '@/utils/getNoDataSetting';

export default {
  name: 'S3BucketListView',
};
</script>

<script lang="ts" setup>
const projectStore = useProject();
const {
  s3BucketList,
  headers,
  usedBytes,
  allocatedBytes,
  toBucketObjectListPage,
  execCreateS3Bucket,
  execDeleteS3Bucket,
  execFetchS3BucketList,
  execFetchS3UsageInfo,
  resetValue,
} = useCloudStorage(PAGE_TYPES.S3_BUCKET_LIST);

const { getS3Endpoint } = useStorage();

const projectId = computed(() => projectStore.getCurrentProject?.id);

const linkUrl = computed(() => {
  return Document.S3;
});

const noDataSetting = computed(() =>
  getNoDataSetting(PAGE_TYPES.S3_BUCKET_LIST)
);

const fetchData = async (callback?: () => void) => {
  await execFetchS3UsageInfo();
  await execFetchS3BucketList().then(callback);
};

const createAction = (bucketName: string, callback?: () => void) => {
  void execCreateS3Bucket(
    bucketName,
    async () => await fetchData(callback),
    callback
  );
};

const deleteAction = (bucketName: string, callback?: () => void) => {
  void execDeleteS3Bucket(
    bucketName,
    async () => await fetchData(callback),
    callback
  );
};

const getUsage = (callback?: () => void) => {
  void execFetchS3UsageInfo(true, callback);
};

watch(projectId, () => {
  resetValue();
});
</script>

<template>
  <ListPageComponent
    :data-list="s3BucketList"
    :headers="headers"
    :title="$t('basic.management.type', { type: $t('services.cloudStorage') })"
    :link-url="linkUrl"
    :no-data-setting="noDataSetting"
    :allocated-bytes="allocatedBytes"
    :used-bytes="usedBytes"
    :endpoint="getS3Endpoint"
    @fetch-data="fetchData"
    @create-action="createAction"
    @delete-action="deleteAction"
    @get-usage="getUsage"
    @to-detail-page="toBucketObjectListPage"
  />
</template>
