<script setup lang="ts">
import { ref, computed, watch } from 'vue';
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  unit: {
    type: String,
    default: '',
  },
  chartData: {
    type: [Array, Object],
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => {},
  },
});
const emits = defineEmits(['re-fetch']);

const selectedLabel = ref('');
const isChartWithOptions = computed(
  () => Array.isArray(props.chartOptions) && props.chartOptions.length
);
watch(
  () => props.chartOptions,
  val => {
    // init
    if (Array.isArray(val) && val.length) {
      selectedLabel.value = val[0];
    }
  },
  { immediate: true }
);
watch(selectedLabel, (newVal, oldVal) => {
  if (newVal !== oldVal && oldVal !== '') {
    // not init case
    emits('re-fetch', newVal);
  }
});

const data = computed(() => {
  if (Array.isArray(props.chartData)) {
    const arr: any[] = [];
    props.chartData.forEach((item: any) => {
      arr.push(item);
    });
    return arr;
  }
  return props.chartData;
});
</script>

<template>
  <div class="px-5 py-4 chart">
    <div class="mb-3 d-flex justify-space-between">
      <span class="align-self-center">
        {{ `${title}${unit ? ` (${unit})` : ''}` }}
      </span>
      <div v-if="isChartWithOptions" class="d-flex">
        <v-select
          v-model="selectedLabel"
          width="250"
          :items="chartOptions"
          :item-title="'name'"
          density="compact"
          variant="outlined"
          hide-details
          return-object
        />
      </div>
    </div>
    <line-chart
      :data="data"
      :dataset="{ pointRadius: 3 }"
      :curve="false"
      :library="{
        interaction: {
          axis: 'x',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }"
    />
  </div>
</template>

<style lang="scss" scoped>
.chart {
  background-color: rgb(var(--v-theme-bg-default));
}
</style>
