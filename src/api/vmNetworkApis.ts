import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

import { type Network } from '@/interfaces/VmInterface';

const API_VERSION = 'vps/api/v1/project';
let projectStore: any;

export const fetchVmNetworks = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/networks`)
    .then((res: AxiosResponse) => {
      return res.data.networks || [];
    });
};
export const fetchVmNetworkDetail = async (payload: { networkId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { networkId } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/networks/${networkId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const createVmNetwork = async (payload: { networkItem: Network }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { networkItem } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/networks`, networkItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const deleteVmNetwork = async (payload: { networkId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { networkId } = payload;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/networks/${networkId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchVmNetworkPorts = async (networkId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/networks/${networkId}/ports`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
