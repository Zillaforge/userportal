<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';

defineProps({
  floatingIpList: {
    type: Array<any>,
    default: () => [],
  },
});
const showDialog = defineModel<boolean>('show', { required: true });
const emits = defineEmits(['submit']);

const isAutoConfigure = ref(true);
const selectedFloatingIp = ref('');

const disableSumbit = computed(() =>
  isAutoConfigure.value ? false : !selectedFloatingIp.value
);

const submitAction = () => {
  emits('submit', {
    auto: isAutoConfigure.value,
    selectedFloatingIp: selectedFloatingIp.value,
  });
};

watch(showDialog, value => {
  if (value) {
    isAutoConfigure.value = true;
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('vm.network.ip.add')"
    :disable-submit="disableSumbit"
    :submit-callback="submitAction"
  >
    <RadioButtonSwitch
      :title="$t('vm.network.ip.add')"
      :options="[
        { label: $t('vm.network.ip.auto'), value: true },
        { label: $t('vm.network.ip.prebuilt'), value: false },
      ]"
      :init-value="isAutoConfigure"
      is-required
      @selected="value => (isAutoConfigure = value)"
    />
    <SelectWithHint
      v-if="isAutoConfigure === false"
      v-model="selectedFloatingIp"
      :title="$t('vm.network.floating.ip')"
      :items="floatingIpList"
      hide-details
      required
      return-object
    />
  </CommonDialog>
</template>
