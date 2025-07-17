<script setup lang="ts">
import { useGlobal } from '@/store';
import { type PropType } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import i18n from '@/i18n';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  data: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
});

const { t } = i18n.global;
const globalStore = useGlobal();

const copyString = () => {
  void navigator.clipboard.writeText(JSON.stringify(props.data));
  globalStore.triggerSnackbar({ content: t('basic.copied') });
};
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('logMgnt.originalData')"
    :show-cancel-btn="false"
  >
    <div class="border pa-4">
      <pre>{{ data }}</pre>
      <div class="text-end cursor-pointer">
        <v-icon @click="copyString">mdi-content-copy</v-icon>
      </div>
    </div>
  </CommonDialog>
</template>
