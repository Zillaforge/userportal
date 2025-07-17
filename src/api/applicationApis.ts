import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

import i18n from '@/i18n';

const API_VERSION = '/aps/api/v1/project';
const getApiConfig = () => {
  return {
    headers: {
      'X-Language': i18n.global.locale === 'tw' ? 'zh-TW' : 'en-US',
    },
  };
};
let projectStore: any;

// Module Category (App Type)
export const fetchAppModuleCategoryList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/module-categories?limit=-1`)
    .then((res: AxiosResponse) => {
      return res.data?.moduleCategories ?? [];
    });
};

// Module (App Type Version)
export const fetchAppModuleList = async (moduleCategoriyId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(
      `${API_VERSION}/${projectId}/module-category/${moduleCategoriyId}/modules?limit=-1`,
      getApiConfig()
    )
    .then((res: AxiosResponse) => {
      return res.data?.modules ?? [];
    });
};

// Application
export const createApplication = async (appItem: {
  name: string;
  description?: string | null;
  moduleID: string;
  answers: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/application`, appItem)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const fetchApplicationList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/applications?limit=-1`)
    .then((res: AxiosResponse) => {
      return res.data?.applications ?? [];
    });
};

export const fetchApplicationDetail = async (appId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/application/${appId}`, getApiConfig())
    .then((res: AxiosResponse) => {
      const detailItem = {
        ...res.data,
        status: res.data.state ?? '',
      };
      return detailItem || {};
    });
};

export const deleteApplication = async (appId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/application/${appId}`)
    .then(() => {
      return null;
    });
};

export const approveApplication = async (appId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/application/${appId}/approve`)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const rejectApplication = async (appId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/application/${appId}/reject`)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

// instance
export const fetchAppInstanceList = async (appId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(
      `${API_VERSION}/${projectId}/instances?limit=-1&where=application-id=${appId}`
    )
    .then((res: AxiosResponse) => {
      return res.data?.instances ?? [];
    });
};

export const associateFloatingIpOfAppInstance = async (payload: {
  instanceId: string;
  floatingIpId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/instance/${payload.instanceId}/floatingip/associate`,
      { floatingIpId: payload.floatingIpId }
    )
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const disassociateFloatingIpOfAppInstance = async (
  instanceId: string
) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(
      `${API_VERSION}/${projectId}/instance/${instanceId}/floatingip/associate`
    )
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

// logs
export const fetchAppLogs = async (appId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/application/${appId}/logs`)
    .then((res: AxiosResponse) => {
      return res.data?.logs || '';
    });
};
