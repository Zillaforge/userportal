<script setup lang="ts">
import { useGlobal } from '@/store';
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchLoadBalancerPoolList,
  createLoadBalancerListener,
} from '@/api';
import CertificateDialog from '@/components/CertificateDialog.vue';
import VmTimeoutDialog from '@/components/VmLoadBalancerTimeoutDialog.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import ExpansionField from '@/components/common/ExpansionField.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { PROTOCOL, timeoutHeaders } from '@/constants/VmConstants';
import i18n from '@/i18n';
import { getPoolProtocol } from '@/utils/utils';
import validation from '@/utils/validation';

const { t } = i18n.global;
interface FormError {
  name?: string;
}
const route = useRoute();
const router = useRouter();
const globalStore = useGlobal();
const { setProjectSwitchCallback } = useProjectSwitch();

const refNameInput = ref<any>(null);
const refFormBasic = ref<any>(null);
const refSetter = ref<any>(null);

const validBasic = ref(false);
const formError = ref<FormError>({});
const showCertDialog = ref(false);
const showTimeoutDialog = ref(false);

const steps = computed(() => [t('label.basicInfo'), t('creation.step.review')]);

const targets = ref<Record<string, any>[]>([]);

const name = ref('listener' + Math.floor(Date.now() / 1000));
const protocol = ref(PROTOCOL.HTTPS);
const port = ref('');
const allowedCidrs = ref([{ cidr: '' }]);
const headers = ref<Record<string, boolean>>({
  'X-Forwarded-For': false,
  'X-Forwarded-Proto': false,
  'X-Forwarded-Port': false,
});
const timeoutSettings = ref({
  timeoutClientData: '50',
  timeoutMemberConnect: '5',
  timeoutMemberData: '50',
  timeoutTcpInspect: '0',
});

const enablePool = ref(false);
const selectedPool = ref<Record<string, any> | undefined>(undefined);

const key = ref('');
const certificate = ref('');

const certificateStatus = computed(() =>
  certificate.value && key.value ? t('vm.lb.cert.set.already') : ''
);
const filteredTargets = computed(() =>
  targets.value.filter(
    pool => pool.protocol === getPoolProtocol(protocol.value)
  )
);

onMounted(async () => {
  targets.value = await makeApiCall({
    apiCallFn: fetchLoadBalancerPoolList,
    payload: route.params.loadBalancerId,
  });
  globalStore.setBreadcrumbsParams({
    loadBalancerId: route.params.loadBalancerId,
  });
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_LOAD_BALANCER_LIST })
  );
});

const submit = () => {
  const listenerItem: any = {
    name: name.value,
    protocol: protocol.value,
    protocol_port: Number(port.value),
    allowed_cidrs: allowedCidrs.value.filter(i => i.cidr).map(i => i.cidr),
    timeout_client_data: Number(timeoutSettings.value.timeoutClientData) * 1000,
    timeout_member_connect:
      Number(timeoutSettings.value.timeoutMemberConnect) * 1000,
    timeout_member_data: Number(timeoutSettings.value.timeoutMemberData) * 1000,
    timeout_tcp_inspect: Number(timeoutSettings.value.timeoutTcpInspect) * 1000,
  };
  const insertHeaders: Record<string, string> = {};
  if (
    protocol.value === PROTOCOL.HTTP ||
    protocol.value === PROTOCOL.TERMINATED_HTTPS
  ) {
    Object.keys(headers.value).forEach(
      key => (insertHeaders[key] = `${headers.value[key]}`)
    );
    listenerItem.insert_headers = insertHeaders;
  }
  if (
    protocol.value === PROTOCOL.TERMINATED_HTTPS &&
    key.value &&
    certificate.value
  ) {
    listenerItem.secret = {
      key: window.btoa(key.value),
      certificate: window.btoa(certificate.value),
    };
  }
  if (enablePool.value && selectedPool.value?.id) {
    listenerItem.pool_id = selectedPool.value?.id;
  }
  makeApiCall({
    apiCallFn: createLoadBalancerListener,
    payload: {
      loadBalancerId: route.params.loadBalancerId,
      listenerItem,
    },
    successCallback: async () =>
      await router.push({
        name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
        params: {
          id: route.params.loadBalancerId,
        },
      }),
  });
};
const cancel = () => {
  void router.push({
    name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
    params: { id: route.params.loadBalancerId },
  });
};

const currentStep = ref(1);
const errSteps = ref<any[]>([]);
watch(currentStep, val => {
  if (currentStep.value === steps.value.length) {
    errSteps.value = getErrorSteps();
  } else {
    errSteps.value = [];
  }
});
const getErrorSteps = () => {
  const errSteps: any[] = [];
  if (currentStep.value !== steps.value.length) {
    return errSteps;
  }

  // basic info

  refNameInput.value?.validate();
  refFormBasic.value.validate();
  refSetter.value.validate();
  if (!validBasic.value) {
    errSteps.push(steps.value[0]);
  }
  return errSteps;
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('vm.lb.listener') })"
      />
      <v-col class="pt-4">
        <Step
          v-model="currentStep"
          :step-names="steps"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="cancel"
        >
          <v-stepper-window-item :value="1" eager>
            <ExpansionField :title="$t('vm.lb.listener')">
              <v-form ref="refFormBasic" v-model="validBasic">
                <TextFieldWithHint
                  ref="refNameInput"
                  v-model="name"
                  :title="$t('label.name')"
                  required
                  :text-field-col="6"
                  :type="'name'"
                  :title-hint="$t('vm.name.hint')"
                  @form-error="
                    event => {
                      formError.name = event[0];
                    }
                  "
                />

                <SelectWithHint
                  v-model="protocol"
                  :title="$t('vm.lb.listener.protocol')"
                  :items="Object.values(PROTOCOL)"
                  required
                  :selection-cols="6"
                />
                <TextFieldWithHint
                  v-model="port"
                  :title="$t('vm.lb.listener.port')"
                  :type="'number'"
                  :max-val="65535"
                  required
                  :text-field-col="6"
                />
                <TextFieldWithHint
                  v-if="protocol === PROTOCOL.TERMINATED_HTTPS"
                  :title="$t('basic.certification')"
                  :text-field-col="6"
                  :field-text="false"
                >
                  <div class="d-flex align-center">
                    <div class="mr-3">{{ certificateStatus }}</div>
                    <OutlinedBtn
                      :text="$t('basic.setting')"
                      @click="showCertDialog = true"
                    />
                  </div>
                </TextFieldWithHint>
                <TextFieldWithHint
                  v-if="
                    protocol === PROTOCOL.HTTP ||
                    protocol === PROTOCOL.TERMINATED_HTTPS
                  "
                  :title="$t('basic.insert') + ' Headers'"
                  :text-field-col="6"
                  :field-text="false"
                >
                  <div class="ml-n3 d-flex flex-wrap">
                    <v-checkbox
                      v-model="headers['X-Forwarded-For']"
                      class="pr-6"
                      color="primary"
                      label="X-Forwarded-For"
                    />
                    <v-checkbox
                      v-model="headers['X-Forwarded-Port']"
                      class="pr-6"
                      color="primary"
                      label="X-Forwarded-Port"
                    />
                    <v-checkbox
                      v-model="headers['X-Forwarded-Proto']"
                      color="primary"
                      label="X-Forwarded-Proto"
                    />
                  </div>
                </TextFieldWithHint>
                <TextFieldWithHint
                  v-if="
                    protocol === PROTOCOL.HTTPS ||
                    protocol === PROTOCOL.HTTP ||
                    protocol === PROTOCOL.TCP
                  "
                  :title="$t('basic.timeout')"
                  :text-field-col="3"
                  :field-text="false"
                >
                  <v-col cols="8">
                    <DetailTable
                      :headers="timeoutHeaders"
                      :items="[timeoutSettings]"
                    />
                    <OutlinedBtn
                      class="my-4"
                      :text="$t('basic.setting')"
                      @click="showTimeoutDialog = true"
                    />
                  </v-col>
                </TextFieldWithHint>
                <MultipleInputSetter
                  ref="refSetter"
                  :title="$t('basic.whitelist')"
                  :params="allowedCidrs"
                  :input-rules="[validation.ruleValidCidr]"
                  :column-infos="[
                    {
                      type: 'text-input',
                      colsNumber: 6,
                      placeholder: 'CIDR e.g. 10.0.0.0/24',
                    },
                  ]"
                  @add-new-item="
                    () => {
                      allowedCidrs.push({
                        cidr: '',
                      });
                    }
                  "
                  @delete-item="
                    (index: number) => {
                      allowedCidrs.splice(index, 1);
                    }
                  "
                />
              </v-form>
            </ExpansionField>
            <v-divider />
            <ExpansionField :title="$t('vm.lb.target.pool')">
              <TextFieldWithHint
                :title="$t('vm.lb.target.pool')"
                :text-field-col="6"
                :field-text="false"
              >
                <v-checkbox
                  v-model="enablePool"
                  class="mx-n3"
                  color="primary"
                  :label="$t('vm.lb.target.pool.assign')"
                />
              </TextFieldWithHint>
              <div v-if="enablePool">
                <div class="mb-2">
                  <span>{{ t('vm.lb.target.pool.message1') }}</span>
                  <router-link
                    class="px-1"
                    :to="{
                      name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
                      params: { id: route.params.loadBalancerId },
                      query: { tab: 'pool' },
                    }"
                  >
                    {{ t('vm.lb.target.pool') }}
                  </router-link>
                  <span>{{ t('vm.lb.target.pool.message2') }}</span>
                </div>
                <SelectWithHint
                  v-model="selectedPool"
                  :title="$t('basic.target')"
                  item-text="name"
                  :items="filteredTargets"
                  return-object
                  required
                  :selection-cols="6"
                />
                <TextFieldWithHint
                  v-if="selectedPool"
                  :model-value="selectedPool?.protocol"
                  :title="$t('vm.lb.target.pool.protocol')"
                  :selection-cols="6"
                  plain-text
                />
                <TextFieldWithHint
                  v-if="selectedPool"
                  :model-value="selectedPool?.member_port"
                  :title="$t('basic.port', { type: $t('vm.lb.target.pool') })"
                  :selection-cols="6"
                  plain-text
                />
              </div>
            </ExpansionField>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <v-row no-gutters>
              <AlertComponent
                v-if="errSteps.length > 0"
                :message="$t('form.error.alert')"
              />
              <CheckItem
                :key-name="$t('basic.name', { type: $t('vm.lb.listener') })"
                :value="name"
                :error-msg="formError.name"
              />
              <CheckItem
                :key-name="$t('vm.lb.listener.protocol')"
                :value="protocol"
              />
              <CheckItem :key-name="$t('vm.lb.listener.port')" :value="port" />
              <CheckItem
                v-if="protocol === PROTOCOL.TERMINATED_HTTPS"
                :key-name="$t('basic.certification')"
                :value="
                  certificate && key
                    ? $t('vm.lb.cert.set.already')
                    : $t('label.no')
                "
              />
              <CheckItem
                v-if="
                  protocol === PROTOCOL.HTTP ||
                  protocol === PROTOCOL.TERMINATED_HTTPS
                "
                :key-name="$t('basic.insert') + 'Headers'"
              >
                <v-chip
                  v-for="(header, index) in Object.keys(headers).filter(
                    header => headers[header]
                  )"
                  :key="index"
                  class="mr-2 mt-4"
                >
                  {{ header }}
                </v-chip>
              </CheckItem>
              <CheckItem
                v-if="
                  protocol === PROTOCOL.HTTPS ||
                  protocol === PROTOCOL.HTTP ||
                  protocol === PROTOCOL.TCP
                "
                :key-name="$t('basic.timeout')"
              >
                <v-col cols="8">
                  <DetailTable
                    class="pt-4"
                    :headers="timeoutHeaders"
                    :items="[timeoutSettings]"
                  />
                </v-col>
              </CheckItem>
              <CheckItem :key-name="$t('basic.whitelist')">
                <v-chip
                  v-for="(list, index) in allowedCidrs.filter(
                    (list: any) => list.cidr
                  )"
                  :key="index"
                  class="mr-2 mt-4"
                >
                  {{ list.cidr }}
                </v-chip>
              </CheckItem>
              <CheckItem
                :key-name="$t('vm.lb.target.pool')"
                :value="enablePool ? $t('label.yes') : $t('label.no')"
              />
              <v-row v-if="enablePool" no-gutters>
                <CheckItem
                  :key-name="
                    $t('basic.name', { type: $t('vm.lb.target.pool') })
                  "
                  :value="selectedPool?.name"
                />
                <CheckItem
                  :key-name="$t('vm.lb.target.pool.protocol')"
                  :value="selectedPool?.protocol"
                />
                <CheckItem
                  :key-name="$t('vm.lb.target.pool.port')"
                  :value="selectedPool?.member_port"
                />
              </v-row>
            </v-row>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
    <CertificateDialog
      v-model:show="showCertDialog"
      @submit="
        event => {
          certificate = event.certificate;
          key = event.key;
        }
      "
    />
    <VmTimeoutDialog
      v-model:show="showTimeoutDialog"
      :timeout="timeoutSettings"
      @submit="
        event => {
          timeoutSettings = event.timeout;
        }
      "
    />
  </UiContainer>
</template>

<style lang="scss" scoped>
.arrow {
  font-size: 24px !important;
  margin-top: 40px;
  margin-left: 20px;
  margin-right: 20px;
}
</style>
