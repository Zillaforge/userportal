<script lang="ts" setup>
import { useGlobal, useUser, useProject } from '@/store';
import { storeToRefs } from 'pinia';
import { ref, onBeforeMount, type Ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  makeMultipleApiCalls,
  fetchProjectMembershipList,
  fetchVirtualImageDetail,
  fetchVirtualImageTags,
  deleteVirtualImageTag,
  fetchVirtualImageTagMemberAcls,
  createVirtualImageMemberAcl,
  createVirtualImageTagMemberAcl,
  deleteVirtualImageMemberAcl,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import VmImageAddSharingDialog from '@/components/VmImageAddSharingDialog.vue';
import VmImageDownloadDialog from '@/components/VmImageDownloadDialog.vue';
import VmImageEditSharingDialog from '@/components/VmImageEditSharingDialog.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import { IMAGE_TYPES } from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import { ActionType } from '@/interfaces/InfraDataTableInterface';
import getTableHeaders from '@/utils/getTableHeaders';
import {
  getDeepObj,
  generalCopy,
  compareArrayDiff,
  formatBytes,
  isPublicSite,
} from '@/utils/utils';

const globalStore = useGlobal();
const { isTenantAdmin } = storeToRefs(useProject());
const { getUserInfo } = storeToRefs(useUser());
const { setProjectSwitchCallback } = useProjectSwitch();
const $isPublicSite = isPublicSite();

const route = useRoute();
const router = useRouter();
const headers = computed(() => getTableHeaders());
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const imageDetail: Ref<Record<string, any>> = ref({});
const imageVersions: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');
const downloadTagId = ref('');
const downloadTagName = ref('');
const { t } = i18n.global;

const showAddSharingDialog = ref(false);
const showEditSharingDialog = ref(false);
const showImageDownloadDialog = ref(false);

const allMembers = ref([]);
const editingSharingVersion = ref({});
const editingMemberList = ref<{ id: string; name: string; aclId: string }[]>(
  []
);

const isCurrentUserRepoCreator = computed(() => {
  const { userId } = getUserInfo.value;
  return imageDetail.value.creator?.id === userId;
});
const imageVersionOptions = computed(() =>
  imageVersions.value.map(tag => ({ tagName: tag.name, id: tag.id }))
);

onBeforeMount(() => {
  globalStore.setBreadcrumbsParams({
    imageName: route.params.imageName,
  });
});
onMounted(async () => {
  const fetchDataCall = fetchData();
  const fetchMembershipCall = makeApiCall({
    skipProgress: true,
    apiCallFn: fetchProjectMembershipList,
    errorResHandlingFn: () => [],
  });
  await fetchDataCall;
  const membershipList = await fetchMembershipCall;
  allMembers.value = membershipList
    .map(
      // get all user's id & name for memberOptions
      (member: {
        user: { userId: string; displayName: string; account: string };
      }) => ({
        id: member.user.userId,
        name: member.user.displayName || member.user.account,
      })
    )
    .filter((member: { id: string }) => {
      const { userId } = getUserInfo.value;
      return member.id !== userId;
    });
  setProjectSwitchCallback(backToList);
});

const fetchData = async () => {
  isLoading.value = true;
  await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchVirtualImageDetail,
    payload: route.params.repoId,
    successCallback: res => {
      imageDetail.value = res;
      globalStore.setBreadcrumbsParams({
        imageName: res.name,
      });
    },
    errorResHandlingFn: () => {},
    errorCallback: backToList,
  });
  imageVersions.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchVirtualImageTags,
    payload: route.params.repoId,
    successCallback: res =>
      res.map((tag: { size: number; extra: Record<string, any> }) => ({
        ...tag,
        tagSize: formatBytes(tag.size),
        diskFormat: tag.extra?.diskFormat || 'raw',
      })),
    errorResHandlingFn: () => [],
    errorCallback: backToList,
  });
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const addSharing = (params: {
  selectedVersions: any[];
  selectedMembers: any[];
}) => {
  const { selectedVersions, selectedMembers } = params;
  return makeApiCall({
    apiCallFn: createVirtualImageMemberAcl,
    apiCallFnName: 'createVirtualImageMemberAcl',
    payload: {
      imageId: route.params.repoId,
      tagIds: selectedVersions.map((version: { id: string }) => version.id),
      userIds: selectedMembers.map((member: { id: string }) => member.id),
    },
    successCallback: closeAddSharingDialog,
  });
};
const closeAddSharingDialog = () => {
  showAddSharingDialog.value = false;
};

const handleClickEditSharing = async (item: any) => {
  editingSharingVersion.value = item;
  const memberAcls = await makeApiCall({
    apiCallFn: fetchVirtualImageTagMemberAcls,
    payload: item.id,
    errorResHandlingFn: () => [],
  });
  editingMemberList.value = memberAcls.map((acl: any) => ({
    aclId: acl.id,
    id: acl.user?.id,
    name: acl.user?.displayName || acl.user?.account,
  }));
  showEditSharingDialog.value = true;
};
const editSharing = async (params: {
  sharingVersion: string;
  selectedMembers: any[];
}) => {
  const { sharingVersion, selectedMembers } = params;
  const { toAdd, toRemove } = compareArrayDiff({
    newArray: selectedMembers,
    originalArray: editingMemberList.value,
    objValueKey: 'id',
  });
  if (toAdd.length > 0) {
    makeApiCall({
      apiCallFn: createVirtualImageTagMemberAcl,
      apiCallFnName: 'createVirtualImageTagMemberAcl',
      payload: {
        tagId: sharingVersion,
        userIds: toAdd.map((member: any) => member.id),
      },
    });
  }
  return await makeMultipleApiCalls({
    apiCallFn: deleteVirtualImageMemberAcl,
    apiCallFnName: 'deleteVirtualImageMemberAcl',
    payloads: toRemove.map((aclItem: any) => aclItem.aclId),
    successCallback: closeEditSharingDialog,
  });
};
const closeEditSharingDialog = () => {
  showEditSharingDialog.value = false;
};

const getItemContent = (item: Record<string, any>, key: string) => {
  let content = getDeepObj(item, key) || '';
  if (key === 'type') {
    const found = Object.keys(IMAGE_TYPES).find(element => element === content);
    if (found) {
      content = t(IMAGE_TYPES[found]);
    }
  }
  return content;
};
const backToList = () => {
  void router.push({ name: PAGE_TYPES.VM_IMAGE_LIST });
};
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp :title="`${imageDetail.name}`" />

      <GeneralDataTable
        :items="imageVersions"
        :more-action-list="[
          {
            label: $t('action.edit.type', { type: $t('label.sharing') }),
            action: handleClickEditSharing,
            disabled: () => !isCurrentUserRepoCreator && !isTenantAdmin,
          },
          {
            label: $t('basic.download'),
            action: item => {
              downloadTagId = item.id;
              downloadTagName = item.name;
              showImageDownloadDialog = true;
            },
            visible: () => $isPublicSite,
            disabled: () => !isCurrentUserRepoCreator && !isTenantAdmin,
          },
          {
            label: $t('action.copyId'),
            action: (item: any) => generalCopy(item.id),
          },
          {
            type: ActionType.DELETE,
            resourceType: $t('image.tag'),
            message: $t('dialog.delete.message.type', {
              type: $t('image.tag'),
            }),
            action: async (item: any) => {
              isLoading = true;
              await makeApiCall({
                apiCallFn: deleteVirtualImageTag,
                apiCallFnName: 'deleteVirtualImageTag',
                payload: item.id,
                skipProgress: true,
              });
              fetchData();
            },
            disabled: () => !isCurrentUserRepoCreator && !isTenantAdmin,
          },
        ]"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'udpate_time',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'id'"
        :has-click-row-handler="false"
        :custom-btn="{
          label: $t('action.add.type', { type: $t('label.sharing') }),
          action: () => {
            showAddSharingDialog = true;
          },
          disabled: !isCurrentUserRepoCreator && !isTenantAdmin,
        }"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getItemContent(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'status'"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
  <VmImageAddSharingDialog
    v-model:show="showAddSharingDialog"
    :version-list="imageVersionOptions"
    :member-list="allMembers"
    @update-value="addSharing"
    @close-dialog="closeAddSharingDialog"
  />
  <VmImageEditSharingDialog
    v-model:show="showEditSharingDialog"
    :sharing-version="editingSharingVersion"
    :member-list="allMembers"
    :selected-members="editingMemberList"
    @update-value="editSharing"
    @close-dialog="closeEditSharingDialog"
  />
  <VmImageDownloadDialog
    v-model:show="showImageDownloadDialog"
    :tag-id="downloadTagId"
    :tag-name="downloadTagName"
    :image-name="imageDetail.name"
  />
</template>
