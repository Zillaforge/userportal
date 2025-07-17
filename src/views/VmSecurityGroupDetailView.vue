<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, type Ref, onMounted, computed } from 'vue';

import {
  makeApiCall,
  fetchVmSecurityGroupDetail,
  vmSecurityGroupAddRule,
  vmSecurityGroupDeleteRule,
} from '@/api';
import SecuritySettingDialog from '@/components/SecurityGroupSettingDialog.vue';
import TD from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { MainActionType } from '@/interfaces/InfraDataTableInterface';
import { getDeepObj, generalCopy } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const { openDeleteDialog } = useGlobal();
const { projectId, router, headers } = useVm(
  PAGE_TYPES.VM_SECURITY_GROUP_DETAIL
);

const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const vmSecurutyGroup: Ref<Record<string, any>> = ref({});
const searchStr: Ref<string> = ref('');

const createDialog: Ref<boolean> = ref(false);
const name = computed(() => router.currentRoute.value.params.sgName);

const fetchData = async () => {
  isLoading.value = true;
  await makeApiCall({
    apiCallFn: fetchVmSecurityGroupDetail,
    payload: {
      projectId: projectId.value,
      securityGroupId: router.currentRoute.value.params.id,
    },
    successCallback: res => {
      vmSecurutyGroup.value = {
        ...res,
        rules: res.rules.map((item: any) => ({
          ...item,
          network_type: 'IPv4',
        })),
      };
    },
  });

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

onMounted(() => {
  void fetchData();
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_SECURITY_GROUP_LIST })
  );
});

const toCreate = () => {
  createDialog.value = true;
};

const securityRule = ref({
  direction: 'ingress',
  port_min: '',
  port_max: '',
  protocol: 'TCP',
  remote_cidr: '',
});

const submitRule = (rule: any) => {
  makeApiCall({
    apiCallFn: vmSecurityGroupAddRule,
    payload: {
      projectId: projectId.value,
      securityGroupId: router.currentRoute.value.params.id,
      ruleItem: {
        ...rule,
        port_min: Number(rule.port_min),
        port_max: Number(rule.port_max),
      },
    },
    successCallback: () => {
      void fetchData();
    },
  });
};

const deleteRule = async (id: any) => {
  await makeApiCall({
    apiCallFn: vmSecurityGroupDeleteRule,
    payload: {
      projectId: projectId.value,
      securityGroupId: router.currentRoute.value.params.id,
      ruleId: id,
    },
    successCallback: () => {
      void fetchData();
    },
  });
};
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp :title="name + $t('vm.sg.rule.manage')" />

      <GeneralDataTable
        :main-action-list="[
          {
            type: MainActionType.CREATE,
            action: toCreate,
          },
        ]"
        :more-action-list="[
          {
            label: $t('action.copyId'),
            action: item => generalCopy(item.id),
          },
          {
            label: $t('table.action.delete'),
            action: (item: any) =>
              openDeleteDialog({
                item: vmSecurutyGroup,
                resourceType: $t('vm.sg.rule'),
                message: $t('dialog.delete.message.type', {
                  type: $t('vm.sg.rule'),
                }),
                deleteAction: () => deleteRule(item.id),
              }),
          },
        ]"
        :items="vmSecurutyGroup.rules"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :search="searchStr"
        :table-headers="headers"
        :table-item-key="'id'"
        :has-click-row-handler="false"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key) || '-'"
            :is-cursor-pointer="false"
            :search="searchStr"
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <SecuritySettingDialog
      v-model:show="createDialog"
      :security-rule="securityRule"
      @submit="submitRule"
    />
  </UiContainer>
</template>
<style lang="scss" scoped></style>
