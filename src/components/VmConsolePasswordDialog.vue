<script lang="ts" setup>
import { Buffer } from 'buffer';

import { useGlobal } from '@/store';
import { ref, watch, type PropType } from 'vue';

import { makeApiCall } from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import i18n from '@/i18n';

const { t } = i18n.global;
const { triggerSnackbar } = useGlobal();

const showDialog = defineModel<boolean>('show', { required: true });
const fileInputRef = ref<InstanceType<typeof HTMLInputElement> | null>(null);

const props = defineProps({
  apiCallFn: {
    type: Function as PropType<(...args: any[]) => any>,
    default: null,
  },
  apiPayload: {
    type: Object as PropType<Record<string, any>>,
    default: null,
  },
});
const privateKey = ref('');
const convertedPwd = ref('');
const copy = (target: string) => {
  void navigator.clipboard.writeText(target);
  triggerSnackbar({ content: t('basic.copied') });
};

const convertKey = async () => {
  await makeApiCall({
    apiCallFn: props.apiCallFn,
    payload: {
      ...props.apiPayload,
      action: {
        action: 'get_pwd',
        private_key: Buffer.from(privateKey.value).toString('base64'),
      },
    },
    successCallback: res => {
      convertedPwd.value = Buffer.from(
        res.password as string,
        'base64'
      ).toString();
    },
  });
};

watch(showDialog, val => {
  if (val) {
    privateKey.value = '';
    convertedPwd.value = '';
  }
});

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input?.files || input.files.length === 0) {
    return; // Exit if there’s no file
  }
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    privateKey.value = e.target?.result as string;
    input.value = '';
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  reader.readAsText(file);
};
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.getConsolePassword')"
    :submit-btn-text="$t('basic.close')"
  >
    <v-row no-gutters>
      <v-col cols="12">
        <v-row no-gutters>
          <v-col cols="2">
            <span>{{ $t('label.privateKey') }}</span>
          </v-col>
          <v-col cols="8">
            <OutlinedBtn
              class="mb-4"
              :text="$t('basic.import')"
              @click="triggerFileInput"
            />
            <input
              ref="fileInputRef"
              class="d-none"
              type="file"
              @change="handleFileChange"
            />
            <TextareaComponent
              v-model="privateKey"
              :placeholder="
                $t('label.pleaseInput.type', { type: $t('label.privateKey') })
              "
            />
            <OutlinedBtn
              class="my-4"
              :text="$t('action.convert')"
              @click="convertKey"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-row no-gutters>
          <v-col cols="2">
            <span>{{ $t('basic.password') }}</span>
          </v-col>
          <v-col cols="8">
            <TextareaComponent v-model="convertedPwd" readonly />
          </v-col>
          <v-col cols="2" class="pl-2">
            <v-icon
              size="small"
              icon="mdi-content-copy"
              @click="copy(convertedPwd)"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </CommonDialog>
</template>
