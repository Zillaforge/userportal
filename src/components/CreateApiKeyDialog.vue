<script setup lang="ts">
import { useGlobal } from '@/store';
import { ref, watch } from 'vue';

import { makeApiCall, createApiKey } from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import DialogAlert from '@/components/common/DialogAlert.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import i18n from '@/i18n';

const showDialog = defineModel<boolean>('show', { required: true });
const { triggerSnackbar } = useGlobal();
const { t } = i18n.global;

const description = ref<string>('');
const isCreated = ref<boolean>(false);
const token = ref<string>('');
const tokenId = ref<string>('');

watch(showDialog, val => {
  if (val) {
    isCreated.value = false;
    token.value = '';
    tokenId.value = '';
    description.value = '';
  }
});

const execCallback = async () => {
  if (!isCreated.value) {
    // Create key
    makeApiCall({
      apiCallFn: createApiKey,
      payload: description.value,
      successCallback: (res: any) => {
        isCreated.value = true;
        token.value = res.token;
        tokenId.value = res.id;
      },
    });
  } else {
    // download key
    download(`appKey_${tokenId.value}`, token.value);
  }
};

const download = (filename: string, text: string) => {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
  );
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const copyToken = (token: string) => {
  void navigator.clipboard.writeText(token);
  triggerSnackbar({ content: t('basic.copied') });
};
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('basic.create.type', { type: $t('keyMgnt.api') })"
    :cancel-btn-text="isCreated ? $t('basic.close') : $t('basic.cancel')"
    :submit-btn-text="isCreated ? $t('basic.download') : $t('basic.create')"
    :disable-submit="!description"
    :submit-callback="execCallback"
    :cancel-callback="() => (showDialog = false)"
    disable-auto-close-dialog
  >
    <div>
      <div class="mb-8">
        <TextFieldWithHint
          v-model="description"
          :title="$t('label.name')"
          :placeholder="$t('label.name')"
          required
          hide-details
          :readonly="isCreated"
        />
        <TextFieldWithHint
          v-if="isCreated"
          v-model="token"
          :title="$t('keyMgnt.key')"
          :placeholder="$t('keyMgnt.key')"
          hide-details
          readonly
          ignore-rules
          type="password"
        >
          <div class="ma-auto">
            <v-icon @click="copyToken(token)">mdi-content-copy</v-icon>
          </div>
        </TextFieldWithHint>
      </div>
      <v-row v-if="isCreated">
        <v-col cols="12">
          <DialogAlert :message="$t('keyMgnt.api.warning')" />
        </v-col>
      </v-row>
    </div>
  </CommonDialog>
</template>
