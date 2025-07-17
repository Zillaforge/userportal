<script setup lang="ts">
import { ref, watch } from 'vue';

import cloneDeep from 'lodash/cloneDeep';

import CommonDialog from '@/components/common/CommonDialog.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';

defineEmits(['update-value']);

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  variables: {
    type: Array<Record<string, any>>,
    required: true,
  },
});
const variableSettings = ref<Record<string, any>[]>([]);

const addVariable = () => {
  variableSettings.value.push({ name: '', value: '' });
};
const removeVariable = (index: number) => {
  variableSettings.value.splice(index, 1);
};

watch(showDialog, newVal => {
  if (newVal) {
    variableSettings.value = cloneDeep(props.variables);
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.edit.type', { type: $t('label.env.variable') })"
    :submit-callback="() => $emit('update-value', variableSettings)"
  >
    <MultipleInputSetter
      :title="$t('label.env.variable')"
      :params="variableSettings"
      :column-infos="[
        {
          header: $t('label.name'),
          type: 'text-input',
          colsNumber: 4,
        },
        {
          header: $t('label.value'),
          type: 'text-input',
          colsNumber: 4,
        },
      ]"
      @add-new-item="addVariable"
      @delete-item="removeVariable"
    />
  </CommonDialog>
</template>
