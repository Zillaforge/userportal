<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.edit.type', { type: $t('basic.desc') })"
    :submit-callback="() => $emit('update-value', dialogDesc)"
  >
    <v-row v-if="itemName" no-gutters>
      <v-col cols="3" class="ocis-form-title">
        {{ $t('label.name') }}
      </v-col>
      <v-col :cols="9" class="ocis-form-title">
        {{ itemName }}
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-4">
      <v-col cols="3" class="ocis-form-title">{{ $t('basic.desc') }}</v-col>
      <v-col cols="9">
        <TextareaComponent v-model="dialogDesc" />
      </v-col>
    </v-row>
  </CommonDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';

defineEmits(['update-value']);

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  itemName: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
});

const dialogDesc = ref('');
watch(showDialog, newVal => {
  if (newVal) {
    dialogDesc.value = props.description;
  }
});
</script>
