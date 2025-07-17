<template>
  <v-row no-gutters>
    <v-icon size="18" :color="statusIconColor()" class="mr-1">
      {{ statusIcon() }}
    </v-icon>
    <v-tooltip v-if="hint && label" location="bottom">
      <template #activator="{ props }">
        <span v-bind="props">
          {{ lowerCase(label) }}
        </span>
      </template>
      <span>{{ hint }}</span>
    </v-tooltip>
    <div v-else-if="label" class="pl-1">{{ lowerCase(label) }}</div>
  </v-row>
</template>

<script setup lang="ts">
import i18n from '@/i18n';

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  pendingToReview: {
    type: Boolean,
    default: true,
  },
});
const { t } = i18n.global;
const getI18nString = (strId: string) => {
  return t(strId);
};

const lowerCase = (strStatus: string) => {
  if (strStatus === 'used') {
    return 'in-use';
  }
  if (props.pendingToReview && strStatus.toLowerCase() === 'pending') {
    return 'under review';
  }
  return strStatus.toLowerCase();
};

const statusIcon = () => {
  const status = props.status ? props.status.toLowerCase() : '';
  switch (status) {
    case 'processing':
    case 'releasing':
    case 'initializing':
    case 'building':
    case 'creating':
    case 'updating':
    case 'running':
    case 'migrating':
      return 'mdi-autorenew';
    case 'created':
    case 'completed':
    case 'finished':
    case 'success':
    case 'succeeded':
    case 'active':
    case 'ready':
    case 'released':
    case 'normal':
    case 'inuse':
    case 'in-use':
    case 'available':
    case 'down':
    case getI18nString('basic.enabled').toLowerCase():
    case getI18nString('basic.state.active').toLowerCase():
      return 'mdi-check-circle';
    case 'error':
    case 'extending_error':
      return 'mdi-alert-circle';
    case 'deleted':
    case 'deleting':
      return 'mdi-delete';
    case 'failed':
    case 'rejected':
    case 'not-ready':
    case getI18nString('basic.state.frozen').toLowerCase():
      return 'mdi-close-circle';
    case 'locked':
      return 'mdi-lock-outline';
    case 'under review':
    case 'pending':
      return 'mdi-account-search';

    case getI18nString('basic.disabled').toLowerCase():
    case 'connect':
      return 'mdi-link';
    case 'disconnect':
      return 'mdi-link-off';
    case 'review':
      return 'mdi-account-search';
    case 'reserved':
      return 'mdi-check-decagram';
    case 'unreserved':
      return '';
    default:
      return 'mdi-minus-circle';
  }
};
const statusIconColor = () => {
  const status = props.status ? props.status.toLowerCase() : '';
  switch (status) {
    case 'processing':
    case 'releasing':
    case 'deleting':
    case 'creating':
    case 'updating':
    case 'initializing':
    case 'building':
      return 'icon_initialize_color';

    case 'active':
    case 'created':
    case 'completed':
    case 'finished':
    case 'success':
    case 'succeeded':
    case 'ready':
    case 'released':
    case 'normal':
    case 'inuse':
    case 'in-use':
    case 'used':
    case 'locked':
    case 'connect':
    case 'reserved':
    case 'up':
    case getI18nString('basic.enabled').toLowerCase():
    case getI18nString('basic.state.active').toLowerCase():
      return 'icon_check_circle_color';

    case 'error':
    case 'failed':
    case 'not-ready':
    case getI18nString('basic.disabled').toLowerCase():
    case getI18nString('basic.state.frozen').toLowerCase():
    case 'extending_error':
      return 'icon_error_color';

    case 'running':
    case 'migrating':
    case 'pending':
    case 'under review':
      return 'icon_running_color';

    case 'available':
    case 'down':
      return 'icon_available_color';
    case 'review':
    case 'rejected':
      return 'icon_review_color';

    case 'deleted':
    default:
      return 'icon_default_color';
  }
};
</script>

<style lang="scss" scoped>
.v-tooltip {
  :deep(.v-overlay__content) {
    background-color: rgb(var(--v-theme-bg-tooltip)) !important;
    font-size: 12px !important;
    color: rgb(var(--v-theme-text-tooltip));
    max-width: 30vw !important;
  }
}
</style>
