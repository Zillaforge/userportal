import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

import { isPublicSite } from '@/utils/utils';

const API_VERSION = '/rds/api/v1';
const API_VERSION_PROJECT = API_VERSION + '/project';
const apiConfig = {
  headers: {
    'X-Namespace': isPublicSite() ? 'public' : 'private',
  },
};
let projectStore: any;

// Remote resource (dataset / image)
export const fetchRemoteResourceList = async (type: string = '') => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(
      `${API_VERSION_PROJECT}/${projectId}/resources?limit=-1${type ? `&where=type=${type}` : ''}`,
      apiConfig
    )
    .then((res: AxiosResponse) => {
      return res.data.resources || [];
    });
};

export const createRemoteResource = async (resourceItem: {
  name: string;
  description?: string | null;
  provider: string;
  scheme: string;
  type: string;
  uri: string;
  expiredAt?: string | null;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION_PROJECT}/${projectId}/resource`,
      resourceItem,
      apiConfig
    )
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const syncRemoteResource = async (resourceId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION_PROJECT}/${projectId}/resource/${resourceId}/sync`,
      {},
      apiConfig
    )
    .then(() => {
      return null;
    });
};

export const deleteRemoteResource = async (resourceId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(
      `${API_VERSION_PROJECT}/${projectId}/resource/${resourceId}`,
      apiConfig
    )
    .then(() => {
      return null;
    });
};

export const fetchResourceProviderList = async () => {
  return await apiService
    .get(`${API_VERSION}/scopes?key=allow_providers&onlyValue=true`, apiConfig)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

// Remote task
export const fetchRemoteTaskList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION_PROJECT}/${projectId}/tasks?limit=-1`, apiConfig)
    .then((res: AxiosResponse) => {
      return res.data.tasks || [];
    });
};

export const fetchRemoteTaskDetail = async (taskId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION_PROJECT}/${projectId}/task/${taskId}`, apiConfig)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const createRemoteTask = async (taskItem: {
  name: string;
  description?: string | null;
  provider: string;
  flavorId: string;
  outputMountPaths: string[];
  environments: string[];
  skeletonType: string;
  command: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION_PROJECT}/${projectId}/task`, taskItem, apiConfig)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const editRemoteTask = async (taskItem: {
  taskId: string;
  body: any;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(
      `${API_VERSION_PROJECT}/${projectId}/task/${taskItem.taskId}`,
      taskItem.body,
      apiConfig
    )
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const deleteRemoteTask = async (taskId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION_PROJECT}/${projectId}/task/${taskId}`, apiConfig)
    .then(() => {
      return null;
    });
};

export const bindRemoteResourcesToTask = async (payload: {
  taskId: string;
  mountPaths: { resourceId: string; path: string }[];
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION_PROJECT}/${projectId}/task/${payload.taskId}/resources`,
      { mountPaths: payload.mountPaths },
      apiConfig
    )
    .then((res: AxiosResponse) => {
      return null;
    });
};

export const unbindRemoteResourceToTask = async (payload: {
  taskId: string;
  resId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(
      `${API_VERSION_PROJECT}/${projectId}/task/${payload.taskId}/resource/${payload.resId}`,
      apiConfig
    )
    .then(() => {
      return null;
    });
};

// job
export const fetchRemoteJobList = async (taskId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(
      `${API_VERSION_PROJECT}/${projectId}/task/${taskId}/jobs?limit=-1`,
      apiConfig
    )
    .then((res: AxiosResponse) => {
      return res.data.jobs || [];
    });
};

export const createRemoteJob = async (jobItem: {
  taskId: string;
  body: { scheme: string; outputUri?: string };
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION_PROJECT}/${projectId}/task/${jobItem.taskId}/job`,
      jobItem.body,
      apiConfig
    )
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const terminateRemoteJob = async (payload: {
  taskId: string;
  jobId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION_PROJECT}/${projectId}/task/${payload.taskId}/job/${payload.jobId}/terminate`,
      null,
      apiConfig
    )
    .then(() => {
      return null;
    });
};

export const deleteRemoteJob = async (payload: {
  taskId: string;
  jobId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(
      `${API_VERSION_PROJECT}/${projectId}/task/${payload.taskId}/job/${payload.jobId}`,
      apiConfig
    )
    .then(() => {
      return null;
    });
};

// Job Log
export const fetchRemoteJobLogFiles = async (payload: {
  taskId: string;
  jobId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(
      `${API_VERSION_PROJECT}/${projectId}/task/${payload.taskId}/job/${payload.jobId}/logs`,
      apiConfig
    )
    .then((res: AxiosResponse) => {
      return res.data.logs || [];
    });
};

export const fetchRemoteJobLogs = async (payload: {
  taskId: string;
  jobId: string;
  logFile: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(
      `${API_VERSION_PROJECT}/${projectId}/task/${payload.taskId}/job/${payload.jobId}/log?name=${payload.logFile}`,
      apiConfig
    )
    .then((res: AxiosResponse) => {
      return res.data || '';
    });
};

// flavor
export const fetchRemoteFlavorList = async () => {
  return await apiService
    .get(`${API_VERSION}/flavors`, apiConfig)
    .then((res: AxiosResponse) => {
      return res.data.flavors || [];
    });
};
