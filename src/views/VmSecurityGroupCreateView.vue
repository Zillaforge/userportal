<script setup lang="ts">
import { ref, computed, watch, type Ref, onMounted } from 'vue';

import { makeApiCall, createVmSecurityGroup } from '@/api';
import SecurityGroupSettingDialog from '@/components/SecurityGroupSettingDialog.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {
  type SecurityGroup,
  type SecurityRule,
} from '@/interfaces/VmInterface';
import router from '@/router';
import getTableHeaders from '@/utils/getTableHeaders';

const { setProjectSwitchCallback } = useProjectSwitch();
const { projectId, t } = useVm(PAGE_TYPES.VM_SECURITY_GROUP_CREATE);
onMounted(async () => {
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_SECURITY_GROUP_LIST })
  );
});

const sgHeaders = computed(() =>
  getTableHeaders(PAGE_TYPES.VM_SECURITY_GROUP_DETAIL)
);
interface FormError {
  name?: string;
}

const sgCreate: Ref<SecurityGroup> = ref({
  name: 'sg' + Math.floor(Date.now()),
  id: '',
});

const refTextfield = ref<any>(null);

const currentStep = ref(1);
const valid = ref(false);
const formError = ref<FormError>({});
const createStepLabels = ref([
  t('label.basicInfo'),
  t('vm.sg.rule.setting'),
  t('basic.review') + '+' + t('basic.create'),
]);

const sgRules: Ref<SecurityRule[]> = ref([
  {
    protocol: 'any',
    port_min: '0',
    port_max: '0',
    remote_cidr: '0.0.0.0/0',
    direction: 'egress',
    network_type: 'ipv4',
  },
]);
const submit = () => {
  makeApiCall({
    apiCallFn: createVmSecurityGroup,
    payload: {
      projectId: projectId.value,
      securityGroupItem: {
        name: sgCreate.value.name,
        description: sgCreate.value.desc,
        rules: sgRules.value.map((item: any) => ({
          ...item,
          port_min: Number(item.port_min),
          port_max: Number(item.port_max),
        })),
      },
    },
    successCallback: () => {
      void router.push({ name: PAGE_TYPES.VM_SECURITY_GROUP_LIST });
    },
  });
};
const cancel = () => {
  void router.push({ name: PAGE_TYPES.VM_SECURITY_GROUP_LIST });
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
  if (currentStep.value !== createStepLabels.value.length) {
    return errSteps;
  }

  // step 1
  refTextfield.value.validate();
  if (!valid.value) {
    errSteps.push(createStepLabels.value[0]);
  }
  return errSteps;
};

const openDialog = ref(false);
const openSecurityGroupDialog = () => {
  openDialog.value = true;
};

const submitRule = (rule: SecurityRule) => {
  rule.protocol = rule.protocol.toLowerCase();
  rule.network_type = 'Ipv4';
  sgRules.value.push(rule);
};

const sgActions = ref([
  {
    label: t('table.action.delete'),
    action: (item: any, index: number) => {
      sgRules.value.splice(index, 1);
    },
  },
]);
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('services.securityGroup') })"
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
              <TextFieldWithHint
                ref="refTextfield"
                v-model="sgCreate.name"
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
              <TextFieldWithHint
                v-model="sgCreate.desc"
                :title="$t('basic.desc')"
                :text-field-col="6"
              />
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <div class="pb-4">
              <v-row no-gutters>
                <v-col cols="12">
                  <span>{{ $t('vm.sg.add.hint') }}</span>
                </v-col>
                <v-col cols="12" class="pt-4">
                  <OutlinedBtn
                    :text="$t('vm.sg.rule.add')"
                    @click="openSecurityGroupDialog"
                  />
                </v-col>
              </v-row>
            </div>
            <DetailTable
              :items="sgRules"
              :headers="sgHeaders"
              :actions="sgActions"
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="3">
            <v-row>
              <v-col v-if="errSteps.length > 0" class="pa-0" cols="12">
                <AlertComponent :message="$t('form.error.alert')" />
              </v-col>
              <CheckItem
                :key-name="$t('label.name')"
                :error-msg="formError.name"
                :value="sgCreate.name"
              />

              <CheckItem :key-name="$t('basic.desc')" :value="sgCreate.desc" />
              <CheckItem :key-name="$t('basic.rule')">
                <v-col cols="9">
                  <DetailTable :items="sgRules" :headers="sgHeaders" />
                </v-col>
              </CheckItem>
            </v-row>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
    <SecurityGroupSettingDialog
      v-model:show="openDialog"
      @submit="rule => submitRule(rule)"
    />
  </UiContainer>
</template>
