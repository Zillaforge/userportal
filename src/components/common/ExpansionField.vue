<script lang="ts" setup>
import { ref } from 'vue';
defineProps({
  title: {
    type: String,
    default: '',
  },
});

const panel = ref([0]);
</script>

<template>
  <v-expansion-panels v-model="panel">
    <v-expansion-panel class="no-shadow">
      <v-expansion-panel-title hide-actions class="mx-n6">
        <template #default="{ expanded }">
          <div>
            <v-icon :icon="expanded ? '$expand' : 'mdi-chevron-right'" />
            <span class="pl-2">{{ title }}</span>
          </div>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <slot />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<style lang="scss" scoped>
.no-shadow :deep(.v-expansion-panel__shadow) {
  box-shadow: none !important;
}

.v-expansion-panel-title {
  :deep(.v-expansion-panel-title__overlay) {
    background-color: rgb(var(--v-theme-bg-default)) !important;
  }
}

.v-expansion-panel-text {
  :deep(.v-expansion-panel-text__wrapper) {
    padding: 0 !important;
  }
}
</style>
