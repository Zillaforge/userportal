import { useProject } from '@/store';

import { type AxiosResponse } from 'axios';

import apiService from './apiServiceReq';

const API_VERSION = '/rss/api/v1';

let projectStore: any;

export const enum RESOURCE_TYPE {
  VPS = 'vps',
  APS = 'aps',
}

export const fetchResourceTransferList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;

  return await apiService
    .get(`${API_VERSION}/project/${projectId}/servers`)
    .then((res: AxiosResponse) => {
      return res.data?.servers ?? [];
    });
};

export const fetchResourceTransferHistoryList = async (payload: {
  resourceType: RESOURCE_TYPE;
  serverId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const url = `${API_VERSION}/project/${projectId}/${payload.resourceType}/${payload.serverId}/history`;

  return await apiService.get(url).then((res: AxiosResponse) => {
    return res.data ?? {};
  });
};

export const deleteResourceTransfer = async (payload: {
  resourceType: RESOURCE_TYPE;
  serverId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const url = `${API_VERSION}/project/${projectId}/${payload.resourceType}/${payload.serverId}/history`;

  return await apiService.delete(url);
};

export const deleteResourceTransferHistory = async (payload: {
  resourceType: RESOURCE_TYPE;
  serverId: string;
  historyId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const url = `${API_VERSION}/project/${projectId}/${payload.resourceType}/${payload.serverId}/history/${payload.historyId}`;

  return await apiService.delete(url);
};

export const fetchResourceTransferInfo = async (payload: {
  resourceType: RESOURCE_TYPE;
  serverId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;

  return await apiService
    .get(
      `${API_VERSION}/project/${projectId}/${payload.resourceType}/${payload.serverId}/migrate`
    )
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const transferResourceToPrivate = async (payload: {
  resourceType: RESOURCE_TYPE;
  serverId: string;
  data: {
    name: string;
    version: string;
    networks: {
      id: string;
      securityGroupIds: string[];
    }[];
  };
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;

  // const data = {
  //   name: 'ubuntu',
  //   version: 22.04,
  //   networks: [
  //     {
  //       id: 'f8956fb0-0f2b-4dc5-bf28-59912de9b54b',
  //       securityGroupIds: ['0ecde116-2f3a-453d-9eb2-1853f93c61c9'],
  //     },
  //   ],
  // };

  return await apiService
    .post(
      `${API_VERSION}/project/${projectId}/${payload.resourceType}/${payload.serverId}/migrate`,
      payload.data
    )
    .then((res: AxiosResponse) => {
      return res.data ?? [];
    });
};
