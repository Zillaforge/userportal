import { useProject } from '@/store';

import { type AxiosResponse } from 'axios';

import apiService from './apiServiceReq';

const API_VERSION = '/ats/api/v1';

let projectStore: any;

export const fetchProjectLogs = async (payload: {
  size: number;
  offset: number;
  from: number;
  to: number;
  language?: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }

  const language = payload.language === 'tw' ? 'zh-tw' : 'en';

  const data = {
    params: {
      from: payload.from,
      to: payload.to,
      limit: payload.size,
      offset: payload.offset,
      language,
    },
  };

  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/project/${projectId}/logs`, data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchUserLogs = async (payload: {
  size: number;
  offset: number;
  from: number;
  to: number;
  language?: string;
}) => {
  const language = payload.language === 'tw' ? 'zh-tw' : 'en';

  const data = {
    params: {
      from: payload.from,
      to: payload.to,
      limit: payload.size,
      offset: payload.offset,
      language,
    },
  };

  return await apiService
    .get(`${API_VERSION}/logs`, data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};
