import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

const API_VERSION = '/iam/api/v1';

let projectStore: any;

export const fetchProjectList = async () =>
  await apiService
    .get('/iam/api/v1/projects')
    .then((res: AxiosResponse) => res);

export const fetchProjectMembershipList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/membership/project/${projectId}`)
    .then(res => {
      return res.data?.memberships ?? [];
    })
    .catch(err => {
      console.log('err', err.response);
      return [];
    });
};
