<script setup lang="ts">
import { ref, computed } from 'vue';

import type { ExternalLinkItem } from '@/interfaces/LayoutItemInterface';

import ExternalLink from '@/components/common/ExternalLink.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import IconBtn from '@/components/common/button/IconBtn.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';

interface ColumnInfo {
  type: 'text-input' | 'select';
  colsNumber: number;
  header?: string;
  headerExternalLink?: ExternalLinkItem;
  placeholder?: string;
  dataType?: 'name' | 'password' | 'passwordConfirm' | 'number';
  selectItems?: any[];
  required?: boolean;
  returnObject?: boolean;
}

const props = defineProps({
  params: {
    type: Array<Record<string, any>>,
    required: true,
  },
  title: {
    type: String,
    default: undefined,
  },
  titleCols: {
    type: Number,
    default: 3,
  },
  required: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: '',
  },
  columnInfos: {
    type: Array<ColumnInfo>,
    required: true,
  },
  disableAddItem: {
    type: Boolean,
    default: false,
  },
  disableDeleteItem: {
    type: Boolean,
    default: false,
  },
  inputRules: {
    type: Array<(val: string) => string | boolean>,
    default: undefined,
  },
});

const showHeader = computed(() => {
  return props.columnInfos.find(info => info.header);
});

const isFormValid = ref(false);
const refForm = ref<any>(null);
const keyList = computed(() => Object.keys(props.params[0] || {}));

const emit = defineEmits(['addNewItem', 'deleteItem', 'formError']);
const hasErrors = computed((): boolean => {
  if (!props.required && props.params.length === 0) {
    return false;
  }
  return !isFormValid.value;
});
const validate = () => {
  refForm.value?.validate().then((res: any) => {
    emit('formError', res);
  });
};
defineExpose({ hasErrors, validate });
</script>

<template>
  <div>
    <div v-if="params.length">
      <v-form ref="refForm" v-model="isFormValid">
        <v-row v-if="showHeader" no-gutters class="align-center">
          <v-col v-if="title !== undefined" :cols="titleCols">
            <div class="ocis-pt-2-and-half">
              <span :class="{ 'ocis-input-required': required }">
                {{ title }}
              </span>
              <InfoTooltip v-if="tooltip" :tooltip="tooltip" />
            </div>
          </v-col>
          <v-col
            v-for="(columnInfo, index) in columnInfos"
            :key="index"
            :cols="columnInfo.colsNumber"
            :class="{
              'pl-2': index > 0,
              'ocis-pt-2-and-half': true,
            }"
          >
            <span>{{ columnInfo.header }}</span>
            <ExternalLink
              v-if="columnInfo.headerExternalLink"
              :link="columnInfo.headerExternalLink"
            />
          </v-col>
        </v-row>
        <v-row v-for="(param, index) in params" :key="index" no-gutters>
          <v-col v-if="title !== undefined" :cols="titleCols">
            <div v-if="!showHeader && index === 0" class="ocis-form-title">
              <span :class="{ 'ocis-input-required': required }">
                {{ index === 0 ? title : '' }}
              </span>
              <InfoTooltip v-if="tooltip" :tooltip="tooltip" />
            </div>
          </v-col>
          <v-col
            v-for="(columnInfo, columnIndex) in columnInfos"
            :key="columnIndex"
            :cols="columnInfo.colsNumber"
          >
            <TextFieldWithHint
              v-if="columnInfo.type === 'text-input'"
              v-model="param[keyList[columnIndex]]"
              :placeholder="columnInfo.placeholder"
              :class="{ 'pl-2': columnIndex > 0 }"
              :type="columnInfo.dataType ?? undefined"
              :text-field-col="12"
              :label="columnInfo.header"
              :required="columnInfo.required ?? required"
              :show-hint="false"
              :rules="inputRules"
            />
            <SelectWithHint
              v-else-if="columnInfo.type === 'select'"
              v-model="param[keyList[columnIndex]]"
              :class="{ 'pl-2': columnIndex > 0 }"
              :items="columnInfo.selectItems || []"
              :selection-cols="12"
              :input-label="columnInfo.header"
              :required="columnInfo.required ?? required"
              :show-hint="false"
              :return-object="columnInfo.returnObject"
            />
          </v-col>
          <v-col cols="1" class="pt-2">
            <IconBtn
              v-if="!disableDeleteItem"
              icon="mdi-delete-outline"
              :disabled="required && params.length === 1"
              @click="emit('deleteItem', index)"
            />
          </v-col>
        </v-row>
      </v-form>
    </div>
    <v-row v-if="!disableAddItem" no-gutters class="mb-4">
      <v-col v-if="title !== undefined" :cols="titleCols">
        <div v-if="!params.length" class="ocis-pt-2-and-half">
          <span :class="{ 'ocis-input-required': required }">
            {{ title }}
          </span>
          <InfoTooltip v-if="tooltip" :tooltip="tooltip" />
        </div>
      </v-col>
      <OutlinedBtn :text="$t('basic.add')" @click="emit('addNewItem')" />
    </v-row>
  </div>
</template>
