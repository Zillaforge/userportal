<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content">
      <TitleComp :title="$t('s3.plugin')" :link-url="linkUrl" />
      <v-col cols="12" class="my-4">
        <v-card class="px-3 py-2">
          {{ $t('keyMgnt.s3.info', { toolName: pluginInfo.name }) }}
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card class="px-3 py-2">
          <v-card-title class="text-h5 pa-0">
            {{ $t('s3.plugin.connection.info') }}
          </v-card-title>
          <v-divider class="my-2" />
          <v-card-text class="px-0 py-2">
            <v-row class="pa-0 ma-0 align-center text-subtitle-1" no-gutters>
              <span>Signature Version : V4</span>
              <v-spacer />
              <OutlinedBtn
                :text="$t('basic.download.type', { type: pluginInfo.name })"
                icon="mdi-cloud-download"
                class="mr-3"
                @click="gotoDownloadPage(pluginInfo.link)"
              />
              <OutlinedBtn
                :text="$t('s3.plugin.key.renew')"
                icon="mdi-refresh"
                @click="updateKey"
              />
            </v-row>
            <v-col class="s3-key-info my-2 pa-3">
              <v-text-field
                label="Access Key"
                class="key-pair-text"
                :model-value="s3Store.getS3AccessKey"
                :append-inner-icon="showAccessKey ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showAccessKey ? 'text' : 'password'"
                variant="underlined"
                color="primary"
                readonly
                @click:append-inner="showAccessKey = !showAccessKey"
              />
              <v-text-field
                label="Secret Key"
                class="key-pair-text"
                :model-value="s3Store.getS3SecretKey"
                :append-inner-icon="showSecretKey ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showSecretKey ? 'text' : 'password'"
                variant="underlined"
                color="primary"
                readonly
                @click:append-inner="showSecretKey = !showSecretKey"
              />
            </v-col>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </UiContainer>
</template>

<script setup lang="ts">
import { useStorage, useProject } from '@/store';
import { computed, ref, watch, onMounted, type Ref } from 'vue';

import { makeApiCall, checkS3Credential, updateS3Credential } from '@/api';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import { OS } from '@/constants/Constants';
import Document from '@/constants/Document';
import { getOS } from '@/utils/utils';

const s3Store = useStorage();
const projectStore = useProject();
const showAccessKey: Ref<boolean> = ref(false);
const showSecretKey: Ref<boolean> = ref(false);
const pluginInfo: Ref<Record<string, string>> = ref({});

const projectId = computed(() => projectStore.getCurrentProject?.id);

const linkUrl = computed(() => {
  return Document.KEY;
});

onMounted(() => {
  initPluginInfo();
  fetchData();
});

const fetchData = () => {
  void makeApiCall({ apiCallFn: checkS3Credential });
};

const initPluginInfo = () => {
  const os = getOS();
  if (os === OS.win) {
    pluginInfo.value = {
      name: 'S3 Browser',
      link: 'https://s3browser.com/',
    };
  } else {
    pluginInfo.value = {
      name: 'Cyberduck',
      link: 'https://cyberduck.io/',
    };
  }
};

const updateKey = () => {
  makeApiCall({ apiCallFn: updateS3Credential });
};

const gotoDownloadPage = (link: string) => {
  window.open(link, '_blank', 'noopener, noreferrer');
};

watch(projectId, () => {
  s3Store.setS3Credential({ accessKey: '', secretKey: '' });
  fetchData();
});
</script>

<style lang="scss" scoped>
.key-pair-text {
  .v-input__control {
    .v-field {
      border: none !important;
      &:hover {
        border: none !important;
      }
      &.v-field--focused {
        border: none !important;
      }
      &.v-field--error {
        border: none !important;
      }
    }
  }
}
.s3-key-info {
  border: 1px solid #a0a2a5;
  border-radius: 5px;
  :deep(.v-input__control) {
    .v-field {
      border: none !important;
      &:hover {
        border: none !important;
      }
      &.v-field--focused {
        border: none !important;
      }
    }
    input {
      cursor: default !important;
    }
  }
}
.inherit-color {
  color: inherit !important;
}
</style>
