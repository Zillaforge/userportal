import { useGlobal } from '@/store';

import i18n from '../i18n';

const { t } = i18n.global;

export interface ApiCallParams {
  skipProgress?: boolean;
  skipErrorDialog?: boolean;
  progressMessage?: string;

  apiCallFn: (...args: any[]) => any;
  apiCallFnName?: string;
  payload?: unknown;
  successCallback?: (...args: any[]) => any;
  errorResHandlingFn?: (...args: any[]) => any;
  errorCallback?: (...args: any[]) => any;
}

export interface MultipleApiCallParams {
  skipProgress?: boolean;
  skipErrorDialog?: boolean;
  progressMessage?: string;

  apiCallFn: (...args: any[]) => any;
  apiCallFnName: string;
  payloads: unknown[];
  successCallback?: (...args: any[]) => any;
  errorResHandlingFn?: (...args: any[]) => any;
  errorCallback?: (...args: any[]) => any;
}

export const makeApiCall = (params: ApiCallParams) => {
  const {
    skipProgress = false, // default false
    skipErrorDialog = false, // default false
    progressMessage = '', // default empty string

    apiCallFn,
    apiCallFnName,
    payload,
    successCallback,
    errorResHandlingFn,
    errorCallback,
  } = params;

  const { uiShowProgressDlg, uiHideProgressDlg, uiResponseErrorDialog } =
    useGlobal();

  if (!skipProgress) {
    uiShowProgressDlg({
      message: progressMessage,
    });
  }
  return apiCallFn(payload)
    .then(async (res: unknown) => {
      return successCallback?.(res) || res;
    })
    .catch(async (originalErrorRes: any) => {
      const errorResponse = errorResHandlingFn
        ? errorResHandlingFn(originalErrorRes)
        : originalErrorRes;

      console.error(originalErrorRes, errorResponse);

      if (!skipErrorDialog) {
        uiResponseErrorDialog({
          title: t('basic.fail.action'),
          message: t('basic.error.message'),
          apiName: apiCallFnName ?? apiCallFn.name,
          errorResponse: originalErrorRes,
          hideCancelBtn: true,
          callback: () => errorCallback?.(errorResponse),
        });
        return errorResponse;
      }
      return errorCallback?.(errorResponse) || errorResponse;
    })
    .finally(() => {
      if (!skipProgress) uiHideProgressDlg();
    });
};

export const makeMultipleApiCalls = async (params: MultipleApiCallParams) => {
  const {
    skipProgress = false, // default false
    skipErrorDialog = false, // default false
    progressMessage = '', // default empty string

    apiCallFn,
    apiCallFnName,
    payloads,
    successCallback,
    errorResHandlingFn,
    errorCallback,
  } = params;

  const { uiShowProgressDlg, uiHideProgressDlg, uiResponseErrorDialog } =
    useGlobal();

  if (!skipProgress) {
    uiShowProgressDlg({
      message: progressMessage,
    });
  }
  const apiCallPromises = payloads.map(payload => apiCallFn(payload));
  return await Promise.allSettled(apiCallPromises)
    .then(async (resArray: { status: string; reason?: string }[]) => {
      console.log('makeMultipleApiCalls res', resArray);
      const resArrayWithIndex = resArray.map((res, index) => ({
        ...res,
        index,
      }));
      if (
        resArrayWithIndex.filter(res => res.status === 'fulfilled').length ===
        payloads.length
      ) {
        // all api calls success
        return successCallback?.(resArrayWithIndex) || resArrayWithIndex;
      } else {
        const rejectedResults = resArrayWithIndex.filter(
          res => res.status === 'rejected'
        );
        const errorResponse = errorResHandlingFn
          ? errorResHandlingFn(rejectedResults)
          : rejectedResults;
        // console.error(rejectedResults, errorResponse);

        if (!skipErrorDialog) {
          const errMsgs = rejectedResults.map(
            (rejectResult: { reason?: string }) => rejectResult.reason ?? ''
          );
          uiResponseErrorDialog({
            title: t('basic.fail.action'),
            message: t('basic.error.message'),
            apiName: apiCallFnName,
            errorResponse: {
              response: { data: { error: errMsgs.join(', ') } },
            },
            hideCancelBtn: true,
            callback: () => errorCallback?.(errorResponse),
          });
          return errorResponse;
        }
        return errorCallback?.(errorResponse) || errorResponse;
      }
    })
    .finally(() => {
      if (!skipProgress) uiHideProgressDlg();
    });
};
