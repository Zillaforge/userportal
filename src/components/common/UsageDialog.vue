<script setup lang="ts">
import CommonDialog from '@/components/common/CommonDialog.vue';
import { formatBytes } from '@/utils/utils';

const showDialog = defineModel<boolean>('show', { required: true });

defineProps({
  usedBytes: {
    type: Number,
    default: 0,
  },
  allocatedBytes: {
    type: Number,
    default: -1,
  },
  showCountInfo: {
    type: Boolean,
    default: false,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  allocatedCount: {
    type: Number,
    default: -1,
  },
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="`${$t('s3.usage')} (${$t('basic.project')})`"
    :alert="$t('s3.usage.warning')"
    :show-cancel-btn="false"
  >
    <v-row no-gutters>
      <span class="ocis-content-key">
        {{ $t('s3.usage.quota') }}
      </span>
      <span class="ocis-content-value mr-3">
        {{
          `${formatBytes(usedBytes)} / ${allocatedBytes === -1 ? $t('label.quota.unlimited') : formatBytes(allocatedBytes)}`
        }}
      </span>
    </v-row>
    <v-row v-if="showCountInfo" no-gutters>
      <span class="ocis-content-key">
        {{ $t('image.usage.count.quota') }}
      </span>
      <span class="ocis-content-value mr-3">
        {{
          `${usedCount} / ${allocatedCount === -1 ? $t('label.quota.unlimited') : allocatedCount}`
        }}
      </span>
    </v-row>
  </CommonDialog>
</template>
