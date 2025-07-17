<script setup lang="ts">
import { ref } from 'vue';

import Pagination from '@/components/PaginationComponment.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  logs: {
    type: Array<string>,
    default: [''],
  },
});

const pagination = ref({
  totalItems: props.logs.length,
  rowsPerPage: 1,
  page: 1,
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('vm.log.title')"
    :show-cancel-btn="false"
    :submit-btn-text="$t('basic.close')"
  >
    <v-row no-gutters>
      <v-col cols="12" class="mb-4">
        <div class="would_break pa-4 log-area">
          {{ logs?.[pagination.page - 1] }}
        </div>
      </v-col>
      <v-col cols="12">
        <Pagination
          class="text-center footer"
          :pagination="pagination"
          :item-title="`${$tc('basic.pages', pagination.totalItems, { number: pagination.totalItems })}`"
          @update-current-page="pagination.page = $event"
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>

<style lang="scss" scoped>
.would_break {
  white-space: pre-line;
  overflow-wrap: break-word;
  overflow-y: auto;
}
.footer {
  background-color: var(--v-thmem-bg-default) !important;
}
.log-area {
  height: 500px;
  border: 1px solid
    rgba(var(--v-theme-border), var(--v-input-default-border-opacity)) !important;
  overflow-y: scroll;
}
</style>
