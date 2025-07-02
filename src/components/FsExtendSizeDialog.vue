<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import { VM_VOLUME_MAX_SIZE } from '@/constants/VmConstants';

const minVal = 1;

const showDialog = defineModel<boolean>('show', { required: true });
const props = defineProps({
  fsName: {
    type: String,
    default: '',
  },
  originalSize: {
    type: Number,
    default: -1,
  },
});

defineEmits(['submit']);

const newSize = ref('0');

const maxVal = computed(() => VM_VOLUME_MAX_SIZE - props.originalSize);

watch(showDialog, val => {
  if (val) {
    newSize.value = '';
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('vm.volume.extend')"
    :submit-callback="() => $emit('submit', newSize)"
    :cancel-callback="() => (showDialog = false)"
    :disable-submit="
      !newSize || Number(newSize) < minVal || Number(newSize) > maxVal
    "
    disable-auto-close-dialog
  >
    <TextFieldWithHint
      :model-value="fsName"
      :title="$t('basic.name')"
      plain-text
    />
    <TextFieldWithHint
      :model-value="originalSize"
      :title="$t('vm.volume.size')"
      plain-text
    />
    <TextFieldWithHint
      v-model="newSize"
      type="number"
      :title="`${$t('vm.volume.extend')} (GiB)`"
      :min-val="minVal"
      :max-val="maxVal"
      required
    />
    <TextFieldWithHint
      :model-value="originalSize + Number(newSize)"
      :title="$t('vm.volume.expected.size')"
      plain-text
    />
  </CommonDialog>
</template>
