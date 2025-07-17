import { defineStore } from 'pinia';

import {
  type S3Info,
  type S3CredentialInfo,
  S3ServiceTypeName,
} from '@/interfaces/CloudStorageInterface';

const useStorageStore = defineStore('s3Storage', {
  state: (): S3Info => ({
    accessKey: '',
    secretKey: '',
    endpoint: '',
    serviceType: S3ServiceTypeName.STORAGE,
  }),
  getters: {
    getS3AccessKey: (state): string => state.accessKey,
    getS3SecretKey: (state): string => state.secretKey,
    getS3Endpoint: (state): string => state.endpoint,
    getCurrentServiceType: (state): S3ServiceTypeName => state.serviceType,
  },
  actions: {
    setS3Credential(payload: S3CredentialInfo) {
      this.accessKey = payload.accessKey;
      this.secretKey = payload.secretKey;
    },
    setS3Endpoint(value: string) {
      this.endpoint = value;
    },
    setCurrentServiceType(value: S3ServiceTypeName) {
      this.serviceType = value;
    },
  },
});

export default useStorageStore;
