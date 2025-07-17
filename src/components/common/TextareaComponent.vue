<script lang="ts" setup>
import { ref } from 'vue';

import i18n from '@/i18n';

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 5,
  },
  autoGrow: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  errorMsg: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:model-value', 'formError']);
const { t } = i18n.global;

const showWarning = ref(false);
const validate = () => {
  showWarning.value = true;
  emits('formError', showWarning.value ? t('form.required') : '');
};
defineExpose({ validate });
</script>

<template>
  <v-textarea
    :model-value="modelValue"
    :label="label"
    :placeholder="placeholder"
    :readonly="readonly"
    :rows="rows"
    :auto-grow="autoGrow"
    variant="solo"
    no-resize
    hide-details
    :disabled="disabled"
    @update:model-value="(value: string) => $emit('update:model-value', value)"
  />
  <div class="pt-1">
    <span v-if="errorMsg" class="ocis-text-alert">
      {{ `${errorMsg}` }}
    </span>
    <span
      v-else-if="required && showWarning && !modelValue"
      class="ocis-text-alert"
    >
      {{ $t('form.required') }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';
.v-input {
  :deep(textarea) {
    mask-image: none !important;
    -webkit-mask-image: none !important;
  }
  &.v-input--readonly {
    :deep(.v-input__control) {
      .v-field {
        background-color: rgb(var(--v-theme-bg-readonly-textarea)) !important;
        textarea {
          cursor: default !important;
          .v-field__input {
            mask-image: none !important;
            -webkit-mask-image: none !important;
          }
        }
      }
    }
  }
}
</style>
