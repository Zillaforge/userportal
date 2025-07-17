<script lang="ts" setup>
import { useGlobal } from '@/store';
import { computed } from 'vue';

import TD from '@/components/TdHighlight.vue';
import { type MoreAction } from '@/interfaces/InfraDataTableInterface';
import { getDeepObj } from '@/utils/utils';

const props = defineProps({
  items: {
    type: Array<any>,
    default: () => {},
  },
  headers: {
    type: Array<any>,
    default: () => [],
  },
  actions: {
    type: Array<MoreAction>,
    default: () => [],
  },
  required: {
    type: Boolean,
    default: false,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  noRowHover: {
    type: Boolean,
    default: true,
  },
  clickRowEvent: {
    type: Function,
    default: undefined,
  },
  statusPendingToReview: {
    type: Boolean,
    default: true,
  },
});

const { triggerSnackbarCopied } = useGlobal();

const checkedHeaders = computed(() => {
  if (props.actions.length === 0) {
    return props.headers;
  }
  return props.headers.concat({
    text: '',
    key: 'actions',
    sortable: false,
    align: 'end',
  });
});
const itemsHasEmptyValue = computed(() =>
  props.items.some((item: Record<string, unknown>) =>
    Object.values(item).every(val => !val)
  )
);

const handleCopy = (e: { stopPropagation: () => void }, value: string) => {
  e.stopPropagation();
  void navigator.clipboard.writeText(value);
  triggerSnackbarCopied();
};
</script>

<template>
  <div>
    <v-data-table
      :class="{ 'ocis-table-border': true, 'table-no-hover': noRowHover }"
      :headers="checkedHeaders"
      :items="items"
      hide-default-footer
    >
      <template #item="{ item, index }">
        <tr
          :class="{ 'cursor-pointer': !!props.clickRowEvent }"
          @click="props.clickRowEvent ? props.clickRowEvent?.(item) : undefined"
        >
          <td
            v-for="(header, indexHeader) in checkedHeaders"
            :key="indexHeader"
          >
            <template v-if="header.key === 'actions'">
              <v-menu open-on-hover>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="flat"
                    icon
                    density="comfortable"
                    class="ocis-table-more-btn float-right"
                    @click.stop
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list class="pa-0 ocis-more-action-list">
                  <template v-for="act in actions" :key="act.label">
                    <v-list-item
                      v-if="act.visible ? act.visible(item) : true"
                      :disabled="act.disabled ? act.disabled(item) : false"
                      @click="act.action ? act.action(item, index) : () => {}"
                    >
                      {{ act.label }}
                    </v-list-item>
                  </template>
                </v-list>
              </v-menu>
            </template>
            <template v-else>
              <TD
                :item="getDeepObj(item, header.key || header.value) ?? '-'"
                :is-status="header.isStatus"
                :use-date-filter="header.useDateFilter"
                :status-pending-to-review="statusPendingToReview"
              >
                <v-icon
                  v-if="
                    header.copy && getDeepObj(item, header.key || header.value)
                  "
                  class="ml-4"
                  @click="
                    handleCopy(
                      $event,
                      getDeepObj(item, header.key || header.value)
                    )
                  "
                >
                  mdi-content-copy
                </v-icon>
              </TD>
            </template>
          </td>
        </tr>
      </template>
      <template v-if="required" #no-data>
        <span class="alert">{{ $t('form.required') }}</span>
      </template>
    </v-data-table>
    <div v-if="hasError || (required && itemsHasEmptyValue)" class="mt-2">
      <span class="alert">
        {{ `(${$t('form.error.pleaseCheck')})` }}
      </span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@use '@/styles/common/v-table';

.alert {
  color: rgb(var(--v-theme-error));
}

.float-right {
  float: right;
}

.table-no-hover {
  :deep(tr) {
    &:hover {
      background-color: transparent !important;
      box-shadow: none !important;
    }
  }
}
</style>
