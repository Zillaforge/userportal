<script setup lang="ts">
import { ref, computed } from 'vue';

import validation from '@/utils/validation';

const emit = defineEmits(['update:modelValue', 'formError']);

const props = defineProps({
  modelValue: {
    type: Array<string | Record<string, unknown>>,
    default: () => [],
  },
  items: {
    type: Array<string | Record<string, unknown>>,
    default: () => [],
  },
  itemTitle: {
    type: String,
    default: 'label',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
  allowCustomValue: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  returnObject: {
    type: Boolean,
    default: true,
  },
});

const refCombobox = ref<any>(null);

const allRules = computed(() => {
  const rules = [];
  if (props.required) {
    rules.push(validation.ruleComboboxRequired());
  }
  return rules;
});

const selectedValues = computed(() => props.modelValue);
const updateValues = ($event: string[]) => {
  let newValues = [];
  if (props.allowCustomValue) {
    newValues = $event;
  } else {
    if (props.returnObject) {
      const optionTitles = props.items.map(
        (item: any) => item[props.itemTitle]
      );
      newValues = $event.filter((item: any) => {
        return optionTitles.includes(item[props.itemTitle]);
      });
    } else {
      const optionValues = props.items.map(
        (item: any) => item[props.itemValue]
      );
      newValues = $event.filter((item: any) =>
        optionValues.includes(item[props.itemValue])
      );
    }
  }
  emit('update:modelValue', newValues);
};

const validate = () => {
  refCombobox.value?.validate().then((res: any) => {
    const errMessage = Array.isArray(res) && res.length ? res[0] : '';
    emit('formError', errMessage);
  });
};

defineExpose({ validate });
</script>

<template>
  <v-combobox
    ref="refCombobox"
    :model-value="selectedValues"
    chips
    multiple
    closable-chips
    auto-select-first
    clearable
    variant="solo"
    density="compact"
    :rules="allRules"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    hide-details="auto"
    color="primary"
    autocomplete="off"
    :return-object="returnObject"
    :list-props="{ class: 'ocis-combobox-menu' }"
    @update:model-value="updateValues"
  />
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';
@use '@/styles/common/v-chip';
</style>
