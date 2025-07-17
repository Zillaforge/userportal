<script lang="ts" setup>
import { useGlobal, useProject, usePortalConfig } from '@/store';
import { ref, onBeforeMount, onMounted, type Ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchContainerImageTags,
  deleteContainerImageTag,
} from '@/api';
import TD from '@/components/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  ActionType,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getTableHeaders from '@/utils/getTableHeaders';
import { formatBytes, getDeepObj, isPublicSite } from '@/utils/utils';

const { t } = i18n.global;
const globalStore = useGlobal();
const projectStore = useProject();
const { portalConfig } = usePortalConfig();
const { setProjectSwitchCallback } = useProjectSwitch();
const $isPublicSite = isPublicSite();

const route = useRoute();
const router = useRouter();
const headers = computed(() =>
  getTableHeaders(PAGE_TYPES.CONTAINER_IMAGE_DETAIL)
);
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const imageVersions: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');

onBeforeMount(() => {
  globalStore.setBreadcrumbsParams({
    imageName: route.params.imageName,
  });
});

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(backToList);
});

const fetchData = async () => {
  isLoading.value = true;
  imageVersions.value = await makeApiCall({
    apiCallFn: fetchContainerImageTags,
    payload: { imageName: route.params.imageName as string },
    successCallback: res => {
      return res.map((tag: { size: number }) => ({
        ...tag,
        tagSize: formatBytes(tag.size),
      }));
    },
    errorResHandlingFn: () => [],
    errorCallback: backToList,
  });

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const handleCopy = (key: string, item: TableItem) => {
  let command = '';
  const imageName = route.params.imageName as string;
  const prjSysCode =
    projectStore.getCurrentProject.projectSysCode.toLowerCase();
  if (key === 'pushCommand') {
    command = `docker push ${portalConfig.IMAGE_REGISTRY}/${prjSysCode}/${imageName}:${item.name}`;
  } else if (key === 'pullCommand') {
    command = `docker pull ${portalConfig.IMAGE_REGISTRY}/${prjSysCode}/${imageName}:${item.name}`;
  }
  void navigator.clipboard.writeText(command);
  globalStore.triggerSnackbar({ content: t('basic.copied') });
};
const backToList = () => {
  void router.push({ name: PAGE_TYPES.CONTAINER_IMAGE_LIST });
};
</script>

<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp :title="`${route.params.imageName}`" />

      <GeneralDataTable
        :items="imageVersions"
        :more-action-list="[
          {
            type: ActionType.DELETE,
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteContainerImageTag,
                payload: {
                  imageName: route.params.imageName,
                  tagName: item.name,
                },
                successCallback: fetchData,
              }),
            visible: (_item: any) => $isPublicSite,
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
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{ item }">
          <TD
            v-for="(header, index) in headers.slice(0, 2)"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'status'"
          />
          <TD :item="''" :search="searchStr">
            <v-icon
              v-if="$isPublicSite"
              class="cursor-pointer mr-1"
              @click="handleCopy('pushCommand', item)"
            >
              mdi-content-copy
            </v-icon>
            <span v-else>-</span>
          </TD>
          <TD :item="''" :search="searchStr">
            <v-icon
              class="cursor-pointer mr-1"
              @click="handleCopy('pullCommand', item)"
            >
              mdi-content-copy
            </v-icon>
          </TD>
          <TD
            v-for="(header, index) in headers.slice(4)"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'status'"
            :use-date-filter="
              header.key === 'pullAt' || header.key === 'pushAt'
            "
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
</template>
