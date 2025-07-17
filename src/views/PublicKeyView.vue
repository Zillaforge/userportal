<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content">
      <TitleComp :title="$t('keyMgnt.public')" :link-url="linkUrl" />
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <TextareaComponent v-model="publicKey" auto-grow />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <TextBtn :text="$t('basic.reset')" @click="fetchData" />
            <TextBtn :text="$t('keyMgnt.public.update')" @click="updateKey" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </UiContainer>
</template>

<script setup lang="ts">
import { useProject, useGlobal } from '@/store';
import { computed, watch, onMounted, ref } from 'vue';

import { fetchPublicKeyList, updatePublicKey, makeApiCall } from '@/api';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';
import Document from '@/constants/Document';
import i18n from '@/i18n';

const { t } = i18n.global;
const projectStore = useProject();
const { uiShowDialog } = useGlobal();

const publicKey = ref('');

const projectId = computed(() => projectStore.getCurrentProject?.id);

const linkUrl = computed(() => {
  return Document.KEY;
});

onMounted(() => {
  fetchData();
});

const fetchData = () => {
  makeApiCall({
    apiCallFn: fetchPublicKeyList,
    successCallback: res => {
      publicKey.value = res;
    },
  });
};

const updateKey = () => {
  uiShowDialog({
    title: t('keyMgnt.public.update.title'),
    callback: () => {
      makeApiCall({
        apiCallFn: updatePublicKey,
        payload: publicKey.value,
        successCallback: () => {
          fetchData();
        },
      });
    },
  });
};

watch(projectId, fetchData);
</script>

<style lang="scss" scoped></style>
