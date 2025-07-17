<script lang="ts">
import { ref, watch, type Ref } from 'vue';

import { makeApiCall, fetchVmList, volumeActions } from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
export default {
  name: 'VmVolumeAttachDialog',
};
</script>

<script setup lang="ts">
const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  volume: {
    type: Object,
    default: () => ({}),
  },
  submitCallback: {
    type: Function,
    default: () => {},
  },
});
const selectedVm: Record<string, any> = ref({});
const vmList: Ref<Record<string, any>[]> = ref([]);

const fetchData = () => {
  makeApiCall({
    apiCallFn: fetchVmList,
    successCallback: res => {
      vmList.value = res.filter(
        (vm: any) => vm.status?.toLowerCase() === 'active'
      );
      selectedVm.value = vmList.value[0];
    },
  });
};

const submitAction = async () => {
  await makeApiCall({
    apiCallFn: volumeActions,
    payload: {
      volumeId: props.volume.id,
      action: {
        action: 'attach',
        server_id: selectedVm.value.id,
      },
    },
    successCallback: () => {
      props.submitCallback?.();
      showDialog.value = false;
    },
  });
};

watch(showDialog, val => {
  if (val) {
    fetchData();
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('vm.volume.attach')"
    :submit-callback="submitAction"
  >
    <SelectWithHint
      v-model="selectedVm"
      :title="$t('vm.instance')"
      :items="vmList"
      :item-text="'name'"
      return-object
    />
  </CommonDialog>
</template>
