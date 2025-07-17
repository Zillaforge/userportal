<script lang="ts">
export default {
  name: 'TextBtn',
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
    class="text-btn no-border"
    variant="flat"
    @click="$emit('click')"
  >
    <slot />
    <v-icon v-if="icon">{{ icon }}</v-icon>
    {{ text }}
  </v-btn>
</template>

<style lang="scss" scoped>
.text-btn {
  border: 1px solid;
  border-color: rgb(var(--v-theme-btn-texted-border)) !important;
  color: rgb(var(--v-theme-btn-texted)) !important;
  border-radius: 8px;
  height: 36px !important;
  background-color: transparent !important;

  &:hover,
  &:active {
    color: rgb(var(--v-theme-btn-texted-active)) !important;
    background-color: rgba(
      var(--v-theme-bg-btn-texted-active),
      var(--v-bg-btn-texted-active-opacity)
    ) !important;
  }
  &:disabled {
    color: rgb(var(--v-theme-btn-texted-disabled)) !important;
    border: 1px solid
      rgba(
        var(--v-theme-btn-texted-disabled-border),
        var(--v-btn-texted-disabled-border-opacity)
      );
    opacity: var(--v-btn-texted-disabled-opacity);
  }

  &.no-border {
    border: 0px !important;
  }
  :deep(.v-ripple__container) {
    color: rgb(var(--v-theme-ripple-color)) !important;
  }
}
</style>
