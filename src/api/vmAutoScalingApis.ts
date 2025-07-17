import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

const API_VERSION = '/vps/api/v1/project';

let projectStore: any;
export const fetchAutoScalingList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/auto_scale_groups`)
    .then((res: AxiosResponse) => {
      return (
        res.data.auto_scale_groups.map((asItem: any) => ({
          ...asItem,
          networkName: asItem.network?.name,
          creator: asItem.user?.name,
        })) || []
      );
    });
};

export const fetchAutoScalingDetail = async (autoScalingId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/auto_scale_groups/${autoScalingId}`)
    .then((res: AxiosResponse) => {
      const item = {
        ...res.data,
        imageName: res.data.metadatas?.vrm_extras_distribution,
        imageTagName: res.data.metadatas?.vrm_image_name?.split(':')?.[1],
        imageLoginUser: res.data.metadatas?.vrm_extras_defaultUser,
        keypairName: res.data.keypair?.name,
        flavorName: res.data.flavor_detail?.name,
        networkName: res.data.network?.name,
        securityGroupNames: res.data.security_groups?.map(
          (sg: { name: string }) => sg.name
        ),
        boot_script: res.data.boot_script
          ? window.atob(`${res.data.boot_script}`)
          : '',
        creator: res.data.user?.name,
      };
      return item || [];
    });
};
export const createAutoScaling = async (autoScalingItem: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/auto_scale_groups`, autoScalingItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const updateAutoScaling = async (payload: {
  id: string;
  valuesToUpdate: any;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { id, valuesToUpdate } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(`${API_VERSION}/${projectId}/auto_scale_groups/${id}`, valuesToUpdate)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteAutoScaling = async (id: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/auto_scale_groups/${id}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const asVmAttachFloatingIp = async (payload: {
  autoScalingId: string;
  serverId: string;
  body: any;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { autoScalingId, serverId, body } = payload;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/auto_scale_groups/${autoScalingId}/servers/${serverId}/floatingip`,
      body
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchAsVmConsoleUrl = async (payload: {
  autoScalingId: string;
  serverId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { autoScalingId, serverId } = payload;
  return await apiService
    .get(
      `${API_VERSION}/${projectId}/auto_scale_groups/${autoScalingId}/servers/${serverId}/vnc_url`
    )
    .then((res: AxiosResponse) => {
      return res.data.url || '';
    });
};

export const approveAutoScaling = async (autoScalingId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/auto_scale_groups/${autoScalingId}/approve`
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const rejectAutoScaling = async (autoScalingId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/auto_scale_groups/${autoScalingId}/reject`
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const asVmActions = async (payload: {
  autoScalingId: string;
  serverId: string;
  action: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { autoScalingId, serverId, action } = payload;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/auto_scale_groups/${autoScalingId}/servers/${serverId}/action`,
      action
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
