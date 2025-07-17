<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, type Ref, watch, onMounted } from 'vue';

import { makeMultipleApiCalls, makeApiCall, createVmKeypair } from '@/api';
import TD from '@/components/TdHighlight.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {
  MainActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import { getDeepObj } from '@/utils/utils';
const { openDeleteDialog } = useGlobal();
const { setProjectSwitchCallback } = useProjectSwitch();
const { headers, router, doFetchVmKeypairs, doDeleteVmKeypair } = useVm(
  PAGE_TYPES.VM_KEYPAIR_LIST
);
const triggerCreateDialog = () => (createDialog.value = true);
const noDataSetting = getNoDataSetting(
  PAGE_TYPES.VM_KEYPAIR_LIST,
  triggerCreateDialog
);
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const vmKeypairList: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');
const createDialog: Ref<boolean> = ref(false);

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => {
    await fetchData();
  });
});

const fetchData = async () => {
  isLoading.value = true;
  await doFetchVmKeypairs(true, res => {
    vmKeypairList.value = res;
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const isCreated = ref(false);
const valid = ref(false);
const name = ref('kp' + Math.floor(Date.now() / 1000));
const publicKey = ref('');

const keypair: Record<string, any> = ref({
  name: '',
  public_key: '',
  private_key: '',
});
const createKey = async () => {
  if (!isCreated.value) {
    // Create key
    await makeApiCall({
      apiCallFn: createVmKeypair,
      payload: {
        keypairItem: {
          name: name.value,
          public_key: publicKey.value,
          description: '',
        },
      },
      successCallback: async res => {
        isCreated.value = true;
        keypair.value = res;
        if (!res.private_key) {
          createDialog.value = false;
        }
        await fetchData();
      },
    });
  }
};

const toDetailPage = (id: number) => {
  void router.push({ name: PAGE_TYPES.VM_KEYPAIR_DETAIL, params: { id } });
};

const download = (filename: string, text: string) => {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
  );
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const batchDeleteAction = async (selectedItems: TableItem[]) => {
  await makeMultipleApiCalls({
    apiCallFn: doDeleteVmKeypair,
    apiCallFnName: 'batchDelete',
    payloads: selectedItems.map((item: Record<string, any>) => item.id),
  });
};

watch(
  () => createDialog.value,
  newVal => {
    if (newVal) {
      isCreated.value = false;
      name.value = 'kp' + Math.floor(Date.now() / 1000);
      publicKey.value = '';
    }
  }
);
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="
          $t('basic.management.type', {
            type: ` ${$t('services.keypairs')}`,
          })
        "
      />

      <GeneralDataTable
        :main-action-list="[
          {
            type: MainActionType.CREATE,
            action: triggerCreateDialog,
          },
        ]"
        :more-action-list="[
          {
            label: $t('table.action.delete'),
            action: (item: any) => {
              openDeleteDialog({
                item: item,
                resourceType: $t('services.keypairs'),
                message: $t('dialog.delete.message.type', {
                  type: $t('services.keypairs'),
                }),
                deleteAction: async () =>
                  await doDeleteVmKeypair(item.id, fetchData),
              });
            },
          },
        ]"
        :batch-delete-setting="{
          items: vmKeypairList,
          action: batchDeleteAction,
        }"
        :items="vmKeypairList"
        :no-data-setting="noDataSetting"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'createdAt',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        @on-row-click="
          (item: any) => {
            toDetailPage(item.id);
          }
        "
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :use-date-filter="header.useDateFilter"
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <CommonDialog
      v-model:show="createDialog"
      :title="$t('basic.create.type', { type: $t('services.keypairs') })"
      :disable-submit="!valid"
      :alert="isCreated && keypair.private_key ? $t('vm.keypair.alert') : ''"
      :show-submit-btn="!isCreated"
      :disable-auto-close-dialog="true"
      :cancel-callback="() => (createDialog = false)"
      :submit-callback="createKey"
      :cancel-btn-text="isCreated ? $t('basic.close') : $t('basic.cancel')"
    >
      <v-form v-model="valid">
        <TextFieldWithHint
          v-model="name"
          :title="$t('label.name')"
          :required="true"
          :text-field-col="8"
          :type="'name'"
        />
        <TextFieldWithHint
          v-model="publicKey"
          class="pt-4"
          :title="$t('label.publicKey')"
          :text-field-col="8"
          :readonly="isCreated"
        />
      </v-form>
      <template v-if="isCreated" #more-actions>
        <ContainedBtn
          :text="isCreated ? $t('basic.download') : $t('basic.create')"
          @click="
            () => {
              download(`${keypair.name}.pem`, keypair.private_key);
            }
          "
        />
      </template>
    </CommonDialog>
  </UiContainer>
</template>
<style lang="scss" scoped></style>
