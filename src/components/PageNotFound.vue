<template>
  <div class="background">
    <v-container class="text-center">
      <!-- <logoView /> -->
      <v-row class="justify-center">
        <v-dialog :model-value="true" persistent width="300" scrim="false">
          <v-card>
            <v-card-text class="text-h5 text-center pt-6 pb-6">
              {{ $t('error.page.not.found') }}
            </v-card-text>
            <v-card-text class="py-0 text-center">
              {{ $t('error.system.oops') }}
            </v-card-text>
            <v-card-text class="text-center">
              <v-row>
                <v-col cols="12" class="md4 offset-md4">
                  <v-btn block class="contained-btn ml-0" @click="home">
                    {{ $t('basic.system.back.home') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// import logoView from '@/components/common/LogoView.vue';
import { useRouter } from 'vue-router';

import PAGE_TYPES from '@/constants/PAGE_TYPES';

const router = useRouter();

const home = () => {
  void router.push({ name: PAGE_TYPES.HOME });
};
</script>

<style lang="scss" scoped>
.background {
  height: 100%;
  background-size: cover;
}
</style>
