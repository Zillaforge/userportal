<script lang="ts" setup>
import { useGlobal, useUser, usePortalConfig, useProject } from '@/store';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { StatusCodes as HttpStatus } from 'http-status-codes';

import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import { isPublicSite, toAdminPanel } from '@/utils/utils';

const { t } = i18n.global;

const userStore = useUser();
const globalStore = useGlobal();
const projectStore = useProject();
const router = useRouter();
const $isPublicSite = isPublicSite();
const { portalConfig } = usePortalConfig();

const account = ref('');
const password = ref('');
const showPassword = ref(false);
const checkSource = ref(true);

const rules = {
  required: (value: string) => !!value || 'Required.',
};

const login = async () => {
  if (account.value === '' && password.value === '') {
    return;
  }
  const loginResult = await userStore
    .login({ account: account.value, password: password.value })
    .catch(_err => {
      return false;
    });
  if (
    loginResult.status !== HttpStatus.OK &&
    loginResult.status !== HttpStatus.RESET_CONTENT
  ) {
    globalStore.uiShowDialog({
      title: t('basic.fail.action', { action: t('action.login') }),
      message: t('error.message.login'),
      width: 400,
      hideCancelBtn: true,
    });
  } else if (loginResult.status === HttpStatus.RESET_CONTENT) {
    window.location.href = loginResult.headers?.location;
  } else {
    await projectStore.fetchMyProjectList();
    const projectList = projectStore.getProjectList;
    if (projectList.length === 0) {
      globalStore.uiShowDialog({
        title: t('basic.fail.action', { action: t('action.login') }),
        message: t('error.message.noProject'),
        width: 400,
        hideCancelBtn: true,
        callback: () => {
          void userStore.logout();
        },
      });
      return;
    } else if (
      projectList.length === 1 &&
      projectList[0].name === 'administrator'
    ) {
      toAdminPanel();
      return;
    }
    void router.push({ name: PAGE_TYPES.HOME });
  }
};

const gotoIServiceLogin = () => {
  window.location.href = `${portalConfig.API_URL}/saml/nchciservice`;
};
</script>

<template>
  <v-card theme="myCustomLightTheme" class="login-card" width="500">
    <div class="text-center pt-16 px-7 login-header">
      <div class="logo-container justify-center align-center pb-8 pb-16">
        <v-row no-gutters>
          <v-img :src="`/images/login_logo_${$i18n.locale}.svg`" />
        </v-row>
        <div v-show="!$isPublicSite" class="pt-4 text-center">
          <v-chip class="chip pa-4" density="comfortable" variant="text">
            {{ $t('basic.private.site') }}
          </v-chip>
        </div>
      </div>
    </div>
    <div v-if="checkSource" class="px-7 py-11 bg-white h-100">
      <v-btn class="login-btn w-100 mb-9" @click="gotoIServiceLogin">
        {{ $t('action.login.user', { type: 'iService ' }) }}
      </v-btn>
      <v-btn class="login-btn other-btn w-100" @click="checkSource = false">
        {{ $t('action.login.user', { type: $t('basic.other') }) }}
      </v-btn>
    </div>
    <div v-else class="px-7 pt-6 pb-4 bg-white h-100">
      <v-icon
        icon="mdi-keyboard-backspace"
        class="mb-6"
        @click="checkSource = true"
      />
      <div class="mb-6">
        <div class="ocis-input-required pb-2">
          {{ $t('label.account.type') }}
        </div>
        <v-text-field
          v-model="account"
          class="text-input"
          :rules="[rules.required]"
          :placeholder="$t('label.account.hint')"
          density="compact"
          variant="solo"
          hide-details
          @keyup.enter="login"
        />
      </div>
      <div>
        <div class="ocis-input-required pb-2">
          {{ $t('label.password.type') }}
        </div>
        <v-text-field
          v-model="password"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[rules.required]"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="$t('label.password.hint')"
          density="compact"
          variant="solo"
          focused
          hide-details
          @keyup.enter="login"
          @click:append-inner="showPassword = !showPassword"
        />
      </div>
      <v-btn
        class="login-btn w-100 mt-12 mb-7"
        :disabled="!password || !account"
        @click="login"
      >
        {{ $t('action.login') }}
      </v-btn>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.login-card {
  background: #f5f7f8 0% 0% no-repeat padding-box;
  border: 0.5px solid #c1c1c1;
  border-radius: 8px;
  opacity: 1;
  .login-header {
    background-color: #282626;
  }
  .logo-container {
    padding-top: 0px;
  }
  .login-btn {
    color: #ffffff;
    height: 48px;
    background: #0a61ff;
    border-radius: 8px;
    opacity: 1;
    &:disabled {
      background: #00000029 0% 0% no-repeat padding-box;
    }
    &.other-btn {
      background: #5f21a8ed;
    }
  }
  .login-title {
    font-size: 42px !important;
    // color: #0f1741;
    color: #ffffff;
  }
  .login-subtitle {
    font-size: 30px !important;
    color: #00cff8;
  }
  .chip {
    background-color: white;
    font-size: 18px !important;
    font-weight: bold;
    color: #dc0d15;
  }
}
</style>
