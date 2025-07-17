<script setup lang="ts">
import { computed, watch } from 'vue';

import { makeApiCall, upgradeK8sVersion } from '@/api';
import CommonDialog from '@/components/common/CommonDialog.vue';
import DetailItem from '@/components/common/DetailItem.vue';

const showDialog = defineModel<boolean>('show', { required: true });

const emits = defineEmits(['upgrade', 'close-dialog']);

const props = defineProps({
  clusterId: {
    required: true,
    type: String,
  },
  currentVersion: {
    required: true,
    type: String,
  },
  k8sVersions: {
    type: Array<string>,
    default: () => [],
  },
});

const handleSubmitUpgradeK8sVersion = async () => {
  await makeApiCall({
    apiCallFn: upgradeK8sVersion,
    payload: {
      clusterId: props.clusterId,
      body: {
        k8sVersion: checkK8sUpgrade.value.version,
      },
    },
    successCallback: () => {
      emits('upgrade');
    },
  });
};

const getVersionList = computed(() => {
  const vers = props.k8sVersions;
  return vers.sort((a, b) => (a > b ? 1 : -1));
});

const getDescVersions = computed(() => {
  return getVersionList.value;
});

const checkK8sUpgrade = computed(() => {
  const check = {
    available: false,
    version: 'none',
  };

  if (getVersionList.value.length) {
    const upgradeMatch = getDescVersions.value.find((version: string) => {
      return version > props.currentVersion;
    });
    if (upgradeMatch) {
      check.available = true;
      check.version = upgradeMatch;
    }
  }
  return check;
});

watch(showDialog, val => {});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('k8s.upgrade.title')"
    :disable-submit="!checkK8sUpgrade.available"
    :cancel-btn-text="$t('basic.cancel')"
    :cancel-callback="() => $emit('close-dialog')"
    :submit-btn-text="$t('action.upgrade')"
    :submit-callback="handleSubmitUpgradeK8sVersion"
  >
    <v-row no-gutters>
      <v-col cols="12" class="pb-4">
        <DetailItem
          :title="$t('k8s.upgrade.current.version')"
          :content="currentVersion"
        />
        <DetailItem
          :title="$t('k8s.upgrade.next.version')"
          :content="checkK8sUpgrade.version"
        />
      </v-col>
      <v-col cols="12" class="pb-4">
        <span v-if="checkK8sUpgrade.available">
          {{ $t('k8s.upgrade.message') }}
        </span>
        <span v-else>
          {{ $t('k8s.upgrade.message.no') }}
        </span>
      </v-col>
    </v-row>
  </CommonDialog>
</template>
