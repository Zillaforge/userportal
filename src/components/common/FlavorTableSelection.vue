<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';

import { makeApiCall, fetchQuotas } from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';
import TableWithRowHeader from '@/components/common/TableWithRowHeader.vue';
import i18n from '@/i18n';

const props = defineProps({
  headers: {
    type: Array<any>,
    default: () => [],
  },
  items: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: () => {},
  },
  showQuotaHeader: {
    type: Boolean,
    default: true,
  },
  displayQuota: {
    type: Boolean,
    default: false,
  },
  tableName: {
    type: String,
    default: '',
  },
  showQuotaLink: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['update:model-value', 'close-quota-dialog']);

interface Quota {
  limit: number;
  name: string;
  usage: string;
}
const { t } = i18n.global;
const quotas = ref<Record<string, any>[]>([]);
const showQuota = ref(false);
const fetchData = async () => {
  await makeApiCall({
    apiCallFn: fetchQuotas,
    successCallback: (data: Record<string, Quota>) => {
      const quota = {
        rowHeader: t('basic.project'),
        cpu: parseQuota(data.vcpu),
        gpu: parseQuota(data.gpu),
        memory: parseQuota(data.ram, 'memory'),
      };
      quotas.value.push(quota);
    },
    skipProgress: true,
  });
};

const parseQuota = (quota: Record<string, any>, type: string = '') => {
  let limit = quota.limit < 0 ? t('label.quota.unlimited') : quota.limit;
  if (type === 'memory') {
    if (quota.limit >= 0) {
      limit = Math.floor(limit / 1024);
    }
    const usage = Math.floor(quota.usage / 1024);
    return `${usage}/${limit}`;
  }
  return `${quota.usage}/${limit}`;
};

onMounted(async () => {
  await fetchData();
});

const selectedFlavor = computed({
  get: () => props.modelValue,
  set: value => {
    if (value) emits('update:model-value', value);
  },
});

const handleRowClick = (_: any, row: any) => {
  selectedFlavor.value = row.item;
};

const projectHeaders = computed(() => [
  {
    title: t('flavor.title'),
    key: 'rowHeader',
  },
  { title: 'GPU', key: 'gpu', subTitle: `(${t('flavor.pcs')})` },
  {
    title: 'CPU',
    key: 'cpu',
    subTitle: `(${t('flavor.cores')})`,
  },
  { title: t('flavor.memory'), key: 'memory', subTitle: '(GB)' },
]);

watch(
  () => props.displayQuota,
  () => {
    showQuota.value = showQuota.value || props.displayQuota;
    emits('close-quota-dialog');
  }
);

watch(
  () => i18n.global.locale,
  async () => {
    quotas.value = [];
    await fetchData();
  }
);
</script>
<template>
  <div v-if="showQuotaHeader" class="mt-3 mb-1">
    <a class="ocis-external-link" @click="showQuota = true">
      {{ $t('creditCalculation.view.quota') }}
      <v-icon size="24">mdi-open-in-new</v-icon>
    </a>
  </div>
  <v-row no-gutters>
    <v-col v-if="tableName" :cols="3" class="ocis-form-title">
      <span class="ocis-input-required">
        {{ tableName }}
      </span>
    </v-col>
    <v-col :cols="tableName ? 9 : 12" class="py-4">
      <div v-if="showQuotaLink" class="pb-2">
        <a class="ocis-external-link" @click="showQuota = true">
          {{ $t('creditCalculation.view.quota') }}
          <v-icon size="24">mdi-open-in-new</v-icon>
        </a>
      </div>
      <v-data-table
        return-object
        show-select
        fixed-header
        class="ocis-table-border flavor-table"
        hide-default-footer
        :headers="headers"
        :items="items"
        :items-per-page="-1"
        @click:row="handleRowClick"
      >
        <template #headers="{ columns, getSortIcon, toggleSort }">
          <tr>
            <th />
            <th v-for="(column, idx) in columns.slice(1)" :key="idx">
              {{ column.title }}
              <InfoTooltip v-if="column.hint" :tooltip="column.hint" />
              <v-icon
                v-if="column.sortable"
                class="v-data-table-header__sort-icon"
                :icon="getSortIcon(column)"
                @click="toggleSort(column)"
              />
              <div>
                {{ column.subTitle }}
              </div>
            </th>
          </tr>
        </template>
        <template #item.data-table-select="{ item }">
          <v-checkbox
            v-model="selectedFlavor"
            color="primary"
            false-icon="mdi-radiobox-blank"
            true-icon="mdi-radiobox-marked"
            :value="item"
            hide-details
          />
        </template>
        <template #item.status="{ item }">
          <v-tooltip v-if="item.status === 'unavailable'">
            <template #activator="{ props }">
              <span v-bind="props" class="alert">
                {{ item.status }}
              </span>
            </template>
            <span>{{ item.statusMessage }}</span>
          </v-tooltip>
          <span v-else>{{ item.status }}</span>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
  <CommonDialog
    v-model:show="showQuota"
    :title="$t('creditCalculation.view.quota')"
    :show-cancel-btn="false"
  >
    <div class="py-3">
      {{ `* ${$t('creditCalculation.quota')}` }}
    </div>
    <TableWithRowHeader :headers="projectHeaders" :items="quotas" />
  </CommonDialog>
</template>
<style lang="scss" scoped>
@use '@/styles/common/v-table';
tbody {
  tr:hover {
    background-color: transparent !important;
    box-shadow: none !important;
    border-bottom: none !important;
  }
}

.alert {
  color: rgb(var(--v-theme-error));
}

.flavor-table {
  max-height: 400px;
  overflow-y: auto;
  display: flex !important;
}
</style>
