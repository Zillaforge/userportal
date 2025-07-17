<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue';

import dayjs from 'dayjs';

import {
  makeApiCall,
  fetchResourceProviderList,
  createRemoteResource,
} from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import DatePicker from '@/components/common/DatePicker.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';
import SelectComponent from '@/components/common/SelectComponent.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import router from '@/router';
import {
  formatDate,
  getDataStorageSchema,
  getTimeOptions,
} from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const { s3BucketList, execFetchS3BucketList } = useCloudStorage(
  PAGE_TYPES.HPC_REMOTE_DATA_CREATE
);

const { t } = i18n.global;
interface FormError {
  name?: string;
  provider?: string;
}

const steps = computed(() => [
  t('creation.step.basic'),
  t('creation.step.review'),
]);
const name = ref('hpcrd' + Math.floor(Date.now()));
// const description = ref('');
const providerList: Ref<string[]> = ref([]);
const provider = ref('');
const dataSources = ref<any>([{ bucket: '', subpath: '' }]);
const bucketList = computed(() => {
  return s3BucketList.value.map(bucket => {
    return { name: bucket.Name, value: bucket.Name };
  });
});
const getDatasetPath = computed(
  () => `${dataSources.value[0].bucket}${dataSources.value[0].subpath}`
);
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

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(() => {
    void router.push({ name: PAGE_TYPES.HPC_REMOTE_DATA_LIST });
  });
});

const fetchData = async () => {
  await execFetchS3BucketList();
  dataSources.value[0].bucket = bucketList.value[0]?.value ?? undefined;
  providerList.value = await makeApiCall({
    apiCallFn: fetchResourceProviderList,
    errorResHandlingFn: () => [],
  });
  provider.value = providerList.value[0] || '';
};

const filesHasEmptyValue = computed(() =>
  dataSources.value.some(
    (file: { bucket: string; subpath: string }) => file.bucket === ''
  )
);
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
  if (
    !validBasic.value ||
    !expirationHasValue.value ||
    filesHasEmptyValue.value
  ) {
    errSteps.push(steps.value[0]);
  }
  return errSteps;
};

const getPayload = computed(() => {
  const payload: any = {
    name: name.value,
    provider: provider.value,
    scheme: getDataStorageSchema(),
    type: 'dataset',
    uri: getDatasetPath.value,
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
      await router.push({ name: PAGE_TYPES.HPC_REMOTE_DATA_LIST }),
  });
};
const cancel = () => {
  void router.push({ name: PAGE_TYPES.HPC_REMOTE_DATA_LIST });
};
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="
          $t('basic.create.type', { type: $t('services.hpc.remote.data') })
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
              <MultipleInputSetter
                :title="$t('hpcRemoteTask.dataSource')"
                required
                :params="dataSources"
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
                    colsNumber: 3,
                  },
                  {
                    header: $t('label.subpath'),
                    type: 'text-input',
                    colsNumber: 3,
                    required: false,
                  },
                ]"
                disable-add-item
                disable-delete-item
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
            <CheckItem :key-name="$t('form.storageInfo')">
              <v-col cols="9">
                <DetailTable
                  :items="dataSources"
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
                  required
                />
              </v-col>
            </CheckItem>
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
