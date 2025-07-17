<script lang="ts">
export default {
  name: 'InfoTooltip',
};
</script>

<script setup lang="ts">
defineProps({
  tooltip: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: 'right',
  },
});
</script>

<template>
  <v-tooltip :location="location">
    <template #activator="{ props }">
      <v-icon v-bind="props" size="20" class="ml-1 algin-bottom">
        mdi-information
      </v-icon>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>
</template>

<style lang="scss" scoped>
.v-icon {
  &.mdi-information {
    color: rgb(var(--v-theme-info-icon));
    &:hover {
      color: rgb(var(--v-theme-primary)) !important;
    }
  }
}
.v-tooltip {
  :deep(.v-overlay__content) {
    background-color: rgb(var(--v-theme-bg-tooltip)) !important;
    font-size: 12px !important;
    color: rgb(var(--v-theme-text-tooltip));
    max-width: 30vw !important;
  }
}

.algin-bottom {
  vertical-align: text-bottom;
}
</style>
