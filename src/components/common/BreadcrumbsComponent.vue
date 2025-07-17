<template>
  <v-row class="mx-0">
    <v-col cols="12" class="breadcrumb-component">
      <v-breadcrumbs :items="breadcrumbs" class="pa-0" divider=">">
        <template #item="{ item }">
          <span
            :class="breadcrumbsColor(item as BreadcrumbItem)"
            role="link"
            tabIndex="-1"
            @keydown.enter="handleClick(item.to)"
            @click="handleClick(item.to)"
          >
            {{ item.title }}
          </span>
        </template>
      </v-breadcrumbs>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useRouter, type RouteLocationRaw } from 'vue-router';

import type { BreadcrumbItem } from '@/utils/getBreadcrumbs';

defineProps({
  breadcrumbs: {
    type: Array<BreadcrumbItem>,
    default: () => [],
  },
});
const router = useRouter();

const breadcrumbsColor = (item: BreadcrumbItem) => {
  return item.disabled ? 'breadcrumb-disabled-text' : 'breadcrumb-normal-text';
};

const handleClick = (to: RouteLocationRaw | undefined) => {
  if (!to) {
    return;
  }

  if (typeof to === 'string') {
    return window.open(to, '_blank', 'noopener, noreferrer');
  }

  void router.push(to);
};
</script>

<style lang="scss" scoped>
.breadcrumb-component {
  padding: 8px 24px 8px 24px;
  background-color: rgb(var(--v-theme-bg-breadcrumb));
  :deep(.v-breadcrumbs-item--disabled) {
    opacity: 1;
  }
}
.breadcrumb-normal-text {
  cursor: pointer;
  color: rgba(
    var(--v-theme-breadcrumb-normal-text),
    var(--v-breadcrumb-text-opacity)
  );
}
.breadcrumb-disabled-text {
  cursor: default;
  color: rgba(
    var(--v-theme-breadcrumb-disabled-text),
    var(--v-breadcrumb-disabled-text-opacity)
  );
}
</style>
