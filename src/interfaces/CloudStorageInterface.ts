import { Upload } from '@aws-sdk/lib-storage';

export type FileEventTarget = EventTarget & { files: FileList }; // https://github.com/microsoft/TypeScript/issues/31816

export const enum S3ServiceTypeName {
  STORAGE = 'dss',
  EXCHANGE = 'des',
  RELEASE = 'drs',
}

export interface S3CredentialInfo {
  accessKey: string;
  secretKey: string;
}

export interface S3Info extends S3CredentialInfo {
  endpoint: string;
  serviceType: S3ServiceTypeName;
}

export interface S3BucketOpParams {
  hasS3Credential: boolean;
  bucketName: string;
}

export interface S3ObjectParams {
  hasS3Credential: boolean;
  bucketName: string;
  delimiter?: string;
  prefix?: string;
  token?: string;
}

export interface S3ObjectListOutput {
  status: number;
  response: Record<string, any>;
  isTruncated?: boolean | undefined;
  token?: string | undefined;
}

export interface S3CreateFolderParams {
  hasS3Credential: boolean;
  bucketName: string;
  path: string;
}

export interface S3UploadParams {
  Bucket: string;
  Key: string;
  Body: any;
}

export interface S3UploadObjectParams {
  hasS3Credential: boolean;
  uploadParams: S3UploadParams;
  updateUploadProgressFunc?: (value: number) => void;
  updateUploadRequestFunc?: (request: Upload) => void;
}

export interface S3DownloadParams {
  Bucket: string;
  Key: string;
}

export interface S3DownloadObjectParams {
  hasS3Credential: boolean;
  params: S3DownloadParams;
  expireTime?: number;
}

export interface S3UploadFile extends File {
  isFolder?: boolean;
  count?: number;
  uploadProgress?: number;
}

export interface S3DeleteObject {
  Key: string;
  isFolder: boolean;
}
export interface S3DeleteObjectParams {
  hasS3Credential: boolean;
  bucketName: string;
  objects: S3DeleteObject[];
}

export const enum InfiniteScrollerStatus {
  LOADING = 'loading',
  ERROR = 'error',
  EMPTY = 'empty',
  OK = 'ok',
}

export const enum InfiniteScrollerSide {
  START = 'start',
  END = 'end',
  BOTH = 'both',
}

export interface AccessControlPolicy {
  Bucket: string;
  AccessControlPolicy: {
    Grants: AccessControlPolicyGrants[];
  };
}
export interface AccessControlPolicyGrants {
  Grantee: {
    Type: string;
    ID?: string;
    URI?: string;
  };
  Permission: string;
}
