<template>
  <v-container class="login-view d-flex justify-center align-center" fluid>
    <MfaVerifyDialog v-if="mfaToken" />
    <LoginDialog v-else />
  </v-container>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';

import LoginDialog from '@/components/LoginDialog.vue';
import MfaVerifyDialog from '@/components/MfaVerifyDialog.vue';

const route = useRoute();

const mfaToken = route.query?.mfa_token;
</script>

<style scoped>
.login-view {
  height: 100%;
  background-image: url('../assets/images/loading_page_bg.png');
  background-size: cover;
}
</style>
