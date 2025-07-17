<script lang="ts" setup>
import { computed, onMounted, ref, type Ref, watch } from 'vue';

import type { TableHeader } from '@/interfaces/InfraDataTableInterface';

import {
  addK8sNodeGroup,
  CLUSTER_STATUS,
  fetchK8sFlavorList,
  makeApiCall,
} from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import FlavorTableSelection from '@/components/common/FlavorTableSelection.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import useK8sCluster from '@/composables/useK8sCluster';
import * as K8s from '@/interfaces/K8sInterface';
import getTableHeaders, { TABLE_TYPE } from '@/utils/getTableHeaders';

const { defaultItem, filterK8sFlavor, RANGE } = useK8sCluster();
const showDialog = defineModel<boolean>('show', { required: true });
const showReviewTipDialog = ref(false);

const props = defineProps({
  clusterName: {
    type: String,
    required: true,
  },
  clusterId: {
    type: String,
    required: true,
  },
  workerCount: {
    type: Number,
    required: true,
  },
});

const ngName = ref('');
const emits = defineEmits(['addNodeGroup']);
const flavorHeaders = ref<TableHeader[]>([]);
const flavorList: Ref<K8s.Flavor[]> = ref([defaultItem.flavor]);
const selectedFlavor: Ref<K8s.Flavor> = ref({
  id: '',
  name: '',
  vcpu: 0,
  gpu_count: 0,
  memory: 0,
});

const workerNodeCount = ref<string>('1');

interface FormError {
  name?: string;
  flavor?: string;
  count?: string;
}

const formError = ref<FormError>({});

const disableSubmit = computed(() => {
  return (
    !selectedFlavor.value?.id ||
    !!formError.value.name ||
    !!formError.value.count ||
    ngName.value === ''
  );
});

onMounted(() => {
  flavorHeaders.value = getTableHeaders(TABLE_TYPE.FLAVOR);
});

const fetchData = async () => {
  const flavors: K8s.Flavor[] = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchK8sFlavorList,
  });
  flavorList.value = filterK8sFlavor(flavors);
  if (flavorList.value.length > 0) {
    selectedFlavor.value = flavorList.value?.[0];
  }
  workerNodeCount.value = '1';
  formError.value = {};
};

const submitAction = async () => {
  const hasGpu = selectedFlavor.value.gpu_count > 0;
  await makeApiCall({
    apiCallFn: addK8sNodeGroup,
    payload: {
      body: {
        nodegroupName: ngName.value,
        clusterId: props.clusterId,
        workerFlavorId: selectedFlavor.value.id,
        hasGpu,
        workerCount: Number(workerNodeCount.value),
        // rootVolumeSize: 100,
        externalVolumeSize: 100,
      },
    },
    successCallback: res => {
      if (res?.reviewStatus === CLUSTER_STATUS.UNDER_REVIEW) {
        showReviewTipDialog.value = true;
      }
      emits('addNodeGroup');
    },
  });
};

const handleAddNg = () => {
  emits('addNodeGroup');
};

watch(showDialog, val => {
  if (val) {
    ngName.value = '';
    void fetchData();
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('k8s.addNode')"
    :disable-submit="disableSubmit"
    :submit-callback="submitAction"
  >
    <v-row no-gutters>
      <v-col cols="3" class="pa-0 ocis-form-title">
        {{ $t('k8s.name') }}
      </v-col>
      <v-col cols="9" class="pa-0 align-content-center">
        {{ clusterName }}
      </v-col>
      <TextFieldWithHint
        ref="refTextfield"
        v-model="ngName"
        :title="$t('label.name')"
        :placeholder="$t('k8s.workerNode.name')"
        required
        :text-field-col="6"
        :type="'name'"
        :max-name-length="24"
        @form-error="
          msg => {
            formError.name = msg[0];
          }
        "
      />
      <v-col cols="12" class="pa-0">
        <FlavorTableSelection
          v-model="selectedFlavor"
          :headers="flavorHeaders"
          :items="flavorList"
          :table-name="$t('flavor.title')"
          :show-quota-header="false"
          :show-quota-link="true"
        />
        <TextFieldWithHint
          v-model="workerNodeCount"
          required
          type="number"
          :title="$t('label.computingNode.number')"
          :text-field-col="9"
          :min-val="RANGE.MIN"
          :max-val="RANGE.MAX"
          @form-error="msg => (formError.count = msg[0])"
        />
      </v-col>
    </v-row>
  </CommonDialog>
  <CommonDialog
    v-model:show="showReviewTipDialog"
    :title="$t('application.createed.dialog.msg')"
    :show-cancel-btn="false"
    :submit-callback="handleAddNg"
  />
</template>
