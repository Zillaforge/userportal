<script setup lang="ts">
import { ref, watch } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';

defineEmits(['update-value']);

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  command: {
    type: String,
    default: '',
  },
});

const newCommand = ref('');
watch(showDialog, newVal => {
  if (newVal) {
    newCommand.value = props.command;
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.edit.type', { type: $t('label.cmd') })"
    :disable-submit="!newCommand"
    :submit-callback="() => $emit('update-value', newCommand)"
  >
    <v-row no-gutters class="mt-4">
      <v-col cols="3" class="ocis-form-title">{{ $t('label.cmd') }}</v-col>
      <v-col cols="9">
        <TextareaComponent v-model="newCommand" />
      </v-col>
    </v-row>
  </CommonDialog>
</template>
