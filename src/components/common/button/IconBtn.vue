<script lang="ts">
import SvgMenuIcon from '@/components/common/SvgMenuIcon.vue';

export default {
  name: 'IconBtn',
};
</script>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    required: true,
  },
  isSvgIcon: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: true,
  },
});
defineEmits(['click']);
</script>

<template>
  <span>
    <v-btn
      v-show="visible"
      variant="flat"
      icon
      density="comfortable"
      class="icon-btn ma-0"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <component :is="SvgMenuIcon" v-if="isSvgIcon" :icon-name="icon" />
      <v-icon v-else>{{ icon }}</v-icon>
    </v-btn>
    <v-tooltip v-if="tooltip" location="bottom" activator="parent" offset="5">
      {{ tooltip }}
    </v-tooltip>
  </span>
</template>

<style lang="scss" scoped>
.icon-btn {
  width: 48px;
  height: 48px;
  background-color: transparent !important;

  &:hover {
    background-color: rgba(
      var(--v-theme-bg-hover),
      var(--v-bg-hover-opacity)
    ) !important;
    border-radius: 50%;
  }
  :deep(.v-ripple__container) {
    color: rgba(
      var(--v-theme-ripple-color),
      var(--v-ripple-opacity)
    ) !important;
  }
}
</style>
