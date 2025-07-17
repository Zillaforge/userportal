<script lang="ts">
export default {
  name: 'ContainedBtn',
};
</script>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['click']);
</script>

<template>
  <v-btn
    :disabled="disabled"
    class="contained-btn ma-0"
    @click="$emit('click')"
  >
    <slot />
    <v-icon v-if="icon">{{ icon }}</v-icon>
    {{ text }}
  </v-btn>
</template>

<style lang="scss" scoped>
.contained-btn {
  color: rgb(var(--v-theme-btn-contained-text)) !important;
  background-color: rgb(var(--v-theme-primary)) !important;
  border-radius: 8px;
  height: 36px;

  &:disabled {
    border: 0px !important;
    color: rgba(
      var(--v-theme-btn-contained-disabled-text),
      var(--v-btn-contained-disabled-text-opacity)
    ) !important;
    background-color: rgba(
      var(--v-theme-bg-btn-contained-disabled),
      var(--v-bg-btn-contained-disabled-opacity)
    ) !important;
    opacity: 1 !important;
  }
  &:hover,
  &:active {
    background-color: rgb(var(--v-theme-bg-btn-contained-active)) !important;
  }
  :deep(.v-ripple__container) {
    color: rgb(var(--v-theme-ripple-color)) !important;
  }
}
</style>
