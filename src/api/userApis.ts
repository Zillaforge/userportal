import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

// user & login related
export interface IAMLoginCredentials {
  account: string;
  password: string;
}

const API_VERSION = '/iam/api/v1';

export const loginApi = async (data: IAMLoginCredentials) =>
  await apiService.post(`${API_VERSION}/login`, data);
export const logoutApi = async () =>
  await apiService.post(`${API_VERSION}/logout`);
export const fetchUserInfo = async () =>
  await apiService.get(`${API_VERSION}/user`).then((res: AxiosResponse) => res);
export const updateUserInfo = async (payload: Record<string, any>) =>
  await apiService
    .put(`${API_VERSION}/user`, payload)
    .then((res: AxiosResponse) => res);
export const changePasswordApi = async (password: string) =>
  await apiService.put(`${API_VERSION}/user/password`, { password });

export const fetchApiKeyList = async () => {
  return await apiService
    .get(`${API_VERSION}/personal_access_api_tokens`)
    .then((res: AxiosResponse) => {
      return res.data?.personalAccessAPITokens || [];
    });
};

export const createApiKey = async (description: string) => {
  return await apiService
    .post(`${API_VERSION}/personal_access_api_token`, {
      description,
      unlimited: true,
    })
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const deleteApiKey = async (id: string) => {
  return await apiService
    .delete(`${API_VERSION}/personal_access_api_token/${id}`)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const fetchPublicKeyList = async () => {
  return await apiService
    .get(`${API_VERSION}/user/publickey`)
    .then((res: AxiosResponse) => {
      return res.data?.publicKey || '';
    });
};

export const updatePublicKey = async (value: string) => {
  return await apiService.put(`${API_VERSION}/user/publickey`, {
    publicKey: value,
  });
};

export const verifyTokenApi = async (token: string) =>
  await apiService.head(`${API_VERSION}/verify`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
