<script setup lang="ts">
import { ref, watch } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';

const showDialog = defineModel<boolean>('show', { required: true });
const emit = defineEmits(['submit']);

const props = defineProps({
  asgId: {
    type: String,
    default: '',
  },
  asList: {
    type: Array<any>,
    default: () => [],
  },
});

const selectedAutoScaling = ref<Record<string, any>>({});

watch(showDialog, () => {
  selectedAutoScaling.value = props.asList[0];
});

const submit = () => {
  emit('submit', { ...selectedAutoScaling.value, fromAutoScaling: true });
};
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    width="850"
    :title="$t('vm.lb.target.pool.members.setting')"
    :disable-submit="!selectedAutoScaling"
    :submit-callback="submit"
  >
    <SelectWithHint
      v-model="selectedAutoScaling"
      :title="$t('vm.lb.target.pool.members')"
      item-text="name"
      :items="asList"
      return-object
      required
      :selection-cols="6"
    />
  </CommonDialog>
</template>
