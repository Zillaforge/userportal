<script setup lang="ts">
import { useGlobal } from '@/store';
import { ref, computed, watch, onMounted } from 'vue';

import type { Flavor } from '@/interfaces/VmInterface';

import {
  makeApiCall,
  fetchVmImagesPrivate,
  fetchVmImagesPublic,
  fetchVmFlavors,
  fetchVmNetworks,
  fetchVmSecurityGroups,
  fetchVmKeypairs,
  // fetchVirtualImages,
  createAutoScaling,
} from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import ComboboxMultiSelect from '@/components/common/ComboboxMultiSelect.vue';
import FlavorTableSelection from '@/components/common/FlavorTableSelection.vue';
import OptionCardsDialog from '@/components/common/OptionCardsDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import router from '@/router';
import getTableHeaders, { TABLE_TYPE } from '@/utils/getTableHeaders';
import { getFilteredFlavor } from '@/utils/utils';

const { uiShowDialog } = useGlobal();
const { setProjectSwitchCallback } = useProjectSwitch();
interface FormError {
  name?: string;
  network?: string;
  imageTag?: string;
  keypair?: string;
  password?: string;
  vmLowerLimit?: string;
}
const formError = ref<FormError>({});

const { t } = i18n.global;
const steps = computed(() => [
  t('creation.step.basic'),
  t('creation.step.vm.spec'),
  t('creation.step.review'),
]);

const validBasic = ref(false);
const validSettings = ref(false);
const fileInputRef = ref<InstanceType<typeof HTMLInputElement> | null>(null);
const nameInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);
const pwdInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);
const networkSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(null);
const imageTagSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(null);
const keypairSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(null);
const vmUpperLimitInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(
  null
);
const vmLowerLimitInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(
  null
);

const showPassword = ref(false);

const METRIC_OPTIONS = {
  CPU: 'cpu',
  MEMORY: 'memory',
};
const metricOptions = ref([METRIC_OPTIONS.CPU, METRIC_OPTIONS.MEMORY]);
const networkList = ref<any[]>([]);
const securityGroupList = ref<any[]>([]);
const keypairList = ref<any[]>([]);
const imageList = ref<{
  public: any[];
  private: any[];
}>({ public: [], private: [] });
const imageTagOptions = computed(() => selectedImage.value?.tags || []);
const flavorList = ref<any[]>([]);

const name = ref('as' + Math.floor(Date.now()));
const description = ref('');
const metric = ref(METRIC_OPTIONS.CPU);
const asUpperThreshold = ref('80');
const asLowerThreshold = ref('20');
const scaleUpperLimit = ref('4');
const scaleLowerLimit = ref('1');
const password = ref('');
const initScript = ref('');

const selectedNetwork = ref<Record<string, any> | undefined>(undefined);
const selectedSecurityGroups = ref<any[]>([]);
const keypairEnable = ref(false);
const selectedKeypair = ref<Record<string, any> | undefined>(undefined);
const selectedImage = ref<Record<string, any> | undefined>(undefined);
const selectedImageTag = ref<Record<string, any> | undefined>(undefined);
const selectedFlavor = ref<Record<string, any> | undefined>(undefined);

const vmFlavorHeaders = computed(() =>
  getTableHeaders(TABLE_TYPE.FLAVOR, [
    {
      title: t('flavor.disk'),
      key: 'disk',
      subTitle: '(GB)',
    },
  ])
);

const filteredFlavorList = computed(() => {
  const vGPU: string = selectedImageTag.value?.vGPU;
  return getFilteredFlavor(flavorList.value as Flavor[], vGPU);
});

watch(filteredFlavorList, () => {
  selectedFlavor.value = filteredFlavorList.value[0];
});

watch(selectedImage, val => {
  if (val?.tags?.length) {
    selectedImageTag.value = {
      tag: val?.tags[0]?.tag,
      id: val?.tags[0]?.id,
      referenceTarget: val?.tags[0]?.referenceTarget,
      vGPU: val?.tags[0]?.vGPU,
    };
  }
});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_AUTO_SCALING_LIST })
  );
});

const remapRepo = (imageList: any, isPrivate: boolean = true) => {
  return imageList
    .map((item: any) => ({
      ...item.repository,
      description: item.repository?.description,
      info: isPrivate ? item.repository?.creator?.displayName : '',
      tags: [],
      img: null,
    }))
    .reduce((acc: any, cur: any) => {
      const exists = acc.find((item: { id: any }) => {
        return item.id === cur.id;
      });
      if (!exists) {
        acc = acc.concat(cur);
      }
      return acc;
    }, []);
};

const remapTag = (res: any, imageList: any) => {
  return res.forEach((item: any) => {
    const repo = imageList.find(
      (repo: { id: any }) => repo.id === item.repository.id
    );
    repo.tags.push({
      tag: item.name,
      id: item.id,
      referenceTarget: item.referenceTarget,
      vGPU: item.extra?.vgpu ?? undefined,
    });
  });
};

const fetchData = async () => {
  const networkListApiCall = makeApiCall({
    apiCallFn: fetchVmNetworks,
  });
  const securityGroupListApiCall = makeApiCall({
    apiCallFn: fetchVmSecurityGroups,
  });
  const keypairListApiCall = makeApiCall({
    apiCallFn: fetchVmKeypairs,
  });
  const vmImagePublicListApiCall = makeApiCall({
    apiCallFn: fetchVmImagesPublic,
    successCallback: res => {
      const publicImgs = remapRepo(res, false);
      remapTag(res, publicImgs);
      return publicImgs;
    },
  });
  const vmImagePrivateListApiCall = makeApiCall({
    apiCallFn: fetchVmImagesPrivate,
    successCallback: res => {
      const privateImgs = remapRepo(res);
      remapTag(res, privateImgs);
      return privateImgs;
    },
  });
  const vmFlavorListApiCall = makeApiCall({
    apiCallFn: fetchVmFlavors,
    successCallback: res =>
      res.map((item: any) => ({
        ...item,
        memory: item?.memory / 1024,
        gpu_count: item?.gpu?.count ?? 0,
      })),
  });
  networkList.value = await networkListApiCall;
  securityGroupList.value = await securityGroupListApiCall;
  keypairList.value = await keypairListApiCall;
  imageList.value.public = await vmImagePublicListApiCall;
  imageList.value.private = await vmImagePrivateListApiCall;
  flavorList.value = await vmFlavorListApiCall;

  selectedImage.value = imageList.value.public[0];
};

const submit = () => {
  const payload: Record<string, any> = {
    name: name.value,
    description: description.value,
    network_id: selectedNetwork.value?.id,
    metric: metric.value,
    threshold_up: Number(asUpperThreshold.value),
    threshold_down: Number(asLowerThreshold.value),
    max_size: Number(scaleUpperLimit.value),
    min_size: Number(scaleLowerLimit.value),
    image_id: selectedImageTag.value?.id,
    sg_ids: selectedSecurityGroups.value.map(sg => sg.id),
    flavor_id: selectedFlavor.value?.id,
    password: window.btoa(password.value),
  };
  if (initScript.value) {
    payload.boot_script = window.btoa(initScript.value);
  }
  if (keypairEnable.value) {
    payload.keypair_id = selectedKeypair.value?.id;
  }
  return makeApiCall({
    apiCallFn: createAutoScaling,
    payload,
    successCallback: async () => {
      return await router.push({ name: PAGE_TYPES.VM_AUTO_SCALING_LIST });
    },
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
  // basic (step 1)
  nameInputRef.value?.validate();
  networkSelectRef.value?.validate();
  vmLowerLimitInputRef.value?.validate();
  vmUpperLimitInputRef.value?.validate();
  if (!validBasic.value || scaleUpperLimit.value < scaleLowerLimit.value) {
    errSteps.push(steps.value[0]);
  }
  imageTagSelectRef.value?.validate();
  keypairSelectRef.value?.validate();
  pwdInputRef.value?.validate();
  if (
    !selectedImage.value ||
    !selectedImageTag.value ||
    !selectedFlavor.value ||
    !selectedSecurityGroups.value.length ||
    formError.value.password
  ) {
    errSteps.push(steps.value[1]);
  }
  return errSteps;
};
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
    initScript.value = e.target?.result as string;
    input.value = '';
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  reader.readAsText(file);
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('services.autoScaling') })"
      />
      <v-col class="pt-4">
        <Step
          v-model="currentStep"
          :step-names="steps"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="router.push({ name: PAGE_TYPES.VM_AUTO_SCALING_LIST })"
        >
          <v-stepper-window-item :value="1">
            <v-form v-model="validBasic">
              <TextFieldWithHint
                ref="nameInputRef"
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
              <TextFieldWithHint
                v-model="description"
                :title="$t('basic.desc')"
                :text-field-col="6"
              />
              <SelectWithHint
                ref="networkSelectRef"
                v-model="selectedNetwork"
                :title="$t('vm.network')"
                :items="networkList"
                :selection-cols="6"
                required
                return-object
                @form-error="errMsg => (formError.network = errMsg)"
              />
              <SelectWithHint
                v-model="metric"
                :title="'Metric'"
                :items="metricOptions"
                :selection-cols="6"
                required
              />
              <TextFieldWithHint
                v-model="asUpperThreshold"
                :title="$t('label.upperThreshold')"
                :text-field-col="6"
                :type="'number'"
                required
              />
              <TextFieldWithHint
                v-model="asLowerThreshold"
                :title="$t('label.lowerThreshold')"
                :text-field-col="6"
                :type="'number'"
                required
              />
              <TextFieldWithHint
                ref="vmUpperLimitInputRef"
                v-model="scaleUpperLimit"
                :title="$t('vm.as.vmUpperLimit')"
                :text-field-col="6"
                :type="'number'"
                :min-val="1"
                required
              />
              <TextFieldWithHint
                ref="vmLowerLimitInputRef"
                v-model="scaleLowerLimit"
                :title="$t('vm.as.vmLowerLimit')"
                :text-field-col="6"
                :type="'number'"
                :max-val="Number(scaleUpperLimit)"
                :min-val="1"
                required
                @form-error="
                  event => {
                    formError.vmLowerLimit = event[0];
                  }
                "
              />
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2" eager>
            <v-form v-model="validSettings">
              <OptionCardsDialog
                :display-items="imageList"
                :selected="selectedImage?.name"
                :display-tabs="{
                  public: $t('basic.public'),
                  private: $t('basic.private'),
                }"
                :dialog-title="$t('image.source')"
                :title="$t('image.source')"
                required
                @update="
                  $event => {
                    selectedImage = $event;
                    selectedImageTag = imageTagOptions[0];
                  }
                "
              />

              <SelectWithHint
                ref="imageTagSelectRef"
                v-model="selectedImageTag"
                :title="$t('image.tag')"
                :items="imageTagOptions"
                :item-text="'tag'"
                required
                :selection-cols="6"
                return-object
                @form-error="errMsg => (formError.imageTag = errMsg)"
              />

              <FlavorTableSelection
                v-model="selectedFlavor"
                :table-name="$t('creation.step.flavor')"
                :headers="vmFlavorHeaders"
                :items="filteredFlavorList"
              />
              <v-row no-gutters class="pt-6">
                <v-col cols="3" class="ocis-form-title ocis-input-required">
                  {{ $t('services.securityGroup') }}
                </v-col>
                <v-col :cols="6">
                  <ComboboxMultiSelect
                    v-model="selectedSecurityGroups"
                    :items="securityGroupList"
                    :item-title="'name'"
                    required
                  />
                </v-col>
              </v-row>
              <RadioButtonSwitch
                :title="$t('services.keypairs')"
                :options="[
                  { label: $t('basic.enabled'), value: true },
                  { label: $t('basic.disabled'), value: false },
                ]"
                :init-value="keypairEnable"
                @selected="value => (keypairEnable = value)"
              />
              <SelectWithHint
                v-if="keypairEnable"
                ref="keypairSelectRef"
                v-model="selectedKeypair"
                :title="$t('services.keypairs')"
                :items="keypairList"
                :selection-cols="6"
                required
                return-object
                @form-error="errMsg => (formError.keypair = errMsg)"
              />
              <TextFieldWithHint
                ref="pwdInputRef"
                v-model="password"
                :title="$t('basic.password')"
                :text-field-col="6"
                :type="'password'"
                required
                @form-error="errMsg => (formError.password = errMsg[0])"
              />

              <v-row no-gutters class="pt-6">
                <v-col cols="3" class="ocis-form-title">
                  {{ $t('label.initialization.script') }}
                </v-col>
                <v-col :cols="6">
                  <TextareaComponent v-model="initScript" :rows="5" />
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
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="3">
            <v-row>
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
                :value="selectedNetwork?.name || ''"
                :error-msg="formError.network"
              />
              <CheckItem :key-name="'Metric'" :value="metric" />
              <CheckItem
                :key-name="$t('label.upperThreshold')"
                :value="asUpperThreshold"
              />
              <CheckItem
                :key-name="$t('label.lowerThreshold')"
                :value="asLowerThreshold"
              />
              <CheckItem
                :key-name="$t('vm.as.vmUpperLimit')"
                :value="scaleUpperLimit"
              />
              <CheckItem
                :key-name="$t('vm.as.vmLowerLimit')"
                :error-msg="formError?.vmLowerLimit"
                :value="scaleLowerLimit"
              />
              <v-divider />
              <span class="sub-title pl-3 pt-4">
                {{ $t('creation.step.vm.spec') }}
              </span>
              <CheckItem
                :key-name="$t('image.source')"
                :value="selectedImage?.name || ''"
                :error-msg="!selectedImage ? $t('form.required') : ''"
              />
              <CheckItem
                v-if="selectedImage"
                :key-name="$t('image.tag')"
                :value="selectedImageTag?.tag || ''"
                :error-msg="formError.imageTag"
              />
              <CheckItem
                :key-name="$t('flavor.title')"
                :value="selectedFlavor?.name || ''"
                :error-msg="!selectedFlavor ? $t('form.required') : ''"
              />
              <CheckItem
                :key-name="$t('services.securityGroup')"
                :error-msg="
                  !selectedSecurityGroups.length ? $t('form.required') : ''
                "
              >
                <v-chip
                  v-for="(securityGroup, index) in selectedSecurityGroups"
                  :key="index"
                  class="mt-3"
                >
                  {{ securityGroup.name }}
                </v-chip>
              </CheckItem>
              <CheckItem
                :key-name="$t('creation.keypair.auth')"
                :value="
                  keypairEnable ? $t('basic.enabled') : $t('basic.disabled')
                "
              />
              <CheckItem
                v-if="keypairEnable"
                :key-name="$t('services.keypairs')"
                :value="selectedKeypair?.name"
              />
              <CheckItem
                :key-name="$t('basic.password')"
                :error-msg="formError.password"
                password
              >
                <v-col>
                  <v-text-field
                    v-if="password.length > 0"
                    :model-value="password"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    variant="plain"
                    readonly
                    :width="`${password.length + 2}rem`"
                    hide-details
                    @click:append="showPassword = !showPassword"
                  />
                </v-col>
              </CheckItem>
              <CheckItem
                :key-name="$t('label.initialization.script')"
                :value="initScript"
                is-text-area
              />
            </v-row>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
  </UiContainer>
</template>

<style lang="scss" scoped>
.arrow {
  font-size: 24px !important;
  margin-top: 40px;
  margin-left: 20px;
  margin-right: 20px;
}

.display-block {
  display: block;
}

.sub-title {
  font-size: 16px !important;
  font-weight: 600;
}
</style>
