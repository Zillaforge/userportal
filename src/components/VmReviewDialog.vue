<script lang="ts">
import { computed, ref, watch } from 'vue';

import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import i18n from '@/i18n';

export default {
  name: 'VmReviewDialog',
};
</script>

<script setup lang="ts">
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
  type: {
    type: String,
    default: 'vm',
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

const title = computed(() => {
  switch (props.type) {
    case 'vm':
      return t('dialog.review.title', {
        resource: t('services.virtualMachine'),
      });
    case 'fip':
      return t('dialog.review.title', {
        resource: t('vm.network.floating.ip'),
      });
    case 'asg':
      return t('dialog.review.title', {
        resource: t('services.autoScaling'),
      });
    default:
      return '';
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="title"
    :submit-callback="submitAction"
  >
    <v-row no-gutters>
      <v-row v-if="type === 'vm'" no-gutters>
        <v-col cols="3" class="pa-0 ocis-form-title">
          {{ $t('label.name') }}
        </v-col>
        <v-col cols="9" class="pa-0 align-content-center">
          {{ item.name }}
        </v-col>
      </v-row>
      <v-row v-if="type === 'fip'" no-gutters>
        <v-col cols="3" class="pa-0 ocis-form-title">
          {{ $t('vm.floating.ip.associate') }}
        </v-col>
        <v-col cols="9" class="pa-0 align-content-center">
          {{ item.device_name }}
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
