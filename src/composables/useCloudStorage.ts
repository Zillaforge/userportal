/* eslint-disable require-jsdoc */
import { useGlobal, useStorage, usePortalConfig } from '@/store';
import { computed, ref, type Ref, watch } from 'vue';

import { Upload } from '@aws-sdk/lib-storage';

import {
  checkS3Credential,
  createS3Bucket,
  createS3ObjectFolder,
  uploadS3Object,
  downloadS3Object,
  deleteS3Bucket,
  deleteS3Objects,
  fetchS3BucketList,
  fetchS3ObjectList,
  fetchS3UsageInfo,
  fetchS3BucketAcl,
  updateS3BucketAcl,
  makeApiCall,
} from '@/api';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  S3ServiceTypeName,
  type S3DeleteObject,
  type S3UploadParams,
  type S3DownloadParams,
} from '@/interfaces/CloudStorageInterface';
import router from '@/router';
import getTableHeaders from '@/utils/getTableHeaders';
import { uiShowProgress, uiHideProgress } from '@/utils/progressFunctions';

const { t } = i18n.global;

let globalStore: any;
let s3Store: any;
let portalConfigStore: any;
let currentPage: string = '';
const headers = ref<any[]>([]);
const s3BucketList: Ref<Record<string, any>[]> = ref([]);
const s3ObjectList: Ref<Record<string, any>[]> = ref([]);
const hasS3Credential: Ref<boolean> = ref(false);

const continuationToken: Ref<string> = ref('');
const isTruncated: Ref<boolean> = ref(false);

const s3UploadProgress: Ref<Record<string, Record<string, number>>> = ref({});
const s3UploadRequest: Ref<Record<string, Upload>> = ref({});
const usedBytes: Ref<number> = ref(0);
const allocatedBytes: Ref<number> = ref(-1);
const s3AbortUploadList: Ref<string[]> = ref([]);

const curContinuationToken = computed(() => {
  return continuationToken.value;
});

const isStorageQuotaFull = computed(() => {
  if (allocatedBytes.value === -1) {
    return false;
  } else if (usedBytes.value >= allocatedBytes.value) {
    return true;
  }
  return false;
});

export const execFetchS3Credential = async () => {
  hasS3Credential.value = await checkS3Credential();
};

const toBucketObjectListPage = async (item: any) => {
  return await router.push({
    name: PAGE_TYPES.S3_OBJECT_LIST,
    params: {
      bucketName: item.Name,
      pathMatch: item.Prefix || '',
    },
  });
};

const execCreateS3Bucket = async (
  bucketName: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  if (!hasS3Credential.value) {
    await execFetchS3Credential();
  }
  return makeApiCall({
    skipProgress: true,
    apiCallFn: createS3Bucket,
    payload: {
      hasS3Credential: hasS3Credential.value,
      bucketName,
    },
    successCallback: successCallback ?? (() => {}),
    errorCallback: errorCallback ?? (() => {}),
  });
};

const execDeleteS3Bucket = async (
  bucketName: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  if (!hasS3Credential.value) {
    await execFetchS3Credential();
  }
  return makeApiCall({
    skipProgress: true,
    apiCallFn: deleteS3Bucket,
    payload: {
      hasS3Credential: hasS3Credential.value,
      bucketName,
    },
    successCallback: successCallback ?? (() => {}),
    errorCallback: errorCallback ?? (() => {}),
  });
};

const execDeleteS3Objects = async (
  bucketName: string,
  objects: S3DeleteObject[],
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  if (!hasS3Credential.value) {
    await execFetchS3Credential();
  }
  return makeApiCall({
    skipProgress: true,
    apiCallFn: deleteS3Objects,
    payload: {
      hasS3Credential: hasS3Credential.value,
      bucketName,
      objects,
    },
    successCallback: successCallback ?? (() => {}),
    errorCallback: errorCallback ?? (() => {}),
  });
};

const execFetchS3BucketList = async () => {
  if (!hasS3Credential.value) {
    await execFetchS3Credential();
  }
  return makeApiCall({
    skipProgress: true,
    apiCallFn: fetchS3BucketList,
    payload: hasS3Credential.value,
    successCallback: (res: any) => {
      s3BucketList.value = res;
    },
    errorCallback: () => {
      s3BucketList.value = [];
    },
  });
};

const resetBucketObjectData = () => {
  continuationToken.value = '';
  isTruncated.value = false;
  s3ObjectList.value = [];
};

const execFetchS3ObjectList = async (
  bucketName: string,
  prefix: string,
  isFetchMoreAction: boolean
) => {
  if (!hasS3Credential.value) {
    await execFetchS3Credential();
  }
  return makeApiCall({
    skipProgress: true,
    apiCallFn: fetchS3ObjectList,
    payload: {
      hasS3Credential: hasS3Credential.value,
      bucketName,
      delimiter: '/',
      prefix,
      token: isFetchMoreAction ? curContinuationToken.value : '',
    },
    successCallback: (res: {
      response: any;
      token: string;
      isTruncated: boolean;
    }) => {
      s3ObjectList.value =
        isFetchMoreAction && curContinuationToken.value
          ? s3ObjectList.value.concat(res.response as Record<string, any>[])
          : res.response;
      continuationToken.value = res.token || '';
      isTruncated.value = res.isTruncated || false;
    },
    errorCallback: () => {
      s3ObjectList.value = [];
    },
  });
};

const execCreateS3Folder = async (
  bucketName: string,
  path: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  if (!hasS3Credential.value) {
    await execFetchS3Credential();
  }
  return makeApiCall({
    skipProgress: true,
    apiCallFn: createS3ObjectFolder,
    payload: {
      hasS3Credential: hasS3Credential.value,
      bucketName,
      path,
    },
    successCallback: successCallback ?? (() => {}),
    errorCallback: errorCallback ?? (() => {}),
  });
};

const execBatchUploadS3Objects = async (
  batchUploadParamsGroup: S3UploadParams[][],
  path: string
) => {
  const response: any[] = [];
  for (const uploadParams of batchUploadParamsGroup) {
    const abortFiles: S3UploadParams[] = [];
    const uploadFiles: S3UploadParams[] = [];

    uploadParams.forEach(params => {
      const key = path ? params.Key?.split(path)?.[1] : params.Key;
      const findIndex = key.indexOf('/');
      let isAborted = false;
      if (findIndex !== -1) {
        const folderName = key.substring(0, findIndex + 1);
        isAborted = s3AbortUploadList.value.includes(`${path}${folderName}`);
      } else {
        isAborted = s3AbortUploadList.value.includes(params.Key);
      }
      if (isAborted) {
        abortFiles.push(params);
      } else {
        uploadFiles.push(params);
      }
    });

    abortFiles.forEach(file => {
      s3UploadProgress.value[file.Key] = {
        percentage: -1,
        total: file.Body.size,
      };
    });

    await Promise.allSettled(
      uploadFiles.map(
        async params =>
          await uploadS3Object({
            hasS3Credential: hasS3Credential.value,
            uploadParams: params,
            updateUploadProgressFunc: value => {
              s3UploadProgress.value[params.Key] = {
                percentage: value,
                total: params.Body.size,
              };
            },
            updateUploadRequestFunc: request => {
              s3UploadRequest.value[params.Key] = request;
            },
          }).catch(() => {
            s3AbortUploadList.value.push(params.Key);
          })
      )
    ).then(res => {
      response.push(...res);
    });
  }
  return response;
};

const execDownloadS3Object = async (
  params: S3DownloadParams,
  successCallback?: (...args: any[]) => any
) => {
  if (!hasS3Credential.value) {
    await execFetchS3Credential();
  }
  return makeApiCall({
    skipProgress: true,
    apiCallFn: downloadS3Object,
    payload: {
      hasS3Credential: hasS3Credential.value,
      params,
    },
    successCallback: successCallback ?? (() => {}),
  });
};

const execFetchS3UsageInfo = async (
  showProgress: boolean = false,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  if (showProgress) {
    uiShowProgress();
  }
  await makeApiCall({
    skipProgress: true,
    skipErrorDialog: !showProgress,
    apiCallFn: fetchS3UsageInfo,
    successCallback: (usage: any) => {
      if (showProgress) {
        uiHideProgress();
      }
      usedBytes.value = usage.sizeBytes;
      allocatedBytes.value = usage.hardLimitBytes;
      successCallback?.();
    },
    errorCallback: () => {
      if (showProgress) {
        uiHideProgress();
      }
      errorCallback?.();
    },
  });
};

const execFetchS3BucketAcl = async (
  bucketName: string,
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  if (!hasS3Credential.value) {
    await execFetchS3Credential();
  }
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchS3BucketAcl,
    payload: {
      hasS3Credential: hasS3Credential.value,
      bucketName,
    },
    successCallback: (res: any) => {
      if (!res.hasPermission) {
        errorCallback?.();
      }
      const grants = res.Grants ?? [];
      const grantee: { ID: string }[] = grants.map(
        (item: any) => item.Grantee ?? {}
      );
      const acl = Array.from(new Set(grantee.map((el: any) => el.ID)));
      successCallback?.(acl.filter(id => !!id));
    },
    errorCallback: errorCallback ?? (() => {}),
  });
};

const execUpdateS3BucketAcl = async (
  bucketName: string,
  acl: string[],
  successCallback?: (...args: any[]) => any,
  errorCallback?: (...args: any[]) => any
) => {
  if (!hasS3Credential.value) {
    await execFetchS3Credential();
  }

  interface AccessControlPolicyGrants {
    Grantee: {
      Type: string;
      ID?: string;
      URI?: string;
    };
    Permission: string;
  }

  let grants: AccessControlPolicyGrants[] = [];

  if (acl.length > 0) {
    acl.forEach(id => {
      grants.push({
        Grantee: {
          Type: 'CanonicalUser',
          ID: id,
        },
        Permission: 'WRITE',
      });
      grants.push({
        Grantee: {
          Type: 'CanonicalUser',
          ID: id,
        },
        Permission: 'READ',
      });
    });
  } else {
    grants = [];
  }

  await makeApiCall({
    skipProgress: true,
    apiCallFn: updateS3BucketAcl,
    payload: {
      hasS3Credential: hasS3Credential.value,
      bucketName,
      accessControlPolicy: {
        Grants: [...grants],
      },
    },
    successCallback: (res: any) => {
      const grants = res.Grants ?? [];
      const grantee: { ID: string }[] = grants.map(
        (item: any) => item.Grantee ?? {}
      );
      const acl = Array.from(new Set(grantee.map((el: any) => el.ID)));
      successCallback?.(acl.filter(id => !!id));
    },
    errorCallback: errorCallback ?? (() => {}),
  });
};

export const showStorageFullDialog = () => {
  if (!globalStore) {
    globalStore = useGlobal();
  }
  globalStore.uiShowDialog({
    title: t('s3.usage.full'),
    message: t('s3.usage.full.message'),
  });
};

const resetValue = () => {
  if (!s3Store) {
    s3Store = useStorage();
  }
  s3Store.setS3Credential({ accessKey: '', secretKey: '' });
  hasS3Credential.value = false;
  s3BucketList.value = [];
  s3ObjectList.value = [];
};

watch(
  () => i18n.global.locale,
  () => {
    headers.value = getTableHeaders(currentPage);
  }
);

export default function (pageType?: string) {
  s3BucketList.value = [];
  s3ObjectList.value = [];

  currentPage = pageType ?? currentPage;
  headers.value = getTableHeaders(currentPage);

  if (!s3Store) {
    s3Store = useStorage();
  }
  if (!portalConfigStore) {
    portalConfigStore = usePortalConfig();
  }
  let endpoint = '';
  let serviceType = '';
  switch (currentPage) {
    case PAGE_TYPES.S3_BUCKET_LIST:
    case PAGE_TYPES.S3_OBJECT_LIST:
    case PAGE_TYPES.HPC_REMOTE_DATA_CREATE:
    case PAGE_TYPES.HPC_REMOTE_TASK_CREATE:
    case PAGE_TYPES.HPC_REMOTE_TASK_LIST:
    case PAGE_TYPES.HPC_REMOTE_TASK_DETAIL:
      endpoint = portalConfigStore.portalConfig.DATA_STORAGE;
      serviceType = S3ServiceTypeName.STORAGE;
      break;
    case PAGE_TYPES.DATA_EXCHANGE_LIST:
    case PAGE_TYPES.DATA_EXCHANGE_CONTENT_LIST:
      endpoint = portalConfigStore.portalConfig.DATA_EXCHANGE;
      serviceType = S3ServiceTypeName.EXCHANGE;
      break;
    case PAGE_TYPES.DATA_RELEASE_LIST:
    case PAGE_TYPES.DATA_RELEASE_CONTENT_LIST:
      endpoint = portalConfigStore.portalConfig.DATA_RELEASE;
      serviceType = S3ServiceTypeName.RELEASE;
      break;
    default:
      break;
  }
  s3Store.setS3Endpoint(endpoint);
  s3Store.setCurrentServiceType(serviceType);

  return {
    headers,
    isTruncated,
    isStorageQuotaFull,
    usedBytes,
    allocatedBytes,
    s3BucketList,
    s3ObjectList,
    s3UploadProgress,
    s3UploadRequest,
    s3AbortUploadList,

    toBucketObjectListPage,
    showStorageFullDialog,

    execFetchS3Credential,
    execCreateS3Bucket,
    execCreateS3Folder,
    execBatchUploadS3Objects,
    execDownloadS3Object,
    execDeleteS3Bucket,
    execDeleteS3Objects,
    execFetchS3BucketList,
    execFetchS3ObjectList,
    execFetchS3UsageInfo,
    execFetchS3BucketAcl,
    execUpdateS3BucketAcl,

    resetBucketObjectData,
    resetValue,
  };
}
