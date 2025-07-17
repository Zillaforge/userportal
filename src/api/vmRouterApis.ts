import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

const API_VERSION = 'vps/api/v1/project';
let projectStore: any;

export const vmRouterActions = async (payload: {
  routerId: string;
  action: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { routerId, action } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/routers/${routerId}/action`, action)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
