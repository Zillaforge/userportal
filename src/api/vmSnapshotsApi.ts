import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

let projectStore: any;
const API_VERSION = 'vps/api/v1/project';
const VRM_API_VERSION = 'vrm/api/v1/project';

export const fetchVmSnapshotList = async (projectId: string) => {
  return await apiService
    .get(`${API_VERSION}/${projectId}/snapshots`)
    .then((res: AxiosResponse) => {
      return res.data.snapshots || [];
    });
};

export const createVmSnapshot = async (payload: {
  serverId: string;
  body: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId, body } = payload;
  return await apiService
    .post(`${VRM_API_VERSION}/${projectId}/server/${serverId}/snapshot`, body)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const deleteVmSnapshot = async (payload: { snapshotId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { snapshotId } = payload;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/snapshots/${snapshotId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
