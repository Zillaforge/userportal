<script lang="ts" setup>
import { ref, computed } from 'vue';

import { formatDate, getAllowedDatesFn } from '@/utils/utils';

defineEmits(['select-date']);
const props = defineProps({
  modelValue: {
    type: Date,
    default: undefined,
  },
  disableSelect: {
    type: Function,
    default: () => false,
  },
  allowedMinDate: {
    type: String, // YYYY-MM-DD
    default: '',
  },
  allowedMaxDate: {
    type: String, // YYYY-MM-DD
    default: '',
  },
});
const showDatePicker = ref(false);
const dateString = computed(() => formatDate(props.modelValue, true));
const allowedDatesFn = computed(() =>
  getAllowedDatesFn({
    allowedMinDate: props.allowedMinDate,
    allowedMaxDate: props.allowedMaxDate,
  })
);
</script>
<template>
  <v-text-field
    :model-value="dateString"
    color="primary"
    density="compact"
    variant="solo"
    single-line
    hide-details
    readonly
    :disabled="disableSelect(modelValue)"
    append-inner-icon="mdi-calendar"
  >
    <v-menu
      v-model="showDatePicker"
      activator="parent"
      :close-on-content-click="false"
    >
      <v-date-picker
        :model-value="modelValue"
        show-adjacent-months
        :allowed-dates="allowedDatesFn"
        @update:model-value="
          ($event: Date) => {
            $emit('select-date', $event);
            showDatePicker = false;
          }
        "
      />
    </v-menu>
  </v-text-field>
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';

.v-text-field {
  :deep(input) {
    min-width: 76px;
  }
}
</style>
