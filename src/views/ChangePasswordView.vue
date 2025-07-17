<template>
  <UiContainer>
    <v-row class="ocis-main-content padding-content">
      <TitleComp :title="$t('appBar.account.changePw')" />
      <v-col>
        <v-card>
          <v-card-text class="ml-4 mt-4">
            <v-form v-model="valid">
              <TextFieldWithHint
                v-model="password"
                :title="$t('basic.password')"
                type="password"
                :text-field-col="8"
                required
              />
              <TextFieldWithHint
                v-model="passwordComfirm"
                class="mt-6"
                :title="$t('basic.password.confirm')"
                type="passwordConfirm"
                :confirm-value="password"
                :text-field-col="8"
                required
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer class="ma-4" />
            <TextBtn :text="$t('basic.cancel')" @click="cancel" />
            <TextBtn
              :text="$t('basic.ok')"
              :disabled="!valid"
              @click="submit"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </UiContainer>
</template>

<script lang="ts" setup>
import { useUser } from '@/store';
import { ref } from 'vue';

import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import router from '@/router';

const { changePassword } = useUser();
const password = ref('');
const passwordComfirm = ref('');
const valid = ref(true);

const submit = () => {
  changePassword(password.value);
};

const cancel = () => {
  void router.push({ name: PAGE_TYPES.HOME });
};
</script>

<style lang="scss" scoped>
.card-close-to-edge {
  width: 100%;
  height: 90%;
  padding: 1px;
}
.frame-content {
  height: 100%;
  width: 100%;
}

.padding-content {
  padding-left: 20%;
  padding-right: 20%;
}
</style>
