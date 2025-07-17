import { useProject } from '@/store';

import apiService from './apiServiceReq';

import type { AxiosResponse } from 'axios';

const API_VERSION = '/vps/api/v1/project';

let projectStore: any;
export const fetchLoadBalancerList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/loadbalancers?detail=true`)
    .then((res: AxiosResponse) => {
      return res.data.load_balancers || [];
    });
};

export const fetchLoadBalancerDetail = async (loadBalancerId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}`)
    .then((res: AxiosResponse) => {
      const item = {
        ...res.data,
        networkName: res.data.network?.name,
        creator: res.data.user?.name,
      };
      return item || [];
    });
};
export const createLoadBalancer = async (loadBalancerItem: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(`${API_VERSION}/${projectId}/loadbalancers`, loadBalancerItem)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const updateLoadBalancer = async (payload: {
  id: string;
  description: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { id, description } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(`${API_VERSION}/${projectId}/loadbalancers/${id}`, {
      description,
    })
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteLoadBalancer = async (id: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(`${API_VERSION}/${projectId}/loadbalancers/${id}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const lbAttachFloatingIp = async (payload: {
  loadbalancerId: string;
  body: { fip_id?: string };
}) => {
  const { loadbalancerId, body } = payload;
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/loadbalancers/${loadbalancerId}/floatingip`,
      body
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

// //////////////////////////////////////////////////// //
// -------------- Load Balancer Listener -------------- //
// //////////////////////////////////////////////////// //

export const fetchLoadBalancerListenerList = async (loadBalancerId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/listeners`
    )
    .then((res: AxiosResponse) => {
      return res.data.load_balancers || [];
    });
};

export const fetchLoadBalancerListener = async (payload: {
  loadBalancerId: string;
  listenerId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { loadBalancerId, listenerId } = payload;
  return await apiService
    .get(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/listeners/${listenerId}`
    )
    .then((res: AxiosResponse) => {
      const item = {
        ...res.data,
        networkName: res.data.network?.name,
      };
      return item || [];
    });
};
export const createLoadBalancerListener = async (payload: {
  loadBalancerId: string;
  listenerItem: any;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { loadBalancerId, listenerItem } = payload;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/listeners`,
      listenerItem
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const updateLoadBalancerListener = async (payload: {
  loadBalancerId: string;
  listenerId: string;
  valuesToUpdate: any;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { loadBalancerId, listenerId, valuesToUpdate } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/listeners/${listenerId}`,
      valuesToUpdate
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteLoadBalancerListener = async (payload: {
  loadBalancerId: string;
  listenerId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { loadBalancerId, listenerId } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/listeners/${listenerId}`
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

// //////////////////////////////////////////////////// //
// ---------------- Load Balancer Pool ---------------- //
// //////////////////////////////////////////////////// //

export const fetchLoadBalancerPoolList = async (loadBalancerId: string) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .get(`${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/pools`)
    .then((res: AxiosResponse) => {
      return res.data.pools || [];
    });
};

export const fetchLoadloadBalancerPool = async (payload: {
  loadBalancerId: string;
  poolId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { loadBalancerId, poolId } = payload;
  return await apiService
    .get(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/pools/${poolId}`
    )
    .then((res: AxiosResponse) => {
      const item = {
        ...res.data,
        networkName: res.data.network?.name,
      };
      return item || [];
    });
};
export const createLoadBalancerPool = async (payload: {
  loadBalancerId: string;
  poolItem: any;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { loadBalancerId, poolItem } = payload;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/pools`,
      poolItem
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const updateLoadBalancerPool = async (payload: {
  loadBalancerId: string;
  poolId: string;
  valuesToUpdate: any;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { loadBalancerId, poolId, valuesToUpdate } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/pools/${poolId}`,
      valuesToUpdate
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteLoadBalancerPool = async (payload: {
  loadBalancerId: string;
  poolId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const { loadBalancerId, poolId } = payload;
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .delete(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/pools/${poolId}`
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const loadBalancerPoolUpdateMembers = async (payload: {
  loadBalancerId: string;
  poolId: string;
  members: { name: string; address: string }[];
}) => {
  const { loadBalancerId, poolId, members } = payload;
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .put(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/pools/${poolId}/members`,
      { members }
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const loadBalancerPoolAddMember = async (payload: {
  loadBalancerId: string;
  poolId: string;
  memberItem: any;
}) => {
  const { loadBalancerId, poolId, memberItem } = payload;
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  return await apiService
    .post(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/pools/${poolId}/members`,
      memberItem
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const loadBalancerPoolRemoveMember = async (payload: {
  loadBalancerId: string;
  poolId: string;
  memberId: string;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { loadBalancerId, poolId, memberId } = payload;
  return await apiService
    .delete(
      `${API_VERSION}/${projectId}/loadbalancers/${loadBalancerId}/pools/${poolId}/members/${memberId}`
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
