<script setup lang="ts">
import { ref } from 'vue';

defineEmits(['update:model-value', 'click', 'blur']);
defineProps({
  selectedValue: {
    type: [String, Object, Number, Boolean],
    default: undefined,
  },
  items: {
    type: Array,
    required: true,
  },
  itemText: {
    type: String,
    default: 'title',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
  placeholder: {
    type: String,
    required: false,
    default: null,
  },
  returnObject: {
    type: Boolean,
    default: false,
  },
  noDataSetting: {
    type: Object,
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
  customItem: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array,
    default: () => [],
  },
  error: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
});

const selectComponentRef = ref();

defineExpose({
  selectComponentRef,
});
</script>

<template>
  <v-select
    ref="selectComponentRef"
    class="customHint"
    :model-value="selectedValue"
    :items="items"
    :item-title="itemText"
    :item-value="itemValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    color="primary"
    density="compact"
    variant="solo"
    hide-details
    :hint="hint"
    persistent-hint
    single-line
    :rules="rules"
    :no-data-text="$t('label.noData')"
    :return-object="returnObject"
    :error="error"
    @update:model-value="(val: any) => $emit('update:model-value', val)"
    @click="$emit('click')"
    @blur="$emit('blur')"
  >
    <template v-if="customItem" #item="{ item }">
      <slot name="customItem" :item="item" />
    </template>
    <template v-if="noDataSetting" #no-data>
      <v-list>
        <v-list-item>
          {{ $t('label.noData') }}
        </v-list-item>
        <v-list-item class="cursor-pointer" @click="noDataSetting.action">
          {{ noDataSetting.text }}
        </v-list-item>
      </v-list>
    </template>
  </v-select>
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';

.customHint {
  :deep(.v-messages) {
    opacity: 1 !important;
  }
}
</style>
