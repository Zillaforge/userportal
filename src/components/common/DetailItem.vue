<template>
  <v-row no-gutters>
    <v-col
      sm="3"
      md="4"
      class="card-content-key"
      :class="{ 'full-layout-header': fillLayout }"
    >
      {{ title }}
    </v-col>
    <v-col
      sm="9"
      md="8"
      class="card-content-value"
      :class="{ 'full-layout-value': fillLayout }"
    >
      <Light
        v-if="isStatus"
        :status="`${content}`"
        :label="`${content}`"
        :hint="statusHint"
        :pending-to-review="statusPendingToReview"
      />
      <span v-else-if="isDateString">{{ formatDateSec(`${content}`) }}</span>
      <span v-else-if="linkTo && content">
        <router-link :to="linkTo">{{ content }}</router-link>
      </span>
      <span v-else-if="Array.isArray(content)">{{ content.join(', ') }}</span>
      <span v-else-if="content || content === 0">{{ content }}</span>
      <slot />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import Light from '@/components/LightComponent.vue';
import { formatDateSec } from '@/utils/utils';
defineProps({
  title: {
    type: String,
    default: '',
  },
  content: {
    type: [String, Number, Array<any>],
    default: '',
  },
  isStatus: {
    type: Boolean,
    required: false,
  },
  isDateString: {
    type: Boolean,
    default: false,
  },
  linkTo: {
    type: Object,
    default: () => {},
  },
  statusHint: {
    type: String,
    default: '',
  },
  fillLayout: {
    type: Boolean,
    default: false,
  },
  statusPendingToReview: {
    type: Boolean,
    default: true,
  },
});
</script>

<style lang="scss" scoped>
.card-content-key {
  color: rgba(var(--v-theme-text-general), var(--v-text-general-opacity));
  align-content: center;
}
.card-content-value {
  color: rgba(var(--v-theme-text-content), var(--v-text-content-opacity));
  word-break: break-all;
}

.full-layout-header {
  width: calc(1 / 6) * 100%;
  max-width: calc(1 / 6) * 100%;
  flex-basis: calc(1 / 6) * 100%;
  @media (max-width: 960px) {
    width: calc(1 / 8) * 100%;
    max-width: calc(1 / 8) * 100%;
    flex-basis: calc(1 / 8) * 100%;
  }
}

.full-layout-value {
  width: calc(5 / 6) * 100%;
  max-width: calc(5 / 6) * 100%;
  flex-basis: calc(5 / 6) * 100%;
  @media (max-width: 960px) {
    width: calc(7 / 8) * 100%;
    max-width: calc(7 / 8) * 100%;
    flex-basis: calc(7 / 8) * 100%;
  }
}
</style>
