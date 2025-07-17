<script lang="ts" setup>
import { useProject } from '@/store';
import { computed, watch, onMounted, ref, type Ref } from 'vue';

import {
  makeApiCall,
  fetchAppModuleCategoryList,
  fetchAppModuleList,
  createApplication,
  fetchVmFlavors,
  fetchVmNetworks,
  fetchVmSecurityGroups,
  fetchVmVolumes,
  fetchVmKeypairs,
} from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import FlavorTableSelection from '@/components/common/FlavorTableSelection.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';
import OptionCard from '@/components/common/OptionCard.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import router from '@/router';
import getTableHeaders, { TABLE_TYPE } from '@/utils/getTableHeaders';
import { sortByKey } from '@/utils/utils';

const { t } = i18n.global;
const { setProjectSwitchCallback } = useProjectSwitch();
const projectStore = useProject();
const projectId = computed(() => projectStore.getCurrentProject?.id);
const isCreateStep: Ref<boolean> = ref(false);

// select module
const moduleCategoryList: Ref<Record<string, any>[]> = ref([]);
const selectedModuleCategoryName: Ref<string> = ref('');
const showSelectModuleDialog: Ref<boolean> = ref(false);
const moduleList: Ref<Record<string, any>[]> = ref([]);
const selectCard = async (item: any) => {
  selectedModuleCategoryName.value = item.name;
  moduleList.value = await makeApiCall({
    apiCallFn: fetchAppModuleList,
    payload: item.id,
    errorResHandlingFn: () => [],
  });
  showSelectModuleDialog.value = true;
};
const selectedModule: Ref<Record<string, any> | undefined> = ref(undefined);
watch(
  () => showSelectModuleDialog.value,
  newVal => {
    if (newVal) {
      selectedModule.value = moduleList.value[0] ?? undefined;
    }
  }
);

onMounted(async () => {
  fetchInit();
  await fetchData();
  setProjectSwitchCallback(() => {
    void router.push({ name: PAGE_TYPES.APPLICATION_LIST });
  });
});
const fetchInit = () => {
  currentStep.value = 1;
  isCreateStep.value = false;
};
const fetchData = async () => {
  const allCategories = await makeApiCall({
    apiCallFn: fetchAppModuleCategoryList,
    errorResHandlingFn: () => [],
  });
  moduleCategoryList.value = allCategories.filter(
    (category: { moduleCount: number }) => category.moduleCount > 0
  );
};

// question groups: hardware, network, storage, authentication, (environments, others)...
interface Question {
  default?: any;
  description?: string;
  group: string;
  label: string;
  options?: any;
  required: boolean;
  type: string;
  variable: string;
  order?: number;
}

// Steps
const STEP_GROUP = {
  BASIC: 'basic',
  HARDWARE: 'hardware',
  NETWORK: 'network',
  STORAGE: 'storage',
  AUTHENTICATION: 'authentication',
  OTHERS: 'others',
  REVIEW: 'review',
};
const QUESTION_TYPE = {
  HARDWARE: {
    VPS_FLAVOR: 'vpsFlavor',
    VPS_GPU_FLAVOR: 'vpsGPUFlavor',
    VPS_VGPU_FLAVOR: 'vpsvGPUFlavor',
    NODE_COUNT: 'int',
  },
  NETWORK: {
    VPS_NETWORK: 'vpsNetwork',
    VPS_SECURITY_GROUPS: 'vpsSecurityGroups',
    PORT: 'port',
  },
  STORAGE: { VPS_VOLUME: 'vpsVolume' },
  AUTHENTICATION: {
    VPS_KEYPAIR: 'vpsKeypair',
    PASSWORD: 'password',
    SSH_PORT: 'sshPort',
  },
  OTHERS: { TEXTFIELD: 'string', NUMBER: 'int', PASSWORD: 'password' },
};
const steps: Ref<Record<string, string>[]> = ref([]);
const currentStep: Ref<number> = ref(1);
const questions: Ref<Question[]> = ref([]);
const answers: Ref<Record<string, any>> = ref({});
const formattedQuestions: Ref<Record<string, any>> = ref({});

const toCreateStep = async () => {
  questions.value =
    selectedModule.value?.questions?.questions.filter(
      (question: { group: string }) => question.group !== 'not_exposed'
    ) ?? [];
  formattedQuestions.value = formatQuestions();
  initSteps();
  await fetchInitQuestionData();
  isCreateStep.value = true;
};

const formatQuestions = () => {
  const genStepQuestions: any = {};
  questions.value.forEach(question => {
    if (!genStepQuestions[question.group]?.[question.type]) {
      if (!genStepQuestions[question.group]) {
        genStepQuestions[question.group] = {};
      }
      genStepQuestions[question.group][question.type] = [question];
    } else {
      genStepQuestions[question.group][question.type].push(question);
    }
  });
  return genStepQuestions;
};

const initSteps = () => {
  steps.value = [];
  steps.value.push({ name: t('creation.step.basic'), value: STEP_GROUP.BASIC });
  if (formattedQuestions.value[STEP_GROUP.HARDWARE]) {
    steps.value.push({
      name: t('creation.step.flavor'),
      value: STEP_GROUP.HARDWARE,
    });
  }
  if (formattedQuestions.value[STEP_GROUP.NETWORK]) {
    steps.value.push({
      name: t('creation.step.network'),
      value: STEP_GROUP.NETWORK,
    });
  }
  if (formattedQuestions.value[STEP_GROUP.STORAGE]) {
    steps.value.push({
      name: t('creation.step.storage'),
      value: STEP_GROUP.STORAGE,
    });
  }
  if (formattedQuestions.value[STEP_GROUP.AUTHENTICATION]) {
    steps.value.push({
      name: t('creation.step.auth'),
      value: STEP_GROUP.AUTHENTICATION,
    });
  }
  if (formattedQuestions.value[STEP_GROUP.OTHERS]) {
    steps.value.push({
      name: t('creation.step.others'),
      value: STEP_GROUP.OTHERS,
    });
  }
  steps.value.push({
    name: t('creation.step.review'),
    value: STEP_GROUP.REVIEW,
  });
};

const getStepNames = computed(() => {
  return steps.value.map(step => {
    return step.name;
  });
});

const getStepNumber = (stepGroup: string) => {
  return steps.value.findIndex(step => step.value === stepGroup) + 1;
};

const getQuestionsByType = (stepGroup: string, questionType: string) => {
  let questionArray: Question[] = [];
  if (
    formattedQuestions.value[stepGroup] &&
    formattedQuestions.value[stepGroup][questionType]?.length > 0
  ) {
    questionArray = formattedQuestions.value[stepGroup][questionType];
    // sort questions with same type if there is an key 'order'.
    if (questionArray.every(q => Number.isInteger(q.order))) {
      questionArray.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  }
  return questionArray;
};

// basic info
const name: Ref<string> = ref('app' + Math.floor(Date.now()));
const desc: Ref<string> = ref('');

// hardware
const flavorList: Ref<Record<string, any>[]> = ref([]);
const noGpuFlavors: Ref<Record<string, any>[]> = ref([]);
const gpuFlavors: Ref<Record<string, any>[]> = ref([]);
const vgpuFlavors: Ref<Record<string, any>[]> = ref([]);

const initFlavors = () => {
  flavorList.value.forEach(flavor => {
    if (flavor.tags?.includes('vgpu')) {
      vgpuFlavors.value.push(flavor);
    } else if (flavor.tags?.includes('gpu')) {
      gpuFlavors.value.push(flavor);
    } else {
      noGpuFlavors.value.push(flavor);
    }
  });
  getAllFlavorQuestions.value.forEach(fQuesiton => {
    answers.value[fQuesiton.variable] =
      getFilteredFlavors(fQuesiton.type)[0] ?? undefined;
  });
};

const flavorHeaders = (type: string) => {
  switch (type) {
    case QUESTION_TYPE.HARDWARE.VPS_FLAVOR:
      return getTableHeaders(
        TABLE_TYPE.FLAVOR,
        [
          {
            title: t('flavor.disk'),
            key: 'disk',
            subTitle: '(GB)',
          },
        ],
        ['gpu_count']
      );
    case QUESTION_TYPE.HARDWARE.VPS_GPU_FLAVOR:
    case QUESTION_TYPE.HARDWARE.VPS_VGPU_FLAVOR:
    default:
      return getTableHeaders(TABLE_TYPE.FLAVOR, [
        {
          title: t('flavor.disk'),
          key: 'disk',
          subTitle: '(GB)',
        },
      ]);
  }
};

const getFilteredFlavors = (type: string) => {
  switch (type) {
    case QUESTION_TYPE.HARDWARE.VPS_FLAVOR:
      return noGpuFlavors.value;
    case QUESTION_TYPE.HARDWARE.VPS_GPU_FLAVOR:
      return gpuFlavors.value;
    case QUESTION_TYPE.HARDWARE.VPS_VGPU_FLAVOR:
      return vgpuFlavors.value;
    default:
      return [];
  }
};

const getAllFlavorQuestions = computed(() => {
  return getQuestionsByType(
    STEP_GROUP.HARDWARE,
    QUESTION_TYPE.HARDWARE.VPS_FLAVOR
  )
    .concat(
      getQuestionsByType(
        STEP_GROUP.HARDWARE,
        QUESTION_TYPE.HARDWARE.VPS_GPU_FLAVOR
      )
    )
    .concat(
      getQuestionsByType(
        STEP_GROUP.HARDWARE,
        QUESTION_TYPE.HARDWARE.VPS_VGPU_FLAVOR
      )
    );
});

// network
const networkList: Ref<Record<string, any>[]> = ref([]);
const securityGroupList: Ref<Record<string, any>[]> = ref([]);

// storage
const volumeList: Ref<Record<string, any>[]> = ref([]);

// authentication
const keypairList: Ref<Record<string, any>[]> = ref([]);

const fetchInitQuestionData = async () => {
  // init base type for 'int'(datatype is string), 'boolean'
  questions.value.forEach(question => {
    if (question.type === 'int') {
      answers.value[question.variable] = question.default || '1';
    } else if (question.type === 'boolean') {
      answers.value[question.variable] = !!question.default || true;
    } else if (question.type === 'port') {
      answers.value[question.variable] = question.default || '80';
    } else if (question.type === 'sshPort') {
      answers.value[question.variable] = {
        enable: true,
        port: question.default || '22',
      };
    }
  });
  // HARDWARE
  const vpsFlavorCount = getAllFlavorQuestions.value.length;
  // NETWORK
  const vpsNetworkCount = getQuestionsByType(
    STEP_GROUP.NETWORK,
    QUESTION_TYPE.NETWORK.VPS_NETWORK
  ).length;
  const vpsSecurityGroupsCount = getQuestionsByType(
    STEP_GROUP.NETWORK,
    QUESTION_TYPE.NETWORK.VPS_SECURITY_GROUPS
  ).length;
  // STORAGE
  const vpsVolumeCount = getQuestionsByType(
    STEP_GROUP.STORAGE,
    QUESTION_TYPE.STORAGE.VPS_VOLUME
  ).length;
  // AUTHENTICATION
  const vpsKeypairCount = getQuestionsByType(
    STEP_GROUP.AUTHENTICATION,
    QUESTION_TYPE.AUTHENTICATION.VPS_KEYPAIR
  ).length;

  const apiCalls: Record<string, any>[] = [];
  if (vpsFlavorCount) {
    apiCalls.push({
      api: fetchVmFlavors,
      type: QUESTION_TYPE.HARDWARE.VPS_FLAVOR,
    });
  }
  if (vpsNetworkCount) {
    apiCalls.push({
      api: fetchVmNetworks,
      type: QUESTION_TYPE.NETWORK.VPS_NETWORK,
    });
  }
  if (vpsSecurityGroupsCount) {
    apiCalls.push({
      api: fetchVmSecurityGroups,
      type: QUESTION_TYPE.NETWORK.VPS_SECURITY_GROUPS,
    });
  }
  if (vpsVolumeCount) {
    apiCalls.push({
      api: fetchVmVolumes,
      type: QUESTION_TYPE.STORAGE.VPS_VOLUME,
    });
  }
  if (vpsKeypairCount) {
    apiCalls.push({
      api: fetchVmKeypairs,
      type: QUESTION_TYPE.AUTHENTICATION.VPS_KEYPAIR,
    });
  }

  const apiCallPromises = apiCalls.map(apiItem => {
    return makeApiCall({
      apiCallFn: apiItem.api,
      payload: projectId.value,
      errorResHandlingFn: () => [],
    });
  });
  await Promise.allSettled(apiCallPromises).then(resFull => {
    resFull.forEach((res: any, index: number) => {
      switch (index) {
        // Flavor
        case apiCalls
          .map(api => api.type)
          .indexOf(QUESTION_TYPE.HARDWARE.VPS_FLAVOR):
          flavorList.value = res.value.map((item: any) => ({
            ...item,
            memory: item?.memory / 1024,
            gpu_count: item?.gpu?.count ?? 0,
          }));
          initFlavors();
          break;
        // Network
        case apiCalls
          .map(api => api.type)
          .indexOf(QUESTION_TYPE.NETWORK.VPS_NETWORK):
          networkList.value = sortByKey(
            res.value.map((item: Record<string, any>) => {
              return {
                name: item.name,
                id: item.id,
                value: item.id,
              };
            })
          );
          // set default network
          getQuestionsByType(
            STEP_GROUP.NETWORK,
            QUESTION_TYPE.NETWORK.VPS_NETWORK
          ).forEach(question => {
            answers.value[question.variable] =
              networkList.value[0] ?? undefined;
          });
          break;
        // Security Group
        case apiCalls
          .map(api => api.type)
          .indexOf(QUESTION_TYPE.NETWORK.VPS_SECURITY_GROUPS):
          securityGroupList.value = sortByKey(
            res.value.map((item: Record<string, any>) => {
              return {
                name: item.name,
                id: item.id,
                value: item.id,
              };
            })
          );
          // set default security group
          getQuestionsByType(
            STEP_GROUP.NETWORK,
            QUESTION_TYPE.NETWORK.VPS_SECURITY_GROUPS
          ).forEach(question => {
            answers.value[question.variable] = [];
            answers.value[question.variable].push({
              securityGroup: securityGroupList.value[0] ?? undefined,
            });
          });
          break;
        // Volume
        case apiCalls
          .map(api => api.type)
          .indexOf(QUESTION_TYPE.STORAGE.VPS_VOLUME):
          volumeList.value = sortByKey(
            res.value
              .map((item: Record<string, any>) => {
                return {
                  name: item.name,
                  id: item.id,
                  status: item.status,
                  value: item.id,
                };
              })
              .filter(
                (volume: { status: string }) =>
                  volume.status?.toLowerCase() === 'available'
              )
          );
          // set default volume
          getQuestionsByType(
            STEP_GROUP.STORAGE,
            QUESTION_TYPE.STORAGE.VPS_VOLUME
          ).forEach((question: Record<string, any>, index) => {
            answers.value[question.variable] =
              volumeList.value[index] ?? undefined;
          });
          break;
        // Keypair
        case apiCalls
          .map(api => api.type)
          .indexOf(QUESTION_TYPE.AUTHENTICATION.VPS_KEYPAIR):
          keypairList.value = sortByKey(
            res.value.map((item: Record<string, any>) => {
              return {
                name: item.name,
                id: item.id,
                value: item.id,
              };
            })
          );
          // set default keypair
          getQuestionsByType(
            STEP_GROUP.AUTHENTICATION,
            QUESTION_TYPE.AUTHENTICATION.VPS_KEYPAIR
          ).forEach(question => {
            answers.value[question.variable] =
              keypairList.value[0] ?? undefined;
          });
          break;
      }
    });
  });
};

const sgOptions = computed(() => {
  const selectableSgs: Record<string, any>[][] = [];
  getQuestionsByType(
    STEP_GROUP.NETWORK,
    QUESTION_TYPE.NETWORK.VPS_SECURITY_GROUPS
  ).forEach((question, index) => {
    selectableSgs[index] = securityGroupList.value?.filter(
      sg =>
        !answers.value[question.variable].some(
          (item: { securityGroup: { id: string } }) =>
            item.securityGroup?.id === sg.id
        )
    );
  });
  return selectableSgs;
});

const volumeOptions = computed(() => {
  const selectedVolumes: Record<string, any>[] = [];

  getQuestionsByType(
    STEP_GROUP.STORAGE,
    QUESTION_TYPE.STORAGE.VPS_VOLUME
  ).forEach(question => {
    if (answers.value[question.variable]) {
      selectedVolumes.push(
        answers.value[question.variable] as Record<string, any>
      );
    }
  });
  return volumeList?.value.filter(
    volume => !selectedVolumes.some(item => item.id === volume.id)
  );
});

// summary
interface FormError {
  name?: string;
  nodeCount?: string[];
  networkPort?: string[];
  network?: string[];
  volume?: string[];
  sshPort?: string[];
  keypair?: string[];
  password?: string[];
  otherText?: string[];
  otherNumber?: string[];
  otherPassword?: string[];
}
const formError = ref<FormError>({});
const validBasic: Ref<boolean> = ref(true);
const validHardware: Ref<boolean> = ref(true);
const validAuthentication: Ref<boolean> = ref(true);

const nameInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);
const networkPortRefs = ref<InstanceType<typeof TextFieldWithHint>[]>([]);
const networkRefs = ref<InstanceType<typeof SelectWithHint>[]>([]);
const sshPortRefs = ref<InstanceType<typeof TextFieldWithHint>[]>([]);
const securityGroupRefs = ref<InstanceType<typeof MultipleInputSetter>[]>([]);
const volumeRefs = ref<InstanceType<typeof SelectWithHint>[]>([]);
const keypairRefs = ref<InstanceType<typeof SelectWithHint>[]>([]);
const passwordRefs = ref<InstanceType<typeof TextFieldWithHint>[]>([]);
const otherTextRefs = ref<InstanceType<typeof TextFieldWithHint>[]>([]);
const otherNumberRefs = ref<InstanceType<typeof TextFieldWithHint>[]>([]);
const otherPasswordRefs = ref<InstanceType<typeof TextFieldWithHint>[]>([]);

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

  // // basic
  nameInputRef.value?.validate();
  if (!validBasic.value) {
    errSteps.push(getStepNames.value[0]);
  }

  // hardware
  if (
    getAllFlavorQuestions.value.some(
      question => question.required && !answers.value[question.variable]
    ) ||
    getQuestionsByType(
      STEP_GROUP.HARDWARE,
      QUESTION_TYPE.HARDWARE.NODE_COUNT
    ).some(
      question => question.required && !answers.value[question.variable]
    ) ||
    !validHardware.value
  ) {
    errSteps.push(getStepNames.value[getStepNumber(STEP_GROUP.HARDWARE) - 1]);
  }

  // // network
  networkPortRefs.value.forEach(element => {
    element.validate();
  });
  networkRefs.value.forEach(element => {
    element.validate();
  });
  securityGroupRefs.value.forEach(element => {
    element.validate();
  });
  if (
    getQuestionsByType(
      STEP_GROUP.NETWORK,
      QUESTION_TYPE.NETWORK.VPS_NETWORK
    ).some(
      question => question.required && !answers.value[question.variable]?.name
    ) ||
    getQuestionsByType(
      STEP_GROUP.NETWORK,
      QUESTION_TYPE.NETWORK.VPS_SECURITY_GROUPS
    ).some(
      question =>
        question.required && !answers.value[question.variable][0]?.securityGroup
    ) ||
    getQuestionsByType(STEP_GROUP.NETWORK, QUESTION_TYPE.NETWORK.PORT).some(
      question => question.required && !answers.value[question.variable]
    )
  ) {
    errSteps.push(getStepNames.value[getStepNumber(STEP_GROUP.NETWORK) - 1]);
  }

  // storage
  volumeRefs.value.forEach(element => {
    element.validate();
  });
  if (
    getQuestionsByType(
      STEP_GROUP.STORAGE,
      QUESTION_TYPE.STORAGE.VPS_VOLUME
    ).some(
      question => question.required && !answers.value[question.variable]?.name
    )
  ) {
    errSteps.push(getStepNames.value[getStepNumber(STEP_GROUP.STORAGE) - 1]);
  }

  // authentication
  sshPortRefs.value.forEach(element => {
    element.validate();
  });
  keypairRefs.value.forEach(element => {
    element.validate();
  });
  passwordRefs.value.forEach(element => {
    element.validate();
  });
  if (
    getQuestionsByType(
      STEP_GROUP.AUTHENTICATION,
      QUESTION_TYPE.AUTHENTICATION.VPS_KEYPAIR
    ).some(
      question => question.required && !answers.value[question.variable]?.name
    ) ||
    getQuestionsByType(
      STEP_GROUP.AUTHENTICATION,
      QUESTION_TYPE.AUTHENTICATION.PASSWORD
    ).some(
      question => question.required && !answers.value[question.variable]
    ) ||
    !validAuthentication.value
  ) {
    errSteps.push(
      getStepNames.value[getStepNumber(STEP_GROUP.AUTHENTICATION) - 1]
    );
  }

  // others
  otherTextRefs.value.forEach(element => {
    element.validate();
  });
  otherNumberRefs.value.forEach(element => {
    element.validate();
  });
  otherPasswordRefs.value.forEach(element => {
    element.validate();
  });
  if (
    getQuestionsByType(STEP_GROUP.OTHERS, QUESTION_TYPE.OTHERS.TEXTFIELD).some(
      question => question.required && !answers.value[question.variable]
    ) ||
    getQuestionsByType(STEP_GROUP.OTHERS, QUESTION_TYPE.OTHERS.NUMBER).some(
      question => question.required && !answers.value[question.variable]
    ) ||
    getQuestionsByType(STEP_GROUP.OTHERS, QUESTION_TYPE.OTHERS.PASSWORD).some(
      question => question.required && !answers.value[question.variable]
    )
  ) {
    errSteps.push(getStepNames.value[getStepNumber(STEP_GROUP.OTHERS) - 1]);
  }

  return errSteps;
};

const getAnswers = computed(() => {
  // follow api format
  const payloadAnswers: Record<string, any> = {};
  questions.value.forEach(question => {
    switch (question.type) {
      case QUESTION_TYPE.HARDWARE.VPS_FLAVOR:
      case QUESTION_TYPE.HARDWARE.VPS_GPU_FLAVOR:
      case QUESTION_TYPE.HARDWARE.VPS_VGPU_FLAVOR:
      case QUESTION_TYPE.NETWORK.VPS_NETWORK:
      case QUESTION_TYPE.AUTHENTICATION.VPS_KEYPAIR:
      case QUESTION_TYPE.STORAGE.VPS_VOLUME:
        if (answers.value[question.variable].id) {
          payloadAnswers[question.variable] =
            answers.value[question.variable].id;
        }
        break;
      case QUESTION_TYPE.NETWORK.VPS_SECURITY_GROUPS:
        payloadAnswers[question.variable] = answers.value[
          question.variable
        ].map(
          (sg: { securityGroup: { id: string } }) => sg.securityGroup?.id ?? ''
        );
        break;
      case QUESTION_TYPE.AUTHENTICATION.SSH_PORT:
        payloadAnswers[question.variable] = answers.value[question.variable]
          .enable
          ? answers.value[question.variable].port
          : '';
        break;
      default:
        if (answers.value[question.variable]) {
          payloadAnswers[question.variable] = answers.value[question.variable];
        }
        break;
    }
  });
  return payloadAnswers;
});

const getPayload = computed(() => {
  const payload: any = {
    name: name.value ?? '',
    description: desc.value ?? '',
    moduleId: selectedModule.value?.id ?? '',
    answers: getAnswers.value,
  };
  return payload;
});

const submit = async () => {
  await makeApiCall({
    apiCallFn: createApplication,
    payload: getPayload.value,
    successCallback: async () =>
      await router.push({ name: PAGE_TYPES.APPLICATION_LIST }),
  });
};
const cancel = async () => {
  await router.push({ name: PAGE_TYPES.APPLICATION_LIST });
};

watch(
  () => i18n.global.locale,
  async () => {
    fetchInit();
    await fetchData();
  }
);
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('services.application') })"
      />
      <v-card
        v-if="!isCreateStep"
        width="100%"
        density="comfortable"
        class="pa-3"
      >
        <v-card-title class="text-h6 font-weight-bold">
          {{ $t('application.select') }}
        </v-card-title>
        <v-col cols="12">
          <v-row>
            <v-col
              v-for="(item, idx) in moduleCategoryList"
              :key="idx"
              cols="6"
            >
              <OptionCard :item="item" @update="event => selectCard(event)" />
            </v-col>
          </v-row>
        </v-col>
      </v-card>
      <v-col v-else>
        <Step
          v-model="currentStep"
          :step-names="getStepNames"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="cancel"
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
                @form-error="
                  event => {
                    formError.name = event[0];
                  }
                "
              />
              <TextFieldWithHint
                v-model="desc"
                :title="$t('basic.desc')"
                :text-field-col="6"
              />
            </v-form>
          </v-stepper-window-item>
          <!-- hardware -->
          <v-stepper-window-item
            v-if="getStepNumber(STEP_GROUP.HARDWARE) > 0"
            :value="getStepNumber(STEP_GROUP.HARDWARE)"
          >
            <v-form v-model="validHardware">
              <FlavorTableSelection
                v-for="(question, index) in getAllFlavorQuestions"
                :key="index"
                v-model="answers[question.variable]"
                :table-name="question.label"
                :headers="flavorHeaders(question.type)"
                :items="getFilteredFlavors(question.type)"
                :show-quota-header="index === 0"
              />
              <TextFieldWithHint
                v-for="(question, index) in getQuestionsByType(
                  STEP_GROUP.HARDWARE,
                  QUESTION_TYPE.HARDWARE.NODE_COUNT
                )"
                :key="index"
                v-model="answers[question.variable]"
                :title="question.label"
                :required="question.required"
                type="number"
                :min-val="1"
                :max-val="32"
                :text-field-col="6"
                @form-error="
                  event => {
                    if (!formError.nodeCount) formError.nodeCount = [];
                    formError.nodeCount[index] = event[0];
                  }
                "
              />
            </v-form>
          </v-stepper-window-item>
          <!-- network -->
          <v-stepper-window-item
            v-if="getStepNumber(STEP_GROUP.NETWORK) > 0"
            :value="getStepNumber(STEP_GROUP.NETWORK)"
          >
            <SelectWithHint
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.NETWORK,
                QUESTION_TYPE.NETWORK.VPS_NETWORK
              )"
              ref="networkRefs"
              :key="index"
              v-model="answers[question.variable]"
              class="pt-4"
              return-object
              :required="question.required"
              :title="question.label"
              :items="networkList"
              :selection-cols="6"
              @form-error="
                errMsg => {
                  if (!formError.network) formError.network = [];
                  formError.network[index] = errMsg;
                }
              "
            />
            <MultipleInputSetter
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.NETWORK,
                QUESTION_TYPE.NETWORK.VPS_SECURITY_GROUPS
              )"
              ref="securityGroupRefs"
              :key="index"
              :title="question.label"
              :required="question.required"
              :params="answers[question.variable]"
              :disable-add-item="sgOptions[index]?.length == 0"
              :column-infos="[
                {
                  type: 'select',
                  selectItems: sgOptions[index],
                  returnObject: true,
                  colsNumber: 6,
                },
              ]"
              @add-new-item="
                () => {
                  answers[question.variable].push({
                    securityGroup: sgOptions[index][0] ?? undefined,
                  });
                }
              "
              @delete-item="
                (idx: number) => {
                  answers[question.variable].splice(idx, 1);
                }
              "
            />
            <TextFieldWithHint
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.NETWORK,
                QUESTION_TYPE.NETWORK.PORT
              )"
              ref="networkPortRefs"
              :key="index"
              v-model="answers[question.variable]"
              :title="question.label"
              :required="question.required"
              type="number"
              :min-val="0"
              :max-val="65535"
              :text-field-col="6"
              @form-error="
                event => {
                  if (!formError.networkPort) formError.networkPort = [];
                  formError.networkPort[index] = event[0];
                }
              "
            />
          </v-stepper-window-item>
          <!-- storage -->
          <v-stepper-window-item
            v-if="getStepNumber(STEP_GROUP.STORAGE) > 0"
            :value="getStepNumber(STEP_GROUP.STORAGE)"
          >
            <SelectWithHint
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.STORAGE,
                QUESTION_TYPE.STORAGE.VPS_VOLUME
              )"
              ref="volumeRefs"
              :key="index"
              v-model="answers[question.variable]"
              class="pt-4"
              return-object
              :required="question.required"
              :title="question.label"
              :items="volumeOptions"
              :selection-cols="6"
              @form-error="
                errMsg => {
                  if (!formError.volume) formError.volume = [];
                  formError.volume[index] = errMsg;
                }
              "
            />
          </v-stepper-window-item>
          <!-- authentication -->
          <v-stepper-window-item
            v-if="getStepNumber(STEP_GROUP.AUTHENTICATION) > 0"
            :value="getStepNumber(STEP_GROUP.AUTHENTICATION)"
          >
            <v-form v-model="validAuthentication">
              <SelectWithHint
                v-for="(question, index) in getQuestionsByType(
                  STEP_GROUP.AUTHENTICATION,
                  QUESTION_TYPE.AUTHENTICATION.VPS_KEYPAIR
                )"
                ref="keypairRefs"
                :key="index"
                v-model="answers[question.variable]"
                class="pt-4"
                return-object
                :required="question.required"
                :title="question.label"
                :items="keypairList"
                :selection-cols="6"
                @form-error="
                  errMsg => {
                    if (!formError.keypair) formError.keypair = [];
                    formError.keypair[index] = errMsg;
                  }
                "
              />
              <TextFieldWithHint
                v-for="(question, index) in getQuestionsByType(
                  STEP_GROUP.AUTHENTICATION,
                  QUESTION_TYPE.AUTHENTICATION.PASSWORD
                )"
                ref="passwordRefs"
                :key="index"
                v-model="answers[question.variable]"
                :title="question.label"
                type="password"
                :text-field-col="6"
                :required="question.required"
                @form-error="
                  event => {
                    if (!formError.password) formError.password = [];
                    formError.password[index] = event[0];
                  }
                "
              />
              <v-row
                v-for="(question, index) in getQuestionsByType(
                  STEP_GROUP.AUTHENTICATION,
                  QUESTION_TYPE.AUTHENTICATION.SSH_PORT
                )"
                :key="index"
                no-gutters
              >
                <v-col cols="12">
                  <RadioButtonSwitch
                    :title="question.label"
                    :init-value="answers[question.variable].enable"
                    :is-required="question.required"
                    :is-inline="true"
                    :options="[
                      {
                        label: $t('basic.enabled'),
                        value: true,
                      },
                      {
                        label: $t('basic.disabled'),
                        value: false,
                      },
                    ]"
                    @selected="
                      value => {
                        answers[question.variable].enable = value;
                      }
                    "
                  />
                </v-col>
                <v-col cols="12">
                  <TextFieldWithHint
                    v-if="answers[question.variable].enable"
                    ref="sshPortRefs"
                    :key="index"
                    v-model="answers[question.variable].port"
                    :title="$t('basic.portNumber')"
                    :required="answers[question.variable].enable"
                    type="number"
                    :min-val="0"
                    :max-val="65535"
                    :text-field-col="6"
                    @form-error="
                      event => {
                        if (!formError.sshPort) formError.sshPort = [];
                        formError.sshPort[index] = event[0];
                      }
                    "
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-window-item>
          <!-- others -->
          <v-stepper-window-item
            v-if="getStepNumber(STEP_GROUP.OTHERS) > 0"
            :value="getStepNumber(STEP_GROUP.OTHERS)"
          >
            <TextFieldWithHint
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.OTHERS,
                QUESTION_TYPE.OTHERS.TEXTFIELD
              )"
              ref="otherTextRefs"
              :key="index"
              v-model="answers[question.variable]"
              :title="question.label"
              :required="question.required"
              :text-field-col="6"
              @form-error="
                event => {
                  if (!formError.otherText) formError.otherText = [];
                  formError.otherText[index] = event[0];
                }
              "
            />
            <TextFieldWithHint
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.OTHERS,
                QUESTION_TYPE.OTHERS.NUMBER
              )"
              ref="otherNumberRefs"
              :key="index"
              v-model="answers[question.variable]"
              :title="question.label"
              :required="question.required"
              type="number"
              :max-val="65535"
              :text-field-col="6"
              @form-error="
                event => {
                  if (!formError.otherNumber) formError.otherNumber = [];
                  formError.otherNumber[index] = event[0];
                }
              "
            />
            <TextFieldWithHint
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.OTHERS,
                QUESTION_TYPE.OTHERS.PASSWORD
              )"
              ref="otherPasswordRefs"
              :key="index"
              v-model="answers[question.variable]"
              :title="question.label"
              :required="question.required"
              type="password"
              :text-field-col="6"
              @form-error="
                event => {
                  if (!formError.otherPassword) formError.otherPassword = [];
                  formError.otherPassword[index] = event[0];
                }
              "
            />
          </v-stepper-window-item>
          <!-- summary -->
          <v-stepper-window-item :value="getStepNumber(STEP_GROUP.REVIEW)">
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
              :key-name="$t('application.name')"
              :value="selectedModuleCategoryName"
            />
            <CheckItem
              :key-name="$t('application.version')"
              :value="selectedModule?.name ?? ''"
            />
            <CheckItem
              v-for="(question, index) in getAllFlavorQuestions"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]?.name"
              :error-msg="
                answers[question.variable]?.name ? '' : $t('form.required')
              "
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.HARDWARE,
                QUESTION_TYPE.HARDWARE.NODE_COUNT
              )"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]"
              :error-msg="formError.nodeCount?.[index]"
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.NETWORK,
                QUESTION_TYPE.NETWORK.VPS_NETWORK
              )"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]?.name"
              :error-msg="formError.network?.[index]"
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.NETWORK,
                QUESTION_TYPE.NETWORK.VPS_SECURITY_GROUPS
              )"
              :key="index"
              :key-name="question.label"
            >
              <v-col cols="9">
                <div class="pt-4">
                  <v-chip
                    v-for="(sg, idx) in answers[question.variable]"
                    :key="idx"
                    class="mr-2"
                  >
                    {{ sg.securityGroup?.name ?? '' }}
                  </v-chip>
                  <span
                    v-if="
                      answers[question.variable].some(
                        (sg: any) => !sg.securityGroup
                      )
                    "
                    class="ocis-text-alert"
                  >
                    {{ `(${$t('form.error.pleaseCheck')})` }}
                  </span>
                </div>
              </v-col>
            </CheckItem>
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.NETWORK,
                QUESTION_TYPE.NETWORK.PORT
              )"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]"
              :error-msg="formError.networkPort?.[index]"
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.STORAGE,
                QUESTION_TYPE.STORAGE.VPS_VOLUME
              )"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]?.name"
              :error-msg="formError.volume?.[index]"
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.AUTHENTICATION,
                QUESTION_TYPE.AUTHENTICATION.VPS_KEYPAIR
              )"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]?.name"
              :error-msg="formError.keypair?.[index]"
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.AUTHENTICATION,
                QUESTION_TYPE.AUTHENTICATION.PASSWORD
              )"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]"
              password
              :error-msg="formError.password?.[index]"
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.AUTHENTICATION,
                QUESTION_TYPE.AUTHENTICATION.SSH_PORT
              )"
              :key="index"
              :key-name="question.label"
              :value="
                answers[question.variable].enable
                  ? `${t('basic.port')}: ${answers[question.variable].port}`
                  : $t('basic.close')
              "
              :error-msg="
                answers[question.variable].enable
                  ? formError.sshPort?.[index]
                  : ''
              "
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.OTHERS,
                QUESTION_TYPE.OTHERS.TEXTFIELD
              )"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]"
              :error-msg="formError.otherText?.[index]"
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.OTHERS,
                QUESTION_TYPE.OTHERS.NUMBER
              )"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]"
              :error-msg="formError.otherNumber?.[index]"
            />
            <CheckItem
              v-for="(question, index) in getQuestionsByType(
                STEP_GROUP.OTHERS,
                QUESTION_TYPE.OTHERS.PASSWORD
              )"
              :key="index"
              :key-name="question.label"
              :value="answers[question.variable]"
              password
              :error-msg="formError.otherPassword?.[index]"
            />
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
    <CommonDialog
      v-model:show="showSelectModuleDialog"
      :title="$t('application.select.version')"
      :disable-submit="!selectedModule"
      :cancel-btn-text="$t('basic.cancel')"
      :submit-callback="toCreateStep"
    >
      <TextFieldWithHint
        v-model="selectedModuleCategoryName"
        plain-text
        :title="$t('application.name')"
      />
      <SelectWithHint
        v-model="selectedModule"
        class="pt-4"
        required
        return-object
        :title="$t('application.version')"
        :items="moduleList"
      />
    </CommonDialog>
  </UiContainer>
</template>
