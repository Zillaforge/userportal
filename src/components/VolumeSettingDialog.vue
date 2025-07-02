<script lang="ts" setup>
import { ref, computed, watch, type Ref } from 'vue';

import SelectWithHint from './common/SelectWithHint.vue';
import TextFieldWithHint from './common/TextFieldWithHint.vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';
import { VM_VOLUME_MAX_SIZE } from '@/constants/VmConstants';
import { type Volume } from '@/interfaces/VmInterface';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  volumeList: {
    type: Array<Volume>,
    default: () => [],
  },
  isCreate: {
    type: Boolean,
    default: false,
  },
  volumeTypes: {
    type: Array<string>,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update-volume']);

const selectedVolume = ref<{ volume: Volume | undefined }[]>([]);
const volumeValidation = ref(false);
const volumeCreate: Ref<Volume> = ref({
  id: '',
  name: 'vol' + Math.floor(Date.now() / 1000),
  size: 10,
  type: props.volumeTypes?.[0],
  from: 'create',
});
const disableSubmit = computed(() =>
  props.isCreate
    ? !volumeValidation.value
    : selectedVolume.value.some(el => !el.volume)
);

const volumeSubmit = () => {
  emit(
    'update-volume',
    props.isCreate
      ? volumeCreate.value
      : selectedVolume.value.map(el => el.volume)
  );
};

watch(showDialog, val => {
  if (val) {
    selectedVolume.value = [{ volume: props.volumeList?.[0] ?? undefined }];
    volumeCreate.value = {
      id: '',
      name: 'vol' + Math.floor(Date.now() / 1000),
      size: 10,
      type: props.volumeTypes?.[0],
      from: 'create',
    };
  }
});

const volumeOptions = computed(() => {
  return props.volumeList.filter(
    volume => !selectedVolume.value.some(item => item.volume?.id === volume.id)
  );
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="title || $t('vm.volume.add')"
    :disable-submit="disableSubmit"
    :submit-callback="volumeSubmit"
  >
    <v-form v-if="isCreate" v-model="volumeValidation">
      <v-row no-gutters>
        <TextFieldWithHint
          v-model="volumeCreate.name"
          :title="$t('label.name')"
          :required="true"
          :type="'name'"
        />
        <v-col cols="12">
          <TextFieldWithHint
            v-model="volumeCreate.desc"
            :title="$t('basic.desc')"
          />
        </v-col>
        <v-col cols="12">
          <TextFieldWithHint
            v-model="volumeCreate.size"
            :title="$t('vm.volume.size')"
            :type="'number'"
            :max-val="VM_VOLUME_MAX_SIZE"
            :required="true"
          />
        </v-col>
        <v-col cols="12">
          <SelectWithHint
            v-model="volumeCreate.type"
            :title="$t('label.type')"
            :items="volumeTypes"
            :item-text="'title'"
            required
            return-object
          />
        </v-col>
      </v-row>
    </v-form>
    <MultipleInputSetter
      v-else
      :title="$t('services.virtualVolume')"
      required
      :params="selectedVolume"
      :disable-add-item="
        selectedVolume.length >= 5 || volumeOptions?.length == 0
      "
      :column-infos="[
        {
          type: 'select',
          selectItems: volumeOptions,
          colsNumber: 8,
          returnObject: true,
        },
      ]"
      @add-new-item="
        () => {
          selectedVolume.push({ volume: volumeOptions[0] });
        }
      "
      @delete-item="
        (index: number) => {
          selectedVolume.splice(index, 1);
        }
      "
    />
  </CommonDialog>
</template>
