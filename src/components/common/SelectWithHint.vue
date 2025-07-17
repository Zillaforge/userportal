<script setup lang="ts">
import { ref, computed, type PropType, nextTick } from 'vue';

import InfoTooltip from '@/components/common/InfoTooltip.vue';
import SelectComponent from '@/components/common/SelectComponent.vue';
import validation from '@/utils/validation';

const emit = defineEmits([
  'formError',
  'clickSelect',
  'checkRules',
  'update:modelValue',
]);
const props = defineProps({
  modelValue: {
    type: [String, Object, Number, Boolean],
    default: undefined,
  },
  items: {
    type: Array,
    required: true,
  },
  itemText: {
    type: String,
    default: 'name',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
  required: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: undefined,
  },
  tooltip: {
    type: String,
    default: '',
  },
  inputLabel: {
    type: String,
    required: false,
    default: null,
  },
  returnObject: {
    type: Boolean,
    default: false,
  },
  hideDetails: {
    type: Boolean,
    default: false,
  },
  isCardContent: {
    type: Boolean,
    default: false,
  },
  titleCols: {
    type: Number,
    default: 3,
  },
  selectionCols: {
    type: Number,
    default: 8,
  },
  noDataSetting: {
    type: Object as PropType<{ action: () => void; text: string }>,
    default: null,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  highlightError: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
});

const refSelection = ref<any>(null);

const allRules = computed(() => {
  const rules = [];
  if (props.required) {
    rules.push(validation.ruleRequired());
  }
  return rules;
});
const isValueValid = computed(() => {
  return allRules.value.every((rule: any) => rule(props.modelValue) === true);
});

const handleBlur = () => {
  validate();
};

const valueChange = (value: any) => {
  emit('update:modelValue', value);
  emit(
    'checkRules',
    allRules.value.every((rule: any) => rule(value) === true)
  );

  void nextTick(() => {
    validate();
  });
};
const validate = () => {
  refSelection.value?.selectComponentRef?.validate().then((res: any) => {
    const errMessage = Array.isArray(res) && res.length ? res[0] : '';
    emit('formError', errMessage);
  });
};
defineExpose({ validate });
</script>

<template>
  <v-row no-gutters>
    <v-col v-if="title !== undefined" :cols="titleCols">
      <div
        :class="{
          'ocis-form-title': true,
          'ocis-card-detail-header': isCardContent,
          'ocis-text-disabled': disabled,
        }"
      >
        <span :class="{ 'ocis-input-required': required && title }">
          {{ title }}
        </span>
        <InfoTooltip v-if="tooltip" :tooltip="tooltip" />
      </div>
    </v-col>
    <v-col :cols="selectionCols" class="ocis-pt-2-and-half">
      <SelectComponent
        ref="refSelection"
        :selected-value="modelValue"
        :items="items"
        :item-title="itemText"
        :item-value="itemValue"
        :placeholder="inputLabel ? inputLabel : title"
        :rules="allRules"
        :return-object="returnObject"
        :hide-details="hideDetails"
        :hint="hint"
        :clearable="clearable"
        :disabled="disabled"
        :error="highlightError ? !isValueValid : false"
        :no-data-setting="noDataSetting"
        @click="$emit('clickSelect')"
        @update:model-value="valueChange($event)"
        @blur="handleBlur"
      />
    </v-col>
    <slot />
    <v-spacer />
  </v-row>
</template>
