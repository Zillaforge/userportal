<template>
  <v-dialog v-model="isShow" persistent :width="400">
    <v-card>
      <v-card-text class="mt-1 mb-1 text-center would_break">
        {{ message }}
        <v-progress-linear
          height="8"
          indeterminate
          color="primary"
          class="mb-0 mt-3"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useGlobal } from '@/store';
import { ref, watch } from 'vue';

import i18n from '@/i18n';

const { t } = i18n.global;
const globalStore = useGlobal();
const duringDialog = ref(false);
const isShow = ref(false);
const message = ref('');
watch(
  () => globalStore.getProgressDlgState,
  newVal => {
    setTimeout(() => (isShow.value = newVal.show ?? false), 0);
    if (newVal.show) {
      setTimeout(() => {
        duringDialog.value = true;
      }, 300);
    } else {
      duringDialog.value = false;
    }
    if (newVal && newVal.show) {
      message.value = newVal.message?.length
        ? newVal.message
        : t('basic.system.process');
    }
  }
);
</script>

<style scoped>
.would_break {
  white-space: pre-line;
  overflow-wrap: break-word;
}
</style>
