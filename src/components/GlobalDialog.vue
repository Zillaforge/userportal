<template>
  <v-dialog
    v-model="showDialog"
    :max-width="uiDialog.width ?? 800"
    persistent
    scrollable
  >
    <v-card class="px-2">
      <v-card-title v-if="uiDialog.title" class="would_break text-h5 pa-4">
        {{ uiDialog.title }}
      </v-card-title>
      <v-card-text class="would_break pa-4">
        <div v-if="isResourceInfoExists">
          <v-row
            v-for="(item, index) in uiDialog.resourceInfo"
            :key="index"
            class="mb-4"
            no-gutters
          >
            <v-col cols="4" class="pa-0">{{ item.title }}</v-col>
            <v-col cols="8" class="pa-0">
              <pre v-if="Array.isArray(item.value)">{{
                item.value.join('\n')
              }}</pre>
              <pre v-else>{{ item.value }}</pre>
            </v-col>
          </v-row>
        </div>
        <v-row v-if="uiDialog.message" no-gutters>
          <DialogAlert
            v-if="uiDialog.showWarningIcon"
            :message="uiDialog.message"
            :message-with-link="uiDialog.messageWithLink"
          />

          <v-col v-else cols="12">
            {{ uiDialog.message }}
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <TextBtn
          v-if="!uiDialog.hideCancelBtn"
          :text="$t('basic.cancel')"
          @click="() => globalStore.uiHideDialog()"
        />
        <TextBtn :text="$t('basic.confirm')" @click="primaryAction" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useGlobal } from '@/store';
import { ref, computed, watch, type Ref } from 'vue';

import type { GlobalDlgParams } from '@/interfaces/LayoutItemInterface';

import DialogAlert from '@/components/common/DialogAlert.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';

const showDialog = ref(false);
const globalStore = useGlobal();
const uiDialog: Ref<GlobalDlgParams> = ref<GlobalDlgParams>({
  title: '',
  message: '',
});

const isResourceInfoExists = computed(() => {
  return (
    Array.isArray(uiDialog.value.resourceInfo) &&
    uiDialog.value.resourceInfo.length
  );
});

// methods
const primaryAction = async () => {
  if (uiDialog.value.callback) {
    await uiDialog.value.callback();
  }
  globalStore.uiHideDialog();
};

watch(
  () => globalStore.globalDlg,
  val => {
    uiDialog.value = globalStore.globalDlg;
    showDialog.value = globalStore.globalDlg.show ?? false;
  }
);

watch(
  () => globalStore.globalDlg.show,
  val => {
    showDialog.value = val ?? false;
  }
);
</script>

<style scoped lang="scss">
.would_break {
  white-space: pre-line;
  overflow-wrap: break-word;
  overflow-y: auto;
}
</style>
