<template>
  <span v-if="link && link.linkTo">
    <br v-if="link.isBreakLine" />
    <span v-if="!link.isBreakLine && margin" class="mr-4" />
    <a
      class="ocis-external-link font-weight-regular"
      :href="getLink(link)"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ link.text }}
      <v-icon size="24" class="mb-2">mdi-open-in-new</v-icon>
    </a>
  </span>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import type { ExternalLinkItem } from '@/interfaces/LayoutItemInterface';

defineProps({
  link: {
    type: Object as PropType<ExternalLinkItem>,
    required: true,
  },
  margin: {
    type: Boolean,
    default: true,
  },
});

const getLink = (link: ExternalLinkItem) => {
  return link.linkTo;
};
</script>
