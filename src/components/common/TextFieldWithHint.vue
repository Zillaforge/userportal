<script setup lang="ts">
import { ref, computed, watch, type PropType, nextTick } from 'vue';

import InfoTooltip from '@/components/common/InfoTooltip.vue';
import InputHint from '@/components/common/InputHint.vue';
import i18n from '@/i18n';
import hints from '@/utils/hints';
import validation from '@/utils/validation';
type DataType = 'name' | 'password' | 'passwordConfirm' | 'number';

const { t } = i18n.global;
const refTextfield = ref<any>(null);
const inputHints = ref([] as any[]);
const showHints = computed(() => inputHints.value.length > 0 && props.showHint);
const emit = defineEmits(['formError', 'update:modelValue']);
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  plainText: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<DataType>,
    default: 'text',
  },
  isCardContent: {
    type: Boolean,
    default: false,
  },
  textFieldCol: {
    type: Number,
    default: 8,
  },
  titleFieldCol: {
    type: Number,
    default: 3,
  },
  confirmValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  showHint: {
    type: Boolean,
    default: true,
  },
  hideDetails: {
    type: Boolean,
    default: false,
  },
  // for type number
  minVal: {
    type: Number,
    default: 0,
  },
  maxVal: {
    type: Number,
    default: 100,
  },
  // for type Name Length
  minNameLength: {
    type: Number,
    default: 3,
  },
  maxNameLength: {
    type: Number,
    default: 63,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  titleHint: {
    type: String,
    default: '',
  },
  titleHintLoc: {
    type: String,
    default: 'right',
  },
  fieldText: {
    type: Boolean,
    default: true,
  },
  ignoreRules: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array<(val: string) => string | boolean>,
    default: undefined,
  },
  hints: {
    type: Array<
      (val: string) => { icon: string; color: string; text: string }[]
    >,
    default: undefined,
  },
  placeholder: {
    type: String,
    default: '',
  },
});

const updateValue = (value: string) => {
  emit('update:modelValue', value);

  void nextTick(() => {
    validate();
    inputHints.value = getHints(value);
  });
};

const getHints = (input: string) => {
  let hintMessage: { icon: string; color: string; text: string }[] = [];

  if (props.ignoreRules) {
    return hintMessage;
  }
  if (props.required) {
    hintMessage.push(hints.requiredHint(input));
  }
  switch (props.type) {
    case 'name':
      hintMessage = hintMessage.concat(
        hints.nameHint(input, props.maxNameLength, props.minNameLength)
      );
      break;
    case 'number':
      hintMessage = hintMessage.concat(
        hints.numberHint({
          val: Number(input),
          minVal: props.minVal,
          maxVal: props.maxVal,
        })
      );

      break;
    case 'password':
      hintMessage = hintMessage.concat(hints.passwordHint(input));
      break;
    case 'passwordConfirm':
      hintMessage.pop();
      break;
    default:
      break;
  }
  if (props.hints) {
    hintMessage = hintMessage.concat(...props.hints.map(hint => hint(input)));
  }

  if (hintMessage.length !== allRules.value.length) {
    hintMessage.push(
      ...allRules.value.slice(hintMessage.length).map(rule => {
        const valid = rule(input) === true;
        return {
          icon: valid ? 'mdi-check-circle' : 'mdi-close-circle',
          color: valid ? 'hint-success' : 'hint-error',
          text: rule(''),
        };
      })
    );
  }
  return hintMessage;
};

const allRules = computed(() => {
  let rules: any[] = [];

  if (props.ignoreRules) {
    return rules;
  }

  if (props.required) {
    rules.push(validation.ruleRequired());
  }
  switch (props.type) {
    case 'name':
      rules.push(validation.ruleFirstAlphabet());
      rules.push(validation.ruleOnlyAlphabetNumberMinusRule);
      rules.push(
        validation.ruleInputLength(
          t('form.inputLength', {
            min: props.minNameLength,
            max: props.maxNameLength,
          }),
          props.maxNameLength,
          props.minNameLength
        )
      );
      break;
    case 'number':
      rules.push(
        validation.checkNumberRange({
          val: Number(props.modelValue),
          minVal: props.minVal,
          maxVal: props.maxVal,
        })
      );
      break;
    case 'password':
      rules = rules.concat(validation.rulePassword());
      break;
    case 'passwordConfirm':
      rules = rules.concat(checkPwdConsistent);
      break;
    default:
      break;
  }
  if (props.rules) {
    rules.push(...props.rules);
  }
  return rules;
});

const handleBlur = () => {
  inputHints.value = [];
  validate();
};

const innerIcon = computed(() => {
  switch (props.type) {
    case 'password':
      return show.value ? 'mdi-eye' : 'mdi-eye-off';
    case 'passwordConfirm':
      return show.value ? 'mdi-eye' : 'mdi-eye-off';
    default:
      return null;
  }
});

const show = ref(false);

const checkPwdConsistent = (val: string) => {
  if (val === props.confirmValue) {
    return true;
  } else {
    return t('basic.password.inconsistent');
  }
};

watch(
  () => props.confirmValue,
  () => {
    if (props.modelValue.toString().length > 0) refTextfield.value?.validate();
  }
);

const validate = () => {
  refTextfield.value?.validate().then((res: any) => {
    emit('formError', res);
  });
};

const textfieldType = computed(() => {
  switch (props.type) {
    case 'password':
      return show.value ? 'text' : 'password';
    case 'passwordConfirm':
      return show.value ? 'text' : 'password';
    case 'number':
      return 'number';
    case 'name':
    default:
      return 'text';
  }
});

defineExpose({ validate });
</script>

<template>
  <v-row no-gutters>
    <v-col
      v-if="title"
      :cols="titleFieldCol"
      :class="`ocis-form-title ${isCardContent ? 'ocis-card-detail-header' : ''}`"
    >
      <span :class="required ? 'ocis-input-required' : ''">
        {{ title }}
      </span>
      <InfoTooltip
        v-if="titleHint"
        :tooltip="titleHint"
        :location="titleHintLoc"
      />
    </v-col>
    <v-col v-if="plainText" :cols="textFieldCol" class="ocis-form-title">
      {{ modelValue }}
    </v-col>
    <v-col
      v-else-if="fieldText"
      :cols="textFieldCol"
      class="ocis-pt-2-and-half"
    >
      <v-tooltip
        :model-value="showHints"
        :disabled="!showHints"
        offset="20"
        activator="parent"
      >
        <template #activator="{}">
          <v-text-field
            ref="refTextfield"
            :append-inner-icon="innerIcon"
            :model-value="modelValue"
            :placeholder="placeholder || title"
            single-line
            :min="minVal"
            :max="maxVal"
            density="compact"
            variant="solo"
            :rules="allRules"
            :label="label"
            :hide-details="hideDetails"
            :type="textfieldType"
            :readonly="readonly"
            color="primary"
            :autocomplete="
              type === 'password' || type === 'passwordConfirm'
                ? 'new-password'
                : 'off'
            "
            @click:append-inner="show = !show"
            @update:model-value="updateValue"
            @blur="handleBlur"
          />
        </template>
        <InputHint :show-hint="showHints" :hints="inputHints" />
      </v-tooltip>
    </v-col>
    <slot />
  </v-row>
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';
</style>
