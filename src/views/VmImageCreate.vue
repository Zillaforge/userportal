<script setup lang="ts">
import { useUser } from '@/store';
import { storeToRefs } from 'pinia';
import { ref, computed, watch, onMounted } from 'vue';

import { makeApiCall, fetchVirtualImages, createVirtualImage } from '@/api';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import ComboboxText from '@/components/common/ComboboxText.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import router from '@/router';
import { getDataStorageSchema } from '@/utils/utils';
import validation from '@/utils/validation';

const { t } = i18n.global;
interface FormError {
  name?: string;
  operatingSystem?: string;
  version?: string;
  bucket?: string;
  filePath?: string;
}

const { setProjectSwitchCallback } = useProjectSwitch();
const { getUserInfo } = storeToRefs(useUser());
const { s3BucketList, execFetchS3BucketList } = useCloudStorage(
  PAGE_TYPES.S3_BUCKET_LIST
);

const steps = computed(() => [
  t('creation.step.basic'),
  t('image.source'),
  t('creation.step.review'),
]);

const name = ref('');
const description = ref('');
const operatingSystem = ref('');
const version = ref('');

const diskFormat = ref('');
const containerFormat = ref('bare');
const bucket = ref('');
const filePath = ref('');

const imageRepoList = ref<Record<string, any>[]>([]);
const diskFormatOptions = ref(['raw', 'qcow2']);

const validBasic = ref(false);
const validImageSource = ref(false);
const formError = ref<FormError>({});

const nameInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);
const operatingSystemSelectRef = ref<InstanceType<
  typeof SelectWithHint
> | null>(null);
const remoteVersionSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(
  null
);

const diskFormatSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(
  null
);
const bucketSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(null);
const filePathInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(
  null
);

onMounted(async () => {
  imageRepoList.value = await makeApiCall({
    apiCallFn: fetchVirtualImages,
    successCallback: res => {
      return res.filter(
        (repo: any) => repo.creator?.id === getUserInfo.value.userId
      );
    },
    errorResHandlingFn: () => [],
  });
  await execFetchS3BucketList();
  diskFormat.value = 'raw';
  containerFormat.value = 'bare';
  setProjectSwitchCallback(() => {
    void router.push({ name: PAGE_TYPES.VM_IMAGE_LIST });
  });
});

const imageOptions = computed(() => imageRepoList.value.map(i => i.name));
const bucketOptions = computed(() => s3BucketList.value.map(i => i.Name));
const isCreatingNewImage = computed(
  () => !imageOptions.value.includes(name.value)
);
const selectedRepo = computed(() => {
  return imageRepoList.value.find(repo => repo.name === name.value);
});

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
  operatingSystemSelectRef.value?.validate();
  remoteVersionSelectRef.value?.validate();
  const isUsingExistedTags = getSelectedImageTags().includes(name.value);
  if (!validBasic.value || isUsingExistedTags) {
    errSteps.push(steps.value[0]);
  }
  // image source (step 2)
  bucketSelectRef.value?.validate();
  filePathInputRef.value?.validate();
  if (!validImageSource.value) {
    errSteps.push(steps.value[1]);
  }
  return errSteps;
};

const getSelectedImageTags = () => {
  return (
    selectedRepo.value?.tags?.map((tag: { name: string }) => tag.name) || []
  );
};

const submit = async () => {
  const payload: Record<string, any> = {
    version: version.value,
    type: 'common',
    diskFormat: diskFormat.value,
    containerFormat: containerFormat.value,
    filepath: `${getDataStorageSchema()}://${bucket.value}/${filePath.value}`,
  };
  if (isCreatingNewImage.value) {
    payload.name = name.value;
    payload.operatingSystem = operatingSystem.value;
    payload.description = description.value;
  } else {
    payload.repositoryId = selectedRepo.value?.id;
  }
  return makeApiCall({
    apiCallFn: createVirtualImage,
    payload,
    successCallback: async () =>
      await router.push({ name: PAGE_TYPES.VM_IMAGE_LIST }),
  });
};
const cancel = async () => {
  await router.push({ name: PAGE_TYPES.VM_IMAGE_LIST });
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="$t('basic.create.type', { type: $t('services.vmImageManage') })"
      />
      <v-col>
        <Step
          v-model="currentStep"
          :step-names="steps"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="cancel"
        >
          <v-stepper-window-item :value="1">
            <v-form v-model="validBasic">
              <v-row no-gutters class="mb-2">
                <v-col cols="3">
                  <span class="ocis-form-title ocis-input-required">
                    {{ $t('label.name') }}
                  </span>
                </v-col>
                <v-col cols="6">
                  <ComboboxText
                    ref="nameInputRef"
                    v-model="name"
                    :items="imageOptions"
                    required
                    @form-error="errMsg => (formError.name = errMsg)"
                  />
                </v-col>
              </v-row>

              <v-row no-gutters class="mb-6">
                <v-col cols="3">
                  <span class="ocis-form-title">{{ $t('basic.desc') }}</span>
                </v-col>
                <v-col cols="6">
                  <TextareaComponent
                    :model-value="
                      isCreatingNewImage
                        ? description
                        : selectedRepo?.description
                    "
                    :disabled="!isCreatingNewImage"
                    @update:model-value="
                      ($event: string) => (description = $event)
                    "
                  />
                </v-col>
              </v-row>
              <v-row no-gutters class="mb-2">
                <SelectWithHint
                  v-if="isCreatingNewImage"
                  ref="operatingSystemSelectRef"
                  v-model="operatingSystem"
                  :items="[
                    { name: 'Linux', value: 'linux' },
                    { name: 'Windows', value: 'windows' },
                  ]"
                  :title="$t('label.operatingSystem')"
                  :hint="$t('image.virtualMachine.os.hint')"
                  required
                  :selection-cols="6"
                  @form-error="errMsg => (formError.operatingSystem = errMsg)"
                />
                <template v-else>
                  <v-col cols="3">
                    <span class="ocis-form-title ocis-input-required">
                      {{ $t('label.operatingSystem') }}
                    </span>
                  </v-col>
                  <v-col cols="6">
                    <span class="ocis-form-title text-capitalize">
                      {{ selectedRepo?.operatingSystem }}
                    </span>
                  </v-col>
                </template>
              </v-row>
              <v-row no-gutters>
                <TextFieldWithHint
                  ref="remoteVersionSelectRef"
                  v-model="version"
                  :title="$t('label.version')"
                  :rules="[
                    validation.duplicateCheck(
                      $t('image.virtualMachine.duplicate.check'),
                      getSelectedImageTags()
                    ),
                  ]"
                  required
                  :text-field-col="6"
                  @form-error="event => (formError.version = event[0])"
                />
              </v-row>
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <v-form v-model="validImageSource">
              <v-row no-gutters class="mb-6">
                <SelectWithHint
                  ref="diskFormatSelectRef"
                  v-model="diskFormat"
                  :items="diskFormatOptions"
                  :title="$t('image.diskFormat')"
                  required
                  :selection-cols="6"
                  @form-error="errMsg => (formError.bucket = errMsg)"
                />
              </v-row>
              <v-row no-gutters class="mb-6">
                <SelectWithHint
                  ref="bucketSelectRef"
                  v-model="bucket"
                  :items="bucketOptions"
                  :title="$t('s3.bucket')"
                  required
                  :selection-cols="6"
                  @form-error="errMsg => (formError.bucket = errMsg)"
                />
              </v-row>
              <v-row no-gutters>
                <TextFieldWithHint
                  ref="filePathInputRef"
                  v-model="filePath"
                  :title="$t('label.filePath')"
                  required
                  :text-field-col="6"
                  @form-error="
                    event => {
                      formError.filePath = event[0];
                    }
                  "
                />
              </v-row>
            </v-form>
          </v-stepper-window-item>

          <v-stepper-window-item :value="3">
            <AlertComponent
              v-if="errSteps.length > 0"
              :message="$t('form.error.alert')"
            />
            <CheckItem
              :key-name="$t('label.name')"
              :error-msg="formError.name"
              :value="name"
            />

            <CheckItem
              :key-name="$t('basic.desc')"
              :value="
                isCreatingNewImage ? description : selectedRepo?.description
              "
            />
            <CheckItem
              :key-name="$t('label.operatingSystem')"
              :error-msg="formError.operatingSystem"
              :value="
                isCreatingNewImage
                  ? operatingSystem
                  : selectedRepo?.operatingSystem
              "
            />
            <CheckItem
              :key-name="$t('label.version')"
              :error-msg="formError.version"
              :value="version"
            />
            <CheckItem
              :key-name="$t('s3.bucket')"
              :value="bucket"
              :error-msg="formError.bucket ?? !bucket ? t('form.required') : ''"
            />
            <CheckItem
              :key-name="$t('label.filePath')"
              :value="filePath"
              :error-msg="
                formError.filePath ?? !filePath ? t('form.required') : ''
              "
            />
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
  </UiContainer>
</template>
