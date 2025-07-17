<script lang="ts" setup>
import { useGlobal } from '@/store';
import { computed, onMounted, ref, watch } from 'vue';

import { fetchK8sMetrics, makeApiCall } from '@/api';
import MonitorChart from '@/components/common/MonitorChart.vue';
import TableActionBtn from '@/components/common/TableActionBtn.vue';
import i18n from '@/i18n';
import { formatDateSec, formatHourMin } from '@/utils/utils';

interface Dataset {
  name: string;
  data: Record<string, any>;
}

interface MonitorData {
  title: string;
  unit?: string;
  key: string;
  data: any[];
  options?: Record<string, any>;
  refetch?: (val: any) => Promise<void>;
}

const { uiShowProgressDlg, uiHideProgressDlg } = useGlobal();

const { t, tc } = i18n.global;
const props = defineProps({
  clusterId: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: true,
  },
  hosts: {
    type: Array<string>,
    default: () => [],
  },
});

const METRIC = {
  CPU: 0,
  MEM: 1,
  DISK: 2,
  NET: 3,
};
const lastUpdatedTime = ref<Date>(new Date());
const selectedPeriod = ref<Record<string, any>>({});
const selectedHost = ref<string>('');
const periodOptions = ref<Record<string, any>[]>([]);
const hostOptions = ref<string[]>([]);
const isInit = ref(false);
const isRead = ref(true);
const isIncoming = ref(true);
const netOptions = ref<Record<string, any>[]>([]);
const diskOptions = ref<Record<string, any>[]>([]);
const monitorDataArray = ref<MonitorData[]>([]);
const initData = async () => {
  // init Options
  netOptions.value = [
    {
      name: t('basic.input'),
      value: 'netrx',
      key: 'network_incoming_bytes_rate',
    },
    {
      name: t('basic.output'),
      value: 'nettx',
      key: 'network_outgoing_bytes_rate',
    },
  ];
  diskOptions.value = [
    { name: t('basic.read'), value: 'diskread', key: 'disk_read_bytes_rate' },
    {
      name: t('basic.write'),
      value: 'diskwrite',
      key: 'disk_write_bytes_rate',
    },
  ];
  periodOptions.value = [
    { name: tc('usage.time.hour', 1, { n: 1 }), value: 3600_000 },
    { name: tc('usage.time.hour', 1, { n: 3 }), value: 10800_000 },
    { name: tc('usage.time.hour', 1, { n: 8 }), value: 28800_000 },
    { name: tc('usage.time.hour', 1, { n: 24 }), value: 86400_000 },
  ];
  hostOptions.value = props.hosts
    .map((host: any) => host.name)
    .sort((a, b) => (a > b ? 1 : -1));

  // init option value
  selectedPeriod.value = periodOptions.value[0];
  if (hostOptions.value.length >= 1 && !selectedHost.value) {
    selectedHost.value = hostOptions.value[0];
  }

  monitorDataArray.value = [
    {
      title: t('vm.monitor.cpuUsage'),
      unit: '%',
      key: 'cpu_util',
      data: [],
    },
    {
      title: t('vm.monitor.memoryUsage'),
      unit: 'MiB',
      key: 'memory_usage',
      data: [],
    },
    {
      title: t('vm.monitor.diskUsage'),
      unit: 'byte/s',
      key: diskOptions.value[0].key,
      data: [],
      options: diskOptions,
      refetch: async (val: Record<string, any>) => {
        isRead.value = val.value === 'diskread';
        const currentKey = monitorDataArray.value[METRIC.DISK].key;
        const selectKey = diskOptions.value[Number(!isRead.value)].key;
        if (currentKey !== selectKey) {
          monitorDataArray.value[METRIC.DISK].key =
            diskOptions.value[Number(!isRead.value)].key;
          if (isInit.value) {
            await fetchData();
          }
        }
      },
    },
    {
      title: t('vm.monitor.networkUsage'),
      unit: 'byte/s',
      key: netOptions.value[0].key,
      data: [],
      options: netOptions,
      refetch: async (val: Record<string, any>) => {
        isIncoming.value = val.value === 'netrx';
        const currentKey = monitorDataArray.value[METRIC.NET].key;
        const selectKey = netOptions.value[Number(!isIncoming.value)].key;
        if (currentKey !== selectKey) {
          monitorDataArray.value[METRIC.NET].key =
            netOptions.value[Number(!isIncoming.value)].key;
          if (isInit.value) {
            await fetchData();
          }
        }
      },
    },
  ];
  isInit.value = true;
};

const fetchData = async () => {
  if (!checkMonitorEnable.value || !props.clusterId || !props.hosts.length) {
    return;
  }

  lastUpdatedTime.value = new Date();
  uiShowProgressDlg();

  const beginTime = new Date().getTime() - selectedPeriod.value.value;
  const beginTimeStr = `${new Date(beginTime).toISOString().split('.')[0]}Z`;

  const payload = {
    clusterId: props.clusterId,
    hostName: selectedHost.value,
    query: {
      from: beginTimeStr,
    },
  };

  // CPU
  const cpuData: Dataset = {
    name: '',
    data: {},
  };
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchK8sMetrics,
    payload: { ...payload, type: 'cpu' },
    successCallback: res => {
      const key = monitorDataArray.value[METRIC.CPU].key;
      res.forEach((el: any) => {
        const time = formatHourMin(el.timestamp as string);
        cpuData.data[time] = el[key].toFixed(2);
      });
    },
  });

  // Memory
  const memData: Dataset = {
    name: '',
    data: {},
  };
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchK8sMetrics,
    payload: { ...payload, type: 'memory' },
    successCallback: res => {
      const key = monitorDataArray.value[METRIC.MEM].key;
      res.forEach((el: any) => {
        const time = formatHourMin(el.timestamp as string);
        memData.data[time] = el[key].toFixed(2);
      });
    },
  });

  // Disk-Read-Write
  const diskData: Dataset = {
    name: '',
    data: {},
  };
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchK8sMetrics,
    payload: { ...payload, type: isRead.value ? 'diskread' : 'diskwrite' },
    successCallback: res => {
      const key: string = monitorDataArray.value[METRIC.DISK].key;
      res.forEach((el: any) => {
        const time = formatHourMin(el.timestamp as string);
        diskData.data[time] = el[key].toFixed(2);
      });
    },
  });

  // Net-Rx-TX
  const netData: Dataset = {
    name: '',
    data: {},
  };
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchK8sMetrics,
    payload: { ...payload, type: isIncoming.value ? 'netrx' : 'nettx' },
    successCallback: res => {
      const key = monitorDataArray.value[METRIC.NET].key;
      res.forEach((el: any) => {
        const time = formatHourMin(el.timestamp as string);
        netData.data[time] = el[key].toFixed(2);
      });
    },
  });

  clearMetric();
  monitorDataArray.value[METRIC.CPU].data.push(cpuData);
  monitorDataArray.value[METRIC.MEM].data.push(memData);
  monitorDataArray.value[METRIC.DISK].data.push(diskData);
  monitorDataArray.value[METRIC.NET].data.push(netData);

  uiHideProgressDlg();
};
onMounted(async () => {
  await initData();
});

const clearMetric = () => {
  monitorDataArray.value[METRIC.CPU].data = [];
  monitorDataArray.value[METRIC.MEM].data = [];
  monitorDataArray.value[METRIC.DISK].data = [];
  monitorDataArray.value[METRIC.NET].data = [];
};

const checkMonitorEnable = computed(() => {
  return !props.disabled;
});

watch(
  () => props.clusterId,
  async newVal => {
    if (newVal) {
      await initData();
    }
  }
);

watch(
  () => props.hosts,
  async () => {
    hostOptions.value = props.hosts
      .map((host: any) => host.name)
      .sort((a, b) => (a > b ? 1 : -1));

    const match = props.hosts.find(
      (host: any) => host.name === selectedHost.value
    );
    if (!match) {
      clearMetric();
      selectedHost.value = '';
    }
  }
);

watch(selectedPeriod, async (newVal, oldVal) => {
  if (oldVal) {
    if (isInit.value) {
      await fetchData();
    }
  }
});

watch(selectedHost, async (newVal, oldVal) => {
  if (!newVal) {
    return;
  }
  if (isInit.value) {
    await fetchData();
  }
});

watch(
  () => i18n.global.locale,
  async () => {
    await initData();
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
            disabled: !checkMonitorEnable,
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
          <v-select
            v-model="selectedHost"
            width="300"
            class="mr-3"
            :items="hostOptions"
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
