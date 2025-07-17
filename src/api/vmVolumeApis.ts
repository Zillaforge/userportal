import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

import { type Volume, type Snapshot } from '@/interfaces/VmInterface';
const API_VERSION = 'vps/api/v1/project';
let projectStore: any;

export const fetchVmVolumeTypes = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/volume_types`)
    .then((res: AxiosResponse) => {
      return res.data.volume_types || [];
    });
};

export const fetchVmVolumes = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/volumes?detail=true`)
    .then((res: AxiosResponse) => {
      return res.data.volumes || [];
    });
};
export const fetchVmVolumeDetail = async (payload: { volumeId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { volumeId } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/volumes/${volumeId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const createVmVolume = async (payload: { volumeItem: Volume }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { volumeItem } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/volumes`, volumeItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const updateVmVolume = async (payload: {
  volumeId: string;
  volumeItem: Volume;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { volumeId, volumeItem } = payload;
  return await apiService
    .put(`${API_VERSION}/${projectId}/volumes/${volumeId}`, volumeItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteVmVolume = async (payload: { volumeId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { volumeId } = payload;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/volumes/${volumeId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchVmSnapshots = async (payload: { volumeId: string }) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { volumeId } = payload;

  return await apiService
    .get(`${API_VERSION}/${projectId}/snapshots`, {
      params: { volume_id: volumeId },
    })
    .then((res: AxiosResponse) => {
      return res.data.snapshots || [];
    });
};

export const fetchVmSnapshotsAll = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;

  return await apiService
    .get(`${API_VERSION}/${projectId}/snapshots`)
    .then((res: AxiosResponse) => {
      return res.data.snapshots || [];
    });
};

export const createVolumeSnapShot = async (payload: {
  snapshotItem: Snapshot;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { snapshotItem } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/snapshots`, snapshotItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const volumeActions = async (payload: {
  volumeId: string;
  action: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { volumeId, action } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/volumes/${volumeId}/action`, action)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
