<script setup lang="ts">
import { ref, computed, watch, type Ref, onMounted } from 'vue';

import { makeApiCall, createVmNetwork } from '@/api';
import CheckItem from '@/components/common/CheckItem.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { type Network } from '@/interfaces/VmInterface';
import validation from '@/utils/validation';

const { setProjectSwitchCallback } = useProjectSwitch();
const { router, t } = useVm(PAGE_TYPES.VM_NETWORK_CREATE);

interface FormError {
  name?: string;
  cidr?: string;
  gateway?: string;
}

const networkCreate: Ref<Network> = ref({
  id: '',
  name: 'vn' + Math.floor(Date.now() / 1000),
});

const refTextfield = ref<any>(null);
const refTextfieldCIDR = ref<any>(null);
const refTextfieldGateway = ref<any>(null);

const currentStep = ref(1);
const valid = ref(false);
const formError = ref<FormError>({});
const createStepLabels = computed(() => [
  t('label.basicInfo'),
  t('basic.review') + '+' + t('basic.create'),
]);

onMounted(() => {
  setProjectSwitchCallback(() => {
    void router.push({ name: PAGE_TYPES.VM_NETWORK_LIST });
  });
});
const submit = async () => {
  await makeApiCall({
    apiCallFn: createVmNetwork,
    payload: {
      networkItem: networkCreate.value,
    },
    successCallback: () => {
      void router.push({ name: PAGE_TYPES.VM_NETWORK_LIST });
    },
  });
};
const cancel = () => {
  void router.push({ name: PAGE_TYPES.VM_NETWORK_LIST });
};
const errSteps = ref<any[]>([]);
watch(currentStep, val => {
  if (currentStep.value === createStepLabels.value.length) {
    errSteps.value = getErrorSteps();
  } else {
    errSteps.value = [];
  }
});

const getErrorSteps = () => {
  const errSteps: any[] = [];

  // step 1
  refTextfield.value.validate();
  refTextfieldCIDR.value.validate();
  refTextfieldGateway.value.validate();
  if (!valid.value) {
    errSteps.push(createStepLabels.value[0]);
  }
  return errSteps;
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="
          $t('basic.create.type', { type: $t('services.virtualNetwork') })
        "
      />
      <v-col class="pt-4">
        <Step
          v-model="currentStep"
          :step-names="createStepLabels"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="cancel"
        >
          <v-stepper-window-item :value="1">
            <v-form v-model="valid">
              <v-row no-gutters>
                <v-col cols="12">
                  <TextFieldWithHint
                    ref="refTextfield"
                    v-model="networkCreate.name"
                    :title="$t('label.name')"
                    :required="true"
                    :text-field-col="6"
                    :type="'name'"
                    :title-hint="$t('vm.name.hint')"
                    :title-hint-loc="'top end'"
                    @form-error="
                      event => {
                        formError.name = event[0];
                      }
                    "
                  />
                </v-col>
                <v-col cols="12">
                  <TextFieldWithHint
                    ref="refTextfieldCIDR"
                    v-model="networkCreate.cidr"
                    :title="$t('basic.cidr')"
                    :text-field-col="6"
                    :required="true"
                    :rules="[validation.ruleValidCidr]"
                    :placeholder="'eg. 10.0.0.0/24'"
                    @form-error="
                      event => {
                        formError.cidr = event[0];
                      }
                    "
                  />
                </v-col>
                <v-col cols="12">
                  <TextFieldWithHint
                    ref="refTextfieldGateway"
                    v-model="networkCreate.gateway"
                    :title="$t('basic.gateway')"
                    :text-field-col="6"
                    :required="true"
                    :rules="[validation.ruleValidIp]"
                    :placeholder="'eg.10.0.0.254'"
                    @form-error="
                      event => {
                        formError.gateway = event[0];
                      }
                    "
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <v-row>
              <v-col cols="12" class="pa-0">
                <v-alert
                  v-if="errSteps.length > 0"
                  type="error"
                  density="compact"
                >
                  {{ $t('form.error.alert') }}
                </v-alert>
              </v-col>
              <CheckItem
                :key-name="$t('label.name')"
                :error-msg="formError.name"
                :value="networkCreate.name"
              />

              <CheckItem
                :key-name="$t('basic.cidr')"
                :value="networkCreate.cidr"
                :error-msg="formError.cidr"
              />

              <CheckItem
                :key-name="$t('basic.gateway')"
                :value="networkCreate.gateway"
                :error-msg="formError.gateway"
              />
            </v-row>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
  </UiContainer>
</template>
