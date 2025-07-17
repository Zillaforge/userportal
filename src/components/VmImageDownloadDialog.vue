<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import { downloadVirtualImageTag, makeApiCall } from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import { getDataStorageSchema } from '@/utils/utils';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  tagId: {
    type: String,
    default: '',
  },
  imageName: {
    type: String,
    default: '',
  },
  tagName: {
    type: String,
    default: '',
  },
});

const { t } = i18n.global;
const { s3BucketList, execFetchS3BucketList } = useCloudStorage(
  PAGE_TYPES.S3_BUCKET_LIST
);

const bucketSelectRef = ref<any>();
const fileNameInputRef = ref<any>();
const selectedBucket = ref();
const filePath = ref('');
const fileName = ref('');
const formError = ref<Record<string, any>>({});

const bucketOptions = computed(() =>
  s3BucketList.value.map(bucket => bucket.Name)
);

const disableSumbit = computed(() => {
  return Object.values(formError.value).some(
    el => !!el || (Array.isArray(el) && el.length === 0)
  );
});

const submit = () => {
  makeApiCall({
    apiCallFn: downloadVirtualImageTag,
    payload: {
      imageTagId: props.tagId,
      filePath: `${getDataStorageSchema()}://${selectedBucket.value}/${filePath.value}${fileName.value}`,
    },
    progressMessage: t('image.virtualMachine.download.progress'),
  });
};

watch(showDialog, async val => {
  if (val) {
    fileName.value = `${props.imageName}-${props.tagName}.img`;
    filePath.value = '';

    await execFetchS3BucketList();
    selectedBucket.value = bucketOptions.value?.[0];

    void nextTick(() => {
      bucketSelectRef.value?.validate();
      fileNameInputRef.value?.validate();
    });
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('basic.download.type', { type: $t('image.virtualMachine') })"
    :submit-callback="submit"
    :disable-submit="disableSumbit"
  >
    <TextFieldWithHint
      :model-value="imageName"
      :title="$t('basic.name')"
      plain-text
      :text-field-col="6"
    />
    <TextFieldWithHint
      :model-value="tagName"
      :title="$t('label.version')"
      plain-text
      :text-field-col="6"
    />
    <SelectWithHint
      ref="bucketSelectRef"
      v-model="selectedBucket"
      :items="bucketOptions"
      :title="$t('s3.bucket')"
      required
      :selection-cols="6"
      @form-error="errMsg => (formError.bucket = errMsg)"
    />
    <TextFieldWithHint
      v-model="filePath"
      :title="$t('label.filePath')"
      :placeholder="'eg. folder1/folder2/'"
      :text-field-col="6"
    />
    <TextFieldWithHint
      ref="fileNameInputRef"
      v-model="fileName"
      :title="$t('label.fileName')"
      required
      :text-field-col="6"
      @form-error="
        event => {
          formError.filePath = event?.[0];
        }
      "
    />
  </CommonDialog>
</template>
