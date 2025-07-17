<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.edit.type', { type: $t('basic.whitelist') })"
    :submit-callback="() => $emit('update-value', dialogValue)"
    :disable-submit="refSetter?.hasErrors"
  >
    <MultipleInputSetter
      ref="refSetter"
      :title="$t('basic.whitelist')"
      :params="dialogValue"
      :input-rules="[validation.ruleValidCidr]"
      :column-infos="[
        {
          type: 'text-input',
          colsNumber: 6,
          placeholder: 'CIDR e.g. 10.0.0.0/24',
        },
      ]"
      @add-new-item="dialogValue.push({ cidr: '' })"
      @delete-item="
        (index: number) => {
          dialogValue.splice(index, 1);
        }
      "
    />
  </CommonDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';
import validation from '@/utils/validation';

defineEmits(['update-value']);

const showDialog = defineModel<boolean>('show', { required: true });
const refSetter = ref<any>(null);
const props = defineProps({
  allowedCidrs: {
    type: Object as PropType<Record<string, boolean>>,
    default: () => {},
  },
});

const dialogValue = ref({});
watch(showDialog, newVal => {
  if (newVal) {
    dialogValue.value = JSON.parse(JSON.stringify(props.allowedCidrs));
  }
});
</script>
