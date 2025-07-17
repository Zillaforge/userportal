<template>
  <v-row no-gutters>
    <v-col :cols="colTitleWidth" class="ocis-form-title">
      <span :class="{ 'ocis-input-required': isRequired }">
        {{ title }}
      </span>
      <InfoTooltip v-if="tooltip" :tooltip="tooltip" />
    </v-col>
    <v-col :cols="colRadioBtnWidth" class="mt-3">
      <v-radio-group
        :model-value="initValue"
        :disabled="disabled"
        :hide-details="isHideDetails"
        :inline="isInline"
        @update:model-value="handleSelect"
      >
        <v-radio
          v-for="(option, index) in options"
          :key="option.value"
          :class="{
            'inline-options': isInline && index !== options.length - 1,
            'mr-8': hasSlot && isInline && index === options.length - 1,
          }"
          :label="option.label"
          :value="option.value"
          :disabled="option.disabled"
          color="primary"
        >
          <template
            v-if="hasSlot && !isInline && index === options.length - 1"
            #label
          >
            <span class="mr-8">{{ option.label }}</span>
            <slot name="last-radio-extra" />
          </template>
        </v-radio>
        <slot v-if="hasSlot && isInline" name="last-radio-extra" />
      </v-radio-group>
    </v-col>
    <v-col cols="nAppendColWidth" />
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, type Ref } from 'vue';

import type { RadioButtonOptions } from '@/interfaces/LayoutItemInterface';

import InfoTooltip from '@/components/common/InfoTooltip.vue';

const nAppendColWidth: Ref<number> = ref(3);
const emit = defineEmits(['selected']);
const props = defineProps({
  isRequired: {
    type: Boolean,
    default: false,
  },
  initValue: {
    type: [String, Boolean],
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  options: {
    type: Array<RadioButtonOptions>,
    default: () => [],
  },
  isHideDetails: {
    type: Boolean,
    default: true,
  },
  tooltip: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  colTitleWidth: {
    type: Number,
    default: 3,
  },
  isInline: {
    type: Boolean,
    default: true,
  },
});

const handleSelect = (value: string | boolean | null) => {
  emit('selected', value);
};

const colRadioBtnWidth = computed(
  () => 12 - nAppendColWidth.value - props.colTitleWidth
);

const slots = useSlots();
const hasSlot = computed(() => {
  return !!slots['last-radio-extra'];
});
</script>

<style lang="scss" scoped>
.inline-options {
  margin-right: 60px;
}

.v-input--selection-controls {
  &.v-input--hide-details {
    margin-top: 0px;
    padding-top: 0px;
  }
}

.v-radio {
  :deep(.v-selection-control__input) {
    &:hover {
      background-color: rgba(var(--v-theme-primary), var(--v-bg-hover-opacity));
      border-radius: 50%;
      &::before {
        opacity: 0 !important;
      }
    }
  }
  :deep(label) {
    width: 100%;
    opacity: 1;
  }
}
</style>
