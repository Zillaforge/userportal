<script setup lang="ts">
import { useGlobal, useConfig } from '@/store';
import { storeToRefs } from 'pinia';
import {
  computed,
  nextTick,
  ref,
  watch,
  type ComputedRef,
  type Ref,
  type WritableComputedRef,
} from 'vue';
import { useRoute } from 'vue-router';

import { useTheme } from 'vuetify';

import GlobalSnackbar from './components/common/GlobalSnackbar.vue';

import type MenuItem from '@/interfaces/MenuItemInterface';
import type { BreadcrumbItem } from '@/utils/getBreadcrumbs';

import AppBar from '@/components/AppBar.vue';
import GlobalDialog from '@/components/GlobalDialog.vue';
import MenuLeft from '@/components/MenuLeft.vue';
import ProgressDialog from '@/components/ProgressDialog.vue';
import Breadcrumbs from '@/components/common/BreadcrumbsComponent.vue';
import i18n from '@/i18n';
// Components
import getBreadcrumbs from '@/utils/getBreadcrumbs';
import getMenuLeft from '@/utils/getMenuLeft';

const route = useRoute();

/** Vuetify Theme */
const theme = useTheme();

/** Global Store */
const globalStore = useGlobal();
const { breadcrumbsParams } = storeToRefs(globalStore);

/** Config Store */
const configStore = useConfig();

const breadcrumbs = ref<BreadcrumbItem[]>([]);
const menuleft = ref<MenuItem[]>([]);
const updateBreadcrumbs = () => {
  try {
    breadcrumbs.value = getBreadcrumbs(
      route.name,
      globalStore.getBreadcrumbsParams
    );
  } catch (e) {}
};

const updateMenuLeft = () => {
  try {
    menuleft.value = getMenuLeft(route.name);
  } catch (e) {}
};
updateBreadcrumbs();
updateMenuLeft();
/** loading overlay visibility */
const loading: WritableComputedRef<boolean> = computed({
  get: () => globalStore.loading,
  set: v => globalStore.setLoading(v),
});

/** Snackbar visibility */
const snackbarVisibility: Ref<boolean> = ref(false);

/** Snackbar text */
const snackbarText: ComputedRef<string> = computed(() => globalStore.message);

/** Toggle Dark mode */
const isDark: ComputedRef<string> = computed(() =>
  configStore.theme ? 'myCustomDarkTheme' : 'myCustomLightTheme'
);

watch([() => route.name, breadcrumbsParams], () => {
  updateBreadcrumbs();
  updateMenuLeft();
});

watch(
  () => i18n.global.locale,
  () => {
    updateBreadcrumbs();
    updateMenuLeft();
  }
);

watch(
  () => globalStore.getBreadcrumbsParams,
  () => updateBreadcrumbs()
);

// When snackbar text has been set, show snackbar.
watch(
  () => globalStore.message,
  message => (snackbarVisibility.value = message !== '')
);

/** Clear store when snackbar hide */
const onSnackbarChanged = async () => {
  globalStore.setMessage();
  await nextTick();
};
</script>

<template>
  <v-app :theme="isDark">
    <AppBar v-if="!route.meta.disableBars" />
    <v-main class="main">
      <router-view v-slot="{ Component, route: currentRoute }">
        <div v-if="!route.meta.disableMenu" class="ocis-left-menu">
          <MenuLeft :menu-content="menuleft" />
        </div>
        <div class="content">
          <div
            v-if="!route.meta.disableBreadcrumbs"
            class="breadcrumbs-content"
          >
            <Breadcrumbs :breadcrumbs="breadcrumbs" />
          </div>
          <component :is="Component" :key="currentRoute.name" />
        </div>
      </router-view>
    </v-main>
    <GlobalDialog />
    <ProgressDialog />
    <GlobalSnackbar />

    <v-overlay v-model="loading" app class="justify-center align-center">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>

    <v-snackbar
      v-model="snackbarVisibility"
      @update:model-value="onSnackbarChanged"
    >
      {{ snackbarText }}
      <template #actions>
        <v-btn icon="mdi-close" @click="onSnackbarChanged" />
      </template>
    </v-snackbar>
  </v-app>
  <teleport to="head">
    <meta
      name="theme-color"
      :content="theme.computedThemes.value[isDark].colors.primary"
    />
    <!-- <link rel="icon" :href="logo" type="image/svg+xml" /> -->
  </teleport>
</template>

<style lang="scss">
@use 'vuetify/_settings';

html {
  // Fix always scrollbar shown.
  overflow-y: auto !important;
}

// Fix app-bar's progress-bar
.v-app-bar .v-progress-linear {
  position: absolute;
  bottom: 0;
}

.main {
  background-color: rgb(var(--v-theme-bg-main));
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.breadcrumbs-content {
  min-width: calc(var(--v-content-min-width) - var(--v-menu-width));
  margin: 0px !important;
  padding: 12px 0px;
  align-content: flex-start;
  height: auto;
  overflow: hidden;
}
</style>
