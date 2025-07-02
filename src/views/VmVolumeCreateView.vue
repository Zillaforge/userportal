<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue';

import {
  makeApiCall,
  fetchVmVolumeTypes,
  fetchVmSnapshotList,
  createVmVolume,
} from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import ComboBoxText from '@/components/common/ComboboxText.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { VM_VOLUME_MAX_SIZE } from '@/constants/VmConstants';
import { type Volume, VolumeOptions } from '@/interfaces/VmInterface';

const { setProjectSwitchCallback } = useProjectSwitch();
const { t, router, projectId } = useVm(PAGE_TYPES.VM_VOLUME_CREATE);

interface FormError {
  name?: string;
  size?: string;
  snapshotName?: string;
}
const refCombobox = ref<any>(null);
const volumeSelection = ref([]);
const volumeSnapshot: Ref<Record<string, any>[]> = ref([]);
const selectedSnapshot: Record<string, any> = ref(undefined);
const fetchData = async () => {
  await makeApiCall({
    apiCallFn: fetchVmVolumeTypes,
    successCallback: (data: any) => {
      volumeSelection.value = data;
      volumeCreate.value.type = volumeSelection.value[0];
    },
  });
  await makeApiCall({
    apiCallFn: fetchVmSnapshotList,
    payload: projectId.value,
    successCallback: (data: any) => {
      volumeSnapshot.value = data.map((item: any) => ({
        ...item,
        title: item.name,
      }));
    },
  });
};
onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => {
    await router.push({ name: PAGE_TYPES.VM_VOLUME_LIST });
  });
});
const volumeCreate: Ref<Volume> = ref({
  id: '',
  name: 'vol' + Math.floor(Date.now() / 1000),
  size: 10,
  type: '',
  from: 'create',
});
const volumeRadio = computed(() => [
  {
    label: t('basic.create', { type: t('basic.disk') }),
    value: VolumeOptions.CREATE,
  },
  {
    label: t('vm.volume.from.snapshot'),
    value: VolumeOptions.PREBUILT,
  },
]);

const currentStep = ref(1);
const errSteps = ref<any[]>([]);
const steps = computed(() => [
  t('creation.step.basic'),
  t('creation.step.review'),
]);

const valid = ref(false);
const formError = ref<FormError>({});
const submit = async () => {
  await makeApiCall({
    apiCallFn: createVmVolume,
    payload: {
      volumeItem:
        volumeCreate.value.from === VolumeOptions.CREATE
          ? {
              name: volumeCreate.value.name,
              description: volumeCreate.value.desc,
              size: Number(volumeCreate.value.size),
              type: volumeCreate.value.type,
            }
          : {
              name: volumeCreate.value.name,
              description: volumeCreate.value.desc,
              size: Number(selectedSnapshot.value.size),
              type: volumeCreate.value.type,
              snapshot_id: selectedSnapshot.value.id,
            },
      projectId: projectId.value,
    },
    successCallback: async () => {
      await router.push({ name: PAGE_TYPES.VM_VOLUME_LIST });
    },
  });
};
const cancel = () => {
  void router.push({ name: PAGE_TYPES.VM_VOLUME_LIST });
};

watch(currentStep, val => {
  if (currentStep.value === steps.value.length) {
    errSteps.value = getErrorSteps();
  } else {
    errSteps.value = [];
  }
});

const getErrorSteps = () => {
  const errSteps: any[] = [];
  refCombobox.value?.validate();
  if (!valid.value) {
    errSteps.push(steps.value[0]);
  }
  return errSteps;
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('services.virtualVolume') })"
      />
      <v-col class="pt-4">
        <Step
          v-model="currentStep"
          :step-names="steps"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="cancel"
        >
          <v-stepper-window-item :value="1">
            <v-form v-model="valid">
              <v-row no-gutters>
                <v-col cols="12">
                  <TextFieldWithHint
                    v-model="volumeCreate.name"
                    :title="$t('label.name')"
                    :required="true"
                    :text-field-col="6"
                    :type="'name'"
                    @form-error="
                      event => {
                        formError.name = event[0];
                      }
                    "
                  />
                </v-col>
                <v-col cols="12">
                  <TextFieldWithHint
                    v-model="volumeCreate.desc"
                    :title="$t('basic.desc')"
                    :text-field-col="6"
                  />
                </v-col>
                <v-col cols="12">
                  <RadioButtonSwitch
                    :title="$t('vm.volume.create.from')"
                    :init-value="volumeCreate.from"
                    :options="volumeRadio"
                    @selected="value => (volumeCreate.from = value)"
                  />
                </v-col>
                <v-col
                  v-if="volumeCreate.from === VolumeOptions.CREATE"
                  cols="12"
                >
                  <TextFieldWithHint
                    v-model="volumeCreate.size"
                    :title="$t('vm.volume.size')"
                    :label="$t('vm.virtual.volume.size')"
                    :type="'number'"
                    :max-val="VM_VOLUME_MAX_SIZE"
                    :required="true"
                    :text-field-col="6"
                    @form-error="
                      event => {
                        formError.size = event[0];
                      }
                    "
                  />
                </v-col>
                <v-col
                  v-if="volumeCreate.from === VolumeOptions.CREATE"
                  cols="12"
                >
                  <SelectWithHint
                    v-model="volumeCreate.type"
                    :title="$t('label.type')"
                    :items="volumeSelection"
                    :item-text="'title'"
                    item-value="tagName"
                    :selection-cols="6"
                    required
                    return-object
                  />
                </v-col>
                <v-col
                  v-if="volumeCreate.from === VolumeOptions.PREBUILT"
                  cols="12"
                >
                  <v-row no-gutters>
                    <v-col cols="3">
                      <span class="ocis-form-title ocis-input-required">
                        {{ $t('virtualVolume.snapshot') }}
                      </span>
                    </v-col>
                    <v-col cols="6" class="pt-2">
                      <ComboBoxText
                        ref="refCombobox"
                        v-model="selectedSnapshot"
                        :items="volumeSnapshot"
                        :item-title="'name'"
                        return-object
                        :required="true"
                        @form-error="
                          event => {
                            formError.snapshotName = event;
                          }
                        "
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <v-row>
              <v-col cols="12" class="pa-0">
                <AlertComponent
                  v-if="errSteps.length > 0"
                  :message="$t('form.error.alert')"
                />
              </v-col>
              <CheckItem
                :key-name="$t('label.name')"
                :error-msg="formError.name"
                :value="volumeCreate.name"
              />

              <CheckItem
                :key-name="$t('basic.desc')"
                :value="volumeCreate.desc"
              />

              <CheckItem
                :key-name="$t('vm.volume.create.from')"
                :value="
                  volumeCreate.from === VolumeOptions.CREATE
                    ? $t('vm.volume.create.from.new')
                    : $t('vm.volume.create.from.snapshot')
                "
              />
              <CheckItem
                v-if="volumeCreate.from === VolumeOptions.PREBUILT"
                :key-name="
                  $t('basic.name', { type: $t('virtualVolume.snapshot') })
                "
                :error-msg="formError.snapshotName"
                :value="selectedSnapshot?.name"
              />
              <CheckItem
                :key-name="$t('vm.volume.size')"
                :value="
                  volumeCreate.from === VolumeOptions.CREATE
                    ? volumeCreate?.size?.toString()
                    : selectedSnapshot?.size?.toString()
                "
                :error-msg="
                  volumeCreate.from === VolumeOptions.CREATE
                    ? formError?.size
                    : ''
                "
              />
              <CheckItem
                v-if="volumeCreate.from === VolumeOptions.CREATE"
                :key-name="$t('label.type')"
                :value="volumeCreate?.type"
              />
            </v-row>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
  </UiContainer>
</template>
<style lang="scss" scoped>
@use '@/styles/common/v-input';
</style>
