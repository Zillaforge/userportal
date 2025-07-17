<script setup lang="ts">
import { ref, watch, computed, onMounted, type Ref } from 'vue';

import dayjs from 'dayjs';

import CommonDialog from '@/components/common/CommonDialog.vue';
import DatePicker from '@/components/common/DatePicker.vue';
import SelectComponent from '@/components/common/SelectComponent.vue';
import { getTimeOptions } from '@/utils/utils';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  resetValue: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(['submit']);

const timeOptions: Ref<any[]> = ref([]);
const selectedStartDate: Ref<Date | undefined> = ref();
const selectedStartTime = ref();
const selectedEndDate: Ref<Date | undefined> = ref();
const selectedEndTime = ref();

const disableSubmit = computed(
  () => !startTimestamp.value || !endTimestamp.value
);

const startTimestamp = computed(() =>
  selectedStartDate.value &&
  (selectedStartTime.value || selectedStartTime.value === 0)
    ? new Date(selectedStartDate.value).getTime() + selectedStartTime.value
    : undefined
);

const endTimestamp = computed(() =>
  selectedEndDate.value &&
  (selectedEndTime.value || selectedEndTime.value === 0)
    ? new Date(selectedEndDate.value).getTime() + selectedEndTime.value
    : undefined
);

const endDateMin = computed(() =>
  dayjs(selectedStartDate.value).format('YYYY-MM-DD')
);

const endDateMax = computed(() => {
  const maxTimestamp =
    new Date(endDateMin.value).getTime() + 30 * 24 * 60 * 60 * 1000;
  const currentTimestamp = new Date().setHours(0, 0, 0, 0);

  return maxTimestamp < currentTimestamp
    ? dayjs(maxTimestamp).format('YYYY-MM-DD')
    : dayjs(currentTimestamp).format('YYYY-MM-DD');
});

const startDateMax = computed(() => {
  const currentTimestamp = new Date().setHours(0, 0, 0, 0);
  return dayjs(currentTimestamp).format('YYYY-MM-DD');
});

const endTimeOptions = computed(() => {
  if (!selectedStartDate.value || !selectedEndDate.value) {
    return timeOptions.value;
  }

  const startTimpstamp = new Date(selectedStartDate.value).getTime();
  const endTimestamp = new Date(selectedEndDate.value).getTime();

  if (startTimpstamp === endTimestamp) {
    const index = timeOptions.value.findIndex(
      option => option.value === selectedStartTime.value
    );
    if (index === timeOptions.value.length - 1) {
      return [timeOptions.value[timeOptions.value.length - 1]];
    } else {
      return index ? timeOptions.value.slice(index + 1) : timeOptions.value;
    }
  } else {
    return timeOptions.value;
  }
});

onMounted(() => {
  timeOptions.value = getTimeOptions();
});

const submitAction = () => {
  showDialog.value = false;
  emits('submit', startTimestamp.value, endTimestamp.value);
};

const updateStartDate = (val: Date) => {
  selectedStartDate.value = val;
  selectedEndDate.value = undefined;
  selectedEndTime.value = undefined;
};

const updateStartTime = (val: number) => {
  selectedStartTime.value = val;

  if (selectedStartDate.value && selectedEndDate.value) {
    const startTimpstamp = new Date(selectedStartDate.value).getTime();
    const endTimestamp = new Date(selectedEndDate.value).getTime();
    if (startTimpstamp === endTimestamp) {
      selectedEndTime.value = undefined;
    }
  }
};

const updateEndDate = (val: Date) => {
  selectedEndDate.value = val;
};

watch(showDialog, val => {
  if (val && props.resetValue) {
    const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
    selectedStartDate.value = currentDate;
    selectedEndDate.value = currentDate;
    selectedStartTime.value = timeOptions.value[0].value;
    selectedEndTime.value =
      timeOptions.value[timeOptions.value.length - 1].value;
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('usage.custom.title')"
    :show-cancel-btn="true"
    :disable-submit="disableSubmit"
    :submit-callback="submitAction"
  >
    <v-row no-gutters class="mb-2">
      <v-col cols="3">
        <span>{{ $t('label.startDate') }}</span>
      </v-col>
      <v-col cols="2">
        <span>{{ $t('logMgnt.time') }}</span>
      </v-col>
      <v-col cols="1" />
      <v-col cols="3">
        <span>{{ $t('label.endDate') }}</span>
      </v-col>
      <v-col cols="2">
        <span>{{ $t('logMgnt.time') }}</span>
      </v-col>
      <v-col cols="1" />
    </v-row>
    <v-row no-gutters>
      <v-col cols="3" class="pr-6">
        <DatePicker
          :model-value="selectedStartDate"
          :allowed-max-date="startDateMax"
          @select-date="updateStartDate"
        />
      </v-col>
      <v-col cols="2">
        <SelectComponent
          :selected-value="selectedStartTime"
          :items="timeOptions"
          @update:model-value="updateStartTime"
        />
      </v-col>
      <v-col cols="1" class="align-self-center text-center">
        {{ $t('usage.custom.to') }}
      </v-col>
      <v-col cols="3" class="pr-6">
        <DatePicker
          :model-value="selectedEndDate"
          :allowed-min-date="endDateMin"
          :allowed-max-date="endDateMax"
          @select-date="updateEndDate"
        />
      </v-col>
      <v-col cols="2">
        <SelectComponent
          :selected-value="selectedEndTime"
          :items="endTimeOptions"
          @update:model-value="val => (selectedEndTime = val)"
        />
      </v-col>
      <v-col cols="1" />
    </v-row>
  </CommonDialog>
</template>
