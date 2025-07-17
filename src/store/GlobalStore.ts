import { defineStore } from 'pinia';
import { ref, type Ref, computed } from 'vue';

import get from 'lodash/get';

import i18n from '../i18n';

import type {
  GlobalDlgParams,
  ProgressDlgParams,
  SnackbarParams,
  // ResourceInfo,
} from '@/interfaces/LayoutItemInterface';

import {
  RESOURCE_REGION_TYPE,
  DEFAULT_RESOURCE_REGION,
} from '@/constants/Constants';
import {
  type TableItem,
  type ResourceInfo,
} from '@/interfaces/InfraDataTableInterface';

const { t } = i18n.global;
const enableSwitchRegion = import.meta.env.VITE_APP_SWITCH_REGION === 'true';

const useGlobal = defineStore('global', () => {
  // State
  const loading: Ref<boolean> = ref(false);
  const progress: Ref<number | null> = ref(null);
  const message: Ref<string> = ref('');

  const localStorageValue = localStorage.getItem('resourceRegion') ?? '';

  const currentRegion = ref<string>(
    enableSwitchRegion &&
      localStorageValue &&
      Object.values(RESOURCE_REGION_TYPE).includes(localStorageValue)
      ? localStorageValue
      : DEFAULT_RESOURCE_REGION
  );

  const resourceRegion = computed(() => [
    {
      value: RESOURCE_REGION_TYPE.TRUSTED_PLATFORM,
      displayName: t('appBar.trustyPlatformResource'),
    },
    {
      value: RESOURCE_REGION_TYPE.PILOT,
      displayName: t('appBar.pilotResource'),
    },
  ]);

  const snackbarParams: Ref<SnackbarParams> = ref({
    show: false,
    content: '',
    timeout: 1500,
  });
  const globalDlg: Ref<GlobalDlgParams> = ref({
    title: '',
    message: '',
  });
  const progressDlg: Ref<ProgressDlgParams> = ref({});
  const breadcrumbsParams: Ref<Record<string, any>> = ref({});

  // Getters
  const getBreadcrumbsParams = computed(() => breadcrumbsParams.value);
  const getProgressDlgState = computed(() => progressDlg.value);
  const getCurrentRegion = computed(() => currentRegion.value);
  const getIsPilotRegion = computed(
    () => currentRegion.value === RESOURCE_REGION_TYPE.PILOT
  );

  // Actions
  const updateResourceRegion = (value: string) => {
    currentRegion.value =
      resourceRegion.value.find(el => el.value === value)?.value ??
      RESOURCE_REGION_TYPE.TRUSTED_PLATFORM;
    localStorage.setItem('resourceRegion', currentRegion.value);
  };
  const triggerSnackbar = (params: SnackbarParams) => {
    snackbarParams.value = {
      show: true,
      content: params.content,
      timeout: params.timeout ?? 1500,
    };
  };
  const triggerSnackbarCopied = () => {
    snackbarParams.value = {
      show: true,
      content: t('basic.copied'),
      timeout: 1500,
    };
  };
  const uiShowDialog = (params: GlobalDlgParams) => {
    globalDlg.value = {
      ...params,
      show: true,
      // width: params.width ?? 0,
      // apiName: params.apiName ?? '',
      // errorCode: params.errorCode ?? '',
      // resourceInfo: params.resourceInfo ?? [],
      // callback: params.callback ?? (() => {}),
      // hideCancelBtn: params.hideCancelBtn ?? false,
    };
  };
  const uiHideDialog = () => {
    globalDlg.value.show = false;
  };
  const showConfirmDialog = ({
    item,
    title,
    action = () => {
      console.warn('TODO: This Action Should Be Implemented Later!');
    },
    showWarningIcon = false,
    message,
    resourceInfo,
    itemIndex,
  }: {
    item: TableItem;
    title: string;
    action: (item: TableItem, itemIndex: number) => void;
    showWarningIcon?: boolean;
    message?: string;
    resourceInfo?: ResourceInfo[];
    itemIndex?: number;
  }) => {
    const handledResourceInfo =
      Array.isArray(resourceInfo) && resourceInfo.length > 0
        ? resourceInfo.map(info => ({
            title: `${info.title}:`,
            value: get(item, info.keyOfvalue),
          }))
        : [
            item.name
              ? {
                  title: t('label.name') + ':',
                  value: get(item, 'name'),
                }
              : {
                  title: 'id:',
                  value: get(item, 'id'),
                },
          ];

    uiShowDialog({
      title,
      showWarningIcon,
      message,
      resourceInfo: handledResourceInfo,
      callback: () => {
        action(item, itemIndex ?? 0);
      },
    });
  };
  const openDeleteDialog = ({
    item,
    deleteAction = () => {
      console.warn(
        'TODO: This DELETE Action Should Be Implemented Later!',
        item
      );
      setTimeout(
        () =>
          uiShowDialog({
            title: 'This Function Is Not Implemented Yet',
            message: 'This DELETE Action Should Be Implemented Later!',
            showWarningIcon: true,
            hideCancelBtn: true,
          }),
        200
      );
    },
    resourceInfo,
    itemIndex,
    message,
    resourceType,
  }: {
    item: TableItem;
    deleteAction?: (item: TableItem, itemIndex: number) => void;
    resourceInfo?: ResourceInfo[];
    itemIndex?: number;
    message?: string;
    resourceType?: string;
  }) => {
    const title = t('dialog.delete.title', {
      resource: resourceType ?? t('basic.resource').toLowerCase(),
    });
    showConfirmDialog({
      item,
      title,
      action: deleteAction,
      showWarningIcon: true,
      message,
      resourceInfo,
      itemIndex,
    });
  };

  const openStartDialog = ({
    item,
    startAction = () => {
      console.warn(
        'TODO: This START Action Should Be Implemented Later!',
        item
      );
      setTimeout(
        () =>
          uiShowDialog({
            title: 'This Function Is Not Implemented Yet',
            message: 'This START Action Should Be Implemented Later!',
            showWarningIcon: true,
            hideCancelBtn: true,
          }),
        200
      );
    },
    resourceInfo,
    itemIndex,
  }: {
    item: TableItem;
    startAction?: (item: TableItem, itemIndex: number) => void;
    resourceInfo?: ResourceInfo[];
    itemIndex?: number;
  }) => {
    const title = t('dialog.start.title', {
      resource: t('basic.resource').toLowerCase(),
    });
    showConfirmDialog({
      item,
      title,
      action: startAction,
      resourceInfo,
      itemIndex,
    });
  };

  const openStopDialog = ({
    item,
    stopAction = () => {
      console.warn('TODO: This STOP Action Should Be Implemented Later!', item);
      setTimeout(
        () =>
          uiShowDialog({
            title: 'This Function Is Not Implemented Yet',
            message: 'This STOP Action Should Be Implemented Later!',
            showWarningIcon: true,
            hideCancelBtn: true,
          }),
        200
      );
    },
    resourceInfo,
    itemIndex,
  }: {
    item: TableItem;
    stopAction?: (item: TableItem, itemIndex: number) => void;
    resourceInfo?: ResourceInfo[];
    itemIndex?: number;
  }) => {
    const title = t('dialog.stop.title', {
      resource: t('basic.resource').toLowerCase(),
    });

    showConfirmDialog({
      item,
      title,
      action: stopAction,
      resourceInfo,
      itemIndex,
    });
  };

  const uiResponseErrorDialog = (params: GlobalDlgParams) => {
    let errMsg = '';
    let errStat = '';
    let errStatText = '';
    const errorResponse = params.errorResponse;

    if (errorResponse?.response) {
      const { data } = errorResponse.response;
      if (data) {
        if (data.error) {
          errMsg = data.error;
        } else if (data.Error) {
          errMsg = data.Error;
        } else if (data.detail) {
          errMsg = data.detail;
        } else if (data.message) {
          errMsg = data.message;
        } else if (data.data) {
          errMsg = data.data.message;
        } else if (data.Message) {
          errMsg = data.Message;
        } else if (data.errorMessage) {
          errMsg = data.errorMessage;
        }
      }
      errStat = errorResponse.response.status || '';
      errStatText = errorResponse.response.statusText || '';
    } else if (errorResponse?.data) {
      errMsg =
        errorResponse.data.detail ||
        errorResponse.data.message ||
        errorResponse.data.Message ||
        errorResponse.data.error ||
        errorResponse.data.errorMessage;
      errStat =
        errorResponse.data.errorCode ||
        errorResponse.data.status ||
        errorResponse.status;
      errStatText = errorResponse.statusText;
    } else if (errorResponse?.message) {
      errMsg = errorResponse.message;
      errStat = '';
      errStatText = '';
    }
    const apiMessage = params?.apiName
      ? `${t('basic.error.function')}: ${params.apiName}\n`
      : '';
    const message = errorResponse?.hideErrorCode
      ? `${t('basic.error.message')}: ${errMsg}`
      : `${import.meta.env.PROD ? '' : apiMessage}` +
        `${t('basic.error.code')}: ${errStat} (${errStatText})\n` +
        `${t('basic.error.message')}: ${errMsg}`;

    globalDlg.value = {
      ...params,
      show: true,
      title: t('basic.fail.action', { action: t('basic.apiCall') }),
      message,
      apiName: params.apiName ?? '',
      errorCode: params.errorCode ?? '',
    };
  };

  const uiShowProgressDlg = (Params: ProgressDlgParams = {}) => {
    progressDlg.value = {
      show: true,
      message: Params.message ?? '',
    };
  };
  const uiHideProgressDlg = () => {
    progressDlg.value = {
      show: false,
      message: '',
    };
  };
  const setLoading = (display: boolean): void => {
    loading.value = display;
    if (!display) {
      // Reset Progress value
      progress.value = null;
    }
  };
  const setProgress = (v: number | null = null): void => {
    // update progress value
    progress.value = v;
    // display loading overlay
    loading.value = true;
  };

  const setMessage = (msg: string = ''): void => {
    // put snackbar text
    message.value = msg;
  };
  const setBreadcrumbsParams = (params: any): void => {
    breadcrumbsParams.value = params;
  };

  return {
    loading,
    progress,
    message,
    snackbarParams,
    globalDlg,
    progressDlg,
    breadcrumbsParams,

    resourceRegion,

    getBreadcrumbsParams,
    getProgressDlgState,
    getCurrentRegion,
    getIsPilotRegion,

    updateResourceRegion,
    triggerSnackbar,
    triggerSnackbarCopied,
    uiShowDialog,
    uiHideDialog,
    showConfirmDialog,
    openDeleteDialog,
    openStartDialog,
    openStopDialog,
    uiResponseErrorDialog,
    uiShowProgressDlg,
    uiHideProgressDlg,
    setLoading,
    setProgress,
    setMessage,
    setBreadcrumbsParams,
  };
});

export default useGlobal;
