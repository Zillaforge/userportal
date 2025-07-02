<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

import { makeApiCall, fetchVmNetworks, createFileSharing } from '@/api';
import CheckItem from '@/components/common/CheckItem.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { VM_VOLUME_MAX_SIZE } from '@/constants/VmConstants';
import i18n from '@/i18n';
import router from '@/router';

const { t } = i18n.global;

interface FormError {
  name?: string;
  virtualNetwork?: string;
  size?: string;
}
const { setProjectSwitchCallback } = useProjectSwitch();
const steps = computed(() => [
  t('creation.step.basic'),
  t('creation.step.review'),
]);
const name = ref('fs' + Math.floor(Date.now()));
const description = ref('');
const virtualNetworkList = ref<any[]>([]);
const selectedVirtualNetwork = ref({ name: '', id: '' });
const size = ref('');
const currentStep = ref(1);

const nameInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);
const virtualNetworkSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(
  null
);
const sizeInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);

const validBasic = ref(false);
const formError = ref<FormError>({});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.FILE_SHARING_LIST })
  );
});

const fetchData = async () => {
  virtualNetworkList.value = await makeApiCall({ apiCallFn: fetchVmNetworks });
};

const submit = () => {
  return makeApiCall({
    apiCallFn: createFileSharing,
    payload: {
      name: name.value,
      description: description.value,
      network_id: selectedVirtualNetwork.value.id,
      size: Number(size.value),
    },
    successCallback: async () =>
      await router.push({ name: PAGE_TYPES.FILE_SHARING_LIST }),
  });
};

const errSteps = computed(() => {
  const errSteps: any[] = [];
  if (currentStep.value !== steps.value.length) {
    return errSteps;
  }

  nameInputRef.value?.validate();
  virtualNetworkSelectRef.value?.validate();
  sizeInputRef.value?.validate();
  if (!validBasic.value) {
    errSteps.push(steps.value[0]);
  }

  return errSteps;
});
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('services.fileSharing') })"
      />
      <v-col class="pt-4">
        <Step
          v-model="currentStep"
          :step-names="steps"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="router.push({ name: PAGE_TYPES.FILE_SHARING_LIST })"
        >
          <v-stepper-window-item :value="1">
            <v-form v-model="validBasic">
              <v-row no-gutters class="mb-2">
                <TextFieldWithHint
                  ref="nameInputRef"
                  v-model="name"
                  :title="$t('label.name')"
                  required
                  :text-field-col="6"
                  :type="'name'"
                  @form-error="
                    event => {
                      formError.name = event[0];
                    }
                  "
                />
              </v-row>
              <v-row no-gutters class="mb-6">
                <v-col cols="3">
                  <span class="ocis-form-title">{{ $t('basic.desc') }}</span>
                </v-col>
                <v-col cols="6">
                  <TextareaComponent
                    :model-value="description"
                    @update:model-value="
                      ($event: string) => (description = $event)
                    "
                  />
                </v-col>
              </v-row>

              <v-row no-gutters>
                <SelectWithHint
                  ref="virtualNetworkSelectRef"
                  v-model="selectedVirtualNetwork"
                  :title="$t('services.virtualNetwork')"
                  :items="virtualNetworkList"
                  :item-value="'id'"
                  :selection-cols="6"
                  required
                  return-object
                  @form-error="errMsg => (formError.virtualNetwork = errMsg)"
                />
              </v-row>
              <v-row no-gutters>
                <TextFieldWithHint
                  ref="sizeInputRef"
                  v-model="size"
                  type="number"
                  :max-val="VM_VOLUME_MAX_SIZE"
                  :title="$t('vm.volume.size')"
                  required
                  :text-field-col="6"
                  @form-error="
                    event => {
                      formError.size = event[0];
                    }
                  "
                />
              </v-row>
            </v-form>
          </v-stepper-window-item>

          <v-stepper-window-item :value="2">
            <v-alert v-if="errSteps.length > 0" class="mb-4" type="error">
              {{ $t('form.error.alert') }}
            </v-alert>
            <CheckItem
              :key-name="$t('label.name')"
              :error-msg="formError.name"
              :value="name"
            />
            <CheckItem :key-name="$t('basic.desc')" :value="description" />
            <CheckItem
              :key-name="$t('services.virtualNetwork')"
              :value="selectedVirtualNetwork.name"
              :error-msg="formError.virtualNetwork"
            />
            <CheckItem
              :key-name="$t('vm.volume.size')"
              :value="size"
              :error-msg="formError.size"
            />
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
  </UiContainer>
</template>
