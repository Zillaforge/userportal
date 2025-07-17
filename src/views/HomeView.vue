<script setup lang="ts">
import { useProject, useGlobal } from '@/store';
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import ServiceSection from '@/components/ServiceSection.vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import SERVICE_TYPES from '@/constants/ServiceTypes';
import i18n from '@/i18n';
import {
  getServices,
  SERVICE_TYPE,
  getServiceAccess,
  isPublicSite,
} from '@/utils/utils';
const { t } = i18n.global;
const services = computed(() => getServices());
const router = useRouter();
const projectStore = useProject();
const { triggerSnackbar, getIsPilotRegion } = useGlobal();
const $isPublicSite = isPublicSite();
const goto = async (routeName: string) => {
  return await router.push({ name: routeName });
};
const copy = (target: string, type: string = 'name') => {
  void navigator.clipboard.writeText(target);
  triggerSnackbar({ content: t('basic.copied') });
};

const chips = computed(() => {
  const serviceAccess = getServiceAccess();
  return [
    {
      text: t('basic.create.type', { type: t('services.virtualMachine') }),
      routeName: PAGE_TYPES.VM_LIST,
    },
    {
      text: t('basic.create.type', {
        type: t('services.containerImageManage'),
      }),
      routeName: PAGE_TYPES.CONTAINER_IMAGE_LIST,
    },
    {
      text: t('basic.create.type', { type: t('services.k8sCluster') }),
      routeName: PAGE_TYPES.K8S_CLUSTER_LIST,
    },
    {
      text: t('basic.create.type', { type: t('services.cloudStorage') }),
      routeName: PAGE_TYPES.S3_BUCKET_LIST,
      hide: !serviceAccess[SERVICE_TYPES.DATA_STORAGE],
    },
  ];
});

watch(
  () => getIsPilotRegion,
  () => {
    void projectStore.fetchMyProjectList();
  }
);
</script>
<template>
  <div class="home-container">
    <v-container fluid class="px-16 pt-6">
      <v-row>
        <v-col
          cols="12"
          class="text-h3 font-weight-bold home-title"
          :class="{
            'public-title': $isPublicSite,
            'private-title': !$isPublicSite,
          }"
        >
          <span
            class="home-title"
            :class="{
              'public-title': $isPublicSite,
              'private-title': !$isPublicSite,
            }"
          >
            {{ $tc('basic.welcome', { item: $t('basic.trusty.platform') }) }}
          </span>
        </v-col>
        <v-col cols="12" class="pl-4">
          <v-row no-gutters>
            <div class="pr-8">
              <span class="subtitle">
                {{
                  `${t('label.name.type.colon', { type: $t('basic.project') })}
                  ${projectStore.getCurrentProject.name || $t('basic.no.data')}`
                }}
              </span>
              <v-icon
                v-if="projectStore.getCurrentProject?.name"
                class="ml-4 copy-icon"
                size="small"
                icon="mdi-content-copy"
                @click="copy(projectStore.getCurrentProject?.name)"
              />
            </div>
            <div class="">
              <span class="subtitle">
                {{
                  `${t('label.id.type.colon', { type: $t('basic.project') })}
                  ${projectStore.getCurrentProject?.projectSysCode ?? $t('basic.no.data')}`
                }}
              </span>
              <v-icon
                v-if="projectStore.getCurrentProject?.projectSysCode"
                class="ml-4 copy-icon"
                size="small"
                icon="mdi-content-copy"
                @click="
                  copy(projectStore.getCurrentProject?.projectSysCode, 'id')
                "
              />
            </div>
          </v-row>
        </v-col>
        <v-row no-gutters class="ml-3">
          <div v-for="chip in chips" :key="chip.text">
            <v-chip
              v-if="!chip.hide"
              prepend-icon="mdi-plus-circle"
              class="mr-4 home-chip mt-2"
              color="white"
              @click="goto(chip.routeName)"
            >
              {{ chip.text }}
            </v-chip>
          </div>
        </v-row>
      </v-row>
      <h1 class="mt-8 service-title">{{ $t('label.service') }}</h1>
      <ServiceSection
        :title="$t('services.type.vm')"
        :services="services[SERVICE_TYPE.VM] || []"
        class="mt-4 home-service"
      />
      <ServiceSection
        :title="$t('services.type.trustyCloud')"
        :services="services[SERVICE_TYPE.TRUSTY_CLOUD] || []"
        class="mt-6 home-service-1"
      />
      <ServiceSection
        :title="$t('services.type.k8s')"
        :services="services[SERVICE_TYPE.K8S] || []"
        class="mt-6 home-service-2"
      />
    </v-container>
  </div>
</template>
<style lang="scss" scoped>
.home-container {
  max-height: calc(100vh - 56px);
  overflow: auto;
  padding: 0px;
  margin: 0px;
}

.home-title {
  font-size: 40px !important;
  &.public-title {
    background: linear-gradient(
        90deg,
        rgba(46, 102, 215, 1) 0%,
        rgba(187, 48, 218, 1) 100%
      )
      0% 0% no-repeat padding-box;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  &.private-title {
    background: transparent linear-gradient(90deg, #2e66d7 0%, #ff2931 100%) 0%
      0% no-repeat padding-box;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.home-chip {
  background-color: rgb(var(--v-theme-primary));
  padding: 16px;
  height: 44px;
  :deep(.v-chip__content) {
    font-size: 20px !important;
  }
  :deep(.v-chip__prepend) {
    .v-icon {
      font-size: 20px !important;
      margin-right: 8px !important;
    }
  }
}

.home-service {
  :deep(.service-group-title) {
    font-size: 20px !important;
    font-weight: bold;
    background: transparent
      linear-gradient(
        90deg,
        rgba(215, 238, 253, 1) 0%,
        rgba(224, 217, 252, 1) 100%
      );
  }
}

.home-service-1 {
  :deep(.service-group-title) {
    font-size: 20px !important;
    font-weight: bold;
    background: transparent
      linear-gradient(
        90deg,
        rgba(224, 217, 252, 1) 0%,
        rgba(249, 222, 242, 1) 100%
      );
  }
}

.home-service-2 {
  :deep(.service-group-title) {
    font-size: 20px !important;
    font-weight: bold;
    background: transparent
      linear-gradient(
        90deg,
        rgba(248, 215, 233, 1) 0%,
        rgba(253, 243, 191, 1) 100%
      );
  }
}

.subtitle {
  font-size: 20px !important;
}
.copy-icon {
  vertical-align: baseline;
}
.service-title {
  font-size: 32px !important;
}
</style>
