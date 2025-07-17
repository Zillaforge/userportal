<script setup lang="ts">
import { useProject } from '@/store';
import { computed, ref, watch, type PropType } from 'vue';

import type {
  TableHeader,
  TableItem,
} from '@/interfaces/InfraDataTableInterface';

import TD from '@/components/TdHighlight.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import SearchTextField from '@/components/common/SearchTextField.vue';
import i18n from '@/i18n';
import { getDeepObj } from '@/utils/utils';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  itemList: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => [],
  },
  tableHeaders: {
    type: Array as PropType<TableHeader[]>,
    default: undefined,
  },
  title: {
    type: String,
    default: '',
  },
  submitAction: {
    type: Function,
    default: undefined,
  },
  sortKey: {
    type: String,
    default: undefined,
  },
  tableItemKey: {
    type: String,
    default: 'id',
  },
});
const { t } = i18n.global;
const projectStore = useProject();

const selectedItems = ref<Record<string, any>[]>([]);
const search = ref('');

const disableSumbit = computed(() => {
  return selectedItems.value.length === 0;
});

const isTenantAdmin = computed(() => {
  return projectStore.isTenantAdmin;
});

const defaultHeaders = computed(() => {
  const value = [
    { title: '', key: 'checkbox', width: '48px' },
    {
      title: t('label.name'),
      key: 'name',
    },
    {
      title: t('label.createdAt'),
      key: 'createdAt',
      useDateFilter: true,
    },
  ];
  if (isTenantAdmin.value) {
    value.push({
      title: t('label.createdBy'),
      key: 'user.name',
    });
  }
  return value;
});

const headers = computed(() => {
  const value: TableHeader[] = [
    ...(props.tableHeaders ?? defaultHeaders.value),
  ];
  const checkbox = value.find(el => el.key === 'checkbox');
  if (checkbox) {
    checkbox.sortable = false;
  }
  return value;
});

const clickRow = (item: Record<string, any>) => {
  const index = selectedItems.value.findIndex(
    el => el[props.tableItemKey] === item[props.tableItemKey]
  );
  if (index < 0) {
    selectedItems.value.push(item);
  } else {
    selectedItems.value.splice(index, 1);
  }
};

const getTdItem = (item: TableItem, headerKey: string) => {
  if (headerKey === 'user.name') {
    return (
      getDeepObj(item, headerKey) ?? getDeepObj(item, 'user.displayName') ?? ''
    );
  }

  return getDeepObj(item, headerKey);
};

watch(showDialog, val => {
  if (!val) {
    selectedItems.value = [];
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="
      title ||
      $t('dialog.delete.title', {
        resource: $t('basic.resource').toLowerCase(),
      })
    "
    :disable-submit="disableSumbit"
    :submit-callback="() => submitAction?.(selectedItems)"
  >
    <SearchTextField v-model="search" />
    <v-data-table-virtual
      :headers="headers"
      :items="itemList"
      :search="search"
      :sort-by="[
        {
          key: sortKey ?? 'createdAt',
          order: 'desc',
        },
      ]"
      class="ocis-table-border mt-4"
    >
      <template #item="{ item }">
        <tr
          :class="{
            'table-row': true,
            selected: !!selectedItems.find(
              el => el[tableItemKey] === item[tableItemKey]
            ),
            'cursor-pointer': true,
          }"
          @click="clickRow(item)"
        >
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getTdItem(item, header.key)"
            :is-status="false"
            :search="search"
            :use-date-filter="header.useDateFilter"
          >
            <v-checkbox
              v-if="header.key === 'checkbox'"
              :model-value="
                !!selectedItems.find(
                  el => el[tableItemKey] === item[tableItemKey]
                )
              "
              color="primary"
              hide-details
            />
          </TD>
        </tr>
      </template>
    </v-data-table-virtual>
  </CommonDialog>
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-table';
</style>
