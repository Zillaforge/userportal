<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.edit.type', { type: $t('basic.insert') + ' Headers' })"
    :submit-callback="() => $emit('update-value', dialogValue)"
  >
    <v-row no-gutters>
      <TextFieldWithHint
        :title="$t('basic.insert') + ' Headers'"
        :text-field-col="6"
        :field-text="false"
      >
        <div class="ml-n3 d-flex">
          <v-checkbox
            v-model="dialogValue['X-Forwarded-For']"
            class="pr-6"
            color="primary"
            label="X-Forwarded-For"
          />
          <v-checkbox
            v-model="dialogValue['X-Forwarded-Port']"
            class="pr-6"
            color="primary"
            label="X-Forwarded-Port"
          />
          <v-checkbox
            v-model="dialogValue['X-Forwarded-Proto']"
            color="primary"
            label="X-Forwarded-Proto"
          />
        </div>
      </TextFieldWithHint>
    </v-row>
  </CommonDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';

defineEmits(['update-value']);

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  insertHeaders: {
    type: Object as PropType<Record<string, any>>,
    default: () => {},
  },
});

const dialogValue: Record<string, any> = ref({});
watch(showDialog, newVal => {
  if (newVal) {
    Object.keys(props.insertHeaders).forEach(key => {
      dialogValue.value[key] = props.insertHeaders[key] === 'true';
    });
  }
});
</script>
