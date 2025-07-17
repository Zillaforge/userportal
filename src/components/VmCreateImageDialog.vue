<script lang="ts">
import { computed, ref, watch } from 'vue';

import { makeApiCall, fetchVirtualImages, createVmSnapshot } from '@/api';
import ComboboxText from '@/components/common/ComboboxText.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
export default {
  name: 'VmCreateImageDialog',
};
</script>

<script setup lang="ts">
const props = defineProps({
  serverId: {
    type: String,
    default: '',
  },
});

const showDialog = defineModel<boolean>('show', { required: true });

const imageName = ref<Record<string, any> | undefined>(undefined);
const imageRepoList = ref<Record<string, any>[]>([]);
const os = ref('');
const version = ref('');
const description = ref('');

const disableSumbit = computed(() => {
  return !imageName.value || !os.value || !version.value;
});

const fetchData = async () => {
  await makeApiCall({
    apiCallFn: fetchVirtualImages,
    successCallback: (res: any) => {
      imageRepoList.value = res;
    },
  });
};
const checkRepoExist = () => {
  return imageRepoList.value.some(item => item.id === imageName.value);
};
const submitAction = async () => {
  await makeApiCall({
    apiCallFn: createVmSnapshot,
    payload: {
      serverId: props.serverId,
      body: checkRepoExist()
        ? {
            repositoryId: imageName.value,
            version: version.value,
          }
        : {
            name: imageName.value,
            operatingSystem: os.value,
            version: version.value,
            description: description.value,
          },
    },
    successCallback: () => {
      showDialog.value = false;
    },
  });
};

watch(showDialog, val => {
  if (val) {
    void fetchData();
    imageName.value = undefined;
    os.value = '';
    version.value = '';
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.createImage')"
    :submit-callback="submitAction"
    :disable-submit="disableSumbit"
  >
    <v-row no-gutters class="mb-2">
      <v-col cols="3">
        <span class="ocis-form-title ocis-input-required">
          {{ $t('label.name') }}
        </span>
      </v-col>
      <v-col cols="8">
        <ComboboxText
          ref="nameInputRef"
          v-model="imageName"
          class="mt-2"
          :items="imageRepoList"
          item-title="name"
          item-value="id"
          required
        />
      </v-col>
    </v-row>
    <TextFieldWithHint v-model="description" :title="$t('basic.desc')" />
    <SelectWithHint
      v-model="os"
      :title="$t('label.operatingSystem')"
      :items="[
        { name: 'Linux', value: 'linux' },
        { name: 'Windows', value: 'windows' },
      ]"
      :hint="$t('image.virtualMachine.os.hint')"
      required
    />
    <TextFieldWithHint
      v-model="version"
      :title="$t('label.version')"
      required
    />
  </CommonDialog>
</template>
