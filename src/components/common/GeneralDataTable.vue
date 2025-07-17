<template>
  <v-row no-gutters>
    <v-col
      v-if="mainActionList.length > 0"
      cols="12"
      class="px-0 pb-3 main-action-col"
    >
      <div>
        <template
          v-for="(mainAction, index) in mainActionList"
          :key="`mainAction${index}`"
        >
          <TableMainActionBtn
            :btn="getMainActionBtn(mainAction)"
            class="mr-3"
          />
        </template>
      </div>
      <div class="align-self-end">
        <slot name="message" />
      </div>
    </v-col>
    <slot v-else name="message" />

    <v-col cols="12">
      <v-card class="ocis-table-card">
        <div class="table-actions">
          <div>
            <template
              v-for="(action, index) in tableActionList"
              :key="`action${index}`"
            >
              <TableActionBtn :btn="getTableActionBtn(action)" />
            </template>

            <TableActionBtn
              :btn="{
                visible: true,
                disabled: false,
                icon: 'mdi-refresh',
                tips: $t('table.action.refresh'),
                action: () => fetchData(),
              }"
            />
          </div>

          <div class="ocis-last-updated-time">
            {{ $t('label.lastUpdated') }}
            {{ formatDateSec(lastUpdatedTime) }}
          </div>
        </div>

        <div class="ocis-table-container">
          <v-col class="search-wrapper">
            <slot name="customSearch" />
            <v-row v-if="showSearchWrapper" no-gutters class="py-2 px-6">
              <v-col cols="8">
                <div>
                  <SearchTextField v-model="searchStr" />
                </div>
              </v-col>
              <v-col
                v-if="customBtn || batchDeleteSetting"
                class="custom-search-bar-btn text-end align-content-center"
              >
                <OutlinedBtn
                  v-if="customBtn"
                  :text="customBtn.label"
                  :disabled="customBtn.disabled"
                  @click="customBtn.action"
                />

                <span v-if="customBtn && batchDeleteSetting" class="px-1" />

                <OutlinedBtn
                  v-if="batchDeleteSetting"
                  :text="$t('table.action.batchDelete')"
                  @click="showBatchDeleteDialog = true"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-divider />
          <v-data-table
            v-model:page="pagination.page"
            v-model:items-per-page="pagination.rowsPerPage"
            v-model:sort-by="sortBy"
            :class="{
              'table--has-data': items.length > 0,
              'table--no-data': items.length === 0,
              'ocis-scrollable-table': true,
            }"
            :items="items"
            :item-value="tableItemKey"
            :headers="stateHeaders"
            :search="searchStr"
            :filter-mode="'some'"
            :loading="loading"
            :loading-text="$t('basic.dataLoading')"
            :show-select="false"
            hide-default-footer
            return-object
            select-strategy="page"
            @update:current-items="handleCurrentItemsChanged"
          >
            <template #loader>
              <v-progress-linear height="4" color="primary" indeterminate />
            </template>
            <template #item="{ item, index: itemIndex }">
              <tr
                v-bind="$attrs"
                :key="item?.[tableItemKey]"
                :class="{
                  'cursor-pointer': getHasClickRowHandler(item),
                  'cursor-default v-no-hover': !getHasClickRowHandler(item),
                  'table-row selected': isRowSelected(item),
                  'table-row': !isRowSelected(item),
                }"
                @click="onRowClick(item)"
              >
                <slot name="item" :item="item" :index="itemIndex" />

                <td
                  v-if="!!stateHeaders.find(el => el.key === 'more-actions')"
                  class="text-end"
                >
                  <v-menu
                    v-if="showMoreActionList(item)"
                    transition="scale-transition"
                    open
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        class="ocis-table-more-btn"
                        variant="flat"
                        icon
                        density="comfortable"
                        @click.stop
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list
                      id="tableMoreList"
                      class="pa-0 ocis-more-action-list"
                    >
                      <template
                        v-for="(moreAction, index) in moreActionList"
                        :key="`moreAction${index}`"
                      >
                        <TableMoreActionListItem
                          v-if="
                            moreAction.visible ? moreAction.visible(item) : true
                          "
                          :table-item="item"
                          :table-item-index="itemIndex"
                          :list-item="
                            getMoreActionListItem(moreAction, item, itemIndex)
                          "
                        />
                      </template>
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </template>

            <template v-if="noDataSetting && items.length === 0" #no-data>
              <div class="text-center align-content-center table-no-data">
                <template v-if="!hideNoDataIcon">
                  <component
                    :is="{ ...noDataSetting.svgIcon }"
                    v-if="noDataSetting.svgIcon"
                    :colorful="false"
                    class="mb-4 ocis-no-data-component"
                  />
                  <img
                    v-else-if="noDataSetting.image"
                    :src="noDataSetting.image"
                    :height="120"
                    class="pb-2"
                    alt="No Data"
                  />
                  <v-icon v-else-if="noDataSetting.icon" size="120">
                    {{ noDataSetting.icon }}
                  </v-icon>
                </template>

                <p class="mb-4">
                  {{ noDataSetting.message1 }}
                  <br />
                  <span v-if="noDataSetting.link">
                    <span>{{ noDataSetting.message2 }}</span>
                    <ExternalLink :link="noDataSetting.link" />
                  </span>
                  <span v-else>
                    {{ noDataSetting.message2 }}
                  </span>
                </p>

                <ContainedBtn
                  v-if="noDataSetting.buttonTitle"
                  :text="noDataSetting.buttonTitle"
                  @click="
                    noDataSetting.action ? noDataSetting.action() : undefined
                  "
                />
              </div>
            </template>
            <template v-else #no-data>
              <div class="text-center">
                {{
                  items.length === 0
                    ? noDataText || $t('label.noData')
                    : $t('label.searchNotFound')
                }}
              </div>
            </template>

            <template
              v-for="(header, index) in headersWithTooltip"
              :key="`header-tooltip-${index}`"
              #[`header.${header.key}`]="{ column }"
            >
              {{ column.title }}
              <InfoTooltip :tooltip="header.tooltip" />
            </template>

            <template #bottom />
          </v-data-table>
          <template v-if="items.length > 0">
            <v-divider />
            <v-card-title class="pa-0">
              <v-row no-gutters class="text-center">
                <v-col cols="12">
                  <Pagination
                    v-show="items.length"
                    :pagination="pagination"
                    :item-title="`${$tc('basic.items', itemCount, { number: itemCount })}`"
                    :show-fetch-more-data="showFetchMoreData"
                    @fetch-more-data="fetchMoreData"
                    @update-current-page="pagination.page = $event"
                  />
                </v-col>
              </v-row>
            </v-card-title>
          </template>
        </div>
      </v-card>
    </v-col>
    <BatchDeleteDialog
      v-model:show="showBatchDeleteDialog"
      :item-list="batchDeleteSetting?.items"
      :table-headers="batchDeleteSetting?.tableHeaders"
      :sort-key="batchDeleteSetting?.sortKey"
      :title="batchDeleteSetting?.dialogTitle"
      :message="batchDeleteSetting?.dialogMessage"
      :submit-action="submitBatchDelete"
      :table-item-key="batchDeleteSetting?.tableItemKey"
    />
  </v-row>
</template>

<script setup lang="ts">
import { useGlobal } from '@/store';
import {
  ref,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  type Ref,
  type PropType,
} from 'vue';

import get from 'lodash/get';

import { useDisplay } from 'vuetify';

import type { SortItem } from '@/interfaces/VuetifyInterfaces';

import Pagination from '@/components/PaginationComponment.vue';
import BatchDeleteDialog from '@/components/common/BatchDeleteDialog.vue';
import ExternalLink from '@/components/common/ExternalLink.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';
import SearchTextField from '@/components/common/SearchTextField.vue';
import TableActionBtn from '@/components/common/TableActionBtn.vue';
import TableMainActionBtn from '@/components/common/TableMainActionBtn.vue';
import TableMoreActionListItem from '@/components/common/TableMoreActionListItem.vue';
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import i18n from '@/i18n';
import {
  MainActionType,
  ActionType,
  type TableItem,
  type MainAction,
  type TableAction,
  type MoreAction,
  type ResourceInfo,
  type NoDataSetting,
  type CustomBtn,
  type BatchDeleteSetting,
} from '@/interfaces/InfraDataTableInterface';
import { formatDateSec } from '@/utils/utils';

const { openDeleteDialog, openStartDialog, openStopDialog } = useGlobal();

const { t } = i18n.global;
const { height } = useDisplay();

const emit = defineEmits([
  'fetch-data',
  'fetch-more-data',
  'updateSearch',
  'onRowClick',
]);
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  lastUpdatedTime: {
    type: [Date, String],
    default: null,
  },
  tableHeaders: {
    type: Array<any>,
    default: [],
  },
  mainActionList: {
    type: Array<MainAction>,
    default: [],
    validator(value: MainAction[]) {
      return value.every(el => !!el.type || !!el.label);
    },
  },
  tableActionList: {
    type: Array<TableAction>,
    default: [],
    validator(value: TableAction[]) {
      return value.every(el => !!el.type || (!!el.icon && !!el.tips));
    },
  },
  moreActionList: {
    type: Array<MoreAction>,
    default: [],
    validator(value: MoreAction[]) {
      return value.every(el => !!el.type || !!el.label);
    },
  },
  resourceInfo: {
    type: Array<ResourceInfo>,
    default: () => [],
  },
  items: {
    type: Array<TableItem>,
    default: () => [],
  },
  noDataSetting: {
    type: Object as PropType<NoDataSetting>,
    default: null,
  },
  noDataText: {
    type: String,
    default: '',
  },
  sortingOptions: {
    type: Object,
    default: () => ({}),
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  autoReloadStatus: {
    type: Array<string>,
    default: () => [
      'Initializing',
      'Creating',
      'Migrating',
      'Starting',
      'Stoping',
      'Deleting',
      'Stopping',
      'Build',
      'Building',
      'Updating',
      'Queueing',
      'Queuing',
      'Queued',
      'Running',
      'Saving',
      'Shelving',
      'Unshelving',
      'Detaching',
      'Processing',
    ],
  },
  autoReloadInterval: {
    type: Number,
    default: 10000,
  },
  tableItemKey: {
    type: String,
    required: true,
    default: 'id',
  },
  showFetchMoreData: {
    type: Boolean,
    default: false,
  },
  searchStr: {
    type: String,
    default: '',
  },
  hasClickRowHandler: {
    type: [Function, Boolean], // Function as PropType<(row: any) => boolean>)
    default: true,
  },
  customBtn: {
    type: Object as PropType<CustomBtn>,
    default: null,
  },
  showSearchWrapper: {
    type: Boolean,
    default: true,
  },
  batchDeleteSetting: {
    type: Object as PropType<BatchDeleteSetting>,
    default: undefined,
  },
});

const sortBy: Ref<SortItem[]> = ref([
  {
    key: props.sortingOptions?.sortBy ?? '',
    order: props.sortingOptions?.isDescending ? 'desc' : 'asc',
  },
]);

const pagination = ref({
  rowsPerPage: 10,
  totalItems: 0,
  page: 1,
});

const timer: Ref<number> = ref(0);
const searchStr = ref('');
const isFetchMoreAction = ref(false);
const showBatchDeleteDialog = ref(false);

const hideNoDataIcon = computed(() => height.value < 700);

const itemCount = computed(() =>
  searchStr.value ? pagination.value.totalItems : props.items.length
);

const headersWithTooltip = computed(() => {
  return stateHeaders.value.filter(header => !!header.tooltip);
});

const stateHeaders = computed(() => {
  const headers = [...props.tableHeaders];
  if (props.items.some(item => showMoreActionList(item))) {
    headers.push({
      title: '',
      key: 'more-actions',
      sortable: false,
    });
  }

  return headers;
});

onBeforeUnmount(() => {
  cancelAutoReload();
});

onMounted(() => {
  init();
});

const init = () => {
  pagination.value.rowsPerPage = props.itemsPerPage;

  if (searchStr.value === '') {
    pagination.value.totalItems = props.items.length;
  }
};

const getMainActionBtn = (action: MainAction) => {
  const btn = {
    disabled: action.disabled ?? false,
    icon: action.icon ?? '',
    label: action.label ?? '',
    action: action.action ?? (() => {}),
  };

  if (action.type === MainActionType.CREATE) {
    btn.icon ||= 'mdi-plus';
    btn.label ||= t('table.action.create');
  }

  return btn;
};

const getTableActionBtn = (tableAction: TableAction) => {
  const iconBtn = {
    visible: tableAction.visible ? tableAction.visible() : true,
    disabled: tableAction.disabled ? tableAction.disabled() : false,
    icon: tableAction.icon ?? '',
    tips: tableAction.tips ?? '',
    action: tableAction.action ?? (() => {}),
  };

  return iconBtn;
};

const getMoreActionListItem = (
  moreAction: MoreAction,
  item: TableItem,
  itemIndex: number
) => {
  const listItem = {
    disabled: moreAction.disabled ? moreAction.disabled(item) : false,
    label: moreAction.label ?? '',
    action: moreAction.action ?? (() => {}),
  };

  // only for default actions: start, stop, (edit), delete
  switch (moreAction.type) {
    case ActionType.START:
      listItem.label ||= t('table.action.start');
      listItem.action = () =>
        openStartDialog({
          item,
          startAction: moreAction.action,
          resourceInfo: props.resourceInfo,
          itemIndex,
        });
      break;
    case ActionType.STOP:
      listItem.label ||= t('table.action.stop');
      listItem.action = () =>
        openStopDialog({
          item,
          stopAction: moreAction.action,
          resourceInfo: props.resourceInfo,
          itemIndex,
        });
      break;
    case ActionType.EDIT:
      listItem.label ||= t('table.action.edit');
      // listItem.action = () =>
      //   openEditDialog(item, moreAction.action);
      break;
    case ActionType.DELETE:
      listItem.label ||= t('table.action.delete');
      listItem.action = () =>
        openDeleteDialog({
          item,
          deleteAction: moreAction.action,
          resourceInfo: props.resourceInfo,
          resourceType: moreAction.resourceType,
          message: moreAction.message,
          itemIndex,
        });
      break;

    default:
      break;
  }
  return listItem;
};

const submitBatchDelete = async (items: Record<string, any>[]) => {
  if (props.batchDeleteSetting?.action) {
    await props.batchDeleteSetting.action(items);
  }
  fetchData();
};

const fetchData = (showLoading = true) => {
  emit('fetch-data', showLoading);
};

const fetchMoreData = () => {
  emit('fetch-more-data');
  isFetchMoreAction.value = true;
};

const cancelAutoReload = () => {
  clearInterval(timer.value);
  timer.value = 0;
};

const isAutoReload = (item: TableItem) => {
  if (!item.status) {
    return false;
  }
  const autoReloadStatus = props.autoReloadStatus;
  if (autoReloadStatus) {
    for (const status of autoReloadStatus) {
      if (status.toUpperCase() === String(item.status).toUpperCase()) {
        return true;
      }
    }
  }

  if (item.public_ip === '' && item.status.toUpperCase() === 'READY') {
    return true;
  }

  // AIMakerModelVersions: check modelDownload status
  if (
    item.modelDownload?.status &&
    item.modelDownload.status.toUpperCase() === 'RELEASING'
  ) {
    return true;
  }

  return false;
};

const isRowSelected = (item: TableItem) => {
  return item?.selected ?? false;
};

const onRowClick = (item: TableItem) => {
  if (getHasClickRowHandler(item)) {
    emit('onRowClick', item);
  }
};

const getHasClickRowHandler = (item: TableItem) => {
  if (
    typeof props.hasClickRowHandler === 'boolean' &&
    props.hasClickRowHandler
  ) {
    return true;
  } else if (
    typeof props.hasClickRowHandler === 'function' &&
    props.hasClickRowHandler(item)
  ) {
    return true;
  }
  return false;
};

const showMoreActionList = (item: TableItem) => {
  const actions = props.moreActionList.filter(action => {
    return action.visible ? action.visible(item) : true;
  });
  return actions.length > 0;
};

const handleCurrentItemsChanged = () => {
  const headerKeyArray = props.tableHeaders.map(header => header.key);

  pagination.value.totalItems = props.items.filter(item => {
    // only compare displayed columns
    const newItem = headerKeyArray.reduce((cur, key) => {
      return Object.assign(cur, { [key]: get(item, key) });
    }, {});

    return Object.values(newItem as Record<string, any>).some((val: any) =>
      val
        ?.toString()
        .toLocaleLowerCase()
        .includes(searchStr.value.toString().toLocaleLowerCase())
    );
  }).length;
};

// watch
watch(
  () => props.items,
  (newVal, oldVal) => {
    if (searchStr.value === '') {
      pagination.value.totalItems = props.items.length;
    }
    const hasNeededReloadItems = newVal.some((cntr: TableItem) => {
      return props.autoReloadStatus && isAutoReload(cntr);
    });
    if (hasNeededReloadItems) {
      if (!timer.value) {
        timer.value = window.setInterval(() => {
          fetchData(false);
        }, props.autoReloadInterval);
      }
    } else {
      if (timer.value) cancelAutoReload();
    }
  }
);

watch(
  () => i18n.global.locale,
  (newVal, oldVal) => {
    if (oldVal) init();
  }
);
watch(
  () => searchStr.value,
  newVal => {
    if (searchStr.value.length === 0) {
      pagination.value.totalItems = props.items.length;
    }
    emit('updateSearch', newVal);
  }
);

watch(
  () => pagination.value.totalItems,
  () => {
    if (!isFetchMoreAction.value) {
      pagination.value = { ...pagination.value, page: 1 };
    } else {
      isFetchMoreAction.value = false;
    }
  }
);
</script>

<style lang="scss" scoped>
@use '@/styles/common/v-table';
.main-action-col {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  display: flex;
}

.table-actions {
  height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .v-btn:hover {
    background-color: rgb(var(--v-theme-bg-highlight)) !important;
  }
}

.v-divider--vertical {
  margin-top: 0px;
  margin-bottom: 0px;
  height: 20px;
  min-height: none;
  vertical-align: middle;
  border-color: #000;
}

.v-text-field :deep(.v-field__prepend-inner) {
  margin-right: 20px;
}

.v-text-field :deep(.v-field__input) {
  padding-top: 8px;
}

.disabled {
  filter: opacity(0.3);
}

.search-wrapper {
  padding: 0px !important;
  background-color: rgb(var(--v-theme-bg-table-header-footer));
}

.custom-search-bar-btn {
  width: 10%;
}

.v-field.v-field--active .v-label.v-field-label--floating {
  visibility: hidden;
}

.v-select--chips .v-field__input,
.v-select--selection-slot .v-field__input {
  height: 40px;
}

.table-row {
  background-clip: padding-box;
  background-color: none !important;
  &.selected {
    background-color: rgb(var(--v-theme-bg-table-row-selected)) !important;
  }
}

.table-no-data {
  margin: auto auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (min-height: 700px) {
    height: calc(100vh - 475px);
    max-height: 470px;
    min-height: 180px;
    width: 500px;
  }
  @media (max-height: 699px) {
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  p {
    font-size: 16px !important;
    font-weight: bold;
    span {
      color: rgba(
        var(--v-theme-text-content),
        var(--v-text-content-opacity)
      ) !important;
      font-weight: normal !important;
    }
  }
}

.toggle-all-btn-disable {
  opacity: 0.6 !important;
}

.toggle-all-btn-hide {
  opacity: 0 !important;
}
</style>
