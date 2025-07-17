<script lang="ts" setup>
import { ref, watch } from 'vue';

import TextFieldWithHint from './common/TextFieldWithHint.vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import i18n from '@/i18n';
import validation from '@/utils/validation';

const { t } = i18n.global;

const showDialog = defineModel<boolean>('show', { required: true });

defineEmits(['submit']);

const cidr = ref('');
const selectedPermission = ref('');
const permissionOptions = ref([
  { name: t('label.permission.readAndWrite'), value: 'rw' },
  { name: t('label.permission.onlyRead'), value: 'ro' },
]);
const formError = ref('');

watch(showDialog, val => {
  if (val) {
    cidr.value = '';
    selectedPermission.value = 'rw';
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.add.type', { type: $t('label.permission') })"
    :cancel-callback="() => (showDialog = false)"
    :submit-callback="
      () => $emit('submit', { cidr, level: selectedPermission })
    "
    :disable-submit="Object.keys(formError).length > 0 || !cidr"
    disable-auto-close-dialog
  >
    <v-row>
      <v-col cols="12">
        <TextFieldWithHint
          v-model="cidr"
          :title="$t('basic.cidr')"
          :label="'eg. 10.0.0.0/24'"
          required
          :rules="[validation.ruleValidCidr]"
          @form-error="errMsg => (formError = errMsg)"
        />
      </v-col>
      <v-col cols="12">
        <SelectWithHint
          v-model="selectedPermission"
          :title="$t('label.permission')"
          :items="permissionOptions"
          required
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>
