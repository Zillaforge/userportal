import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';
const API_VERSION = '/crm/api/v1';
const API_VERSION_PROJECT = API_VERSION + '/project';

let projectStore: any;

export const fetchContainerRegistry = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: fetchContainerRegistry', projectId);
  return await apiService
    .get(`${API_VERSION_PROJECT}/${projectId}`)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const fetchGlobalContainerImageList = async () => {
  console.log('calling api: fetchGlobalContainerImageList');
  return await apiService
    .get(`${API_VERSION}/repositories?public=true`)
    .then((res: AxiosResponse) => {
      return res.data.repositories || [];
    });
};

export const fetchContainerImageList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: fetchContainerImageList', projectId);
  return await apiService
    .get(`${API_VERSION_PROJECT}/${projectId}/repositories`)
    .then((res: AxiosResponse) => {
      return res.data.repositories || [];
    });
};
export const fetchContainerImageDetail = async (imageName: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: fetchContainerImageDetail', projectId, imageName);
  return await apiService
    .get(`${API_VERSION_PROJECT}/${projectId}/repository/${imageName}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const updateContainerImage = async (payload: {
  imageName: string;
  description: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { imageName, description } = payload;
  const projectId = projectStore.getCurrentProject.id;
  console.log(
    'calling api: updateContainerImage',
    projectId,
    imageName,
    description
  );
  return await apiService
    .put(`${API_VERSION_PROJECT}/${projectId}/repository/${imageName}`, {
      description,
    })
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteContainerImage = async (imageName: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: deleteContainerImage', projectId, imageName);
  return await apiService
    .delete(`${API_VERSION_PROJECT}/${projectId}/repository/${imageName}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchContainerImageTags = async (payload: {
  imageName: string;
  projectId?: string;
}) => {
  if (!payload.projectId) {
    if (!projectStore) {
      projectStore = useProject();
    }
    payload.projectId = projectStore.getCurrentProject.id;
  }
  console.log(
    'calling api: fetchContainerImageTags',
    payload.projectId,
    payload.imageName
  );
  return await apiService
    .get(
      `${API_VERSION_PROJECT}/${payload.projectId}/repository/${payload.imageName}/tags`
    )
    .then((res: AxiosResponse) => {
      return res.data.tags || [];
    });
};

export const fetchGlobalContainerImageTags = async (payload: {
  imageName: string;
  projectId?: string;
}) => {
  if (!payload.projectId) {
    if (!projectStore) {
      projectStore = useProject();
    }
    payload.projectId = projectStore.getCurrentProject.id;
  }
  console.log(
    'calling api: fetchGlobalContainerImageTags',
    payload.projectId,
    payload.imageName
  );
  return await apiService
    .get(
      `${API_VERSION}/repository/${payload.imageName}/tags?project-id=${payload.projectId}`
    )
    .then((res: AxiosResponse) => {
      return res.data.tags || [];
    });
};

export const fetchContainerImageTagDetail = async (payload: {
  imageName: string;
  tagName: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { imageName, tagName } = payload;
  console.log(
    'calling api: fetchContainerImageTagDetail',
    projectId,
    imageName,
    tagName
  );
  return await apiService
    .get(
      `${API_VERSION_PROJECT}/${projectId}/repository/${imageName}/tag/${tagName}`
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteContainerImageTag = async (payload: {
  imageName: string;
  tagName: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { imageName, tagName } = payload;
  console.log(
    'calling api: deleteContainerImageTag',
    projectId,
    imageName,
    tagName
  );
  return await apiService
    .delete(
      `${API_VERSION_PROJECT}/${projectId}/repository/${imageName}/tag/${tagName}`
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
