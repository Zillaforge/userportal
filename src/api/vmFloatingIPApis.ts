import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

const API_VERSION = 'vps/api/v1/project';
let projectStore: any;
export const fetchVmFloatingIP = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/floatingips`)
    .then((res: AxiosResponse) => {
      return res.data.floating_ips || [];
    });
};

export const createVmFloatingIP = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/floatingips`, {})
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const updateVmFloatingIP = async (payload: {
  floatingIpId: string;
  body: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { body, floatingIpId } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(`${API_VERSION}/${projectId}/floatingips/${floatingIpId}`, body)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteVmFloatingIP = async (floatingIpId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/floatingips/${floatingIpId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
  // return '204 No Content';
};

export const detachFloatingIP = async (payload: { floatingIpId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { floatingIpId } = payload;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/floatingips/${floatingIpId}/disassociate`
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const approveFloatingIP = async (payload: { floatingIpId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { floatingIpId } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/floatingips/${floatingIpId}/approve`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const rejectFloatingIP = async (payload: { floatingIpId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { floatingIpId } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/floatingips/${floatingIpId}/reject`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
