<script setup lang="ts">
import { useUser } from '@/store';
import { computed, ref, watch } from 'vue';

import QrcodeVue from 'qrcode.vue';

import { useDisplay } from 'vuetify';

import {
  fetchMfaInfo,
  enableMfaAuth,
  makeApiCall,
  disableMfaAuth,
} from '@/api';
import appstoreSvg from '@/assets/images/mfa/appstore.svg';
import googlePlaySvg from '@/assets/images/mfa/googleplay.svg';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import i18n from '@/i18n';

const showDialog = defineModel<boolean>('show', { required: true });

const { t } = i18n.global;
const { xs } = useDisplay();
const userStore = useUser();

const dialogPage = ref(0);
const originMfaEnable = ref(false);
const mfaEnable = ref(false);
const mfaUrl = ref('');
const mfaToken = ref('');
const mfaSecret = ref('');
const verifyCode = ref('');
const showErrorMessage = ref(false);

const userInfo = computed(() => userStore.getUserInfo);

const dialogTitle = computed(() =>
  dialogPage.value === 0
    ? t('mfa.dialog.title')
    : mfaEnable.value
      ? dialogPage.value === 3
        ? t('mfa.dialog.enable.finish.title')
        : t('mfa.dialog.enable.title')
      : t('mfa.dialog.disable.title')
);

const submitBtnText = computed(() =>
  dialogPage.value === 0 || dialogPage.value === 3
    ? t('basic.ok')
    : mfaEnable.value
      ? dialogPage.value === 2
        ? t('mfa.dialog.enable.btn')
        : t('basic.next')
      : t('basic.ok')
);

const cancelBtnText = computed(() =>
  dialogPage.value === 2 && mfaEnable.value
    ? t('basic.back')
    : t('basic.cancel')
);

const disableSubmit = computed(() =>
  dialogPage.value === 2 && mfaEnable.value
    ? verifyCode.value.length !== 6
    : false
);

const initValue = () => {
  dialogPage.value = 0;

  mfaUrl.value = '';
  mfaToken.value = '';
  mfaSecret.value = '';
  verifyCode.value = '';
};

const fetchData = async () => {
  await userStore.fetchUserSelfInfo(userStore.getToken, true, false);
  originMfaEnable.value = userInfo.value?.mfa ?? false;
  mfaEnable.value = userInfo.value?.mfa ?? false;
};

const handleCancel = () => {
  dialogPage.value === 2 && mfaEnable.value
    ? (dialogPage.value = 1)
    : (showDialog.value = false);
};

const handleSubmit = async () => {
  if (mfaEnable.value === originMfaEnable.value) {
    showDialog.value = false;
    return;
  }

  if (dialogPage.value === 0) {
    dialogPage.value = 1;
  } else if (dialogPage.value === 1) {
    if (mfaEnable.value) {
      makeApiCall({
        apiCallFn: fetchMfaInfo,
        skipProgress: true,
        successCallback: res => {
          mfaSecret.value = res.mfaSecret;
          mfaToken.value = res.mfaToken;
          mfaUrl.value = res.url;
          dialogPage.value = 2;
        },
      });
    } else {
      // disable
      makeApiCall({
        apiCallFn: disableMfaAuth,
        progressMessage: t('mfa.dialog.disable.progress'),
        successCallback: () => {
          void fetchData();
          showDialog.value = false;
        },
      });
    }
  } else if (dialogPage.value === 2) {
    // enable
    makeApiCall({
      apiCallFn: enableMfaAuth,
      payload: {
        verificationCode: verifyCode.value,
        mfaSecret: mfaSecret.value,
        mfaToken: mfaToken.value,
      },
      skipErrorDialog: true,
      progressMessage: t('mfa.dialog.enable.progress'),
      successCallback: () => {
        void fetchData();
        dialogPage.value = 3;
      },
      errorCallback: () => {
        showErrorMessage.value = true;
      },
    });
  }
};

const gotoLink = (link: string) => {
  return window.open(link, '_blank', 'noopener, noreferrer');
};

watch(showDialog, val => {
  if (val) {
    initValue();
    void fetchData();
  }
});

watch(verifyCode, () => {
  showErrorMessage.value = false;
});
</script>

<template>
  <div>
    <CommonDialog
      v-model:show="showDialog"
      :title="dialogTitle"
      :show-cancel-btn="true"
      :submit-btn-text="submitBtnText"
      :submit-btn-highlight="dialogPage === 2 && mfaEnable"
      :submit-callback="handleSubmit"
      :disable-submit="disableSubmit"
      :cancel-btn-text="cancelBtnText"
      :cancel-callback="handleCancel"
      disable-auto-close-dialog
    >
      <v-row v-if="dialogPage === 0" no-gutters>
        <v-col cols="12">
          <div class="step-title">
            {{ $t('mfa.dialog.step0.title') }}
          </div>
          <div>
            {{ $t('mfa.dialog.step0.message') }}
          </div>
        </v-col>

        <v-col cols="12" class="mt-10">
          <RadioButtonSwitch
            :title="$t('mfa.dialog.setting.title')"
            :options="[
              { label: $t('basic.enabled'), value: true },
              { label: $t('basic.disabled'), value: false },
            ]"
            :init-value="mfaEnable"
            is-required
            @selected="(value: boolean) => (mfaEnable = value)"
          />
        </v-col>
      </v-row>
      <v-row v-else-if="dialogPage === 1" no-gutters>
        <v-col v-if="mfaEnable" cols="12">
          <div class="mb-6">{{ $t('mfa.dialog.step1.description') }}</div>
          <div class="step-title">
            {{ $t('mfa.dialog.step1.title') }}
          </div>
          <div>
            {{ $t('mfa.dialog.step1.message') }}
          </div>
          <v-card class="ma-6 border">
            <v-card-title class="step-title text-center">
              {{ $t('mfa.dialog.authenticator.title') }}
            </v-card-title>
            <v-row no-gutters class="pb-5">
              <v-col cols="12" class="text-center" :class="{ 'px-7': xs }">
                <v-img
                  :src="appstoreSvg"
                  class="authenticator-image d-inline-block"
                  :class="{
                    'mr-2': !xs,
                    'mb-3': xs,
                  }"
                  @click="
                    gotoLink(
                      'https://apps.apple.com/tw/app/google-authenticator/id388497605'
                    )
                  "
                />
                <v-img
                  :src="googlePlaySvg"
                  class="authenticator-image d-inline-block"
                  :class="{
                    'ml-2': !xs,
                  }"
                  @click="
                    gotoLink(
                      'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'
                    )
                  "
                />
              </v-col>
            </v-row>
          </v-card>
          <div>{{ $t('mfa.dialog.step1.extra') }}</div>
        </v-col>
        <v-col v-else cols="12">
          {{ $t('mfa.dialog.disable.description') }}
        </v-col>
      </v-row>
      <v-row v-else-if="dialogPage === 2" no-gutters>
        <v-col v-if="mfaEnable" cols="12">
          <div class="step-title">
            {{ $t('mfa.dialog.step2.title') }}
          </div>
          <div>
            <div>{{ $t('mfa.dialog.step2.message') }}</div>
          </div>

          <div class="qrcode pt-1">
            <QrcodeVue :value="mfaUrl" :size="180" level="L" />
          </div>
          <div class="text-center mb-4">{{ mfaSecret }}</div>

          <div class="step-title">
            {{ $t('mfa.dialog.step3.title') }}
          </div>
          <div>
            {{ $t('mfa.dialog.step3.message') }}
          </div>
          <TextFieldWithHint
            v-model="verifyCode"
            :text-field-col="12"
            :placeholder="$t('mfa.dialog.verify.code')"
            hide-details
            @keypress.enter="handleSubmit"
          />
          <div v-if="showErrorMessage" class="mt-1 ocis-text-alert">
            {{ $t('mfa.verify.error') }}
          </div>
          <div class="mt-4">{{ $t('mfa.dialog.step3.extra') }}</div>
        </v-col>
      </v-row>
      <v-row v-else-if="dialogPage === 3" no-gutters>
        <v-col v-if="mfaEnable" cols="12">
          <div class="step-title">
            {{ $t('mfa.dialog.finish.title') }}
          </div>
          <div>
            {{ $t('mfa.dialog.finish.message') }}
          </div>
        </v-col>
      </v-row>
    </CommonDialog>
  </div>
</template>
<style lang="scss" scoped>
.step-title {
  font-size: 16px !important;
  font-weight: bold !important;
  padding-bottom: 8px !important;
}
.qrcode {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(var(--v-theme-white-color));
  width: 100%;
  height: 200px;
}
.authenticator-image {
  cursor: pointer;
  width: 200px;
  height: 56px;
}
</style>
