<script setup lang="ts">
import {
  useConfig,
  useProject,
  useUser,
  useGlobal,
  usePortalConfig,
} from '@/store';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useDisplay } from 'vuetify';

import i18n from '../i18n';

import type { TableItem } from '@/interfaces/InfraDataTableInterface';

import NCHC_logo from '@/assets/NCHCLogo.svg';
import MfaSettingDialog from '@/components/MfaSettingDialog.vue';
import TD from '@/components/TdHighlight.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import SearchTextField from '@/components/common/SearchTextField.vue';
import SvgMenuIcon from '@/components/common/SvgMenuIcon.vue';
import { LOG_TYPES, MEMBER_TYPES } from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import version from '@/constants/Version';
import router from '@/router';
import useNavigationDrawerStore from '@/store/NavigationDrawerStore';
import {
  getServices,
  getDeepObj,
  toAdminPanel,
  isPublicSite,
} from '@/utils/utils';

const enableSwitchRegion = import.meta.env.VITE_APP_SWITCH_REGION === 'true';
const portalConfigStore = usePortalConfig();
const { t } = i18n.global;
const configStore = useConfig();
const userStore = useUser();
const route = useRoute();
const globalStore = useGlobal();
const { triggerSnackbar, updateResourceRegion } = globalStore;
const { smAndDown } = useDisplay();
const $isPublicSite = isPublicSite();

const showSvcDlg = ref(false);
const showPrjDlg = ref(false);
const showMfaDlg = ref(false);
const search = ref('');
const projectStore = useProject();
const prjSelected = ref();
const logo = ref(NCHC_logo);
const hideLanguage = ref(false);

const serviceList = computed(() => getServices());

const projectHeaders = computed(() => [
  {
    title: 'ID',
    sortable: true,
    width: '30%',
    key: 'projectSysCode',
  },
  { title: t('label.name'), key: 'name', width: '50%' },
  { title: t('label.role'), key: 'role', width: '20%' },
]);

const resourceRegion = computed(() => globalStore.resourceRegion);

const enableTheme = computed(() => {
  return import.meta.env.VITE_APP_ENABLE_THEME === 'true';
});

const rWDsvcCards = computed(() => {
  return Object.values(serviceList.value).flat();
});

const projectList = computed(() => {
  const list = projectStore.getProjectList ?? [];
  return list.filter(prj => prj.name !== 'administrator');
});

const isAdmin = computed(() => {
  const list = projectStore.getProjectList ?? [];
  return !!list.find(prj => prj.name === 'administrator');
});

const getCurrentRegionText = computed(
  () =>
    resourceRegion.value.find(el => el.value === globalStore.getCurrentRegion)
      ?.displayName ?? ''
);

const goTo = (routerName: string) => {
  const params =
    routerName === PAGE_TYPES.LOGS ? { logType: LOG_TYPES.PROJECT } : undefined;
  void router.push({ name: routerName, params });
};

const toggleNavigationDrawer = () => {
  const navigationDrawerStore = useNavigationDrawerStore();
  navigationDrawerStore.toggleNavigationDrawer();
};

const copyID = (id: string) => {
  void navigator.clipboard.writeText(id);
  triggerSnackbar({ content: t('basic.copied') });
};

const selectRowPrj = (project: any) => {
  prjSelected.value = project;
};

const signOut = () => {
  void userStore.logout();
};

const documentUrl: Record<string, any> = ref({
  tw: `${portalConfigStore.portalConfig.DOCUMENT_URL}/user-guide`,
  en: `${portalConfigStore.portalConfig.DOCUMENT_URL}/user-guide-en`,
});
const gotoDoc = () => {
  window.open(documentUrl.value[i18n.global.locale] as string, '_blank');
};

const submitChangeRegion = (value: string) => {
  updateResourceRegion(value);
  void router.push({ name: PAGE_TYPES.HOME });
};

const getProjectTableTdItem = (item: TableItem, headerKey: string) => {
  if (headerKey === 'role') {
    return item.tenantRole === MEMBER_TYPES.TENANT_MEMBER
      ? t('appBar.project.tenantUser')
      : t('appBar.project.tenantAdmin');
  }
  return getDeepObj(item, headerKey);
};
</script>

<template>
  <v-app-bar
    :class="$isPublicSite ? 'app-bar' : 'app-bar-private'"
    density="comfortable"
  >
    <v-app-bar-nav-icon
      v-if="smAndDown && !route.meta.disableMenu"
      @click="toggleNavigationDrawer"
    />
    <v-img
      :src="logo"
      max-width="150px"
      min-width="150px"
      class="ml-4 cursor-pointer"
      @click="router.push({ name: PAGE_TYPES.HOME })"
    />

    <v-app-bar-title class="ml-2">
      <v-chip
        v-if="!$isPublicSite"
        class="private-chip ml-4"
        density="comfortable"
        variant="text"
      >
        {{ $t('basic.private.site') }}
      </v-chip>

      <!-- 服務 -->
      <v-menu>
        <template #activator="{ props, isActive }">
          <v-btn
            v-if="!smAndDown"
            v-bind="props"
            class="ml-16 text-h6 header-btn"
            :class="{ 'header-btn-active': isActive }"
          >
            <v-icon icon="mdi-list-box-outline" />
            {{ $t('label.service') }}
          </v-btn>
        </template>
        <v-card>
          <v-row no-gutters>
            <v-col
              v-for="serviceType in Object.keys(serviceList)"
              :key="serviceType"
              cols="12"
              sm="6"
              md="4"
            >
              <v-list class="pa-2 service_list">
                <v-list-item class="service-type">
                  {{ $t(`services.type.${serviceType}`) }}
                  <v-divider class="divider mt-2" />
                </v-list-item>
                <template
                  v-for="service in serviceList[serviceType]"
                  :key="service.text"
                >
                  <v-list-item
                    v-if="!service.hide"
                    class="icon-color"
                    @click="goTo(service.routeName || '')"
                  >
                    <component
                      :is="SvgMenuIcon"
                      :icon-name="service.menuIcon"
                    />
                    <span class="service-text">{{ service.text }}</span>
                  </v-list-item>
                </template>
              </v-list>
            </v-col>
          </v-row>
        </v-card>
      </v-menu>
      <v-btn
        v-if="!smAndDown"
        class="ml-6 text-h6"
        :class="{ 'header-active': showPrjDlg }"
        @click="
          showPrjDlg = true;
          prjSelected = projectStore.getCurrentProject;
        "
      >
        <v-icon icon="mdi-view-grid-outline" />
        {{ projectStore.getCurrentProject.name }}
      </v-btn>
    </v-app-bar-title>

    <!-- 語言 -->
    <v-menu v-if="!smAndDown && !hideLanguage" class="language-list-menu">
      <template #activator="{ props, isActive }">
        <v-btn icon :class="{ 'header-active': isActive }" v-bind="props">
          <v-icon icon="mdi-cog-outline" />
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          class="app-bar-list-item"
          :class="{
            'item-selected-color ': $i18n.locale === 'tw',
          }"
          @click="configStore.setLocale('tw')"
        >
          <span>{{ '中文' }}</span>
        </v-list-item>
        <v-list-item
          class="app-bar-list-item"
          :class="{
            'item-selected-color ': $i18n.locale === 'en',
          }"
          @click="configStore.setLocale('en')"
        >
          <span>{{ 'English' }}</span>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- 文件 -->
    <v-menu v-if="!smAndDown" class="language-list-menu">
      <template #activator="{ props, isActive }">
        <v-btn icon :class="{ 'header-active': isActive }" v-bind="props">
          <v-icon icon="mdi-help-circle-outline" />
        </v-btn>
      </template>

      <v-list>
        <v-list-item class="app-bar-list-item" @click="gotoDoc()">
          <span>{{ $t('basic.document') }}</span>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- 區域 -->
    <v-menu v-if="!smAndDown && enableSwitchRegion" class="text-h6">
      <template #activator="{ props, isActive }">
        <v-btn :class="{ 'header-active': isActive }" v-bind="props">
          <v-icon icon="mdi-cloud-outline" />
          {{ getCurrentRegionText }}
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="region in resourceRegion"
          :key="`region-${region.value}`"
          class="app-bar-list-item"
          :class="{
            'item-selected-color ':
              globalStore.getCurrentRegion === region.value,
          }"
          @click="submitChangeRegion(region.value)"
        >
          <span>{{ region.displayName }}</span>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- dark mode -->
    <v-btn
      v-if="enableTheme"
      icon="mdi-theme-light-dark"
      @click="configStore.toggleTheme"
    />

    <div v-if="!smAndDown" class="mr-6">
      <v-menu>
        <template #activator="{ props, isActive }">
          <v-chip
            v-bind="props"
            class="account-chip mr-4"
            :class="{ 'header-active': isActive }"
          >
            <v-icon class="px-2 mr-2">
              {{ 'mdi-account-outline' }}
            </v-icon>
            <span class="btn-text">
              {{ userStore.getUserInfo.displayName }}
            </span>
          </v-chip>
        </template>
        <v-list>
          <v-list-item
            class="app-bar-list-item"
            @click="goTo(PAGE_TYPES.KEY_API)"
          >
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-key-variant</v-icon>
              <span>{{ $t('keyMgnt.key') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="app-bar-list-item" @click="goTo(PAGE_TYPES.LOGS)">
            <v-list-item-title class="menu-item d-flex align-center">
              <component
                :is="SvgMenuIcon"
                icon-name="menu_icon_log"
                class="mr-3 account-menu-component"
              />
              <span>{{ $t('logMgnt') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="isAdmin"
            class="app-bar-list-item"
            @click="toAdminPanel"
          >
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-shield-account</v-icon>
              <span>{{ $t('services.adminPanel') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            class="app-bar-list-item"
            @click="goTo(PAGE_TYPES.SIMULATION)"
          >
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-drama-masks</v-icon>
              <span>{{ $t('simulated.user') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="userStore.isCloudinfraUser"
            class="app-bar-list-item"
            @click="showMfaDlg = true"
          >
            <v-list-item-title class="menu-item d-flex align-center">
              <component
                :is="SvgMenuIcon"
                icon-name="menu_icon_mfa"
                class="mr-3 account-menu-component"
              />
              <span>{{ $t('mfa.dialog.setting.title') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="userStore.isCloudinfraUser"
            class="app-bar-list-item"
            @click="goTo(PAGE_TYPES.CHANGE_PASSWORD)"
          >
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-lock</v-icon>
              <span>{{ $t('appBar.account.changePw') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="app-bar-list-item" @click="signOut()">
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-logout</v-icon>
              <span>{{ $t('appBar.account.logout') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="app-bar-list-item">
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-book-clock-outline</v-icon>
              <span>{{ version.verNo }}</span>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <div v-else class="mr-2">
      <v-menu>
        <template #activator="{ props, isActive }">
          <v-btn icon :class="{ 'header-active': isActive }" v-bind="props">
            <v-icon icon="mdi-dots-vertical" />
          </v-btn>
        </template>
        <v-list>
          <v-list-item class="app-bar-list-item" @click="showPrjDlg = true">
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-apps</v-icon>
              <span>{{ projectStore.getCurrentProject.name }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="app-bar-list-item" @click="showSvcDlg = true">
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-image-multiple</v-icon>
              <span>{{ $t('appBar.services') }}</span>
            </v-list-item-title>
          </v-list-item>
          <template v-if="!hideLanguage">
            <v-list-item class="app-bar-list-item">
              <v-list-item-title class="menu-item d-flex align-center">
                <v-icon class="mr-3">mdi-web</v-icon>
                <span>{{ 'Language' }}</span>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              class="app-bar-list-item"
              @click="configStore.setLocale('tw')"
            >
              <v-list-item-title
                class="menu-item d-flex align-center"
                :class="$i18n.locale === 'tw' ? 'item-selected-color ' : ''"
              >
                <v-icon class="mr-3" color="transparent">mdi-translate</v-icon>
                <span>{{ '中文' }}</span>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              class="app-bar-list-item"
              @click="configStore.setLocale('en')"
            >
              <v-list-item-title
                class="menu-item d-flex align-center"
                :class="$i18n.locale === 'en' ? 'item-selected-color ' : ''"
              >
                <v-icon class="mr-3" color="transparent">mdi-translate</v-icon>
                <span>{{ 'English' }}</span>
              </v-list-item-title>
            </v-list-item>
          </template>
          <template v-if="enableSwitchRegion">
            <v-list-item class="app-bar-list-item">
              <v-list-item-title class="menu-item d-flex align-center">
                <v-icon class="mr-3" icon="mdi-cloud-outline" />
                {{ $t('basic.resource') }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-for="region in resourceRegion"
              :key="`region-xs-${region.value}`"
              class="app-bar-list-item"
              @click="submitChangeRegion(region.value)"
            >
              <v-list-item-title
                class="menu-item d-flex align-center"
                :class="
                  globalStore.getCurrentRegion === region.value
                    ? 'item-selected-color '
                    : ''
                "
              >
                <v-icon class="mr-3" color="transparent">mdi-translate</v-icon>
                <span>{{ region.displayName }}</span>
              </v-list-item-title>
            </v-list-item>
          </template>
          <v-list-item class="app-bar-list-item">
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-account-circle</v-icon>
              <span>{{ userStore.getUserInfo.displayName }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            class="app-bar-list-item"
            @click="goTo(PAGE_TYPES.KEY_API)"
          >
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">
                <!-- mdi-key-variant -->
              </v-icon>
              <span>{{ $t('keyMgnt.key') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="app-bar-list-item" @click="goTo(PAGE_TYPES.LOGS)">
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3" />
              <!-- <component
                :is="SvgMenuIcon"
                icon-name="menu_icon_log"
                class="mr-3 account-menu-component"
              /> -->
              <span>{{ $t('logMgnt') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="isAdmin"
            class="app-bar-list-item"
            @click="toAdminPanel"
          >
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">
                <!-- mdi-shield-account -->
              </v-icon>
              <span>{{ $t('services.adminPanel') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            class="app-bar-list-item"
            @click="goTo(PAGE_TYPES.SIMULATION)"
          >
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">
                <!-- mdi-drama-masks -->
              </v-icon>
              <span>{{ $t('simulated.user') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="userStore.isCloudinfraUser"
            class="app-bar-list-item"
            @click="showMfaDlg = true"
          >
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3" />
              <!-- <component
                :is="SvgMenuIcon"
                icon-name="menu_icon_mfa"
                class="mr-3 account-menu-component"
              /> -->
              <span>{{ $t('mfa.dialog.setting.title') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="userStore.isCloudinfraUser"
            class="app-bar-list-item"
            @click="goTo(PAGE_TYPES.CHANGE_PASSWORD)"
          >
            <v-list-item-title>
              <v-icon class="mr-3">
                <!-- mdi-lock -->
              </v-icon>
              <span>{{ $t('appBar.account.changePw') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="app-bar-list-item" @click="signOut()">
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">
                <!-- mdi-logout -->
              </v-icon>
              <span>{{ $t('appBar.account.logout') }}</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="app-bar-list-item">
            <v-list-item-title class="menu-item d-flex align-center">
              <v-icon class="mr-3">mdi-book-clock-outline</v-icon>
              <span>{{ version.verNo }}</span>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
  <CommonDialog
    v-model:show="showSvcDlg"
    :title="$t('appBar.services')"
    :show-cancel-btn="false"
    :submit-btn-text="$t('basic.cancel')"
  >
    <v-list v-for="(svc, i) in rWDsvcCards" :key="i">
      <v-divider />

      <v-list-item @click="goTo(svc.routeName || '')">
        <v-row no-gutters class="my-2">
          <component
            :is="svc.icon"
            :colorful="true"
            class="service-icon-style"
          />
          <v-list-item class="text-h6">
            {{ svc.text }}
          </v-list-item>
        </v-row>
      </v-list-item>
    </v-list>
  </CommonDialog>

  <CommonDialog
    v-model:show="showPrjDlg"
    :title="$t('appBar.project.selection')"
    :show-cancel-btn="true"
    :submit-btn-text="$t('basic.ok')"
    :submit-callback="() => projectStore.setCurrentProject(prjSelected)"
  >
    <SearchTextField v-model="search" />

    <v-data-table-virtual
      class="ocis-table-border mt-4"
      :headers="projectHeaders"
      :items="projectList"
      :search="search"
    >
      <template #item="{ item }">
        <tr
          :class="{
            'selected-item selected': prjSelected?.id === item.id,
            'cursor-pointer': true,
          }"
          @click="selectRowPrj(item)"
        >
          <TD
            v-for="(header, index) in projectHeaders"
            :key="index"
            :item="getProjectTableTdItem(item, header.key)"
            :is-cursor-pointer="false"
            :is-status="false"
            :search="search"
          >
            <template v-if="header.key === 'id'" #default>
              <v-icon icon="mdi-content-copy" @click="copyID(item.id)" />
            </template>
          </TD>
        </tr>
      </template>
    </v-data-table-virtual>
  </CommonDialog>
  <MfaSettingDialog v-model:show="showMfaDlg" />
</template>

<style lang="scss" scoped>
.app-bar {
  background-color: rgb(var(--v-theme-bg-dashboard-header)) !important;
  color: white !important;
}

.app-bar-private {
  background-color: rgb(var(--v-theme-bg-dashboard-header-private)) !important;
  color: white !important;
}

.private-chip {
  background-color: white;
  font-weight: bold;
  color: #dc0d15;
  height: 32px;
  cursor: default;
  &:hover {
    background-color: white !important;
  }
}

.service-type {
  color: rgb(var(--v-theme-text-service-type)) !important;
  :deep(.v-list-item__content) {
    font-size: 16px !important;
    font-weight: 500;
  }
}

.item-selected-color {
  color: rgb(var(--v-theme-menu-item-selected-color)) !important;
}

.btn-text {
  font-size: 18px !important;
  font-weight: normal;
  text-transform: none;
}

.account-menu {
  background-color: rgb(var(--v-theme-app-bar-menu-bg)) !important;
  min-width: 140px;
  margin-top: 12px;
  margin-left: 12px;
}

.app-bar-list-item {
  background-color: rgb(var(--v-theme-app-bar-list-bg));
  &:hover {
    background-color: rgba(
      var(--v-theme-app-bar-list-hover),
      var(--v-app-bar-list-hover-opacity)
    );
  }
}

.selected-item {
  &.selected {
    background-color: rgb(var(--v-theme-bg-table-row-selected)) !important;
  }
}

.divider {
  color: rgb(var(--v-theme-menu-item-selected-color));
  opacity: 60%;
}

.service_list {
  background-color: transparent;
  color: #000000de;
  min-width: 300px;
  .v-list-item {
    &:hover {
      background-color: transparent !important;
    }
  }
}

.service-icon-style {
  height: 100%;
  max-height: -webkit-fill-available;
  max-height: -moz-available;
  max-height: fill-available;
}

.icon-color:hover {
  color: rgb(var(--v-theme-menu-item-selected-color));
}

.v-btn,
.account-chip {
  &:not(.v-btn--icon, .v-chip) {
    height: 56px !important;
    border-radius: 0px;
    :deep(.v-btn__content) {
      font-size: 20px !important;
      .v-icon {
        font-size: 18px !important;
        margin-right: 8px;
      }
    }
  }
  &.v-btn--icon {
    margin-right: 8px;
    .v-icon {
      font-size: 20px !important;
    }
  }
  &:hover {
    background-color: rgb(var(--v-theme-primary)) !important;
  }
  &.header-btn-active,
  &.header-active {
    background-color: rgba(black, 0.5) !important;
  }
  &.v-chip {
    height: 44px;
    margin-left: 8px;
    :deep(.v-chip__overlay) {
      opacity: 0 !important;
    }
  }
}

.account-menu-component {
  width: 20px !important;
  height: 20px !important;
}

.v-menu {
  :deep(.v-overlay__content) {
    top: 56px !important;
    border: 1px solid rgba(var(--v-theme-border), var(--v-list-border-opacity)) !important;
  }
  :deep(.v-icon) {
    font-size: 20px !important;
  }
}
.service-text {
  margin-left: 12px;
  vertical-align: text-bottom;
}
</style>
