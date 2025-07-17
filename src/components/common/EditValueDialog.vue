<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';

type INPUT_TYPE = 'text' | 'number';

defineEmits(['update-value']);

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  value: {
    type: String,
    default: '',
  },
  inputType: {
    type: String as PropType<INPUT_TYPE>,
    default: 'text',
  },
  useSelect: {
    type: Boolean,
    default: false,
  },
  selectItems: {
    type: Array<any>,
    default: () => [],
  },
  minVal: {
    type: Number,
    default: 0,
  },
  maxVal: {
    type: Number,
    default: 100,
  },
});

const dialogValue = ref('');
watch(showDialog, newVal => {
  if (newVal) {
    dialogValue.value = props.value;
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.edit.type', { type: label })"
    :submit-callback="() => $emit('update-value', dialogValue)"
  >
    <v-row no-gutters>
      <TextFieldWithHint
        v-if="!useSelect"
        v-model="dialogValue"
        :title="label"
        :type="inputType"
        :placeholder="label"
        :min-val="minVal"
        :max-val="maxVal"
      />
      <SelectWithHint
        v-else
        v-model="dialogValue"
        :title="label"
        :placeholder="label"
        :items="selectItems"
      />
    </v-row>
  </CommonDialog>
</template>
