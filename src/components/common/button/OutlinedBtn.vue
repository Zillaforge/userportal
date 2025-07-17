<script lang="ts">
export default {
  name: 'OutlinedBtn',
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
    v-bind="$attrs"
    :disabled="disabled"
    variant="flat"
    class="outlined-btn"
    @click="$emit('click', $event)"
  >
    <slot />
    <v-icon v-if="icon">{{ icon }}</v-icon>
    {{ text }}
  </v-btn>
</template>

<style lang="scss" scoped>
.outlined-btn {
  color: rgb(var(--v-theme-text-highlight)) !important;
  border: 1px solid rgb(var(--v-theme-primary)) !important;
  border-radius: 8px;
  background-color: transparent !important;

  :deep(.v-ripple__container) {
    color: rgb(var(--v-theme-ripple-color));
  }
  &:disabled {
    color: rgb(
      var(--v-theme-text-disabled),
      var(--v-text-disabled-opacity)
    ) !important;
    border: 1px solid
      rgba(
        var(--v-theme-btn-texted-disabled-border),
        var(--v-btn-texted-disabled-border-opacity)
      ) !important;
    border-radius: 8px;
  }
  &:hover,
  &:active {
    color: rgb(var(--v-theme-btn-texted-active)) !important;
    background-color: rgba(
      var(--v-theme-bg-btn-texted-active),
      var(--v-bg-btn-texted-active-opacity)
    ) !important;
  }
  &.no-border {
    border: 0px !important;
    &:disabled {
      border: 0px !important;
    }
    &:hover,
    &:active {
      color: rgb(var(--v-theme-text-highlight)) !important;
    }
  }
}
</style>
