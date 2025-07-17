<template>
  <v-btn
    variant="flat"
    :disabled="btn.disabled"
    class="main-action-btn"
    @click="btn.action()"
  >
    <v-icon color="white">{{ btn.icon }}</v-icon>
    <span>
      {{ btn.label }}
    </span>
  </v-btn>
</template>

<script lang="ts">
import type { PropType } from 'vue';

import type { MainAction } from '@/interfaces/InfraDataTableInterface';

export default {
  name: 'TableMainActionBtn',
};
</script>

<script setup lang="ts">
defineProps({
  btn: {
    type: Object as PropType<MainAction>,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.main-action-btn {
  color: #ffffff !important;
  background-image: linear-gradient(#2a97ff, #2e71eb) !important;
  border-radius: 12px;
  height: 36px;
  :deep(.v-ripple__container) {
    color: #ffffff !important;
    opacity: 0.25 !important;
  }
  &:hover {
    background-image: linear-gradient(#60d5ff, #2a97ff) !important;
  }
  &.v-btn--disabled {
    background-image: linear-gradient(#00000014, #00000029) !important;
  }
}
</style>
