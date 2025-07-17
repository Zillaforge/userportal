<script setup lang="ts">
import { useGlobal } from '@/store';
import { ref, watch } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import i18n from '@/i18n';

const { t } = i18n.global;
const { uiShowDialog } = useGlobal();

const showDialog = defineModel<boolean>('show', { required: true });
const props = defineProps({
  setCertificate: {
    type: String,
    default: '',
  },
  setKey: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['submit']);

const certificateVal = ref('');
const keyVal = ref('');

const certFileRef = ref(null);
const keyFileRef = ref(null);

watch(showDialog, () => {
  certificateVal.value = props.setCertificate;
  keyVal.value = props.setKey;
});

const triggerFileInput = (type: string) => {
  if (type === 'cert') {
    certFileRef.value?.click();
  } else if (type === 'key') {
    keyFileRef.value?.click();
  }
};
const handleFileChange = (type: string, event) => {
  const maxSize = 100 * 1024; // 100 KB
  const file = event.target.files[0];
  if (file.size > maxSize) {
    uiShowDialog({
      title: '',
      message: t('vm.scriptImport.fileExceedSize'),
      hideCancelBtn: true,
    });
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    if (type === 'cert') {
      certificateVal.value = e.target.result;
    } else if (type === 'key') {
      keyVal.value = e.target.result;
    }
    event.target.value = '';
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  reader.readAsText(file);
};
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('basic.setting') + $t('basic.certification')"
    :submit-callback="
      () => emit('submit', { certificate: certificateVal, key: keyVal })
    "
  >
    <v-row>
      <v-col cols="12" class="pb-4">
        <span>{{ $t('vm.lb.cert.setting') }}</span>
      </v-col>
      <v-col cols="2" class="pt-4">
        <span>{{ $t('basic.certification') }}</span>
      </v-col>
      <v-col cols="9">
        <OutlinedBtn
          :text="$t('basic.import')"
          @click="triggerFileInput('cert')"
        />
        <input
          ref="certFileRef"
          class="d-none"
          type="file"
          @change="$event => handleFileChange('cert', $event)"
        />
      </v-col>
      <v-col offset="2" cols="10">
        <TextareaComponent v-model="certificateVal" :rows="5" />
      </v-col>
      <v-col cols="2" class="pt-4">
        <span>{{ $t('basic.key') }}</span>
      </v-col>
      <v-col cols="9">
        <OutlinedBtn
          :text="$t('basic.import')"
          @click="triggerFileInput('key')"
        />
        <input
          ref="keyFileRef"
          class="d-none"
          type="file"
          @change="$event => handleFileChange('key', $event)"
        />
      </v-col>
      <v-col offset="2">
        <TextareaComponent v-model="keyVal" :rows="5" />
      </v-col>
    </v-row>
  </CommonDialog>
</template>
<style lang="scss" scoped>
.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  height: 100%;
  position: absolute;
  cursor: pointer;
}
</style>
