import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

import { type Keypair } from '@/interfaces/VmInterface';

let projectStore: any;
const API_VERSION = 'vps/api/v1/project';

export const fetchVmKeypairs = async (prjId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = prjId ?? projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/keypairs`)
    .then((res: AxiosResponse) => {
      return res.data.keypairs || [];
    });
};
export const fetchVmKeypairDetail = async (payload: { keypairId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { keypairId } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/keypairs/${keypairId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const createVmKeypair = async (payload: { keypairItem: Keypair }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { keypairItem } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/keypairs`, keypairItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const deleteVmKeypair = async (payload: { keypairId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { keypairId } = payload;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/keypairs/${keypairId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
