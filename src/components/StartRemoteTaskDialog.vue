<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import RadioButtonSwitch from './RadioButtonSwitch.vue';
import MultipleInputSetter from './common/MultipleInputSetter.vue';

import { makeApiCall, createRemoteJob } from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { getDataStorageSchema } from '@/utils/utils';

const props = defineProps({
  taskId: {
    type: String,
    default: '',
    required: true,
  },
  starActionCallback: {
    type: Function,
    default: undefined,
  },
});

const { s3BucketList, execFetchS3BucketList } = useCloudStorage(
  PAGE_TYPES.HPC_REMOTE_TASK_LIST
);
const bucketList = computed(() => {
  return s3BucketList.value.map(bucket => {
    return { name: bucket.Name, value: bucket.Name };
  });
});
const enableOutput = ref(false);
const outputPath = ref<{ bucket: string; subpath: string }[]>([
  { bucket: '', subpath: '' },
]);

const showDialog = defineModel<boolean>('show', { required: true });

const disableCreate = computed(
  () => enableOutput.value && !outputPath.value[0].bucket
);

watch(showDialog, async newVal => {
  if (newVal) {
    enableOutput.value = false;
    await execFetchS3BucketList();
    outputPath.value = [{ bucket: '', subpath: '' }];
  }
});

const getPayload = computed(() => {
  const payload: any = {
    taskId: props.taskId,
    body: { scheme: getDataStorageSchema() },
  };
  if (outputPath.value[0]?.bucket) {
    payload.body.outputUri = `${outputPath.value[0].bucket}${outputPath.value[0].subpath}`;
  }
  return payload;
});

const submit = async () => {
  await makeApiCall({
    apiCallFn: createRemoteJob,
    payload: getPayload.value,
  });
  props.starActionCallback?.();
};
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('HpcRemoteTask.dialog.start.title')"
    :disable-submit="disableCreate"
    :submit-callback="submit"
  >
    <RadioButtonSwitch
      class="mb-6"
      :col-title-width="5"
      :title="$t('HpcRemoteTask.dialog.start.message')"
      :init-value="enableOutput"
      :options="[
        { label: $t('label.no'), value: false },
        { label: $t('label.yes'), value: true },
      ]"
      @selected="(event: boolean) => (enableOutput = event)"
    />
    <MultipleInputSetter
      v-if="enableOutput"
      required
      :title="
        $t('label.service.type', {
          type: $t('services.cloudStorage'),
        }).toLowerCase()
      "
      :params="outputPath"
      :column-infos="[
        {
          header: $t('s3.bucket'),
          type: 'select',
          selectItems: bucketList,
          headerExternalLink: {
            linkTo: '/user/cloudStorage/bucket/list',
            text: $t('basic.create.type', {
              type: $t('services.cloudStorage'),
            }),
            unique: false,
          },
          colsNumber: 4,
        },
        {
          header: $t('label.subpath'),
          type: 'text-input',
          colsNumber: 4,
          required: false,
        },
      ]"
      disable-add-item
      disable-delete-item
    />
  </CommonDialog>
</template>
