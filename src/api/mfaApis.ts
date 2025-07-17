import { useUser } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

import { setToken2Cookie } from '@/utils/utils';

interface mfaPayload {
  verificationCode: string;
  mfaSecret?: string;
  mfaToken: string;
}

const API_VERSION = '/iam/api/v1/mfa';

export const fetchMfaInfo = async () =>
  await apiService.get(`${API_VERSION}/get`).then((res: AxiosResponse) => {
    return res.data ?? {};
  });

export const enableMfaAuth = async (payload: mfaPayload) =>
  await apiService
    .post(`${API_VERSION}/enable`, payload)
    .then((res: AxiosResponse) => {
      if (res.status === 204) {
        return true;
      } else {
        return false;
      }
    });

export const disableMfaAuth = async () =>
  await apiService
    .post(`${API_VERSION}/disable`, null)
    .then((res: AxiosResponse) => {
      if (res.status === 204) {
        return true;
      } else return false;
    });

export const verifyMfaAuth = async (payload: mfaPayload) =>
  await apiService
    .post(`${API_VERSION}/verify`, payload)
    .then((res: AxiosResponse) => {
      if (res.status === 200) {
        const userStore = useUser();
        userStore.setLoginInfo(res.data);
        setToken2Cookie(res.data?.token as string);
        return true;
      } else return false;
    });
