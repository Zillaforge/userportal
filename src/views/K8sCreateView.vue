<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type Ref, watch } from 'vue';

import {
  CLUSTER_STATUS,
  createK8sCluster,
  fetchK8sFlavorList,
  fetchK8sFloatingIpList,
  fetchK8sVersionList,
  fetchSgList,
  makeApiCall,
} from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import FlavorTableSelection from '@/components/common/FlavorTableSelection.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useK8sCluster from '@/composables/useK8sCluster';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import * as K8s from '@/interfaces/K8sInterface';
import getTableHeaders, { TABLE_TYPE } from '@/utils/getTableHeaders';

const { t } = i18n.global;
const { setProjectSwitchCallback } = useProjectSwitch();
const { toListPage, defaultItem, filterK8sFlavor, RANGE } = useK8sCluster(
  PAGE_TYPES.K8S_CLUSTER_CREATE
);

const steps = computed(() => [
  t('creation.step.basic'),
  t('creation.step.flavor'),
  t('creation.step.network'),
  t('creation.step.review'),
]);

const isLoading: Ref<boolean> = ref(false);
const currentStep: Ref<number> = ref(1);

// basic info
const name: Ref<string> = ref('k8s' + Math.floor(Date.now()));
const desc: Ref<string> = ref('');

// hardware settings
const selectedWorkerFlavor: Ref<K8s.Flavor> = ref(defaultItem.flavor);
const workerNodeCount: Ref<string | number> = ref(1);
const masterNodeCountList = ref([1, 3, 5]);
const masterNodeCount = ref(masterNodeCountList.value[0] || 1);
const displayQuota = ref(false);

const k8sVersionList: Ref<{ version: string }[]> = ref([]);
const flavorList: Ref<K8s.Flavor[]> = ref([defaultItem.flavor]);
const sgList = ref([]);

const selectedVersion = ref('');
const selectedSgs = ref<{ sg: Record<string, any> | undefined }[]>([
  { sg: undefined },
]);
const getNetworkHeaders = computed(() => [
  {
    title: t('k8s.network.ip.float'),
    value: 'fip',
  },
  {
    title: t('services.securityGroup'),
    value: 'sg',
  },
]);

// ip
const FIP = {
  NONE: 'none',
  AUTO: 'auto',
  EXIST: 'exist',
};
const selectedIpType: Ref<string> = ref('none');
const selectedExistIp: Ref<K8s.IP> = ref(defaultItem.ip);
const ipList = ref([]);
const ipOptions = computed(() => [
  {
    label: t('k8s.network.ip.none'),
    value: FIP.NONE,
  },
  {
    label: t('k8s.network.ip.auto'),
    value: FIP.AUTO,
  },
  {
    label: t('k8s.network.ip.exist'),
    value: FIP.EXIST,
  },
]);

const nameInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);
const versionInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(
  null
);

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(() => toListPage());
  await initData();
});

const fetchData = async () => {
  isLoading.value = true;

  // K8s Versions
  k8sVersionList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchK8sVersionList,
  });

  // Flavor list

  const flavors: K8s.Flavor[] = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchK8sFlavorList,
  });
  flavorList.value = filterK8sFlavor(flavors);

  ipList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchK8sFloatingIpList,
  });

  sgList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchSgList,
  });

  isLoading.value = false;
};

const initData = async () => {
  void nextTick(() => {
    // select default version
    selectedVersion.value = getVersionList.value[0];

    // select default flavor
    if (getFlavorList.value.length) {
      selectedWorkerFlavor.value = getFlavorList.value[0];
    }

    if (getFloatingIpList.value.length) {
      selectedExistIp.value = getFloatingIpList.value[0];
    }
  });
};

const getVersionList = computed(() => {
  // make descending
  return k8sVersionList.value
    .map(el => el.version)
    .sort((a, b) => (a > b ? 1 : -1))
    .reverse();
});

const getFlavorHeaders = computed(() => {
  return getTableHeaders(TABLE_TYPE.FLAVOR);
});

const getFlavorList = computed(() => {
  return flavorList.value;
});

const getFloatingIpList = computed(() => {
  return ipList.value
    .filter((ip: any) => {
      return ip.status === 'DOWN';
    })
    .map((ip: any) => {
      return {
        id: ip.id,
        address: ip.address,
      };
    });
});

const getSgList = computed(() => {
  return sgList.value.map((sg: any) => {
    return {
      id: sg.id,
      name: sg.name,
    };
  });
});

// Sg Options. Without duplicated selection.
const getSgOptions = computed(() => {
  return getSgList.value.filter(sg => {
    const match = selectedSgs.value.find(select => {
      return select?.sg?.id === sg.id;
    });
    return !match;
  });
});

const getSelectedSgList = computed(() => {
  const validSgList: any[] = [];
  selectedSgs.value.forEach(sg => {
    if ((sg?.sg?.id ?? '') !== '') {
      validSgList.push(sg.sg);
    }
  });
  return validSgList;
});

const enableAddSgBtn = computed(() => {
  return (
    getSgOptions.value.length >
    selectedSgs.value.length - getSelectedSgList.value.length
  );
});

const getCheckNetwork = computed(() => {
  let fip: string;
  if (selectedIpType.value === FIP.NONE) {
    fip = t('k8s.network.ip.none');
  } else if (selectedIpType.value === FIP.AUTO) {
    fip = t('k8s.network.ip.auto');
  } else {
    fip = selectedExistIp.value.address;
  }
  return [
    {
      fip,
      sg: getSelectedSgList.value.map(sg => sg.name),
    },
  ];
});

const handleSubmit = async () => {
  let endpointPublicAccess: boolean = false;
  let staticIpId = '';

  switch (selectedIpType.value) {
    case FIP.NONE:
      endpointPublicAccess = false;
      staticIpId = '';
      break;
    case FIP.AUTO:
      endpointPublicAccess = true;
      staticIpId = '';
      break;
    case FIP.EXIST:
      endpointPublicAccess = true;
      staticIpId = selectedExistIp.value.id;
      break;
  }

  const createItem = {
    clusterName: name.value,
    description: desc.value,
    k8sVersion: selectedVersion.value,
    endpointPublicAccess,
    staticIpId,
    securityGroupIds: getSelectedSgList.value.map(sg => sg.id),
    workerFlavorId: selectedWorkerFlavor.value.id,
    hasGPU: !!selectedWorkerFlavor.value?.gpu_count,
    // workerRootVolumeSize: 40,
    masterCount: Number(masterNodeCount.value),
    workerCount: Number(workerNodeCount.value),
    apiServerLog: true,
    kubernetesAuditLog: true,
    controllerManagerLog: true,
    kubeSchedulerLog: true,
  };

  await makeApiCall({
    apiCallFn: createK8sCluster,
    payload: createItem,
    successCallback: (res: any) => {
      if (res?.clusterStatus === CLUSTER_STATUS.CREATE_PENDING) {
        showReviewTipDialog.value = true;
      } else {
        toListPage();
      }
    },
    errorCallback: () => {},
  });
};

// summary
interface FormError {
  name?: string;
  version?: string;
  flavor?: string;
  workerCount?: string;
  security?: string;
  floatingIp?: string;
}

// validation
const validBasic = ref(false);
const formError = ref<FormError>({});

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

  // basic (step 1)
  nameInputRef.value?.validate();
  versionInputRef.value?.validate();
  if (!validBasic.value || !versionInputRef.value) {
    errSteps.push(steps.value[0]);
  }

  // hardware (step 2)
  if (selectedWorkerFlavor.value.id === '') {
    formError.value.flavor = t('form.required');
  }
  const validMaster = masterNodeCountList.value.includes(masterNodeCount.value);
  const count = Number(workerNodeCount.value);
  const validWorker = count >= RANGE.MIN && count <= RANGE.MAX;
  if (!validMaster || !validWorker || !selectedWorkerFlavor.value.id) {
    errSteps.push(steps.value[1]);
  }

  // network (step 3)
  if (selectedIpType.value === FIP.EXIST && selectedExistIp.value.id === '') {
    errSteps.push(steps.value[2]);
  }
  if (!getSelectedSgList.value.length) {
    formError.value.security = t('form.required');
    errSteps.push(steps.value[2]);
  }

  return errSteps;
};
const showReviewTipDialog: Ref<boolean> = ref(false);
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('services.k8sCluster') })"
      />
      <v-col>
        <Step
          v-model="currentStep"
          :step-names="steps"
          :err-steps="errSteps"
          @submit="handleSubmit"
          @cancel="toListPage"
        >
          <!-- basic info -->
          <v-stepper-window-item :value="1">
            <v-form v-model="validBasic">
              <TextFieldWithHint
                ref="nameInputRef"
                v-model="name"
                :title="$t('label.name')"
                required
                :text-field-col="6"
                :type="'name'"
                :max-name-length="24"
                @form-error="event => (formError.name = event[0])"
              />
              <TextFieldWithHint
                v-model="desc"
                :title="$t('basic.desc')"
                :text-field-col="6"
              />
              <SelectWithHint
                ref="versionInputRef"
                v-model="selectedVersion"
                required
                :title="$t('k8s.version')"
                :items="getVersionList"
                :selection-cols="6"
                @form-error="event => (formError.version = event)"
              />
            </v-form>
          </v-stepper-window-item>

          <!-- hardware settings -->
          <v-stepper-window-item :value="2">
            <div class="mt-3 mb-1">
              <a class="ocis-external-link" @click="displayQuota = true">
                {{ $t('creditCalculation.view.quota') }}
                <v-icon size="24">mdi-open-in-new</v-icon>
              </a>
            </div>
            <SelectWithHint
              v-model="masterNodeCount"
              class="pt-4"
              required
              :title="$t('k8s.masterNode.number')"
              :items="masterNodeCountList"
              :selection-cols="9"
            />
            <v-divider />
            <FlavorTableSelection
              v-model="selectedWorkerFlavor"
              :headers="getFlavorHeaders"
              :items="getFlavorList"
              :show-quota-header="false"
              :display-quota="displayQuota"
              :table-name="$t('k8s.workerNode.hardware.setting')"
              @close-quota-dialog="displayQuota = false"
            />
            <TextFieldWithHint
              v-model="workerNodeCount"
              required
              :title="$t('label.computingNode.number')"
              type="number"
              :text-field-col="9"
              :min-val="RANGE.MIN"
              :max-val="RANGE.MAX"
              @form-error="event => (formError.workerCount = event[0])"
            />
          </v-stepper-window-item>

          <!-- virtual network -->
          <v-stepper-window-item :value="3">
            <RadioButtonSwitch
              :title="$t('k8s.network.ip.add')"
              :init-value="selectedIpType"
              :options="ipOptions"
              is-inline
              is-required
              @selected="
                (event: string) => {
                  selectedIpType = event;
                }
              "
            />
            <SelectWithHint
              v-if="selectedIpType === FIP.EXIST"
              v-model="selectedExistIp"
              class="pt-4"
              required
              :title="$t('k8s.network.ip.float')"
              :items="getFloatingIpList"
              item-text="address"
              item-value="id"
              :selection-cols="6"
            />
            <MultipleInputSetter
              :title="$t('virtualNetwork.securityGroup')"
              :tooltip="$t('k8s.network.sg.tooltip')"
              required
              :params="selectedSgs"
              :disable-add-item="!enableAddSgBtn"
              :column-infos="[
                {
                  type: 'select',
                  selectItems: getSgOptions,
                  colsNumber: 6,
                  returnObject: true,
                },
              ]"
              @add-new-item="
                () => {
                  selectedSgs.push({ sg: { id: '', name: '' } });
                }
              "
              @delete-item="
                (index: number) => {
                  selectedSgs.splice(index, 1);
                }
              "
            />
          </v-stepper-window-item>

          <!-- summary -->
          <v-stepper-window-item :value="4">
            <AlertComponent
              v-if="errSteps.length > 0"
              :message="$t('form.error.alert')"
            />
            <CheckItem
              :key-name="$t('label.name')"
              :error-msg="formError.name"
              :value="name"
            />
            <CheckItem :key-name="$t('basic.desc')" :value="desc" />
            <CheckItem
              :key-name="$t('k8s.version')"
              :error-msg="formError.version"
              :value="selectedVersion"
            />
            <CheckItem
              :key-name="$t('k8s.masterNode.number')"
              :value="`${masterNodeCount}`"
            />
            <CheckItem
              :key-name="$t('k8s.workerNode.hardware.setting')"
              :error-msg="formError.flavor"
              :value="selectedWorkerFlavor.name"
            />
            <CheckItem
              :key-name="$t('k8s.workerNode.number')"
              :error-msg="formError.workerCount"
              :value="`${workerNodeCount}`"
            />
            <CheckItem :key-name="$t('creation.step.network')">
              <v-col cols="9">
                <DetailTable
                  :items="getCheckNetwork"
                  :headers="getNetworkHeaders"
                />
              </v-col>
            </CheckItem>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
    <CommonDialog
      v-model:show="showReviewTipDialog"
      :title="$t('application.createed.dialog.msg')"
      :show-cancel-btn="false"
      :submit-callback="toListPage"
    />
  </UiContainer>
</template>
