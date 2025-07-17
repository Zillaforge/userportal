<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('basic.create.type', { type: $t('basic.folder') })"
    :disable-submit="disableCreate"
    :submit-callback="() => $emit('create-folder', folderName)"
  >
    <TextFieldWithHint
      v-model="folderName"
      :title="$t('label.name')"
      :required="true"
    />
  </CommonDialog>
</template>

<script setup lang="ts">
import { computed, ref, type Ref, watch } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';

const folderName: Ref<string> = ref('');
const error: Ref<string> = ref('');

defineEmits(['create-folder']);

const showDialog = defineModel<boolean>('show', { required: true });

const disableCreate = computed(() => {
  return Boolean(!folderName.value || error.value);
});

watch(showDialog, newVal => {
  if (newVal) {
    folderName.value = 'folder' + Math.floor(Date.now() / 1000);
  }
});
</script>
