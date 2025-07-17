<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('basic.create.type', { type: $t('s3.bucket') })"
    :disable-submit="disableCreate"
    :submit-callback="() => $emit('create-bucket', bucketName)"
  >
    <TextFieldWithHint
      v-model="bucketName"
      :title="$t('label.name')"
      :required="true"
      :rules="[
        validation.ruleFirstAlphabet(),
        validation.ruleOnlyLowercaseNumberMinusDot(),
        validation.ruleLastLowercaseNumber(),
        validation.ruleInputLength(
          $t('form.inputLength', { min: 3, max: 63 }),
          63,
          3
        ),
      ]"
      :hints="[hints.firstAlphabetHint, hints.lowercaseNumberMinusDotHint]"
      @form-error="error = $event"
    />
  </CommonDialog>
</template>

<script setup lang="ts">
import { computed, ref, type Ref, watch } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import hints from '@/utils/hints';
import validation from '@/utils/validation';

const bucketName: Ref<string> = ref('');
const error: Ref<string[]> = ref([]);

defineEmits(['create-bucket']);

const showDialog = defineModel<boolean>('show', { required: true });

const disableCreate = computed(() => {
  return Boolean(!bucketName.value || error.value.some(val => !!val));
});
watch(showDialog, newVal => {
  if (newVal) {
    bucketName.value = 'bucket' + Math.floor(Date.now() / 1000);
  }
});
</script>
