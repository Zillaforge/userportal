<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { makeApiCall, verifyMfaAuth } from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';

const route = useRoute();
const router = useRouter();
const mfaToken = ref('');
const verifyCode = ref('');
const showErrorMessage = ref(false);

const disableSubmit = computed(() => verifyCode.value.length !== 6);

onMounted(() => {
  initValue();
});

const initValue = () => {
  mfaToken.value = '';
  verifyCode.value = '';
};

const handleSubmit = async () => {
  // verify
  makeApiCall({
    apiCallFn: verifyMfaAuth,
    payload: {
      verificationCode: verifyCode.value,
      mfaToken: route.query?.mfa_token,
    },
    skipErrorDialog: true,
    successCallback: res => {
      void router.push({ name: PAGE_TYPES.HOME });
    },
    errorCallback: () => {
      showErrorMessage.value = true;
    },
  });
};

watch(verifyCode, () => {
  showErrorMessage.value = false;
});
</script>

<template>
  <div>
    <CommonDialog
      :show="true"
      :title="$t('mfa.verify.dialog.title')"
      :submit-callback="handleSubmit"
      :disable-submit="disableSubmit"
      :show-cancel-btn="false"
      disable-auto-close-dialog
    >
      <v-row no-gutters>
        <v-col cols="12">
          {{ $t('mfa.verify.dialog.message') }}
        </v-col>
        <TextFieldWithHint
          v-model="verifyCode"
          :text-field-col="12"
          :placeholder="$t('mfa.dialog.verify.code')"
          hide-details
          @keypress.enter="handleSubmit"
        />
        <v-col v-if="showErrorMessage" cols="12" class="mt-1 ocis-text-alert">
          {{ $t('mfa.verify.error') }}
        </v-col>
      </v-row>
    </CommonDialog>
  </div>
</template>
