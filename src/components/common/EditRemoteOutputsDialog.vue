<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';

defineEmits(['update-value']);

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  outputs: {
    type: Array<string>,
    required: true,
  },
});
const newOutputs = ref<Record<string, any>[]>([]);

const addVariable = () => {
  newOutputs.value.push({ outputPath: '' });
};
const removeVariable = (index: number) => {
  newOutputs.value.splice(index, 1);
};

watch(showDialog, newVal => {
  if (newVal) {
    newOutputs.value = props.outputs.map(output => {
      return { outputPath: output };
    });
  }
});

const disableSubmit = computed(() => {
  return !!newOutputs.value.find(output => !output.outputPath);
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="
      $t('action.edit.type', { type: $t('HpcRemoteTask.outputDirectory') })
    "
    :disable-submit="disableSubmit"
    :submit-callback="() => $emit('update-value', newOutputs)"
  >
    <MultipleInputSetter
      :title="$t('HpcRemoteTask.outputDirectory')"
      required
      :params="newOutputs"
      :column-infos="[
        {
          type: 'text-input',
          colsNumber: 4,
        },
      ]"
      @add-new-item="addVariable"
      @delete-item="removeVariable"
    />
  </CommonDialog>
</template>
