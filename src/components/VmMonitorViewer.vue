<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';

import dayjs from 'dayjs';

import { makeMultipleApiCalls, fetchVmMetrics } from '@/api';
import MonitorChart from '@/components/common/MonitorChart.vue';
import TableActionBtn from '@/components/common/TableActionBtn.vue';
import i18n from '@/i18n';
import { formatDateSec } from '@/utils/utils';

interface MonitorData {
  title: string;
  unit?: string;
  data: any[];
  options?: Record<string, any>;
  refetch?: (val: any) => Promise<void>;
}

const { t, tc } = i18n.global;
const props = defineProps({
  serverId: {
    type: String,
    required: true,
  },
  vgpu: {
    type: Boolean,
    default: false,
  },
});

const lastUpdatedTime = ref<Date>(new Date());
const selectedPeriod = ref<Record<string, any>>({});
const periodOptions = ref<Record<string, any>[]>([]);
const isRead = ref(true);
const isIncoming = ref(true);
const netOptions = ref<Record<string, any>[]>([]);
const diskOptions = ref<Record<string, any>[]>([]);
const monitorDataArray = ref<MonitorData[]>([]);
const initData = () => {
  netOptions.value = [
    { name: t('basic.input'), value: 'input' },
    { name: t('basic.output'), value: 'output' },
  ];
  diskOptions.value = [
    { name: t('basic.read'), value: 'read' },
    { name: t('basic.write'), value: 'write' },
  ];
  periodOptions.value = [
    { name: tc('usage.time.hour', 1, { n: 1 }), value: 3600 },
    { name: tc('usage.time.hour', 1, { n: 3 }), value: 10800 },
    { name: tc('usage.time.hour', 1, { n: 8 }), value: 28800 },
    { name: tc('usage.time.hour', 1, { n: 24 }), value: 86400 },
  ];
  selectedPeriod.value = periodOptions.value[0];
  monitorDataArray.value = [
    {
      title: t('vm.monitor.cpuUsage'),
      unit: '%',
      data: [],
    },
    {
      title: t('vm.monitor.memoryUsage'),
      unit: 'MiB',
      data: [],
    },
    {
      title: t('vm.monitor.diskUsage'),
      unit: 'byte/s',
      data: [],
      options: diskOptions,
      refetch: async (val: Record<string, any>) => {
        isRead.value = val.value === 'read';
        await fetchData();
      },
    },
    {
      title: t('vm.monitor.networkUsage'),
      unit: 'byte/s',
      data: [],
      options: netOptions,
      refetch: async (val: Record<string, any>) => {
        isIncoming.value = val.value === 'input';
        await fetchData();
      },
    },
  ];
  if (props.vgpu) {
    monitorDataArray.value.push({
      title: t('vm.monitor.vgpu'),
      unit: '%',
      data: [],
    });
  }
};

const fetchData = async () => {
  lastUpdatedTime.value = new Date();
  const query = {
    granularity: '300',
    start: Math.floor(Date.now() / 1000) - selectedPeriod.value.value,
  };

  const payloads = [
    {
      serverId: props.serverId,
      query: { ...query, type: 'cpu' },
    },
    {
      serverId: props.serverId,
      query: { ...query, type: 'memory' },
    },
    {
      serverId: props.serverId,
      query: {
        ...query,
        type: 'disk',
        rw: isRead.value ? 'read' : 'write',
      },
    },
    {
      serverId: props.serverId,
      query: {
        ...query,
        type: 'net',
        direction: isIncoming.value ? 'incoming' : 'outgoing',
      },
    },
  ];

  if (props.vgpu) {
    payloads.push({
      serverId: props.serverId,
      query: { ...query, type: 'vgpu' },
    });
  }

  await makeMultipleApiCalls({
    apiCallFn: fetchVmMetrics,
    apiCallFnName: 'fetchVmMetrics',
    payloads,
    successCallback: resFull => {
      resFull.forEach((res: any, index: number) => {
        monitorDataArray.value[index].data = [];
        res.value.forEach((el: any) => {
          const dataset = {
            name: el.name ?? '',
            data: {},
          };
          el.measures.forEach((measure: any) => {
            const time = Number(measure.timestamp) * 1000;
            const timestamp = dayjs(time).format('HH:mm');
            dataset.data = {
              ...dataset.data,
              [timestamp]: measure.value,
            };
          });
          monitorDataArray.value[index].data.push(dataset);
        });
      });
    },
  });
};
onMounted(async () => {
  initData();
});

watch(selectedPeriod, async () => {
  await fetchData();
});

watch(
  () => i18n.global.locale,
  async () => {
    initData();
    await fetchData();
  }
);
</script>

<template>
  <div class="ma-4">
    <div class="table-actions mr-2">
      <div>
        <TableActionBtn
          :btn="{
            visible: true,
            disabled: false,
            icon: 'mdi-refresh',
            tips: $t('table.action.refresh'),
            action: fetchData,
          }"
        />
      </div>

      <div class="ocis-last-updated-time">
        <span class="text-end">
          {{ $t('label.lastUpdated') }}
          {{ formatDateSec(lastUpdatedTime) }}
        </span>
      </div>
    </div>

    <div class="border">
      <div class="d-flex align-items justify-space-between pa-4">
        <span class="align-self-center">
          {{ $t('basic.monitor.metrics') }}
        </span>
        <div class="d-flex">
          <v-select
            v-model="selectedPeriod"
            width="300"
            class="mr-3"
            :items="periodOptions"
            :item-title="'name'"
            density="compact"
            variant="outlined"
            hide-details
            return-object
          />
        </div>
      </div>
      <v-row no-gutters class="pt-4 pl-4 monitor-chart">
        <v-col
          v-for="monitorData in monitorDataArray"
          :key="monitorData.title"
          cols="6"
          class="pr-4 pb-4"
        >
          <MonitorChart
            :title="monitorData.title"
            :unit="monitorData.unit"
            :chart-data="monitorData.data"
            :chart-options="monitorData.options"
            @re-fetch="monitorData.refetch"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-actions {
  height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .v-btn:hover {
    background-color: rgb(var(--v-theme-bg-highlight)) !important;
  }
}

.monitor-chart {
  background: rgb(var(--v-theme-bg-main)) !important;
}
</style>
