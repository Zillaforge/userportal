<script setup lang="ts">
import type { PropType } from 'vue';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';

defineEmits(['update-value']);

const route = useRoute();
const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  poolList: {
    type: Array<Record<string, boolean>>,
    default: () => [],
  },
  selectedPool: {
    type: Object as PropType<Record<string, boolean>>,
    default: undefined,
  },
});

const dialogValue = ref<Record<string, any> | undefined>(undefined);
watch(showDialog, newVal => {
  if (newVal) {
    dialogValue.value = props.selectedPool
      ? JSON.parse(JSON.stringify(props.selectedPool))
      : undefined;
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('vm.lb.target.pool.setting')"
    :submit-callback="() => $emit('update-value', dialogValue)"
    :disable-submit="!dialogValue"
  >
    <div class="mb-2">
      <span>{{ $t('vm.lb.target.pool.message1') }}</span>
      <router-link
        class="px-1"
        :to="{
          name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
          params: { id: route.params.loadBalancerId },
          query: { tab: 'pool' },
        }"
      >
        {{ $t('vm.lb.target.pool') }}
      </router-link>
      <span>{{ $t('vm.lb.target.pool.message2') }}</span>
    </div>
    <SelectWithHint
      v-model="dialogValue"
      :title="$t('basic.target')"
      item-text="name"
      :items="poolList"
      return-object
      :selection-cols="6"
    />
    <TextFieldWithHint
      :model-value="dialogValue?.protocol"
      :title="$t('vm.lb.target.pool.protocol')"
      :selection-cols="6"
      plain-text
    />
    <TextFieldWithHint
      :model-value="dialogValue?.member_port"
      :title="$t('basic.port', { type: $t('vm.lb.target.pool') })"
      :selection-cols="6"
      plain-text
    />
  </CommonDialog>
</template>
