<script setup lang="ts">
import { ref, watch } from 'vue';

import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import i18n from '@/i18n';

const showDialog = defineModel<boolean>('show', { required: true });
const { t } = i18n.global;
const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  submitCallback: {
    type: Function,
    default: () => {},
  },
});

const approve = ref<boolean>(false);
const submitAction = () => {
  props.submitCallback?.(approve.value);
};

watch(showDialog, val => {
  if (val) {
    approve.value = false;
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="
      t('dialog.review.title', {
        resource: `${t('services.application')} `,
      })
    "
    :submit-callback="submitAction"
  >
    <v-row no-gutters>
      <v-row no-gutters>
        <v-col cols="3" class="pa-0 ocis-form-title">
          {{ $t('label.name') }}
        </v-col>
        <v-col cols="9" class="pa-0 align-content-center">
          {{ item.name }}
        </v-col>
      </v-row>
      <v-col cols="12" class="pa-0">
        <RadioButtonSwitch
          :title="$t('vm.floating.ip.review')"
          :options="[
            { label: $t('basic.accept'), value: true },
            { label: $t('basic.reject'), value: false },
          ]"
          :init-value="approve"
          is-required
          @selected="value => (approve = value)"
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>
