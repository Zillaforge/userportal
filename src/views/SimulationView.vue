<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content">
      <TitleComp :title="$t('simulated.user')" :link-url="linkUrl" />
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <RadioButtonSwitch
              :init-value="enableSimulationUser"
              :title="$t('s3.accessControl')"
              :options="[
                { label: $t('basic.enabled'), value: true },
                { label: $t('basic.disabled'), value: false },
              ]"
              :tooltip="$t('simulated.user.tooltip')"
              is-required
              @selected="val => (enableSimulationUser = val)"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <TextBtn :text="$t('basic.cancel')" @click="cancelAction" />
            <TextBtn :text="$t('basic.ok')" @click="submitAction" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </UiContainer>
</template>

<script setup lang="ts">
import { useProject, useGlobal, useUser } from '@/store';
import { computed, watch, onMounted, ref } from 'vue';

import { updateUserInfo, makeApiCall } from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import router from '@/router';

const { t } = i18n.global;
const projectStore = useProject();
const { uiShowDialog } = useGlobal();
const userStore = useUser();

const enableSimulationUser = ref(false);

const projectId = computed(() => projectStore.getCurrentProject?.id);

const linkUrl = computed(() => {
  return Document.SIMULATION;
});

onMounted(() => {
  void fetchData();
});

const fetchData = async () => {
  await userStore.fetchUserSelfInfo(userStore.getToken);
  enableSimulationUser.value =
    userStore.getUserInfo.extra?.enableSimulationUser ?? false;
};

const cancelAction = () => {
  void router.push({ name: PAGE_TYPES.HOME });
};

const submitAction = () => {
  if (enableSimulationUser.value) {
    uiShowDialog({
      title: t('simulated.user.enable.dialog.title'),
      message: t('simulated.user.enable.dialog.message'),
      callback: () => {
        updatePermission();
      },
    });
  } else {
    updatePermission();
  }
};

const updatePermission = () => {
  makeApiCall({
    apiCallFn: updateUserInfo,
    payload: {
      extra: {
        enableSimulationUser: enableSimulationUser.value,
      },
    },
    successCallback: () => {
      void fetchData();
    },
  });
};

watch(projectId, fetchData);
</script>

<style lang="scss" scoped></style>
