<script lang="ts">
import { ref, watch, type PropType } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import { type LoadBalancerTimeout } from '@/interfaces/VmInterface';
export default {
  name: 'VmLoadBalancerTimeoutDialog',
};
</script>

<script setup lang="ts">
const showDialog = defineModel<boolean>('show', { required: true });
const emit = defineEmits(['submit']);
const props = defineProps({
  timeout: {
    type: Object as PropType<LoadBalancerTimeout>,
    default: () => ({
      timeoutClientData: '',
      timeoutMemberConnect: '',
      timeoutMemberData: '',
      timeoutTcpInspect: '',
    }),
  },
});
const tempTimeout = ref({
  timeoutClientData: '',
  timeoutMemberConnect: '',
  timeoutMemberData: '',
  timeoutTcpInspect: '',
});
watch(showDialog, val => {
  if (val) {
    tempTimeout.value = { ...props.timeout };
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('basic.setting') + $t('basic.timeout')"
    :submit-callback="() => emit('submit', { timeout: tempTimeout })"
  >
    <TextFieldWithHint
      v-model="tempTimeout.timeoutClientData"
      :title="$t('vm.lb.client.inactive.timeout')"
      type="number"
      :title-field-col="4"
      :text-field-col="7"
      required
    />
    <TextFieldWithHint
      v-model="tempTimeout.timeoutMemberConnect"
      :title="$t('vm.lb.server.timeout')"
      type="number"
      :title-field-col="4"
      :text-field-col="7"
      required
    />
    <TextFieldWithHint
      v-model="tempTimeout.timeoutMemberData"
      :title="$t('vm.lb.server.inactive.timeout')"
      type="number"
      :title-field-col="4"
      :text-field-col="7"
      required
    />
    <TextFieldWithHint
      v-model="tempTimeout.timeoutTcpInspect"
      :title="$t('vm.lb.tcp.timeout')"
      type="number"
      :title-field-col="4"
      :text-field-col="7"
      required
    />
  </CommonDialog>
</template>
