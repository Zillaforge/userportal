import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';
const API_VERSION = '/vps/api/v1/project';

let projectStore: any;
export const fetchFileSharingList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/shares`)
    .then((res: AxiosResponse) => {
      const sortedShares =
        res.data.shares?.sort(
          (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) || [];
      return sortedShares || [];
    });
};
export const fetchFileSharingDetail = async (shareId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/shares/${shareId}`)
    .then((res: AxiosResponse) => {
      const item = {
        ...res.data,
        networkName: res.data.network?.name,
        userName: res.data.user?.name,
      };
      return item || [];
    });
};
export const createFileSharing = async (fileSharingItem: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/shares`, fileSharingItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const updateFileSharing = async (payload: {
  shareId: string;
  description: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { shareId, description } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(`${API_VERSION}/${projectId}/shares/${shareId}`, { description })
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteFileSharing = async (shareId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/shares/${shareId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const extendFileSharing = async (payload: {
  shareId: string;
  body: { new_size: number };
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { shareId, body } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/shares/${shareId}/extend`, body)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

// //////////////////////////////////////////////////// //
// ---------------- File Sharing Rules ---------------- //
// //////////////////////////////////////////////////// //

export const createFileSharingRule = async (payload: {
  shareId: string;
  ruleItem: any;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { shareId, ruleItem } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/shares/${shareId}/rules`, ruleItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteFileSharingRule = async (payload: {
  shareId: string;
  ruleId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { shareId, ruleId } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/shares/${shareId}/rules/${ruleId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
