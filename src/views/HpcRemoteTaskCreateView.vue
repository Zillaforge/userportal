<script setup lang="ts">
import { useGlobal } from '@/store';
import { ref, computed, watch, onMounted, type Ref } from 'vue';

import type { ExternalLinkItem } from '@/interfaces/LayoutItemInterface';

import {
  makeApiCall,
  fetchResourceProviderList,
  fetchRemoteResourceList,
  fetchRemoteFlavorList,
  createRemoteTask,
} from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import ExternalLink from '@/components/common/ExternalLink.vue';
import FlavorTableSelection from '@/components/common/FlavorTableSelection.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import router from '@/router';
import { getDataStorageSchema } from '@/utils/utils';

const { uiShowDialog } = useGlobal();
const { setProjectSwitchCallback } = useProjectSwitch();
const { s3BucketList, execFetchS3BucketList } = useCloudStorage(
  PAGE_TYPES.HPC_REMOTE_TASK_CREATE
);
const { t } = i18n.global;
interface FormError {
  name?: string;
  provider?: string;
  remoteImage?: string;
}

const steps = computed(() => [
  t('creation.step.basic'),
  t('creation.step.flavor'),
  t('creation.step.storage'),
  t('creation.step.variables'),
  t('creation.step.script'),
  t('creation.step.review'),
]);

// basic
const name: Ref<string> = ref('hpc' + Math.floor(Date.now()));
const description = ref('');
const providerList: Ref<string[]> = ref([]);
const provider = ref('');
const remoteResources: Ref<Record<string, any>[]> = ref([]);
const remoteImage: Ref<Record<string, any> | undefined> = ref(undefined);
const remoteImageLink: Ref<ExternalLinkItem> = ref<ExternalLinkItem>({
  linkTo: '/user/hpcRemote/image/create',
  text: t('basic.create.type', { type: t('services.hpc.remote.image') }),
  unique: false,
});
const remoteImageList = computed(() => {
  return remoteResources.value.filter(
    res =>
      res.provider === provider.value &&
      res.type === 'image' &&
      res.status === 'finished'
  );
});

// hardware
const flavorHeaders = ref([
  {
    title: t('label.name'),
    key: 'name',
    sortable: false,
    width: '20%',
  },
  {
    title: t('HpcRemoteTask.flavor.node'),
    key: 'nodes',
    subTitle: t('HpcRemoteTask.flavor.node.subtitle'),
    width: '20%',
  },
  {
    title: 'GPU',
    key: 'gpu',
    subTitle: t('HpcRemoteTask.flavor.gpu.subtitle'),
    width: '20%',
  },
  {
    title: 'CPU',
    key: 'cpu',
    subTitle: t('HpcRemoteTask.flavor.cpu.subtitle'),
    width: '20%',
  },
  {
    title: t('flavor.memory'),
    key: 'memory',
    subTitle: t('HpcRemoteTask.flavor.memory.subtitle'),
    width: '20%',
  },
]);
const allFlavorList: Ref<Record<string, any>[]> = ref([]);
const flavorList = computed(() => {
  return allFlavorList.value
    .filter(flv => flv.provider === provider.value)
    .map(flavor => {
      return {
        id: flavor.id,
        name: flavor.name,
        gpu: flavor.metadata?.gpus_per_node,
        cpu: flavor.metadata?.cpus_per_task,
        memory: flavor.metadata?.memory_per_cpu / 1024,
        nodes: flavor.metadata?.nodes,
      };
    });
});
const selectedFlavor: Ref<Record<string, any> | undefined> = ref(undefined);

// storage
const datasets = ref<
  { remoteDataset: Record<string, any> | undefined; path: string }[]
>([{ remoteDataset: undefined, path: '' }]);

const outputPaths = ref<{ outputPath: string }[]>([{ outputPath: '' }]);
const validOutputPath = computed(() => {
  return outputPaths.value.filter(path => !!path.outputPath);
});

const remoteDatasetList = computed(() => {
  return remoteResources.value
    .filter(
      res =>
        res.provider === provider.value &&
        res.type === 'dataset' &&
        res.status === 'finished'
    )
    .map(dataset => {
      return {
        name: dataset.name,
        value: dataset.id,
      };
    });
});

const addDataset = () => {
  datasets.value.push({ remoteDataset: undefined, path: '' });
};
const removeDataset = (index: number) => {
  datasets.value.splice(index, 1);
};
const addOutputpath = () => {
  outputPaths.value.push({ outputPath: '' });
};
const removeOutputpath = (index: number) => {
  outputPaths.value.splice(index, 1);
};

// variable
const variableSettings = ref<{ name: string; value: string }[]>([]);
const getVariables = computed(() => {
  return variableSettings.value.filter(item => !!item.name && !!item.value);
});

const addVariable = () => {
  variableSettings.value.push({ name: '', value: '' });
};
const removeVariable = (index: number) => {
  variableSettings.value.splice(index, 1);
};

// script
const SCRIPT_TYPE = {
  NORMAL: 'singularity',
  NEXTFLOW: 'nextflow',
};
const skeletonType = ref(SCRIPT_TYPE.NORMAL);
const scriptOptions = computed(() => [
  { label: t('label.normal'), value: SCRIPT_TYPE.NORMAL },
  { label: 'Nextflow', value: SCRIPT_TYPE.NEXTFLOW },
]);

const scriptCommand = ref('');
const triggerFileInput = () => {
  fileInputRef.value?.click();
};
const handleFileChange = (event: Event) => {
  const maxSize = 100 * 1024; // 100 KB
  const input = event.target as HTMLInputElement;

  if (!input?.files || input.files.length === 0) {
    return; // Exit if there’s no file
  }
  const file = input.files[0];
  if (file.size > maxSize) {
    uiShowDialog({
      title: '',
      message: t('vm.scriptImport.fileExceedSize'),
      hideCancelBtn: true,
    });
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    scriptCommand.value = e.target?.result as string;
    input.value = '';
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  reader.readAsText(file);
};

const nextflowInfo = ref<{ bucket: string; subpath?: string }[]>([
  { bucket: '', subpath: '' },
]);
const bucketList = computed(() => {
  return s3BucketList.value.map(bucket => {
    return { name: bucket.Name, value: bucket.Name };
  });
});

// validation
const validBasic = ref(false);
const formError = ref<FormError>({});

const nameInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);
const providerSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(null);
const remoteImageSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(
  null
);
const remoteDatasetRef = ref<InstanceType<typeof MultipleInputSetter> | null>(
  null
);
const remoteOutputPathsRef = ref<InstanceType<
  typeof MultipleInputSetter
> | null>(null);
const singularityRef = ref<InstanceType<typeof TextareaComponent> | null>(null);
const fileInputRef = ref<InstanceType<typeof HTMLInputElement> | null>(null);
const nextflowInfoRef = ref<InstanceType<typeof MultipleInputSetter> | null>(
  null
);

const mountPathsHasEmptyValue = computed(() =>
  datasets.value.some(obj => !obj.remoteDataset?.name)
);
const soutputPathsHasEmptyValue = computed(() =>
  outputPaths.value.some(obj => obj.outputPath === '')
);
const nextflowHasEmptyValue = computed(() =>
  nextflowInfo.value.some(obj => obj.bucket === '')
);

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
  // basic (step 1)
  nameInputRef.value?.validate();
  providerSelectRef.value?.validate();
  remoteImageSelectRef.value?.validate();
  if (!validBasic.value) {
    errSteps.push(steps.value[0]);
  }

  // hardware (step 2)
  if (!selectedFlavor.value) {
    errSteps.push(steps.value[1]);
  }

  // storage (step 3)
  remoteDatasetRef.value?.validate();
  remoteOutputPathsRef.value?.validate();
  if (mountPathsHasEmptyValue.value || soutputPathsHasEmptyValue.value) {
    errSteps.push(steps.value[2]);
  }

  // initialte (step 5)
  singularityRef.value?.validate();
  nextflowInfoRef.value?.validate();
  if (
    !skeletonType.value ||
    (skeletonType.value === SCRIPT_TYPE.NORMAL && !scriptCommand.value) ||
    (skeletonType.value === SCRIPT_TYPE.NEXTFLOW && nextflowHasEmptyValue.value)
  ) {
    errSteps.push(steps.value[4]);
  }
  return errSteps;
};

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(() => {
    void router.push({ name: PAGE_TYPES.HPC_REMOTE_TASK_LIST });
  });
});
const fetchData = async () => {
  providerList.value = await makeApiCall({
    apiCallFn: fetchResourceProviderList,
    errorResHandlingFn: () => [],
  });

  provider.value = providerList.value[0] || '';

  remoteResources.value = await makeApiCall({
    apiCallFn: fetchRemoteResourceList,
    errorResHandlingFn: () => [],
  });
  remoteImage.value = remoteImageList.value[0] || undefined;

  allFlavorList.value = await makeApiCall({
    apiCallFn: fetchRemoteFlavorList,
    errorResHandlingFn: () => [],
  });
  selectedFlavor.value = flavorList.value[0] || undefined;

  await execFetchS3BucketList();
};

watch(provider, (newVal, oldVal) => {
  if (oldVal !== newVal) {
    remoteImage.value = remoteImageList.value[0] || undefined;
    selectedFlavor.value = flavorList.value[0] || undefined;
  }
});

const getEnvironments = computed(() => {
  return getVariables.value.map(
    variable => `${variable.name}=${variable.value}`
  );
});

const getMountPaths = computed(() => {
  const imageToMount = [{ resourceId: remoteImage.value?.id ?? '' }];
  const datasetsToMount: { resourceId: string; path?: string }[] =
    datasets.value.map(dataset => {
      return {
        resourceId: dataset.remoteDataset?.value ?? '',
        path: dataset.path,
      };
    });
  return datasetsToMount.concat(imageToMount);
});

const getCommand = computed(() => {
  let command = scriptCommand.value;
  if (skeletonType.value === SCRIPT_TYPE.NEXTFLOW) {
    command = `${getDataStorageSchema()}://${nextflowInfo.value[0].bucket}${nextflowInfo.value[0].subpath}`;
  }
  return command;
});

const getPayload = computed(() => {
  const payload: any = {
    name: name.value,
    provider: provider.value,
    flavorId: selectedFlavor.value?.id ?? '',
    mountPaths: getMountPaths.value,
    outputMountPaths: outputPaths.value.map(obj => obj.outputPath),
    environments: getEnvironments.value,
    skeletonType: skeletonType.value,
    command: getCommand.value,
  };
  if (description.value) {
    payload.description = description.value;
  }
  return payload;
});

const submit = async () => {
  await makeApiCall({
    apiCallFn: createRemoteTask,
    payload: getPayload.value,
    successCallback: async () =>
      await router.push({ name: PAGE_TYPES.HPC_REMOTE_TASK_LIST }),
  });
};
const cancel = async () => {
  await router.push({ name: PAGE_TYPES.HPC_REMOTE_TASK_LIST });
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="
          $t('basic.create.type', { type: ` ${$t('services.hpc.deliver')}` })
        "
      />
      <v-col>
        <Step
          v-model="currentStep"
          :step-names="steps"
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
                v-model="description"
                :title="$t('basic.desc')"
                :text-field-col="6"
              />
              <SelectWithHint
                ref="providerSelectRef"
                v-model="provider"
                :items="providerList"
                :title="$t('label.env')"
                required
                :tooltip="$t('hpcRemoteTask.env.tooltip')"
                :selection-cols="6"
                @form-error="errMsg => (formError.provider = errMsg)"
              />
              <SelectWithHint
                ref="remoteImageSelectRef"
                v-model="remoteImage"
                :items="remoteImageList"
                :item-value="'id'"
                return-object
                :title="$t('services.hpc.remote.image')"
                required
                :selection-cols="6"
                @form-error="errMsg => (formError.remoteImage = errMsg)"
              />
              <v-row no-gutter>
                <v-col cols="3" />
                <v-col cols="9">
                  <ExternalLink :link="remoteImageLink" :margin="false" />
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <FlavorTableSelection
              v-model="selectedFlavor"
              :headers="flavorHeaders"
              :items="flavorList"
              :show-quota-header="false"
              :table-name="$t('label.computingNode.flavor')"
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="3">
            <MultipleInputSetter
              ref="remoteDatasetRef"
              required
              :title="$t('HpcRemoteTask.remoteData.source')"
              :tooltip="$t('HpcRemoteTask.remoteData.source.tooltip')"
              :params="datasets"
              :column-infos="[
                {
                  header: $t('HpcRemoteTask.remoteData.bucket'),
                  headerExternalLink: {
                    linkTo: '/user/hpcRemote/data/create',
                    text: $t('basic.create.type', {
                      type: $t('services.hpc.remote.data'),
                    }),
                    unique: false,
                  },
                  type: 'select',
                  returnObject: true,
                  selectItems: remoteDatasetList,
                  colsNumber: 4,
                },
                {
                  header: $t('content.mountPath'),
                  type: 'text-input',
                  colsNumber: 4,
                  required: false,
                },
              ]"
              @add-new-item="addDataset"
              @delete-item="removeDataset"
            />
            <MultipleInputSetter
              ref="remoteOutputPathsRef"
              required
              :title="$t('HpcRemoteTask.outputDirectory')"
              :params="outputPaths"
              :column-infos="[
                {
                  type: 'text-input',
                  colsNumber: 4,
                },
              ]"
              @add-new-item="addOutputpath"
              @delete-item="removeOutputpath"
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="4">
            <MultipleInputSetter
              :title="$t('label.env.variable')"
              :params="variableSettings"
              :column-infos="[
                {
                  header: $t('label.name'),
                  type: 'text-input',
                  colsNumber: 4,
                },
                {
                  header: $t('label.value'),
                  type: 'text-input',
                  colsNumber: 4,
                },
              ]"
              @add-new-item="addVariable"
              @delete-item="removeVariable"
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="5">
            <v-row no-gutters class="mb-6">
              <RadioButtonSwitch
                :title="$t('label.script')"
                is-required
                :init-value="skeletonType"
                :options="scriptOptions"
                @selected="
                  (event: any) => {
                    skeletonType = event;
                  }
                "
              />
            </v-row>
            <v-row v-if="skeletonType === SCRIPT_TYPE.NORMAL" no-gutters>
              <v-col cols="3" />
              <v-col cols="6">
                <TextareaComponent
                  ref="singularityRef"
                  :model-value="scriptCommand"
                  required
                  :placeholder="'CMD'"
                  @update:model-value="
                    ($event: string) => (scriptCommand = $event)
                  "
                />
              </v-col>
              <v-col cols="3" offset="3" class="pt-4">
                <OutlinedBtn
                  :text="$t('basic.import')"
                  @click="triggerFileInput"
                />
                <input
                  ref="fileInputRef"
                  class="d-none"
                  type="file"
                  @change="handleFileChange"
                />
              </v-col>
            </v-row>
            <MultipleInputSetter
              v-else-if="skeletonType === SCRIPT_TYPE.NEXTFLOW"
              ref="nextflowInfoRef"
              required
              :title="$t('HpcRemoteTask.nextflow.source')"
              :params="nextflowInfo"
              :column-infos="[
                {
                  header: $t('s3.bucket'),
                  headerExternalLink: {
                    linkTo: '/user/cloudStorage/bucket/list',
                    text: $t('basic.create.type', {
                      type: $t('services.cloudStorage'),
                    }),
                    unique: false,
                  },
                  type: 'select',
                  selectItems: bucketList,
                  colsNumber: 4,
                },
                {
                  header: $t('label.subpath'),
                  type: 'text-input',
                  colsNumber: 4,
                  required: false,
                },
              ]"
              disable-add-item
              disable-delete-item
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="6">
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
              :key-name="$t('label.env')"
              :value="provider"
              :tooltip="$t('hpcRemoteTask.env.tooltip')"
              :error-msg="formError.provider"
            />
            <CheckItem
              :key-name="$t('services.hpc.remote.image')"
              :value="remoteImage?.name ?? ''"
              :error-msg="formError.remoteImage"
            />
            <CheckItem
              :key-name="$t('label.computingNode.flavor')"
              :value="selectedFlavor?.name ?? ''"
            />
            <CheckItem :key-name="$t('HpcRemoteTask.remoteData.source')">
              <v-col cols="9">
                <DetailTable
                  :items="datasets"
                  :headers="[
                    {
                      title: $t('HpcRemoteTask.remoteData.bucket'),
                      value: 'remoteDataset.name',
                      width: '50%',
                    },
                    {
                      title: $t('content.mountPath'),
                      value: 'path',
                      width: '50%',
                    },
                  ]"
                  required
                />
              </v-col>
            </CheckItem>
            <CheckItem :key-name="$t('HpcRemoteTask.outputDirectory')">
              <v-col cols="9">
                <div class="pt-4">
                  <v-chip
                    v-for="(outputPath, index) in validOutputPath"
                    :key="index"
                    class="mr-2"
                  >
                    {{ outputPath.outputPath }}
                  </v-chip>
                  <span
                    v-if="validOutputPath.length === 0"
                    class="ocis-text-alert"
                  >
                    {{ `(${$t('form.error.pleaseCheck')})` }}
                  </span>
                </div>
              </v-col>
            </CheckItem>
            <CheckItem :key-name="$t('label.env.variable')">
              <v-col cols="9">
                <DetailTable
                  :items="getVariables"
                  :headers="[
                    {
                      title: $t('label.name'),
                      value: 'name',
                      width: '50%',
                    },
                    {
                      title: $t('label.value'),
                      value: 'value',
                      width: '50%',
                    },
                  ]"
                />
              </v-col>
            </CheckItem>
            <CheckItem
              :key-name="$t('label.script')"
              :value="
                skeletonType === SCRIPT_TYPE.NORMAL
                  ? $t('label.normal')
                  : 'Nextflow'
              "
            />
            <CheckItem
              v-if="skeletonType === SCRIPT_TYPE.NORMAL"
              :key-name="$t('creation.step.script')"
              :value="scriptCommand"
              :error-msg="scriptCommand ? '' : $t('form.required')"
              is-text-area
            />
            <CheckItem
              v-if="skeletonType === SCRIPT_TYPE.NEXTFLOW"
              :key-name="'Nextflow'"
            >
              <v-col cols="9">
                <DetailTable
                  :items="nextflowInfo"
                  required
                  :headers="[
                    {
                      title: $t('s3.bucket'),
                      value: 'bucket',
                      width: '50%',
                    },
                    {
                      title: $t('label.subpath'),
                      value: 'subpath',
                      width: '50%',
                    },
                  ]"
                />
              </v-col>
            </CheckItem>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
  </UiContainer>
</template>
