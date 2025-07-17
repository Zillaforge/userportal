import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

const API_VERSION = '/vrm/api/v1/project';

let projectStore: any;

export const fetchVmImageRegistry = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}`)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const fetchVirtualImages = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/repositories`)
    .then((res: AxiosResponse) => {
      return res.data.repositories || [];
    });
};
export const fetchVirtualImageDetail = async (imageId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/repository/${imageId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const createVirtualImage = async (vmImageItem: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/upload`, vmImageItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const updateVirtualImage = async (payload: {
  imageId: string;
  description: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { imageId, description } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(`${API_VERSION}/${projectId}/repository/${imageId}`, { description })
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteVirtualImage = async (imageId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/repository/${imageId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

// //////////////////////////////////////////////////// //
// ------------------- Vm Image Tag ------------------- //
// //////////////////////////////////////////////////// //

export const fetchVirtualImageTags = async (imageRepoId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/repository/${imageRepoId}/tags`)
    .then((res: AxiosResponse) => {
      return res.data.tags || [];
    });
};
export const fetchVirtualImageTagDetail = async (payload: {
  imageId: string;
  tagId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { imageId, tagId } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/repository/${imageId}/tag/${tagId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const createVirtualImageTag = async (payload: {
  imageRepoId: string;
  imageTagItem: any;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { imageRepoId, imageTagItem } = payload;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/repository/${imageRepoId}/tag`,
      imageTagItem
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const updateVirtualImageTag = async (tagId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(`${API_VERSION}/${projectId}/tag/${tagId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteVirtualImageTag = async (tagId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/tag/${tagId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const downloadVirtualImageTag = async (payload: {
  imageTagId: string;
  filePath: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const data = {
    filepath: payload.filePath, // '<source>://<bucket-name>/<image-path>',
  };
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/tag/${payload.imageTagId}/download`,
      data
    )
    .then(async (res: AxiosResponse) => {
      await new Promise(resolve =>
        setTimeout(() => {
          resolve('done');
        }, 3000)
      );
      return res.data;
    });
};

// //////////////////////////////////////////////////// //
// ---------------- Vm Image MemberAcl ---------------- //
// //////////////////////////////////////////////////// //

export const fetchVirtualImageTagMemberAcls = async (tagId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/tag/${tagId}/memberacls`)
    .then((res: AxiosResponse) => {
      return res.data.memberAcls || [];
    });
};
export const createVirtualImageMemberAcl = async (payload: {
  imageId: string;
  tagIds: string[];
  userIds: string[];
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { imageId, tagIds, userIds } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/repository/${imageId}/memberacl`, {
      tagId: tagIds,
      userId: userIds,
    })
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const createVirtualImageTagMemberAcl = async (payload: {
  tagId: string;
  userIds: string[];
}) => {
  const { tagId, userIds } = payload;
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/tag/${tagId}/memberacl`, {
      userId: userIds,
    })
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const deleteVirtualImageMemberAcl = async (memberAclId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/memberacl/${memberAclId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
