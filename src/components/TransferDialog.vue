<script lang="ts" setup>
import { computed, nextTick, ref, watch, type PropType } from 'vue';

import type { FormError } from '@/interfaces/VmInterface';

import {
  fetchResourceTransferInfo,
  transferResourceToPrivate,
  makeApiCall,
  RESOURCE_TYPE,
  fetchVmKeypairs,
} from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  resourceId: {
    type: String,
    default: '',
  },
  resourceName: {
    type: String,
    default: '',
  },
  resourceType: {
    type: String as PropType<RESOURCE_TYPE>,
    required: true,
  },
  keypairId: {
    type: String,
    default: '',
  },
});

const transferName = ref('');
const transferVersion = ref('');
const virtualNetworkList = ref<Record<string, any>[]>([]);
const selectedVirtualNetworkId = ref<string>();
const securityGroupList = ref<Record<string, any>[]>([]);
const selectedSecurityGroupId = ref<string>();
const privateTagNames = ref<string[]>([]);
const transferNameError = ref<string[]>([]);
const transferVersionError = ref<string[]>([]);
const transferNameRef = ref<any>(null);
const transferVersionRef = ref<any>(null);
const enableKeypair = ref(false);
const selectedKeypairId = ref<string>();
const keypairList = ref<Record<string, any>[]>([]);
const password = ref<string>();
const formError = ref<FormError>({});

const disableSumbit = computed(
  () =>
    !transferName.value ||
    (props.resourceType === RESOURCE_TYPE.VPS && !transferVersion.value) ||
    !selectedVirtualNetworkId.value ||
    !selectedSecurityGroupId.value ||
    transferNameError.value.length > 0 ||
    transferVersionError.value.length > 0 ||
    (enableKeypair.value || props.resourceType === RESOURCE_TYPE.APS
      ? !!formError.value.keypair
      : false) ||
    !!formError.value.password ||
    !password.value
);

const fetchData = async () => {
  const info = await makeApiCall({
    apiCallFn: fetchResourceTransferInfo,
    payload: {
      serverId: props.resourceId,
      resourceType: props.resourceType,
    },
    errorResHandlingFn: () => {},
  });
  if (props.resourceType === RESOURCE_TYPE.VPS) {
    transferVersion.value = info?.image?.tagName;
    privateTagNames.value = [...(info?.private?.tags ?? [])].map(
      tag => tag.name
    );
  }
  virtualNetworkList.value = [...(info?.private?.networks ?? [])];
  securityGroupList.value = [...(info?.private?.securityGroups ?? [])];

  selectedVirtualNetworkId.value =
    virtualNetworkList.value?.[0]?.id ?? undefined;
  selectedSecurityGroupId.value = securityGroupList.value?.[0]?.id ?? undefined;

  keypairList.value = await makeApiCall({
    apiCallFn: fetchVmKeypairs,
    skipErrorDialog: true,
    errorResHandlingFn: () => [],
  });
  if (props.keypairId) {
    selectedKeypairId.value = keypairList.value.find(
      keypair => keypair.id === props.keypairId
    )?.id;
    enableKeypair.value = true;
  } else {
    selectedKeypairId.value = keypairList.value[0]?.id;
    enableKeypair.value = false;
  }

  void nextTick(() => {
    transferNameRef.value?.validate();
    transferVersionRef.value?.validate();
  });
};

const submitAction = () => {
  makeApiCall({
    apiCallFn: transferResourceToPrivate,
    payload: getPaylod.value,
  });
};

const getPaylod = computed(() => {
  if (props.resourceType === RESOURCE_TYPE.VPS) {
    return {
      serverId: props.resourceId,
      resourceType: props.resourceType,
      data: {
        name: transferName.value,
        version: transferVersion.value,
        networks: [
          {
            id: selectedVirtualNetworkId.value,
            securityGroupIds: [selectedSecurityGroupId.value],
          },
        ],
        password: password.value,
        keypairId: enableKeypair.value ? selectedKeypairId.value : undefined,
      },
    };
  } else {
    return {
      serverId: props.resourceId,
      resourceType: props.resourceType,
      data: {
        name: transferName.value,
        password: password.value,
        keypairId: selectedKeypairId.value,
        network: {
          id: selectedVirtualNetworkId.value,
          securityGroupIds: [selectedSecurityGroupId.value],
        },
      },
    };
  }
});

watch(showDialog, val => {
  if (val) {
    transferName.value = `${props.resourceName}-transfer`;
    password.value = undefined;
    enableKeypair.value = false;
    selectedKeypairId.value = undefined;
    void fetchData();
  } else {
    void nextTick(() => {
      transferName.value = '';
      transferVersion.value = '';
      virtualNetworkList.value = [];
      selectedVirtualNetworkId.value = undefined;
      securityGroupList.value = [];
      selectedSecurityGroupId.value = undefined;
      privateTagNames.value = [];
      transferNameError.value = [];
      transferVersionError.value = [];
    });
  }
});
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('basic.transfer')"
    :disable-submit="disableSumbit"
    :submit-callback="submitAction"
  >
    <v-row no-gutters>
      <span class="mb-4">
        {{ $t('resourceTransfer.dialog.message') }}
      </span>
    </v-row>
    <TextFieldWithHint
      ref="transferNameRef"
      v-model="transferName"
      :title="$t('resourceTransfer.name')"
      :title-hint="$t('resourceTransfer.dialog.name.tooltip')"
      type="name"
      required
      @form-error="errMsg => (transferNameError = errMsg)"
    />
    <TextFieldWithHint
      v-if="resourceType === RESOURCE_TYPE.VPS"
      ref="transferVersionRef"
      v-model="transferVersion"
      :title="$t('resourceTransfer.version')"
      :title-hint="$t('resourceTransfer.dialog.version.tooltip')"
      :rules="[
        val =>
          (!!val && !privateTagNames.includes(val)) ||
          $t('resourceTransfer.dialog.version.duplicated'),
      ]"
      required
      @form-error="errMsg => (transferVersionError = errMsg)"
    />
    <SelectWithHint
      v-model="selectedVirtualNetworkId"
      :title="$t('resourceTransfer.virtualNetwork')"
      :items="virtualNetworkList"
      item-text="name"
      item-value="id"
      required
    />
    <SelectWithHint
      v-model="selectedSecurityGroupId"
      :title="$t('resourceTransfer.securityGroup')"
      :items="securityGroupList"
      item-text="name"
      item-value="id"
      required
    />
    <RadioButtonSwitch
      v-if="resourceType === RESOURCE_TYPE.VPS"
      :title="$t('creation.keypair.auth')"
      :init-value="enableKeypair"
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
      @selected="(value: boolean) => (enableKeypair = value)"
    />
    <SelectWithHint
      v-if="enableKeypair || resourceType === RESOURCE_TYPE.APS"
      ref="keypairInputRef"
      v-model="selectedKeypairId"
      :title="$t('services.keypairs')"
      :items="keypairList"
      :item-text="'name'"
      :item-value="'id'"
      :selection-cols="8"
      required
      @form-error="
        event => {
          if (event) formError.keypair = event;
        }
      "
    />
    <TextFieldWithHint
      ref="passwordInputRef"
      v-model="password"
      :title="$t('basic.password')"
      type="password"
      :text-field-col="8"
      required
      @form-error="
        event => {
          formError.password = event[0];
        }
      "
    />
  </CommonDialog>
</template>
