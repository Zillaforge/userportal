<script lang="ts" setup>
defineProps({
  iconName: {
    type: String,
    default: '',
    required: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <svg :class="selected ? 'svg-icon-selected' : 'svg-icon'">
    <use :xlink:href="`#icon-${iconName}`" />
  </svg>
</template>
<style>
.svg-icon {
  width: 24px;
  height: 24px;
  vertical-align: text-bottom;
  fill: currentColor !important;
}

.svg-icon-selected {
  width: 24px;
  height: 24px;
  vertical-align: text-bottom;
  fill: rgb(var(--v-theme-menu-item-selected-color)) !important;
}
</style>
