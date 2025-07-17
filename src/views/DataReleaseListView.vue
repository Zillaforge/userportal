<script lang="ts">
import { useProject, useStorage } from '@/store';
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import ListPageComponent from '@/components/DataListPageComponent.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import getNoDataSetting from '@/utils/getNoDataSetting';

export default {
  name: 'DataReleaseListView',
};
</script>

<script lang="ts" setup>
const projectStore = useProject();
const router = useRouter();
const {
  s3BucketList,
  headers,
  usedBytes,
  allocatedBytes,
  execCreateS3Bucket,
  execDeleteS3Bucket,
  execFetchS3BucketList,
  execFetchS3UsageInfo,
  resetValue,
} = useCloudStorage(PAGE_TYPES.DATA_RELEASE_LIST);

const { getS3Endpoint } = useStorage();

const projectId = computed(() => projectStore.getCurrentProject?.id);

const linkUrl = computed(() => {
  return Document.DATA_RELEASE;
});

const noDataSetting = computed(() =>
  getNoDataSetting(PAGE_TYPES.DATA_RELEASE_LIST)
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

const gotoContentList = async (item: any) => {
  return await router.push({
    name: PAGE_TYPES.DATA_RELEASE_CONTENT_LIST,
    params: {
      bucketName: item.Name,
      pathMatch: item.Prefix || '',
    },
  });
};

watch(projectId, () => {
  resetValue();
});
</script>

<template>
  <ListPageComponent
    :data-list="s3BucketList"
    :headers="headers"
    :title="$t('basic.management.type', { type: $t('services.dataRelease') })"
    :link-url="linkUrl"
    :no-data-setting="noDataSetting"
    :allocated-bytes="allocatedBytes"
    :used-bytes="usedBytes"
    :endpoint="getS3Endpoint"
    :endpoint-tooltip="$t('s3.endpoint.tooltip')"
    @fetch-data="fetchData"
    @create-action="createAction"
    @delete-action="deleteAction"
    @get-usage="getUsage"
    @to-detail-page="gotoContentList"
  />
</template>
