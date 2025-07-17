import { useStorage, useUser, useProject } from '@/store';

import * as AWS from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';

import apiService from './apiServiceReq';

import type {
  S3BucketOpParams,
  S3ObjectParams,
  S3CredentialInfo,
  S3ObjectListOutput,
  S3CreateFolderParams,
  S3UploadParams,
  S3UploadObjectParams,
  S3DownloadObjectParams,
  S3DeleteObject,
  S3DeleteObjectParams,
  AccessControlPolicy,
  S3ServiceTypeName,
} from '@/interfaces/CloudStorageInterface';
import type { AxiosResponse } from 'axios';

import i18n from '@/i18n';
import PortalConfig from '@/store/PortalConfig';
import { formatBytes, formatDate, getS3Services } from '@/utils/utils';

const { t } = i18n.global;
let portalConfigStore: any;
let userStore: any;
let projectStore: any;
let s3Store: any;

export interface S3BucketPayload {
  projectId: string;
  userId: string;
}

const missingCredentialsErrorResponse = {
  data: { message: 'Missing credentials' },
  hideErrorCode: true,
};

const getS3Object = () => {
  if (!portalConfigStore) {
    portalConfigStore = PortalConfig();
  }
  if (!s3Store) {
    s3Store = useStorage();
  }
  return new AWS.S3({
    region: 'default',
    endpoint: s3Store.getS3Endpoint,
    credentials: {
      accessKeyId: s3Store.getS3AccessKey,
      secretAccessKey: s3Store.getS3SecretKey,
    },
    forcePathStyle: true,
    // For v3 S3 Client, default is v4 signatures
    // Also can confirm it by request header: Authorization (AWS4-HMAC-SHA256).
    // So comment this to resolve TypeScript warning.
    // signatureVersion: 'v4',
  });
};

const formatErrRes = (err: any) => {
  return {
    data: {
      message: err.message || '-',
    },
    status: err.statusCode,
    statusText: err.code,
  };
};

const convertToDeleteObjectFormat = (array: any) => {
  return array.map((obj: any) => {
    return {
      Key: obj.Key,
    };
  });
};

const handleS3Delete = async (
  s3: AWS.S3,
  folders: S3DeleteObject[],
  payload: S3DeleteObjectParams
) => {
  const deleteFolderPromise = [];
  for (const folder of folders) {
    let isTruncated = false;
    let token = '';
    do {
      const getFolderList = await fetchS3ObjectList({
        hasS3Credential: true,
        bucketName: payload.bucketName,
        prefix: folder.Key,
        token,
      });
      const folderContent = getFolderList.response || [];
      const deleteFolderContent = convertToDeleteObjectFormat(folderContent);
      deleteFolderContent.push({
        Key: folder.Key,
      });
      const deleteFolderParams = {
        Bucket: payload.bucketName,
        Delete: {
          Objects: deleteFolderContent,
        },
      };
      const promise = new Promise((resolve, reject) => {
        s3.deleteObjects(deleteFolderParams, (err: any, data: any) => {
          if (err) {
            console.log('Error', err);
            reject(formatErrRes(err));
          } else {
            data.Size = formatBytes(Number(data.ContentLength));
            resolve(data);
          }
        });
      });
      deleteFolderPromise.push(promise);
      isTruncated = getFolderList.isTruncated ?? false;
      token = getFolderList.token ?? '';
    } while (isTruncated && !!token);
  }

  return deleteFolderPromise;
};

const API_VERSION = '/iam/api/v1';
const fetchS3Credential = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/credential/project/${projectId}/`)
    .then((res: AxiosResponse) => res.data);
};

export const checkS3Credential = async () => {
  if (!s3Store) {
    s3Store = useStorage();
  }
  if (!(s3Store.getS3AccessKey && s3Store.getS3SecretKey)) {
    let hasS3Credential = true;
    await fetchS3Credential()
      .then((res: S3CredentialInfo) => {
        s3Store.setS3Credential(res);
      })
      .catch(() => {
        s3Store.setS3Credential({ accessKey: '', secretKey: '' });
        hasS3Credential = false;
      });
    return hasS3Credential;
  } else {
    return true;
  }
};

export const updateS3Credential = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  if (!s3Store) {
    s3Store = useStorage();
  }
  const projectId = projectStore.getCurrentProject.id;
  await apiService
    .put(`${API_VERSION}/credential/project/${projectId}/`)
    .then((res: AxiosResponse) => {
      s3Store.setS3Credential({
        accessKey: res.data.accessKey,
        secretKey: res.data.secretKey,
      });
    })
    .catch(() => {
      s3Store.setS3Credential({ accessKey: '', secretKey: '' });
    });
};

const processS3ObjectListResponse = (
  commonPrefixes: AWS.CommonPrefix[],
  payload: S3ObjectParams,
  content: AWS._Object[]
) => {
  let res: any[] = [];
  const newCommonPrefixes: any[] = commonPrefixes.map(el => ({
    ...el,
    Key: el.Prefix,
  }));
  res = content.concat(newCommonPrefixes);

  if (payload.prefix) {
    res = res.filter(el => el.Key !== payload.prefix);
  }

  return res.map(el => {
    el.name = payload.prefix ? el.Key.replace(payload.prefix, '') : el.Key;
    el.rawSize = typeof el.Size !== 'undefined' ? Number(el.Size) : -1;
    el.size =
      typeof el.Size !== 'undefined' ? formatBytes(Number(el.Size)) : '-';
    el.lastModified =
      typeof el.LastModified !== 'undefined'
        ? formatDate(String(el.LastModified), false)
        : '-';
    return el;
  });
};

export const fetchS3BucketList = async (hasS3Credential: boolean) => {
  if (!hasS3Credential) {
    return await Promise.reject(missingCredentialsErrorResponse);
  }
  const s3 = getS3Object();
  return await new Promise((resolve, reject) => {
    s3.listBuckets({}, (err, data) => {
      if (err) {
        reject(formatErrRes(err));
      } else {
        const res = data?.Buckets ?? [];
        resolve(res);
      }
    });
  });
};

export const fetchS3ObjectList = async (payload: S3ObjectParams) => {
  const RESPONSE_STATUS = {
    SUCCESS: 0,
    ERROR: 1,
  };
  const s3 = getS3Object();
  const params: AWS.ListObjectsV2CommandInput = {
    Bucket: payload.bucketName,
    FetchOwner: true,
    Delimiter: payload.delimiter ? payload.delimiter : '',
    Prefix: payload.prefix ?? '',
    ContinuationToken: payload.token ?? '',
    MaxKeys: 100,
  };
  if (payload.token) {
    params.ContinuationToken = payload.token;
  }

  const { status, response, isTruncated, token }: S3ObjectListOutput =
    await new Promise((resolve, reject) => {
      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          resolve({
            status: RESPONSE_STATUS.ERROR,
            response: formatErrRes(err),
          });
          return;
        }
        const content = data?.Contents ?? []; // file
        if (payload.prefix && (!content || content.length === 0)) {
          resolve({
            status: RESPONSE_STATUS.ERROR,
            response: {
              data: {
                message: t('Error.NotFound'),
              },
              hideErrorCode: true,
            },
          });
        }
        const commonPrefixes = data?.CommonPrefixes ?? []; // folder
        const res = processS3ObjectListResponse(
          commonPrefixes,
          payload,
          content
        );
        resolve({
          status: RESPONSE_STATUS.SUCCESS,
          response: res,
          isTruncated: data?.IsTruncated,
          token: data?.NextContinuationToken,
        });
      });
    });

  if (status === RESPONSE_STATUS.ERROR) {
    return await Promise.reject(response);
  } else {
    return await Promise.resolve({
      response,
      isTruncated,
      token,
    });
  }
};

const checkS3BucketName = async (params: { Bucket: string }) => {
  const s3 = getS3Object();
  return await new Promise(resolve => {
    s3.headBucket(params, (err: any) => {
      if (err) {
        if (err.$metadata.httpStatusCode === 404) {
          resolve('');
        } else {
          resolve(formatErrRes(err));
        }
      } else {
        resolve({
          data: {
            message: t('s3.error.nameDuplicated.type', {
              type: t('s3.bucket'),
            }),
          },
          hideErrorCode: true,
        });
      }
    });
  });
};

export const createS3Bucket = async (payload: S3BucketOpParams) => {
  if (!payload.hasS3Credential) {
    return await Promise.reject(missingCredentialsErrorResponse);
  }
  const s3 = getS3Object();
  const params = {
    Bucket: payload.bucketName,
  };
  const checkNameExist = await checkS3BucketName(params);
  if (checkNameExist) {
    return await Promise.reject(checkNameExist);
  }

  return await new Promise((resolve, reject) => {
    s3.createBucket(params, (err: any, data: unknown) => {
      if (err) {
        reject(formatErrRes(err));
      } else {
        resolve(data);
      }
    });
  });
};

export const deleteS3Bucket = async (payload: S3BucketOpParams) => {
  if (!payload.hasS3Credential) {
    return await Promise.reject(missingCredentialsErrorResponse);
  }
  const s3 = getS3Object();
  let isTruncated = false;
  let token = '';
  const deletePromise = [];
  do {
    const getObjects = await fetchS3ObjectList({
      hasS3Credential: payload.hasS3Credential,
      bucketName: payload.bucketName,
    });
    const objects = getObjects.response || [];
    const deleteObjects = convertToDeleteObjectFormat(objects);
    const deleteObjectsParams = {
      Bucket: payload.bucketName,
      Delete: {
        Objects: deleteObjects,
      },
    };
    const promise = new Promise((resolve, reject) => {
      s3.deleteObjects(deleteObjectsParams, (err: any, data: any) => {
        if (err) {
          reject(formatErrRes(err));
        } else {
          data.Size = formatBytes(Number(data.ContentLength));
          resolve(data);
        }
      });
    });
    deletePromise.push(promise);
    isTruncated = getObjects.isTruncated ?? false;
    token = getObjects.token ?? '';
  } while (isTruncated && !!token);

  await Promise.all(deletePromise);

  return await new Promise((resolve, reject) => {
    s3.deleteBucket({ Bucket: payload.bucketName }, (err, data) => {
      if (err) {
        reject(formatErrRes(err));
      } else {
        resolve(data);
      }
    });
  });
};

export const deleteS3Objects = async (payload: S3DeleteObjectParams) => {
  if (!payload.hasS3Credential) {
    return await Promise.reject(missingCredentialsErrorResponse);
  }
  const isValid =
    payload.bucketName &&
    Array.isArray(payload.objects) &&
    payload.objects.every(obj => obj.Key);

  if (!isValid) {
    const formatError = {
      data: {
        message: t('Basic.Error.Format'),
      },
      hideErrorCode: true,
    };
    return await Promise.reject(formatError);
  }
  const s3 = getS3Object();
  const allDeleteObjects = [...payload.objects];
  const folders = allDeleteObjects.filter(obj => obj.isFolder);
  const files = allDeleteObjects.filter(obj => !obj.isFolder);

  const deleteFiles = convertToDeleteObjectFormat(files);

  const deleteFilesParams = {
    Bucket: payload.bucketName,
    Delete: {
      Objects: deleteFiles,
    },
  };

  const deleteFilesPromise = new Promise((resolve, reject) => {
    s3.deleteObjects(deleteFilesParams, (err: any, data: any) => {
      if (err) {
        console.log('Error', err);
        reject(formatErrRes(err));
      } else {
        data.Size = formatBytes(Number(data.ContentLength));
        resolve(data);
      }
    });
  });

  const deleteFolderPromise = await handleS3Delete(s3, folders, payload);
  return await Promise.all([deleteFilesPromise, ...deleteFolderPromise]);
};

const checkS3ObjectFolderName = async (params: {
  Bucket: string;
  Key: string;
}) => {
  const s3 = getS3Object();
  return await new Promise(resolve => {
    s3.headObject(params, (err: any) => {
      if (err) {
        if (err.$metadata.httpStatusCode === 404) {
          resolve('');
        } else {
          resolve(err);
        }
      } else {
        resolve({
          data: {
            message: t('s3.error.nameDuplicated.type', {
              type: t('basic.folder'),
            }),
          },
          hideErrorCode: true,
        });
      }
    });
  });
};

export const createS3ObjectFolder = async (payload: S3CreateFolderParams) => {
  if (!payload.hasS3Credential) {
    return await Promise.reject(missingCredentialsErrorResponse);
  }

  const s3 = getS3Object();
  const params = {
    Bucket: payload.bucketName,
    Key: payload.path,
  };
  const checkNameExist = await checkS3ObjectFolderName(params);

  if (checkNameExist) {
    return await Promise.reject(checkNameExist);
  }
  const uploadParams: S3UploadParams = {
    ...params,
    Body: '',
  };

  const s3Upload = new Upload({
    client: s3,
    params: uploadParams,
  });

  try {
    await s3Upload.done();
    return await Promise.resolve('');
  } catch (e) {
    return await Promise.reject(e);
  }
};

export const uploadS3Object = async (payload: S3UploadObjectParams) => {
  if (!payload.hasS3Credential) {
    return await Promise.reject(missingCredentialsErrorResponse);
  }
  const s3 = getS3Object();
  const params = payload.uploadParams;
  const request = new Upload({
    client: s3,
    params,
    queueSize: 5,
  });

  if (payload.updateUploadProgressFunc) {
    payload.updateUploadProgressFunc(0);
  }

  request.on('httpUploadProgress', progress => {
    const loaded = progress.loaded ?? 0;
    const total = progress.total ?? 0;
    if (payload.updateUploadProgressFunc) {
      payload.updateUploadProgressFunc(
        total === 0 ? 100 : (loaded / total) * 100
      );
    }
  });

  if (payload.updateUploadRequestFunc) {
    payload.updateUploadRequestFunc(request);
  }

  return await new Promise((resolve, reject) => {
    request
      .done()
      .then(data => {
        if (payload.updateUploadProgressFunc) {
          payload.updateUploadProgressFunc(100);
        }
        resolve(data);
      })
      .catch(err => {
        if (payload.updateUploadProgressFunc) {
          payload.updateUploadProgressFunc(-1);
        }
        reject(err);
      });
  });
};

export const downloadS3Object = async (payload: S3DownloadObjectParams) => {
  if (!payload.hasS3Credential) {
    return await Promise.reject(missingCredentialsErrorResponse);
  }
  const s3 = getS3Object();
  const command = new AWS.GetObjectCommand(payload.params);
  return await new Promise((resolve, reject) => {
    getSignedUrl(s3, command, {
      expiresIn: payload.expireTime ? payload.expireTime : 60,
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.log('Error', err);
        reject(formatErrRes(err));
      });
  });
};

export const fetchS3UsageInfo = async () => {
  if (!portalConfigStore) {
    portalConfigStore = PortalConfig();
  }
  if (!userStore) {
    userStore = useUser();
  }
  if (!projectStore) {
    projectStore = useProject();
  }
  if (!s3Store) {
    s3Store = useStorage();
  }
  const apiConfig = {
    headers: {
      authorization: `Bearer ${userStore.getToken}`,
    },
  };
  const projectId = projectStore.getCurrentProject.id;
  const currentServiceType: S3ServiceTypeName = s3Store.getCurrentServiceType;
  const url = `${portalConfigStore.portalConfig.API_URL}/${getS3Services()?.[currentServiceType]}/cs/api/v1/project/${projectId}`;

  return await axios
    .get(url, apiConfig)
    .then(async res => {
      return await Promise.resolve(res.data);
    })
    .catch(async err => {
      console.log('err', err.response);
      return await Promise.reject(err.response);
    });
};

export const fetchS3BucketAcl = async (payload: {
  hasS3Credential: boolean;
  bucketName: string;
}) => {
  if (!payload.hasS3Credential) {
    return await Promise.reject(missingCredentialsErrorResponse);
  }

  const params = {
    Bucket: payload.bucketName,
  };

  const s3 = getS3Object();
  return await new Promise((resolve, reject) => {
    s3.getBucketAcl(params, (err: any, data: any) => {
      if (err) {
        resolve({
          hasPermission: false,
          ...err,
        });
      } else {
        resolve({
          hasPermission: true,
          ...data,
        });
      }
    });
  });
};

export const updateS3BucketAcl = async (payload: {
  hasS3Credential: boolean;
  bucketName: string;
  accessControlPolicy: AccessControlPolicy;
}) => {
  if (!payload.hasS3Credential) {
    return await Promise.reject(missingCredentialsErrorResponse);
  }

  const params = {
    Bucket: payload.bucketName,
    AccessControlPolicy: payload.accessControlPolicy,
  };

  const s3 = getS3Object();
  return await new Promise(resolve => {
    s3.putBucketAcl(
      params as AWS.PutBucketAclCommandInput,
      (err: any, data: any) => {
        if (err) {
          resolve({
            ...err,
          });
        } else {
          resolve({
            ...data,
          });
        }
      }
    );
  });
};
