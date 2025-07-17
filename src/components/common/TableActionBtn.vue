<template>
  <span class="ocis-action-button-style">
    <IconBtn
      :visible="btn.visible"
      :disabled="btn.disabled"
      :icon="btn.icon"
      :tooltip="btn.tips"
      @click="btn.action"
    />
  </span>
</template>

<script lang="ts">
import type { PropType } from 'vue';

import type { TableActionBtn } from '@/interfaces/InfraDataTableInterface';

import IconBtn from '@/components/common/button/IconBtn.vue';

export default {
  name: 'TableActionBtn',
};
</script>

<script setup lang="ts">
defineProps({
  btn: {
    type: Object as PropType<TableActionBtn>,
    required: true,
  },
});
</script>
