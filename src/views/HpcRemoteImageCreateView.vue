<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue';

import dayjs from 'dayjs';

import {
  makeApiCall,
  fetchResourceProviderList,
  fetchGlobalContainerImageList,
  fetchContainerImageList,
  fetchGlobalContainerImageTags,
  fetchContainerImageTags,
  createRemoteResource,
} from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import DatePicker from '@/components/common/DatePicker.vue';
import OptionCardsDialog from '@/components/common/OptionCardsDialog.vue';
import SelectComponent from '@/components/common/SelectComponent.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import router from '@/router';
import { formatDate, getTimeOptions } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;
interface FormError {
  name?: string;
  provider?: string;
  image?: string;
  imageVersion?: string;
}

const steps = computed(() => [
  t('creation.step.basic'),
  t('creation.step.review'),
]);
const name = ref('hpcri' + Math.floor(Date.now()));
// const description = ref('');
const providerList: Ref<string[]> = ref([]);
const provider = ref('');

const cntrImages: Ref<Record<string, any>> = ref([]);
const selectedImage: Ref<Record<string, any> | null> = ref(null);
const imageVersions: Ref<Record<string, any>[]> = ref([]);
const selectedImageVersion: Ref<Record<string, any> | undefined> =
  ref(undefined);
const updateImage = async (
  image: { name: string; projectId?: string },
  type: string
) => {
  selectedImage.value = image;
  imageVersions.value = await makeApiCall({
    apiCallFn:
      type === 'public'
        ? fetchGlobalContainerImageTags
        : fetchContainerImageTags,
    payload: {
      imageName: encodeURIComponent(image.name),
      projectId: image.projectId,
    },
    successCallback: res => {
      return res.map((tag: { name: string; uri: string }) => {
        return { name: tag.name, uri: tag.uri };
      });
    },
    errorResHandlingFn: () => [],
  });
  selectedImageVersion.value = imageVersions.value[0] ?? undefined;
};

const expiration = ref('disabled');
const expireDate = ref<Date>(
  new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
);
const expireDateMin = dayjs(expireDate.value).format('YYYY-MM-DD');
const expireTime = ref<number>(0);

const timeOptions = computed(() => getTimeOptions());

const expireationOptions = computed(() => [
  { label: t('label.noExpiration'), value: 'disabled' },
  { label: t('label.expireDate.option'), value: 'enabled' },
]);

const expireDateString = computed(() => {
  const date = dayjs(expireDate.value).format(`YYYY-MM-DD 00:00`);
  const timestamps = new Date(date).getTime();
  const expireTimestamps = timestamps + expireTime.value;
  return formatDate(expireTimestamps);
});

const validBasic = ref(false);
const formError = ref<FormError>({});

const nameInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);
const providerSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(null);
const imageSelectRef = ref<InstanceType<typeof OptionCardsDialog> | null>(null);
const imageVersionSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(
  null
);

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(() => {
    void router.push({ name: PAGE_TYPES.HPC_REMOTE_IMAGE_LIST });
  });
});

const fetchData = async (callback?: () => void) => {
  providerList.value = await makeApiCall({
    apiCallFn: fetchResourceProviderList,
    errorResHandlingFn: () => [],
  });
  provider.value = providerList.value[0] || '';

  const globalCtrImageList: Ref<Record<string, any>[]> = await makeApiCall({
    apiCallFn: fetchGlobalContainerImageList,
    errorResHandlingFn: () => [],
  });
  const projectCtrImageList: Ref<Record<string, any>[]> = await makeApiCall({
    apiCallFn: fetchContainerImageList,
    errorResHandlingFn: () => [],
  });
  cntrImages.value = {
    public: globalCtrImageList,
    project: projectCtrImageList,
  };
  // selectedImage.value = cntrImages.value.public.value[0] || null;
};

const expirationHasValue = computed(() => !!expiration.value);

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
  nameInputRef.value?.validate();
  providerSelectRef.value?.validate();
  imageSelectRef.value?.validate();
  imageVersionSelectRef.value?.validate();
  if (!validBasic.value || !selectedImage.value || !expirationHasValue.value) {
    errSteps.push(steps.value[0]);
  }
  return errSteps;
};

const getPayload = computed(() => {
  const payload: any = {
    name: name.value,
    provider: provider.value,
    scheme: 'crm',
    type: 'image',
    uri: selectedImageVersion.value?.uri ?? '',
  };

  // if (description.value) {
  //   payload.description = description.value;
  // }

  if (expiration.value === 'enabled' && expireDate.value) {
    const expireTimeValue = new Date(expireDateString.value).toISOString();
    payload.expiredAt = expireTimeValue;
  }
  return payload;
});

const submit = async () => {
  await makeApiCall({
    apiCallFn: createRemoteResource,
    payload: getPayload.value,
    successCallback: async () =>
      await router.push({ name: PAGE_TYPES.HPC_REMOTE_IMAGE_LIST }),
  });
};

const cancel = () => {
  void router.push({ name: PAGE_TYPES.HPC_REMOTE_IMAGE_LIST });
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="
          $t('basic.create.type', { type: $t('services.hpc.remote.image') })
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
              <!-- <TextFieldWithHint
                v-model="description"
                :title="$t('basic.desc')"
                :text-field-col="6"
              /> -->
              <SelectWithHint
                ref="providerSelectRef"
                v-model="provider"
                :items="providerList"
                :title="$t('label.env')"
                required
                :selection-cols="6"
                @form-error="errMsg => (formError.provider = errMsg)"
              />
              <OptionCardsDialog
                ref="imageSelectRef"
                :display-items="cntrImages"
                :selected="selectedImage?.name"
                :display-tabs="{
                  public: $t('basic.public'),
                  project: $t('basic.project'),
                }"
                :dialog-title="$t('image.source')"
                :title="$t('image.source')"
                required
                @update="updateImage"
                @form-error="errMsg => (formError.image = errMsg)"
              />
              <SelectWithHint
                ref="imageVersionSelectRef"
                v-model="selectedImageVersion"
                :items="imageVersions"
                item-value="uri"
                return-object
                :title="$t('image.tag')"
                required
                :selection-cols="6"
                @form-error="
                  errMsg => {
                    formError.imageVersion = errMsg;
                  }
                "
              />
              <RadioButtonSwitch
                :title="$t('label.expireDate')"
                :init-value="expiration"
                :options="expireationOptions"
                :is-inline="false"
                is-required
                @selected="
                  (event: any) => {
                    expiration = event;
                  }
                "
              >
                <template #last-radio-extra>
                  <DatePicker
                    :model-value="expireDate"
                    :disable-select="() => expiration !== 'enabled'"
                    :allowed-min-date="expireDateMin"
                    class="mr-2"
                    @select-date="$event => (expireDate = $event)"
                  />
                  <SelectComponent
                    :selected-value="expireTime"
                    :items="timeOptions"
                    :disabled="expiration !== 'enabled'"
                    @update:model-value="expireTime = $event"
                  />
                </template>
              </RadioButtonSwitch>
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <AlertComponent
              v-if="errSteps.length > 0"
              :message="$t('form.error.alert')"
            />
            <CheckItem
              :key-name="$t('label.name')"
              :error-msg="formError.name"
              :value="name"
            />

            <!-- <CheckItem :key-name="$t('basic.desc')" :value="description" /> -->
            <CheckItem
              :key-name="$t('label.env')"
              :value="provider"
              :error-msg="formError.provider"
            />
            <CheckItem
              :key-name="$t('image.source')"
              :value="selectedImage?.name"
              :error-msg="formError.image"
            />
            <CheckItem
              :key-name="$t('image.tag')"
              :value="selectedImageVersion?.name ?? ''"
              :error-msg="formError.imageVersion"
            />
            <CheckItem
              :key-name="$t('label.expireDate')"
              :error-msg="!expirationHasValue ? t('form.required') : ''"
              :value="
                expirationHasValue
                  ? expiration === 'enabled'
                    ? expireDateString
                    : $t('label.noExpiration')
                  : ''
              "
            />
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
  </UiContainer>
</template>
