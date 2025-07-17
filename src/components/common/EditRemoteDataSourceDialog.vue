<script setup lang="ts">
import { ref, computed, watch, type Ref } from 'vue';

import { makeApiCall, fetchRemoteResourceList } from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';

defineEmits(['update-value']);

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  resourceList: {
    type: Array<Record<string, any>>,
    required: true,
  },
  provider: {
    type: String,
    default: 'slurm',
  },
});
const newDatasets = ref<
  { remoteDataset: Record<string, any> | undefined; path: string }[]
>([{ remoteDataset: undefined, path: '' }]);

const addDataset = () => {
  newDatasets.value.push({ remoteDataset: undefined, path: '' });
};
const removeDataset = (index: number) => {
  newDatasets.value.splice(index, 1);
};

const remoteDatasetList: Ref<Record<string, any>[]> = ref([]);
watch(showDialog, async newVal => {
  if (newVal) {
    const remoteResources = await makeApiCall({
      apiCallFn: fetchRemoteResourceList,
      errorResHandlingFn: () => [],
    });
    remoteDatasetList.value = remoteResources
      .filter(
        (res: { provider: string; type: string; status: string }) =>
          res.provider === props.provider &&
          res.type === 'dataset' &&
          res.status === 'finished'
      )
      .map((dataset: { name: string; id: string }) => {
        return {
          name: dataset.name,
          value: dataset.id,
        };
      });
    newDatasets.value = props.resourceList.map(res => {
      return {
        remoteDataset: { name: res.remoteBucket, value: res.id },
        path: res.mountPath,
      };
    });
  }
});

const disableSubmit = computed(() => {
  return !!newDatasets.value.find(dataset => !dataset.remoteDataset);
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="
      $t('action.edit.type', { type: $t('HpcRemoteTask.remoteData.source') })
    "
    :disable-submit="disableSubmit"
    :submit-callback="() => $emit('update-value', newDatasets)"
  >
    <MultipleInputSetter
      required
      :title="$t('HpcRemoteTask.remoteData.source')"
      :params="newDatasets"
      :column-infos="[
        {
          header: $t('HpcRemoteTask.remoteData.bucket'),
          type: 'select',
          returnObject: true,
          selectItems: remoteDatasetList,
          colsNumber: 4,
        },
        {
          header: $t('content.mountPath'),
          type: 'text-input',
          colsNumber: 4,
          required: false,
        },
      ]"
      @add-new-item="addDataset"
      @delete-item="removeDataset"
    />
  </CommonDialog>
</template>
