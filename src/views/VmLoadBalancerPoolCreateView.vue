<script setup lang="ts">
import { useGlobal } from '@/store';
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchLoadBalancerDetail,
  fetchAutoScalingList,
  fetchVmNetworkPorts,
  createLoadBalancerPool,
} from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import VmMemberDialog from '@/components/VmLoadBalancerMemberDialog.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { PROTOCOL, METHOD } from '@/constants/VmConstants';
import i18n from '@/i18n';
const { t } = i18n.global;
interface FormError {
  name?: string;
}

const route = useRoute();
const router = useRouter();
const globalStore = useGlobal();
const { setProjectSwitchCallback } = useProjectSwitch();

const steps = computed(() => [t('label.basicInfo'), t('creation.step.review')]);

const loadBalancerItem = ref<Record<string, any>>({});
const vmList = ref<Record<string, any>[]>([]);
const autoScalingList = ref([]);
const balanceMethodList = ref(Object.values(METHOD));

const name = ref('target' + Math.floor(Date.now() / 1000));
const protocol = ref(PROTOCOL.HTTPS);
const port = ref('');
const method = ref(METHOD.ROUND_ROBIN);

const isMemberFromAutoScaling = ref(false);
const selectedMembers = ref<{ address: string; name: string; id?: string }[]>(
  []
);

const showMemberDialog = ref(false);
const refFormBasic = ref<any>(null);
const validBasic = ref(false);
const formError = ref<FormError>({});

onMounted(async () => {
  await fetchData();
  globalStore.setBreadcrumbsParams({
    loadBalancerId: route.params.loadBalancerId,
  });
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_LOAD_BALANCER_LIST })
  );
});

const fetchData = async () => {
  loadBalancerItem.value = await makeApiCall({
    apiCallFn: fetchLoadBalancerDetail,
    payload: route.params.loadBalancerId,
    successCallback: res => ({
      ...res,
      fipAddress: res.floating_ip?.address,
    }),
  });

  if (loadBalancerItem.value.network_id) {
    vmList.value = await makeApiCall({
      skipProgress: true,
      apiCallFn: fetchVmNetworkPorts,
      payload: loadBalancerItem.value.network_id,
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
  }

  if (globalStore.getIsPilotRegion) {
    autoScalingList.value = [];
  } else {
    const autoScalingApiCall = makeApiCall({
      apiCallFn: fetchAutoScalingList,
    });
    autoScalingList.value = await autoScalingApiCall;
  }
};

const submit = () => {
  makeApiCall({
    apiCallFn: createLoadBalancerPool,
    payload: {
      loadBalancerId: route.params.loadBalancerId,
      poolItem: isMemberFromAutoScaling.value
        ? {
            asg_id: selectedMembers.value[0].id,
            name: name.value,
            protocol: protocol.value,
            method: method.value,
            member_port: Number(port.value),
          }
        : {
            name: name.value,
            protocol: protocol.value,
            member_port: Number(port.value),
            method: method.value,
            members: selectedMembers.value.map(
              (member: { address: string; name: string }) => ({
                address: member.address,
                name: member.name,
              })
            ),
            // asg_id: 'string',
          },
    },
    successCallback: async () =>
      await router.push({
        name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
        params: { id: route.params.loadBalancerId },
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
  refFormBasic.value?.validate();
  if (!validBasic.value) {
    errSteps.push(steps.value[0]);
  }

  if (selectedMembers.value.length === 0) {
    errSteps.push(steps.value[0]);
  }
  return errSteps;
};

const submitMember = (event: { members: { ip: string; name?: string }[] }) => {
  const newMembers = event.members.map((member: any) => ({
    address: member.address,
    name: member.name ?? t('vm.lb.target.pool.custom'),
  }));
  selectedMembers.value = selectedMembers.value.concat(newMembers);
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('vm.lb.target.pool') })"
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
            <v-form ref="refFormBasic" v-model="validBasic">
              <TextFieldWithHint
                v-model="name"
                :title="$t('basic.name', { type: $t('vm.lb.target.pool') })"
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
                :items="
                  Object.values(PROTOCOL).filter(
                    item => item !== PROTOCOL.TERMINATED_HTTPS
                  )
                "
                :title="$t('vm.lb.target.pool.protocol')"
                :selection-cols="6"
              />
              <TextFieldWithHint
                v-model="port"
                :title="$t('basic.port', { type: $t('vm.lb.target.pool') })"
                :type="'number'"
                :max-val="65535"
                required
                :text-field-col="6"
                @form-error="
                  event => {
                    formError.name = event[0];
                  }
                "
              />
              <SelectWithHint
                v-model="method"
                :title="$t('vm.lb.method')"
                :items="balanceMethodList"
                required
                :selection-cols="6"
              />
              <RadioButtonSwitch
                :title="$t('vm.lb.target.pool.members.source')"
                :init-value="isMemberFromAutoScaling"
                :options="
                  globalStore.getIsPilotRegion
                    ? [{ label: $t('vm.instance') + ' & IP', value: false }]
                    : [
                        { label: $t('vm.instance') + ' & IP', value: false },
                        { label: $t('vm.as.instance'), value: true },
                      ]
                "
                is-required
                @selected="
                  event => {
                    selectedMembers = [];
                    isMemberFromAutoScaling = event;
                  }
                "
              />
              <TextFieldWithHint
                v-if="isMemberFromAutoScaling === false"
                :title="$t('vm.lb.target.pool.members')"
                :text-field-col="6"
                required
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
                      :items="selectedMembers"
                      :actions="[
                        {
                          label: $t('table.action.delete'),
                          action: (item: any, index: number) => {
                            selectedMembers.splice(index, 1);
                          },
                        },
                      ]"
                    />
                  </v-col>
                  <v-col>
                    <OutlinedBtn
                      class="my-4"
                      :text="$t('basic.add')"
                      @click="showMemberDialog = true"
                    />
                  </v-col>
                </v-row>
              </TextFieldWithHint>
              <SelectWithHint
                v-if="isMemberFromAutoScaling"
                :model-value="selectedMembers"
                :title="$t('vm.lb.target.pool.members')"
                item-text="name"
                :items="
                  autoScalingList.filter(
                    (asg: any) =>
                      !asg.lb_pool_id && asg.status?.toLowerCase() === 'active'
                  )
                "
                return-object
                required
                :selection-cols="6"
                @update:model-value="selectedMembers = [$event]"
              />
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <v-row no-gutters>
              <AlertComponent
                v-if="errSteps.length > 0"
                :message="$t('form.error.alert')"
              />
              <CheckItem
                :key-name="$t('basic.name', { type: $t('vm.lb.target.pool') })"
                :value="name"
              />
              <CheckItem
                :key-name="$t('vm.lb.target.pool.protocol')"
                :value="protocol"
              />
              <CheckItem
                :key-name="$t('basic.port', { type: $t('vm.lb.target.pool') })"
                :value="port"
              />
              <CheckItem :key-name="$t('vm.lb.method')" :value="method" />
              <CheckItem
                :key-name="$t('vm.lb.target.pool.members.source')"
                :value="
                  isMemberFromAutoScaling
                    ? $t('vm.as.instance')
                    : $t('vm.instance')
                "
              />
              <CheckItem :key-name="$t('vm.lb.target.pool.members')">
                <v-col cols="8" class="pt-4">
                  <DetailTable
                    :headers="
                      isMemberFromAutoScaling
                        ? [
                            {
                              title: $t('vm.lb.target.pool.members'),
                              value: 'name',
                            },
                          ]
                        : [
                            {
                              title: $t('vm.lb.target.pool.members'),
                              value: 'name',
                            },
                            {
                              title: 'IP',
                              value: 'address',
                            },
                          ]
                    "
                    :items="selectedMembers"
                    required
                  />
                </v-col>
              </CheckItem>
            </v-row>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
    <VmMemberDialog
      v-model:show="showMemberDialog"
      :vm-list="vmList"
      :selected-members="selectedMembers"
      @submit="submitMember"
    />
  </UiContainer>
</template>

<style lang="scss" scoped></style>
