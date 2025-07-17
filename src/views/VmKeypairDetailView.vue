<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, type Ref } from 'vue';

import { makeApiCall, fetchVmKeypairDetail } from '@/api';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { formatDateSec, generalCopy } from '@/utils/utils';

const { setProjectSwitchCallback } = useProjectSwitch();
const { openDeleteDialog } = useGlobal();
const { t, router, doDeleteVmKeypair } = useVm(PAGE_TYPES.VM_KEYPAIR_DETAIL);
const tabs = computed(() => [t('basic.overview')]);
const expansionPanels = computed(() => [
  { title: t('label.basicInfo'), value: 'basicInfo' },
  { title: t('label.detailInfo'), value: 'detailInfo' },
]);

const lastUpdatedTime: Ref<Date | string> = ref('');
const keypairDetail: Ref<Record<string, any>> = ref({ basicInfo: [] });

const fetchData = async () => {
  await makeApiCall({
    apiCallFn: fetchVmKeypairDetail,
    payload: {
      keypairId: router.currentRoute.value.params.id,
    },
    successCallback: res => {
      keypairDetail.value = {
        ...res,
        basicInfo: [
          {
            text: 'label.name',
            value: res.name,
          },
          {
            text: 'label.createdAt',
            value: formatDateSec(res.createdAt as string),
          },
        ],
      };
      lastUpdatedTime.value = new Date();
    },
  });
};
onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(async () => {
    await router.push({ name: PAGE_TYPES.VM_KEYPAIR_LIST });
  });
});

const deleteKey = async () => {
  await doDeleteVmKeypair(keypairDetail.value.id as string, () => {
    void router.push({ name: PAGE_TYPES.VM_KEYPAIR_LIST });
  });
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp
        :title="$tc('basic.detail.type', { type: $t('services.keypairs') })"
      />
      <v-card class="w-100 mt-4">
        <TabsComponent :tab-names="tabs">
          <template #tab-0>
            <v-card>
              <v-card-title class="pa-2">
                <v-row no-gutters>
                  <v-col cols="12">
                    <DetailActionBtn
                      v-for="(item, index) in [
                        {
                          text: t('table.action.delete'),
                          icon: 'mdi-delete-outline',
                          visible: true,
                          action: () =>
                            openDeleteDialog({
                              item: keypairDetail,
                              resourceType: $t('services.keypairs'),
                              message: $t('dialog.delete.message.type', {
                                type: $t('services.keypairs'),
                              }),
                              deleteAction: deleteKey,
                            }),
                        },
                        {
                          text: t('table.action.refresh'),
                          icon: 'mdi-refresh',
                          visible: true,
                          action: () => void fetchData(),
                        },
                      ]"
                      :key="index"
                      :btn="item"
                      :btn-tips="item.text"
                      :btn-icon="item.icon"
                      :last-updated-time="lastUpdatedTime"
                      @item-click="item.action"
                    />

                    <span class="ocis-last-updated-time pt-4 pr-4">
                      {{ $t('label.lastUpdated') }}
                      {{ formatDateSec(lastUpdatedTime) }}
                    </span>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-text class="ocis-detail-scroll-view px-4">
                <DetailPanelGroup v-model="expansionPanels">
                  <DetailPanel
                    :title="expansionPanels[0].title"
                    :value="expansionPanels[0].value"
                  >
                    <v-row no-gutters class="text-body-2">
                      <v-col
                        v-for="item in keypairDetail.basicInfo"
                        :key="item.text"
                        cols="6"
                        class="pb-4"
                      >
                        <DetailItem
                          :title="$t(item.text)"
                          :content="item.value"
                        />
                      </v-col>
                    </v-row>
                  </DetailPanel>

                  <DetailPanel
                    :title="expansionPanels[1].title"
                    :value="expansionPanels[1].value"
                  >
                    <v-row>
                      <v-col cols="2">
                        <span class="text-body-2">
                          {{ $t('label.publicKey') }}
                        </span>
                      </v-col>
                      <v-col>
                        {{ keypairDetail.public_key?.slice(0, 32) + ' ...' }}
                        <v-icon
                          size="small"
                          icon="mdi-content-copy"
                          @click="generalCopy(keypairDetail.public_key)"
                        />
                      </v-col>
                    </v-row>
                  </DetailPanel>
                </DetailPanelGroup>
              </v-card-text>
            </v-card>
          </template>
        </TabsComponent>
      </v-card>
    </v-row>
  </UiContainer>
</template>
