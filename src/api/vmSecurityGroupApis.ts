import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

const API_VERSION = 'vps/api/v1/project';
let projectStore: any;

interface VmSecurityGroupRule {
  direction: 'ingress' | 'egress';
  port_max: number;
  port_min: number;
  protocol: string;
  remote_cidr: string;
}

interface VmSecurityGroup {
  description: string;
  name: string;
  rules: VmSecurityGroupRule[];
}

export const fetchVmSecurityGroups = async (prjId?: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = prjId ?? projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/security_groups`)
    .then((res: AxiosResponse) => {
      return res.data.security_groups || [];
    });
};
export const fetchVmSecurityGroupDetail = async (payload: {
  projectId: string;
  securityGroupId: string;
}) => {
  const { projectId, securityGroupId } = payload;
  return await apiService
    .get(`${API_VERSION}/${projectId}/security_groups/${securityGroupId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
  // return exampleSecurityGroupItem;
};
export const createVmSecurityGroup = async (payload: {
  projectId: string;
  securityGroupItem: VmSecurityGroup;
}) => {
  const { projectId, securityGroupItem } = payload;
  return await apiService
    .post(`${API_VERSION}/${projectId}/security_groups`, securityGroupItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const deleteVmSecurityGroup = async (payload: {
  securityGroupId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { securityGroupId } = payload;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/security_groups/${securityGroupId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const vmSecurityGroupAddRule = async (payload: {
  projectId: string;
  securityGroupId: string;
  ruleItem: VmSecurityGroupRule;
}) => {
  const { projectId, securityGroupId, ruleItem } = payload;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/security_groups/${securityGroupId}/rules`,
      ruleItem
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const vmSecurityGroupDeleteRule = async (payload: {
  projectId: string;
  securityGroupId: string;
  ruleId: string;
}) => {
  const { projectId, securityGroupId, ruleId } = payload;
  return await apiService
    .delete(
      `${API_VERSION}/${projectId}/security_groups/${securityGroupId}/rules/${ruleId}`
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
