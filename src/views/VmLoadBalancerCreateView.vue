<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue';

import {
  makeApiCall,
  fetchVmNetworks,
  fetchVmNetworkPorts,
  createLoadBalancer,
} from '@/api';
import CertificateDialog from '@/components/CertificateDialog.vue';
import LoadBalancerMemberDialog from '@/components/VmLoadBalancerMemberDialog.vue';
import VmTimeoutDialog from '@/components/VmLoadBalancerTimeoutDialog.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
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
import { PROTOCOL, METHOD, timeoutHeaders } from '@/constants/VmConstants';
import i18n from '@/i18n';
import router from '@/router';
import { getPoolProtocol } from '@/utils/utils';
import validation from '@/utils/validation';

const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;
interface FormError {
  name?: string;
  network?: string;
  port?: string;
}

const refFormBasic = ref<any>(null);
const vmNetworkSelectRef = ref<any>(null);
const refFormListener = ref<any>(null);
const refSetter = ref<any>(null);

const validBasic = ref(false);
const validListener = ref(false);
const formError = ref<FormError>({});
const showCertDialog = ref(false);
const showTimeoutDialog = ref(false);
const showMemberDialog = ref(false);

const methodOptions = ref(Object.values(METHOD));
const networkList = ref([]);
const vmList = ref<Record<string, any>[]>([]);

const steps = computed(() => [
  t('label.basicInfo'),
  `${t('vm.lb.listener')} / ${t('vm.lb.target.pool')}`,
  t('creation.step.review'),
]);

const name = ref('lb' + Math.floor(Date.now()));
const description = ref('');
const selectedNetwork = ref<{ id: string; name: string } | undefined>(
  undefined
);

const listeners: Ref<Record<string, any>[]> = ref([]);
const selectedListener = ref<Record<string, any> | undefined>(undefined);
const selectedPoolMembers = ref<Record<string, any>[]>([]);

onMounted(async () => {
  await fetchData();
  addNewListener();
  selectedListener.value = listeners.value[0];
  setProjectSwitchCallback(backToList);
});

const fetchData = async () => {
  const networkListApiCall = makeApiCall({
    apiCallFn: fetchVmNetworks,
    errorResHandlingFn: () => [],
  });
  networkList.value = await networkListApiCall;
};

const addNewListener = () => {
  listeners.value.push({
    name: 'listener' + Math.floor(Date.now()),
    protocol: PROTOCOL.HTTPS,
    port: '',
    key: '',
    certificate: '',
    headers: {
      'X-Forwarded-For': false,
      'X-Forwarded-Proto': false,
      'X-Forwarded-Port': false,
    },
    timeout: {
      timeoutClientData: '50',
      timeoutMemberConnect: '5',
      timeoutMemberData: '50',
      timeoutTcpInspect: '0',
    },
    allowedCidrs: [],
    enablePool: false,
    pool: {
      name: 'pool' + Math.floor(Date.now()),
      protocol: PROTOCOL.HTTPS,
      port: '',
      method: METHOD.ROUND_ROBIN,
      members: [],
    },
  });
};

const openTimeoutDialog = (index: number) => {
  selectedListener.value = listeners.value[index];
  showTimeoutDialog.value = true;
};

const openCertDialog = (index: number) => {
  selectedListener.value = listeners.value[index];
  showCertDialog.value = true;
};

const openMemberDialog = (index: number) => {
  selectedListener.value = listeners.value[index];
  showMemberDialog.value = true;
  selectedPoolMembers.value = selectedListener.value.pool?.members || [];
};

const submitMember = (event: { members: any[] }) => {
  const members = event.members.map(member => ({
    name: member.name ?? t('vm.lb.target.pool.custom'),
    address: member.address,
  }));
  if (selectedListener.value) {
    selectedListener.value.pool.members =
      selectedListener.value?.pool.members.concat(members);
  }
};

const submit = () => {
  const payloadListeners = listeners.value.map(listener => {
    const pool = listener.pool;
    const listenerPayload: any = {
      name: listener.name,
      protocol: listener.protocol,
      protocol_port: Number(listener.port),

      timeout_client_data: Number(listener.timeout.timeoutClientData) * 1000,
      timeout_member_connect:
        Number(listener.timeout.timeoutMemberConnect) * 1000,
      timeout_member_data: Number(listener.timeout.timeoutMemberData) * 1000,
      timeout_tcp_inspect: Number(listener.timeout.timeoutTcpInspect) * 1000,
    };
    if (
      listener.protocol === PROTOCOL.HTTP ||
      listener.protocol === PROTOCOL.TERMINATED_HTTPS
    ) {
      Object.keys(listener.headers as Record<string, boolean>).forEach(
        key => (listener.headers[key] = `${listener.headers[key]}`)
      );
      listenerPayload.insert_headers = listener.headers;
    }
    if (
      listener.protocol === PROTOCOL.TERMINATED_HTTPS &&
      listener.certificate &&
      listener.key
    ) {
      listenerPayload.secret = {
        certificate: window.btoa(listener.certificate as string),
        key: window.btoa(listener.key as string),
      };
    }
    if (listener.allowedCidrs.length) {
      listenerPayload.allowed_cidrs = listener.allowedCidrs.map(
        (i: { cidr: string }) => i.cidr
      );
    }
    if (listener.enablePool) {
      listenerPayload.pool = {
        name: pool.name,
        protocol: pool.protocol,
        member_port: Number(pool.port),
        members: pool.members,
        method: pool.method,
      };
    }
    return listenerPayload;
  });
  return makeApiCall({
    apiCallFn: createLoadBalancer,
    payload: {
      name: name.value,
      description: description.value,
      network_id: selectedNetwork.value?.id,
      listeners: payloadListeners,
    },
    successCallback: backToList,
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
watch(selectedNetwork, async val => {
  vmList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchVmNetworkPorts,
    payload: val?.id,
    successCallback: res => {
      const servers = res.reduce(
        (
          accumulator: Record<string, any>[],
          item: { server?: Record<string, any> }
        ) => {
          if (item.server) {
            accumulator.push(item.server);
          }
          return accumulator;
        },
        []
      );
      return servers.map((vm: Record<string, any>) => ({
        ...vm,
        address: vm.private_ips[0],
      }));
    },
  });
});
const getErrorSteps = () => {
  const errSteps: any[] = [];
  if (currentStep.value !== steps.value.length) {
    return errSteps;
  }

  // basic info
  // refFormBasic.value.validate();
  vmNetworkSelectRef.value?.validate();
  if (!validBasic.value) {
    errSteps.push(steps.value[0]);
  }
  // refFormListener.value.forEach((element: { validate: () => void }) => {
  //   element.validate();
  // });
  // refSetter.value.forEach((element: { validate: () => void }) => {
  //   element.validate();
  // });
  if (!validListener.value) {
    errSteps.push(steps.value[1]);
  }

  return errSteps;
};

const expansionPanels = computed(() => {
  const panels = [];
  for (let i = 0; i < listeners.value.length; i++) {
    panels.push({
      title: listeners.value[i].name,
      value: 'listener' + (i + 1),
    });
  }
  return panels;
});
const backToList = () => {
  void router.push({ name: PAGE_TYPES.VM_LOAD_BALANCER_LIST });
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('services.loadBalancer') })"
      />
      <v-col class="pt-4">
        <Step
          v-model="currentStep"
          :step-names="steps"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="backToList"
        >
          <v-stepper-window-item :value="1" eager>
            <v-form ref="refFormBasic" v-model="validBasic">
              <v-row no-gutters>
                <v-col cols="12">
                  <TextFieldWithHint
                    v-model="name"
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
                    v-model="description"
                    :title="$t('basic.desc')"
                    :text-field-col="6"
                  />
                </v-col>
                <SelectWithHint
                  ref="vmNetworkSelectRef"
                  v-model="selectedNetwork"
                  :title="$t('services.virtualNetwork')"
                  :items="networkList"
                  :item-value="'id'"
                  :selection-cols="6"
                  required
                  return-object
                  @form-error="errMsg => (formError.network = errMsg)"
                />
              </v-row>
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2" eager>
            <DetailPanelGroup v-model="expansionPanels">
              <DetailPanel
                v-for="(listener, index) in listeners"
                :key="index"
                :title="expansionPanels[index].title"
                :value="expansionPanels[index].value"
                :show-delete="listeners.length > 1"
                @delete-action="listeners.splice(index, 1)"
              >
                <ExpansionField :title="$t('vm.lb.listener')">
                  <v-form ref="refFormListener" v-model="validListener">
                    <TextFieldWithHint
                      v-model="listener.name"
                      :title="$t('label.name')"
                      required
                      :text-field-col="6"
                      :type="'name'"
                      :title-hint="$t('vm.name.hint')"
                    />

                    <SelectWithHint
                      v-model="listener.protocol"
                      :title="$t('vm.lb.listener.protocol')"
                      :items="Object.values(PROTOCOL)"
                      :selection-cols="6"
                      @update:model-value="
                        $event =>
                          (listener.pool.protocol = getPoolProtocol($event))
                      "
                    />
                    <TextFieldWithHint
                      v-model="listener.port"
                      :title="$t('vm.lb.listener.port')"
                      :type="'number'"
                      :max-val="65535"
                      required
                      :text-field-col="6"
                    />
                    <TextFieldWithHint
                      v-if="listener.protocol === PROTOCOL.TERMINATED_HTTPS"
                      v-model="listener.certificate"
                      :title="$t('basic.certification')"
                      required
                      :text-field-col="6"
                      :field-text="false"
                    >
                      <div class="d-flex align-center">
                        <div
                          v-if="listener.certificate && listener.key"
                          class="mr-3"
                        >
                          {{ $t('vm.lb.cert.set.already') }}
                        </div>
                        <OutlinedBtn
                          :text="$t('basic.setting')"
                          @click="openCertDialog(index)"
                        />
                      </div>
                    </TextFieldWithHint>
                    <TextFieldWithHint
                      v-if="
                        listener.protocol === PROTOCOL.HTTP ||
                        listener.protocol === PROTOCOL.TERMINATED_HTTPS
                      "
                      :title="$t('basic.insert') + ' Headers'"
                      :text-field-col="6"
                      :field-text="false"
                    >
                      <div class="ml-n3 d-flex">
                        <v-checkbox
                          v-model="listener.headers['X-Forwarded-For']"
                          class="pr-6"
                          color="primary"
                          label="X-Forwarded-For"
                        />
                        <v-checkbox
                          v-model="listener.headers['X-Forwarded-Port']"
                          class="pr-6"
                          color="primary"
                          label="X-Forwarded-Port"
                        />
                        <v-checkbox
                          v-model="listener.headers['X-Forwarded-Proto']"
                          color="primary"
                          label="X-Forwarded-Proto"
                        />
                      </div>
                    </TextFieldWithHint>
                    <TextFieldWithHint
                      v-if="
                        listener.protocol === PROTOCOL.HTTPS ||
                        listener.protocol === PROTOCOL.HTTP ||
                        listener.protocol === PROTOCOL.TCP
                      "
                      :title="$t('basic.timeout')"
                      :text-field-col="6"
                      :field-text="false"
                    >
                      <div>
                        <DetailTable
                          :headers="timeoutHeaders"
                          :items="[listener.timeout]"
                        />
                        <OutlinedBtn
                          class="my-4"
                          :text="$t('basic.setting')"
                          @click="openTimeoutDialog(index)"
                        />
                      </div>
                    </TextFieldWithHint>
                    <MultipleInputSetter
                      ref="refSetter"
                      :title="$t('basic.whitelist')"
                      :params="listener?.allowedCidrs || []"
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
                          listener.allowedCidrs.push({
                            cidr: '',
                          });
                        }
                      "
                      @delete-item="
                        (index: number) => {
                          listener.allowedCidrs.splice(index, 1);
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
                      v-model="listener.enablePool"
                      class="mx-n3"
                      color="primary"
                      :label="$t('vm.lb.target.pool.create')"
                    />
                  </TextFieldWithHint>
                  <div v-if="listener.enablePool">
                    <TextFieldWithHint
                      ref="nameInputRef"
                      v-model="listener.pool.name"
                      :title="
                        $t('label.name.type', { type: $t('vm.lb.target.pool') })
                      "
                      required
                      :text-field-col="6"
                      :type="'name'"
                      :title-hint="$t('vm.name.hint')"
                      @form-error="
                        event => {
                          // formError.name = event[0];
                        }
                      "
                    />
                    <TextFieldWithHint
                      :model-value="listener.pool.protocol"
                      :title="$t('vm.lb.target.pool.protocol')"
                      required
                      :text-field-col="6"
                      plain-text
                    />
                    <TextFieldWithHint
                      v-model="listener.pool.port"
                      :title="
                        $t('basic.port', { type: $t('vm.lb.target.pool') })
                      "
                      required
                      :text-field-col="6"
                      @form-error="
                        event => {
                          // formError.port = event[0];
                        }
                      "
                    />
                    <SelectWithHint
                      v-model="listener.pool.method"
                      :title="$t('vm.lb.method')"
                      :items="methodOptions"
                      required
                      :selection-cols="6"
                    />
                    <TextFieldWithHint
                      :title="$t('vm.lb.target.pool.members')"
                      :text-field-col="6"
                      :field-text="false"
                    >
                      <v-row no-gutters>
                        <v-col cols="12">
                          <DetailTable
                            :headers="[
                              {
                                title: $t('vm.lb.target.pool.members'),
                                value: 'name',
                              },
                              {
                                title: 'IP',
                                value: 'address',
                              },
                            ]"
                            :items="listener.pool?.members"
                            :actions="[
                              {
                                label: $t('table.action.delete'),
                                action: (item: any, index: number) => {
                                  listener.pool.members.splice(index, 1);
                                },
                              },
                            ]"
                          />
                        </v-col>
                        <v-col>
                          <OutlinedBtn
                            class="my-4"
                            :text="$t('basic.add')"
                            @click="openMemberDialog(index)"
                          />
                        </v-col>
                      </v-row>
                    </TextFieldWithHint>
                  </div>
                </ExpansionField>
              </DetailPanel>
            </DetailPanelGroup>
            <OutlinedBtn
              class="my-4"
              :text="$t('vm.lb.listener.add')"
              @click="addNewListener()"
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="3">
            <v-row no-gutters>
              <AlertComponent
                v-if="errSteps.length > 0"
                :message="$t('form.error.alert')"
              />
              <CheckItem
                :key-name="$t('label.name')"
                :value="name"
                :error-msg="formError.name"
              />

              <CheckItem :key-name="$t('basic.desc')" :value="description" />
              <CheckItem
                :key-name="$t('vm.network')"
                :value="selectedNetwork?.name"
                :error-msg="formError.network"
              />
              <v-row
                v-for="(listener, index) in listeners"
                :key="index"
                no-gutters
              >
                <v-divider class="mt-6" />
                <span class="ocis-form-title">
                  {{ listener.name }}
                </span>
                <CheckItem
                  :key-name="$t('vm.lb.listener')"
                  :value="listener.name"
                  :error-msg="listener.name ? '' : $t('form.required')"
                />
                <CheckItem
                  :key-name="$t('vm.lb.listener.protocol')"
                  :value="listener.protocol"
                />
                <CheckItem
                  :key-name="$t('vm.lb.listener.port')"
                  :value="listener.port"
                  :error-msg="listener.port ? '' : $t('form.required')"
                />
                <CheckItem
                  v-if="listener.protocol === PROTOCOL.TERMINATED_HTTPS"
                  :key-name="$t('basic.certification')"
                  :value="
                    listener.certificate && listener.key
                      ? $t('vm.lb.cert.set.already')
                      : $t('label.no')
                  "
                />
                <CheckItem
                  v-if="
                    listener.protocol === PROTOCOL.HTTP ||
                    listener.protocol === PROTOCOL.TERMINATED_HTTPS
                  "
                  :key-name="$t('basic.insert') + 'Headers'"
                >
                  <v-chip
                    v-for="(header, index) in Object.keys(
                      listener.headers
                    ).filter(header => listener.headers[header] === true)"
                    :key="index"
                    class="mr-2 mt-4"
                  >
                    {{ header }}
                  </v-chip>
                </CheckItem>
                <CheckItem
                  v-if="
                    listener.protocol === PROTOCOL.HTTPS ||
                    listener.protocol === PROTOCOL.HTTP ||
                    listener.protocol === PROTOCOL.TCP
                  "
                  :key-name="$t('basic.timeout')"
                >
                  <DetailTable
                    class="pt-4"
                    :headers="timeoutHeaders"
                    :items="[listener.timeout]"
                  />
                </CheckItem>
                <CheckItem :key-name="$t('basic.whitelist')">
                  <v-chip
                    v-for="(list, index) in listener.allowedCidrs.filter(
                      (list: any) => list.cidr
                    )"
                    :key="index"
                    class="mr-2 mt-4"
                  >
                    {{ list.cidr }}
                  </v-chip>
                </CheckItem>
                <!-- <span class="ocis-form-title">
                  {{ $t('vm.lb.target.pool') }}
                </span> -->
                <CheckItem
                  :key-name="$t('vm.lb.target.pool')"
                  :value="
                    listener.enablePool ? $t('label.yes') : $t('label.no')
                  "
                />
                <v-row v-if="listener.enablePool" no-gutters>
                  <CheckItem
                    :key-name="$t('vm.lb.target.pool') + $t('basic.name')"
                    :value="listener.pool.name"
                    :error-msg="listener.pool.name ? '' : $t('form.required')"
                  />
                  <CheckItem
                    :key-name="$t('vm.lb.target.pool.protocol')"
                    :value="listener.pool.protocol"
                  />
                  <CheckItem
                    :key-name="
                      $t('basic.port', { type: $t('vm.lb.target.pool') })
                    "
                    :value="listener.pool.port"
                    :error-msg="listener.pool.port ? '' : $t('form.required')"
                  />
                  <CheckItem
                    :key-name="$t('vm.lb.method')"
                    :value="listener.pool.method"
                  />
                  <CheckItem :key-name="$t('vm.lb.target.pool.members')">
                    <v-col cols="8" class="pt-4">
                      <DetailTable
                        :headers="[
                          {
                            title: $t('vm.lb.target.pool.members'),
                            value: 'name',
                          },
                          {
                            title: 'IP',
                            value: 'address',
                          },
                        ]"
                        :items="listener?.pool.members || []"
                      />
                    </v-col>
                  </CheckItem>
                </v-row>
              </v-row>
            </v-row>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
    <CertificateDialog
      v-model:show="showCertDialog"
      :set-certificate="selectedListener?.certificate || ''"
      :set-key="selectedListener?.key || ''"
      @submit="
        event => {
          if (selectedListener) {
            selectedListener.certificate = event.certificate;
            selectedListener.key = event.key;
          }
        }
      "
    />
    <VmTimeoutDialog
      v-model:show="showTimeoutDialog"
      :timeout="selectedListener?.timeout"
      @submit="
        event => {
          if (selectedListener) {
            selectedListener.timeout = event.timeout;
          }
        }
      "
    />
    <LoadBalancerMemberDialog
      v-model:show="showMemberDialog"
      :vm-list="vmList"
      :selected-members="selectedPoolMembers"
      @submit="submitMember"
    />
  </UiContainer>
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
