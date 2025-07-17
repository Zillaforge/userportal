import { useUser } from '@/store';
import { defineStore } from 'pinia';
import { ref, type Ref, computed } from 'vue';

import { fetchProjectList, makeApiCall } from '@/api';
import { MEMBER_TYPES, COOKIE_CONFIG } from '@/constants/Constants';
import { setValue2Cookie } from '@/utils/utils';

const useProjectStore = defineStore('project', () => {
  // State
  const currentProject: Ref<Record<string, any>> = ref({});

  const projectList: Ref<any[]> = ref([]);

  // Getters
  const getCurrentProject = computed(
    () => currentProject.value || projectList.value[0]
  );
  const isTenantAdmin = computed(
    () => getCurrentProject.value.tenantRole !== MEMBER_TYPES.TENANT_MEMBER
  );
  const getProjectList = computed(() => projectList.value);

  // Actions
  const setCurrentProject = (payload: any) => {
    setValue2Cookie(COOKIE_CONFIG.PROJECT.ID, (payload.id as string) ?? '');
    currentProject.value = payload;
  };

  const fetchMyProjectList = async () => {
    await makeApiCall({
      apiCallFn: fetchProjectList,
      successCallback: (res: any) => {
        let data = res.data.projects || [];
        data = data
          .map((obj: any) => {
            const {
              displayName: name,
              projectId: id,
              extra,
              ...rest
            } = obj.project;
            const { userPermissionId, tenantRole } = obj;
            const projectSysCode = extra?.iservice?.projectSysCode ?? '';
            return {
              name,
              id,
              ...rest,
              userPermissionId,
              projectSysCode,
              tenantRole,
              extra,
            };
          })
          .filter((prj: any) => !prj.frozen);

        projectList.value = data;
        const projectId = useUser().cookiesInstance?.get(
          COOKIE_CONFIG.PROJECT.ID
        );
        const matchPrj = data.find((prj: any) => prj.id === projectId);

        if (matchPrj && matchPrj.name !== 'administrator') {
          setCurrentProject(matchPrj);
        } else {
          if (data?.[0]?.name === 'administrator') {
            setCurrentProject(data?.[1] ?? {});
          } else {
            setCurrentProject(data?.[0] ?? {});
          }
        }
      },
    });
  };

  return {
    getCurrentProject,
    isTenantAdmin,
    setCurrentProject,
    getProjectList,
    fetchMyProjectList,
  };
});

export default useProjectStore;
