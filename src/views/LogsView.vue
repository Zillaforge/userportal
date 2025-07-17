<script lang="ts" setup>
import { useGlobal, useProject } from '@/store';
import { ref, watch, computed, onMounted, type Ref } from 'vue';
import { useRoute } from 'vue-router';

import { VSelect } from 'vuetify/components';

import { fetchProjectLogs, fetchUserLogs, makeApiCall } from '@/api';
import LogDetailDialog from '@/components/LogDetailDialog.vue';
import TD from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import SelectComponent from '@/components/common/SelectComponent.vue';
import SelectCustomPeriodDialog from '@/components/common/SelectCustomPeriodDialog.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import { LOG_TYPES, RESOURCE_REGION_TYPE } from '@/constants/Constants';
import Document from '@/constants/Document';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  type TableHeader,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getNoDataSetting from '@/utils/getNoDataSetting';
import getTableHeaders from '@/utils/getTableHeaders';
import {
  getDeepObj,
  getTimePeriodOptions,
  formatDate,
  generalCopy,
} from '@/utils/utils';

const props = defineProps({
  logType: {
    type: String,
    default: LOG_TYPES.PROJECT,
  },
});

const FETCH_SIZE = 100;

const globalStore = useGlobal();
const projectStore = useProject();
const route = useRoute();

const { t } = i18n.global;

const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const searchStr: Ref<string> = ref('');
const showDetailDialog: Ref<boolean> = ref(false);
const logs: Ref<Record<string, any>[]> = ref([]);
const headers = ref<TableHeader[]>([]);
const detailData: Ref<Record<string, any>> = ref({});
const selectedTimePeriod: Ref<number | undefined> = ref();
const endTime: Ref<number | undefined> = ref();
const startTime: Ref<number | undefined> = ref();
const totalCount: Ref<number> = ref(0);
const fetchMoreCount: Ref<number> = ref(0);
const showtCustomPeriodDialog: Ref<boolean> = ref(false);
const selectedTimePeriodRef: Ref<InstanceType<typeof VSelect> | undefined> =
  ref();

const projectId = computed(() => projectStore.getCurrentProject?.id);
const linkUrl = computed(() => {
  return Document.USAGE_LOG;
});

const noDataSetting = computed(() => getNoDataSetting(PAGE_TYPES.LOGS));

const hasMoreData = computed(() => totalCount.value > logs.value.length);

const pageTitle = computed(() =>
  props.logType === LOG_TYPES.USER ? t('logMgnt.userLog') : t('logMgnt.log')
);

onMounted(() => {
  init();
  initValue();
  void fetchData();
});

const init = () => {
  headers.value = getTableHeaders(PAGE_TYPES.LOGS);
};

const initValue = () => {
  selectedTimePeriod.value = getTimePeriodOptions()?.[0]?.value;
  endTime.value = Date.now();
  startTime.value = endTime.value - selectedTimePeriod.value;
  totalCount.value = 0;
  fetchMoreCount.value = 0;
  logs.value = [];
  globalStore.setBreadcrumbsParams({ logType: props.logType });
};

const fetchData = async (offestCount: number = 0) => {
  if (offestCount === 0) {
    fetchMoreCount.value = 0;
  }
  isLoading.value = true;
  const apiFunc =
    props.logType === LOG_TYPES.USER ? fetchUserLogs : fetchProjectLogs;

  await makeApiCall({
    skipProgress: true,
    apiCallFn: apiFunc,
    payload: {
      offset: offestCount * FETCH_SIZE,
      size: FETCH_SIZE,
      from: startTime.value,
      to: endTime.value,
      language: i18n.global.locale,
    },
    successCallback: res => {
      totalCount.value = res.total ?? 0;
      const history = res.accessLogs ?? [];
      logs.value =
        offestCount === 0 ? [...history] : [...logs.value, ...history];

      logs.value.forEach((element: Record<string, any>) => {
        element.rawData = JSON.parse(JSON.stringify(element));
        element.uiType = element.service?.displayName;
        element.uiAction = element.action?.displayName;
        element.userName = element.user?.displayName;
      });
      lastUpdatedTime.value = new Date();
    },
  });
  isLoading.value = false;
};

const openDetailDialog = (data: Record<string, any>) => {
  detailData.value = data;
  showDetailDialog.value = true;
};

const getItemValue = (item: TableItem, headerKey: string) => {
  if (headerKey === 'userName' && item.saatUser?.id) {
    return getDeepObj(item, headerKey) + ` (${t('logMgnt.simulated.user')})`;
  }

  if (headerKey === 'meta.ad') {
    const value = getDeepObj(item, headerKey);

    if (!value) {
      return '-';
    }

    switch (value) {
      case RESOURCE_REGION_TYPE.PILOT:
        return t('appBar.pilotResource');
      case RESOURCE_REGION_TYPE.TRUSTED_PLATFORM:
        return t('appBar.trustyPlatformResource');
      default:
        return value;
    }
  }

  return getDeepObj(item, headerKey).toString().length
    ? getDeepObj(item, headerKey)
    : '-';
};

const updateTimePeriod = (value: number) => {
  selectedTimePeriodRef.value?.selectComponentRef?.blur();

  if (value === -1) {
    showtCustomPeriodDialog.value = true;
    return;
  }
  selectedTimePeriod.value = value;
  endTime.value = Date.now();
  startTime.value = endTime.value - value;
  void fetchData();
};

const updateCustomTimePeriod = (start: number, end: number) => {
  selectedTimePeriod.value = -1;
  endTime.value = end;
  startTime.value = start;
  void fetchData();
};

watch(projectId, () => {
  initValue();
  void fetchData();
});

watch(
  () => i18n.global.locale,
  () => {
    init();
    initValue();
    void fetchData();
  }
);

watch(route, () => {
  init();
  initValue();
  void fetchData();
});
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp :title="pageTitle" :link-url="linkUrl" />
      <GeneralDataTable
        :more-action-list="[
          {
            label: $t('logMgnt.copy'),
            action: item => generalCopy(item.meta?.requestID),
          },
          {
            label: $t('logMgnt.originalData'),
            action: item => openDetailDialog(item.rawData),
          },
        ]"
        :items="logs"
        :last-updated-time="lastUpdatedTime"
        :table-headers="headers"
        :table-item-key="'name'"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'action.time',
          isDescending: true,
        }"
        :show-search-wrapper="false"
        :show-fetch-more-data="hasMoreData"
        :has-click-row-handler="false"
        @fetch-data="fetchData()"
        @fetch-more-data="fetchData(++fetchMoreCount)"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getItemValue(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :use-date-filter="header.useDateFilter"
          />
        </template>
        <template #customSearch>
          <v-row no-gutters class="px-6 py-2 align-center">
            <v-col cols="3" class="pr-4">
              <SelectComponent
                ref="selectedTimePeriodRef"
                :selected-value="selectedTimePeriod"
                :items="getTimePeriodOptions()"
                :custom-item="true"
              >
                <template #customItem="{ item }">
                  <v-list-item
                    :active="selectedTimePeriod === item.value"
                    @click="updateTimePeriod(item.value)"
                  >
                    {{ item.title }}
                  </v-list-item>
                </template>
              </SelectComponent>
            </v-col>
            <v-col cols="9">
              <span class="text-primary">
                {{
                  `${$t('usage.period')}: ${formatDate(startTime)} ~ ${formatDate(endTime)}`
                }}
              </span>
            </v-col>
          </v-row>
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
  <LogDetailDialog v-model:show="showDetailDialog" :data="detailData" />
  <SelectCustomPeriodDialog
    v-model:show="showtCustomPeriodDialog"
    :reset-value="selectedTimePeriod !== -1"
    @submit="updateCustomTimePeriod"
  />
</template>
