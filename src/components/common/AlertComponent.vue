<script lang="ts">
import { type PropType } from 'vue';

export default {
  name: 'AlertComponent',
};
</script>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String as PropType<'error' | 'success' | 'warning' | 'info'>,
    default: 'error',
  },
});
</script>

<template>
  <v-alert :type="type" density="compact" variant="tonal">
    {{ message }}
  </v-alert>
</template>

<style lang="scss" scoped>
.v-alert {
  border-radius: 8px !important;
  padding: 14px 18px !important;
  min-height: 48px !important;
  &.text-error {
    background-color: rgba(
      var(--v-theme-alert-color),
      var(--v-bg-general-opacity)
    );
  }
  &.text-success {
    background-color: rgba(var(--v-theme-success), var(--v-bg-general-opacity));
  }
  &.text-warning {
    background-color: rgba(var(--v-theme-warning), var(--v-bg-general-opacity));
  }
  &.text-info {
    background-color: rgba(var(--v-theme-info), var(--v-bg-general-opacity));
  }
  &.v-alert--variant-tonal {
    :deep(.v-alert__underlay) {
      opacity: 0 !important;
    }
  }
  :deep(.v-icon) {
    font-size: 20px !important;
    width: 20px !important;
    height: 20px !important;
  }
}
</style>
