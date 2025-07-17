import { useProject } from '@/store';

import axios from 'axios';

import type { AxiosResponse } from 'axios';

import apiService from '@/api/apiServiceReq';

const CKS_API = 'cks/api/v1';
const VPS_API = 'vps/api/v1';

let projectStore: any;

export const CLUSTER_STATUS = {
  CREATE_PENDING: 'create pending',
  CREATE_REJECT: 'create reject',
  CREATE_REJECTED: 'create rejected',
  CREATE_DELETED: 'create deleted',
  CREATE_FAILED: 'create failed',
  CREATING: 'creating',
  READY: 'ready',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under review',
  UPDATING: 'updating',
  UPDATE_PENDING: 'update pending',
  UPDATE_FAILED: 'update failed',
  DELETING: 'deleting',
  DELETE_FAILED: 'delete failed',
  DELETE_COMPLETE: 'delete complete',
};

const getDisplayStatus = (resStatus: any) => {
  return CLUSTER_STATUS[resStatus as keyof typeof CLUSTER_STATUS] ?? '';
};

// const getDisplayStatus = (resStatus: string) => {
//   let value = resStatus.toLowerCase();
//   Object.keys(CLUSTER_STATUS).forEach(key => {
//     const clusterStatus: string[] =
//       CLUSTER_STATUS[key as keyof typeof CLUSTER_STATUS];
//     if (clusterStatus.find(status => value === status)) {
//       value = key; // .capitalize();
//     }
//   });
//   return value;
// };

export const fetchK8sClusters = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: fetchK8sClusters', projectId);
  return await apiService
    .get(`${CKS_API}/project/${projectId}/clusters`)
    .then(async (res: AxiosResponse) => {
      const clusters = res.data.clusters || [];
      const result = clusters.map((item: any) => {
        return {
          ...item,
          status: getDisplayStatus(item.clusterStatus),
          clusterStatus: getDisplayStatus(item.clusterStatus),
          reviewStatus: getDisplayStatus(item.reviewStatus),
          name: item.clusterName,
          createdBy: item.user?.name,
        };
      });
      return await Promise.resolve(result);
    });
};

export const fetchK8sClusterDetail = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { clusterId } = payload;
  console.log('calling api: fetchK8sClusterDetail', projectId, clusterId);
  return await apiService
    .get(`${CKS_API}/project/${projectId}/cluster/${clusterId}`)
    .then((res: AxiosResponse) => {
      const detail = res.data;
      detail.clusterStatus = getDisplayStatus(detail.clusterStatus);
      detail.reviewStatus = getDisplayStatus(detail.reviewStatus);
      return detail || {};
    });
};

export const fetchK8sFlavorList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: fetchK8sFlavorList');
  return await apiService
    .get(`${VPS_API}/project/${projectId}/flavors`)
    .then((res: AxiosResponse) => {
      if (Array.isArray(res.data?.flavors)) {
        res.data?.flavors.forEach((flavor: any) => {
          flavor.gpu_count = flavor?.gpu?.count ?? 0;
        });
      }
      return res.data?.flavors || [];
    });
};

export const fetchSgList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: fetchSgList');
  return await apiService
    .get(`${VPS_API}/project/${projectId}/security_groups?detail=true`)
    .then((res: AxiosResponse) => {
      const sgList: any[] = res.data.security_groups || [];
      return filterValidSgList(sgList, 6443);
    });
};

export const fetchNgList = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { clusterId } = payload;
  console.log('calling api: fetchNgList');
  return await apiService
    .get(`${CKS_API}/project/${projectId}/nodegroups?clusterId=${clusterId}`)
    .then((res: AxiosResponse) => {
      const ngs = res.data?.nodegroups || [];
      ngs.forEach((ng: any) => {
        ng.status = getDisplayStatus(ng.status);
        ng.reviewStatus = getDisplayStatus(ng.reviewStatus);
      });
      return ngs;
    });
};

export const fetchK8sVersionList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  console.log('calling api: fetchK8sVersionList');
  return await apiService
    .get(`${CKS_API}/kubernetes_versions`)
    .then((res: AxiosResponse) => {
      return res.data.versions || [];
    });
};

export const upgradeK8sVersion = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { clusterId, body } = payload;
  console.log('calling api: upgradeK8sVersion: ', body.k8sVersion);
  return await apiService
    .post(`${CKS_API}/project/${projectId}/cluster/${clusterId}/upgrade`, body)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const updateK8sCluster = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { clusterId, body } = payload;
  console.log('calling api: updateK8sCluster: ', JSON.stringify(body));
  return await apiService
    .put(`${CKS_API}/project/${projectId}/cluster/${clusterId}`, body)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const updateK8sNodeGroup = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { nodeGroupId, body } = payload;
  console.log('calling api: updateK8sNodeGroup: ', JSON.stringify(body));
  return await apiService
    .put(`${CKS_API}/project/${projectId}/nodegroup/${nodeGroupId}`, body)
    .then((res: AxiosResponse) => {
      res.data.status = getDisplayStatus(res.data?.status);
      res.data.reviewStatus = getDisplayStatus(res.data?.reviewStatus);
      return res.data || {};
    });
};

export const reviewK8sCluster = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { clusterId, body } = payload;
  console.log('calling api: reviewK8sCluster: ', body.action);
  return await apiService
    .post(`${CKS_API}/project/${projectId}/cluster/${clusterId}/review`, body)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const reviewK8sNodeGroup = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { nodeGroupId, body } = payload;
  console.log('calling api: reviewK8sNodeGroup: ', body.action);
  return await apiService
    .post(
      `${CKS_API}/project/${projectId}/nodegroup/${nodeGroupId}/review`,
      body
    )
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const fetchK8sFloatingIpList = async () => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: fetchK8sFloatingIpList');
  return await apiService
    .get(`${VPS_API}/project/${projectId}/floatingips`)
    .then((res: AxiosResponse) => {
      return res.data?.floating_ips || [];
    });
};

export const fetchK8sKubeconfig = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { clusterId } = payload;
  console.log('calling api: fetchK8sKubeconfig');
  return await apiService
    .get(`${CKS_API}/project/${projectId}/cluster/${clusterId}/download`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const createK8sCluster = async (createItem: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: createK8sCluster', createItem);
  return await apiService
    .post(`${CKS_API}/project/${projectId}/cluster`, createItem)
    .then((res: AxiosResponse) => {
      res.data.clusterStatus = getDisplayStatus(res.data?.clusterStatus);
      res.data.reviewStatus = getDisplayStatus(res.data?.reviewStatus);
      return res.data || {};
    });
};

export const deleteK8sCluster = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  console.log('calling api: deleteK8sCluster', payload.clusterId);
  const clusterId = payload.clusterId;
  return await apiService
    .delete(`${CKS_API}/project/${projectId}/cluster/${clusterId}`)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const deleteK8sNodeGroup = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const nodeGroupId = payload.nodeGroupId;
  console.log('calling api: deleteK8sNodeGroup', payload.nodeGroupId);
  return await apiService
    .delete(`${CKS_API}/project/${projectId}/nodegroup/${nodeGroupId}`)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

export const addK8sNodeGroup = async (payload: any) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { clusterId, body } = payload;
  console.log('calling api: addK8sNodeGroup', clusterId);
  return await apiService
    .post(`${CKS_API}/project/${projectId}/nodegroup`, body)
    .then((res: AxiosResponse) => {
      res.data.status = getDisplayStatus(res.data?.status);
      res.data.reviewStatus = getDisplayStatus(res.data?.reviewStatus);
      return res.data || {};
    });
};

export const fetchK8sLog = async (payload: any) => {
  // Other QueryString
  // ?size= (The number of logs or metrics in response)
  // ?offset=0 (The number of items to skip before starting to collect the result set.)
  // ?from=(rfc3339) (The start timestamp to query data)
  // ?to=(rfc3339) (The end timestamp to query data)
  // ?start=false (If true, show oldest logs in response, else show latest logs, default is false)

  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { clusterId, hostName, type, query } = payload;
  console.log('calling api: fetchK8sLog', `${clusterId} ${hostName}: ${type}`);
  const controller = payload.controller;

  return await apiService
    .get(
      `${CKS_API}/project/${projectId}/cluster/${clusterId}/node/${hostName}/log/${type}`,
      {
        params: query,
        signal: controller.signal,
      }
    )
    .then((res: AxiosResponse) => {
      return res.data || {};
    })
    .catch(async err => {
      const isCancel = axios.isCancel(err);
      return {
        ...err,
        isCancel,
      };
    });
};

export const fetchK8sMetrics = async (payload: {
  clusterId: string;
  hostName: string;
  type: string;
  query: Record<string, any>;
}) => {
  if (!projectStore) {
    projectStore = useProject();
  }
  const projectId = projectStore.getCurrentProject.id;
  const { clusterId, hostName, type, query } = payload;
  return await apiService
    .get(
      `${CKS_API}/project/${projectId}/cluster/${clusterId}/node/${hostName}/metric/${type}`,
      {
        params: query,
      }
    )
    .then((res: AxiosResponse) => {
      if (type === 'diskread' || type === 'diskwrite') {
        return res.data?.[0]?.utils || [];
      }
      return res.data || [];
    });
};

const filterValidSgList = (
  sgList: any[],
  filterPort: number
): { name: string; id: string }[] => {
  const ruleRange = (rule: any) => {
    return (
      rule.direction === 'ingress' &&
      (rule.protocol === 'any' || rule.protocol === 'tcp') &&
      rule.port_min > 0 &&
      rule.port_max > 0 &&
      rule.port_min <= filterPort &&
      rule.port_max >= filterPort
    );
  };
  const ruleAny = (rule: any) => {
    return (
      rule.direction === 'ingress' &&
      (rule.protocol === 'any' || rule.protocol === 'tcp') &&
      rule.port_min === 0 &&
      rule.port_max === 0
    );
  };

  return sgList
    .filter(sg =>
      sg.rules.some((rule: any) => ruleRange(rule) || ruleAny(rule))
    )
    .map(({ name, id }) => ({ name, id }));
};
