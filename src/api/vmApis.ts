import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

import { type VmCreation } from '@/interfaces/VmInterface';

let projectStore: any;
const API_VERSION = 'vps/api/v1/project';
const VRM_API_VERSION = 'vrm/api/v1/project';

export const fetchVmList = async (prjId?: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = prjId ?? projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/servers?detail=true`)
    .then((res: AxiosResponse) => {
      return res.data.servers || [];
    });
};

export const fetchVmDetail = async (payload: { serverId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/servers/${serverId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const createVm = async (payload: { vmItem: VmCreation }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { vmItem } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/servers/`, vmItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const deleteVm = async (payload: { serverId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId } = payload;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/servers/${serverId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchVmFlavors = async (prjId?: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = prjId ?? projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/flavors`)
    .then((res: AxiosResponse) => {
      return res.data.flavors || [];
    });
};

export const fetchVmFlavor = async (flavorId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/flavors/${flavorId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchVmImagesPrivate = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(
      `${VRM_API_VERSION}/${projectId}/tags?globalPublic=false&globalLimit=false&where=project-id=${projectId}`
    )
    .then((res: AxiosResponse) => {
      return res.data.tags || [];
    });
};

export const fetchVmImagesPublic = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(
      `${VRM_API_VERSION}/${projectId}/tags?creator=false&projectLimit=false&projectPublic=false&adminRole=false`
    )
    .then((res: AxiosResponse) => {
      return res.data.tags || [];
    });
};

export const fetchVmImageDetail = async (tagId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${VRM_API_VERSION}/${projectId}/tag/${tagId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchServerNics = async (payload: { serverId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/servers/${serverId}/nics`)
    .then((res: AxiosResponse) => {
      return res.data.nics || [];
    });
};

export const fetchServerVolumes = async (payload: { serverId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/servers/${serverId}/volumes`)
    .then((res: AxiosResponse) => {
      return res.data.disks || [];
    });
};

export const attachServerVolume = async (payload: {
  serverId: string;
  volumeId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId, volumeId } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/servers/${serverId}/volumes/${volumeId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const updateServer = async (payload: {
  serverId: string;
  body: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId, body } = payload;
  return await apiService
    .put(`${API_VERSION}/${projectId}/servers/${serverId}`, body)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const vmActions = async (payload: {
  serverId: string;
  action: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId, action } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/servers/${serverId}/action`, action)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const vmAttachFIP = async (payload: {
  serverId: string;
  nicId: string;
  body: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId, nicId, body } = payload;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/servers/${serverId}/nics/${nicId}/floatingip`,
      body
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const vmUpdateSecurityGroup = async (payload: {
  serverId: string;
  nicId: string;
  body: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId, nicId, body } = payload;
  return await apiService
    .put(`${API_VERSION}/${projectId}/servers/${serverId}/nics/${nicId}`, body)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchVncConsole = async (payload: { serverId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/servers/${serverId}/vnc_url`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchVmMetrics = async (payload: {
  serverId: string;
  query: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId, query } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/servers/${serverId}/metric`, {
      params: query,
    })
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchQuotas = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/quotas`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const removeNic = async (payload: {
  serverId: string;
  nicId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId, nicId } = payload;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/servers/${serverId}/nics/${nicId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const attachNic = async (payload: {
  serverId: string;
  body: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId, body } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/servers/${serverId}/nics`, body)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchResizeFlavors = async (payload: { serverId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { serverId } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/flavors/?resize_server_id=${serverId}`)
    .then((res: AxiosResponse) => {
      return res.data.flavors || [];
    });
};

export * from './vmKeypairApis';
export * from './vmNetworkApis';
export * from './vmRouterApis';
export * from './vmSecurityGroupApis';
export * from './vmSnapshotsApi';
export * from './vmVolumeApis';
export * from './vmLoadBalancerApis';
export * from './vmAutoScalingApis';
export * from './vmFloatingIPApis';
