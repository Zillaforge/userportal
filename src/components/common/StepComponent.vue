<script setup lang="ts">
import { computed, ref } from 'vue';

import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';
import i18n from '@/i18n';

const { t } = i18n.global;
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },
  stepNames: {
    type: Array as () => string[],
    default: () => [],
  },
  errSteps: {
    type: Array as () => string[],
    default: () => [],
  },
});

const emit = defineEmits(['submit', 'cancel', 'update:modelValue']);
const refStepper = ref<any>(null);
const submitText = computed(() => {
  return props.modelValue < props.stepNames.length
    ? t('basic.review') + '+' + t('basic.create')
    : t('basic.create');
});

const prev = () => {
  refStepper.value.prev();
};

const next = () => {
  refStepper.value.next();
};

const submit = () => {
  if (props.modelValue === props.stepNames.length) {
    emit('submit');
  } else {
    emit('update:modelValue', props.stepNames.length);
  }
};

const cancel = () => {
  emit('cancel');
};

const getNextSuffix = () => {
  return props.modelValue === props.stepNames.length
    ? ''
    : ': ' + props.stepNames[props.modelValue] + '>';
};
</script>

<template>
  <v-stepper
    ref="refStepper"
    :model-value="modelValue"
    editable
    alt-labels
    error-icon="mdi-close"
    edit-icon=""
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #default="{}">
      <v-stepper-header class="steps-header">
        <template v-for="i in stepNames.length" :key="`${i}-step`">
          <v-stepper-item
            :value="i"
            :complete="modelValue > i"
            :ripple="false"
            :error="errSteps.includes(stepNames[i - 1])"
            :color="modelValue >= i ? 'primary' : 'svc-icon-round'"
            class="steps-item"
          >
            {{ stepNames[i - 1] }}
          </v-stepper-item>
          <v-divider
            v-if="i !== stepNames.length"
            :key="i"
            :thickness="1"
            :class="modelValue > i ? 'divider-active mt-10' : 'mt-10'"
          />
        </template>
      </v-stepper-header>
      <div class="steps-scroll-view">
        <v-stepper-window>
          <slot />
        </v-stepper-window>
      </div>
    </template>
  </v-stepper>
  <v-footer app>
    <v-row no-gutters class="ma-0">
      <div class="footer-btn">
        <ContainedBtn
          :text="submitText"
          :disabled="errSteps.length > 0 && modelValue === stepNames.length"
          @click="submit"
        />
        <OutlinedBtn
          :text="`<${$t('basic.back')}`"
          :disabled="modelValue === 1"
          @click="prev"
        />
        <OutlinedBtn
          :text="`${$t('basic.next')} ${getNextSuffix()}`"
          :disabled="modelValue === stepNames.length"
          @click="next"
        />
      </div>
      <TextBtn :text="$t('basic.cancel')" @click="cancel" />
    </v-row>
  </v-footer>
</template>
<style lang="scss" scoped>
.steps-header {
  background: rgb(var(--v-theme-bg-main));
  box-shadow: none;
}
.steps-item {
  opacity: 1 !important;
  padding: 16px !important;
}

.v-stepper-item {
  :deep(.v-avatar) {
    color: white !important;
    margin-bottom: 8px !important;
  }
  :deep(.v-icon) {
    font-size: 16px !important;
  }
  :deep(.v-stepper-item__content) {
    color: rgba(var(--v-theme-text-general), var(--v-text-disabled-opacity));
  }
  &.v-stepper-item--selected,
  &.v-stepper-item--complete {
    :deep(.v-stepper-item__content) {
      color: rgba(var(--v-theme-text-general), var(--v-text-general-opacity));
    }
  }
  &.v-stepper-item--error {
    :deep(.v-stepper-item__content) {
      color: rgb(var(--v-theme-error));
    }
  }
}

.v-divider {
  &.divider-active {
    border-color: rgb(var(--v-theme-primary));
    opacity: 1 !important;
  }
}

.footer-btn .v-btn {
  margin: 0px 8px !important;
}

.steps-scroll-view .v-stepper-window {
  max-height: calc(100vh - 390px);
  overflow-y: auto;
  margin: 0px;
  padding: 24px 40px;
}

.v-stepper :deep(.v-stepper-item__avatar) {
  width: 36px !important;
  height: 36px !important;
  font-size: 16px !important;
}

.v-stepper:hover :deep(.v-stepper-item__overlay) {
  opacity: 0 !important;
}

.v-stepper {
  box-shadow: 0px 2px 6px #00000029;
  border: 1px solid #16161629;
}
.v-footer {
  box-shadow: 0px 8px 8px #0000003d;
  height: 72px;
}
</style>
