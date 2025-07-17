<template>
  <!-- eslint-disable vue/no-use-v-if-with-v-for -->
  <v-navigation-drawer
    v-model="showDrawer"
    :temporary="smAndDown"
    mobile-breakpoint="sm"
    :width="displayConfig(configType.MENU_WIDTH)"
    location="left"
    class="navigation-style"
  >
    <v-list v-model:opened="opened" class="py-0">
      <template v-for="(item, index) in content" :key="'v-list-' + index">
        <!-- single item -->
        <v-list-item
          v-show="
            !item.hide &&
            (item.assessKey ? access[item.assessKey] : true) &&
            !item.group
          "
          :title="item.title"
          :class="onColor[index] ? 'selected-list-item' : 'list-item'"
          @click="goto(item)"
        >
          <template #prepend>
            <div class="menu-prepend-icon-style">
              <v-icon
                v-if="item.icon"
                :size="displayConfig(configType.ITEM_ICON_SIZE, item)"
              >
                {{ item.icon }}
              </v-icon>
              <component
                :is="SvgMenuIcon"
                v-else-if="item.iconName"
                :icon-name="item.iconName"
                :selected="onColor[index]"
              />
              <v-img
                v-else-if="item.img"
                :src="item.img"
                :height="displayConfig(configType.ITEM_ICON_SIZE, item)"
                :width="displayConfig(configType.ITEM_ICON_SIZE, item)"
              />
            </div>
          </template>
        </v-list-item>

        <!-- group item-->
        <v-list-group
          v-show="
            !item.hide &&
            (item.assessKey ? access[item.assessKey] : true) &&
            item.group
          "
          :value="item.title"
        >
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="item.title"
              :class="'list-item'"
            >
              <template #prepend>
                <div class="menu-prepend-icon-style">
                  <v-icon
                    v-if="item.icon"
                    :icon="item.icon"
                    :color="
                      onColor[index] && false
                        ? 'selected-list-item'
                        : 'list-item'
                    "
                    :size="displayConfig(configType.ITEM_ICON_SIZE, item)"
                  />
                  <component
                    :is="SvgMenuIcon"
                    v-else-if="item.iconName"
                    :icon-name="item.iconName"
                    :selected="onColor[index] && false"
                  />
                  <v-img
                    v-else-if="item.img"
                    :src="item.img"
                    :height="displayConfig(configType.ITEM_ICON_SIZE, item)"
                    :width="displayConfig(configType.ITEM_ICON_SIZE, item)"
                  />
                </div>
              </template>
            </v-list-item>
          </template>
          <v-list-item
            v-for="(subItem, i) in item.group"
            v-show="
              !subItem.hide &&
              (subItem.assessKey ? access[subItem.assessKey] : true) &&
              !subItem.subgroup
            "
            :key="'subItem-' + i"
            :class="subItem.onColor ? 'selected-list-item' : 'list-item'"
            :title="subItem.title"
            @click="goto(subItem)"
          />
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
  <v-btn
    v-if="!smAndDown"
    class="toggle-btn"
    @click.stop="showDrawer = !showDrawer"
  >
    <v-icon>
      {{ showDrawer ? 'mdi-menu-left' : 'mdi-menu-right' }}
    </v-icon>
    <v-tooltip activator="parent" location="end">
      {{
        showDrawer ? $t('navigationDrawer.hide') : $t('navigationDrawer.show')
      }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useDisplay } from 'vuetify';

import type MenuItem from '@/interfaces/MenuItemInterface';

import SvgMenuIcon from '@/components/common/SvgMenuIcon.vue';
import { Constants } from '@/constants/Constants';
import useNavigationDrawerStore from '@/store/NavigationDrawerStore';

const showDrawer = ref(true);
const route = useRoute();
const router = useRouter();
const { smAndDown } = useDisplay();
const navigationDrawerStore = useNavigationDrawerStore();
const onColor: Ref<boolean[]> = ref([]);
const opened: Ref<string[]> = ref([]);
const access: Ref<Record<string, any>> = ref({}); // TBD
const configType = {
  APP_BAR_HEIGHT_PX: 0,
  ITEM_ICON_SIZE: 1,
  MENU_WIDTH: 2,
  MENU_FOOTER_BTN_SIZE: 3,
  MENU_FOOTER_ICON_SIZE: 4,
};

const props = defineProps({
  content: {
    type: Array<any>,
    default: () => [],
  },
});

const goto = (item: MenuItem) => {
  /**
   *  samePathCallback的目的是為了解決點擊相同頁面的link時不會重新整理的問題
   *  方法是比對現在的route名稱:"this.$router.app.$route.name" 和目標route名稱:"item.routeName"
   **/
  if (item.routeName === route.name) {
    if (
      item.samePathCallback &&
      Object.prototype.hasOwnProperty.call(item, 'samePathCallback')
    ) {
      // if (item.hasOwnProperty('samePathCallback')) {
      // 只處理有設samePathCallback的連結
      item.samePathCallback();
    } else {
      void router.push({
        name: item.routeName,
        params: item.routeParams,
      });
    }
  } else if (item.routeName) {
    void router.push({ name: item.routeName, params: item.routeParams });
  } else if (item.linkUrl && item.linkUrl !== undefined) {
    window.open(item.linkUrl, '_blank', 'noopener, noreferrer');
  }
};

const initTitleColor = () => {
  const currentPath = router.currentRoute.value.path?.toLowerCase();
  props.content.forEach((element, idx) => {
    onColor.value[idx] = false;
    if (!element.group && element.relatedPath) {
      element.relatedPath.some((path: string) => {
        if (currentPath.includes(path.toLowerCase())) {
          onColor.value[idx] = true;
          opened.value = [element.title];
          return true;
        } else return false;
      });
    } else if (element.group) {
      element.group.forEach((subItem: MenuItem) => {
        if (subItem.relatedPath) {
          for (const path of subItem.relatedPath) {
            subItem.onColor = false;
            if (currentPath.includes(path.toLowerCase())) {
              onColor.value[idx] = true;
              subItem.onColor = true;
              opened.value = [element.title];
              break;
            }
          }
        }
      });
    }
  });
};

const init = () => {
  initTitleColor();
};

init();

const displayConfig = (type: number, item?: MenuItem) => {
  switch (type) {
    case configType.APP_BAR_HEIGHT_PX:
      return String(Constants.APP_BAR_HEIGHT_PX);
    case configType.ITEM_ICON_SIZE:
      if (!item) return '';
      else {
        return item.iconSize
          ? String(item.iconSize)
          : String(Constants.MENU_ICON_DEFAULT_SIZE);
      }
    case configType.MENU_WIDTH:
      return String(Constants.MENU_NORMAL_WIDTH);
    case configType.MENU_FOOTER_BTN_SIZE:
      return String(Constants.MENU_FOOTER_BTN_SIZE);
    case configType.MENU_FOOTER_ICON_SIZE:
      return String(Constants.MENU_FOOTER_ICON_SIZE);
    default:
      return '';
  }
};

watch(
  () => [router.currentRoute.value.path, props.content],
  () => initTitleColor()
);

const storeShowValue = computed(
  () => navigationDrawerStore.showNavigationDrawer
);
watch(storeShowValue, val => {
  showDrawer.value = val;
});

watch(
  smAndDown,
  val => {
    showDrawer.value = !val;
  },
  { immediate: true }
);
watch(showDrawer, val => {
  if (!val && smAndDown) {
    navigationDrawerStore.toggleNavigationDrawer(false);
  }
});
</script>

<style lang="scss" scoped>
.list-item {
  color: rgba(var(--v-theme-menu-text), var(--v-text-general-opacity));
  &:hover {
    background-color: rgba(
      var(--v-theme-drawer-item-selected-color),
      var(--v-drawer-item-hover-opacity)
    );
  }
}
.selected-list-item {
  color: rgb(var(--v-theme-menu-item-selected-color));
  background-color: rgba(
    var(--v-theme-drawer-item-selected-color),
    var(--v-drawer-item-selected-opacity)
  );
  box-shadow: inset 6px 0 rgb(var(--v-theme-primary));
  &:hover {
    background-color: rgba(
      var(--v-theme-drawer-item-selected-color),
      var(--v-drawer-item-selected-hover-opacity)
    );
  }
}

.navigation-style {
  height: 100%;
  min-height: calc(100vh - var(--v-footer-height-px)) !important;
  background-color: rgb(var(--v-theme-app-bar-menu-bg)) !important;
}

.menu-prepend-icon-style {
  width: 54px;
  align-items: center;
  align-self: center;
}

.menu-footer-btn:hover {
  background-color: #ffffff33 !important;
}
.menu-footer-btn {
  margin: 0px !important;
}
.menu-footer-btn.v-btn--floating .v-btn__content {
  height: auto !important;
}

.menu-footer-style {
  height: 48px !important;
  align-items: center;
  align-self: center;
  display: flex;
}

.menu-divider-style {
  color: white;
}

.menu-footer-padding {
  padding-left: 28px;
}

.toggle-btn {
  min-width: auto;
  padding: 0px;
  position: absolute;
  top: calc(50% + 32px - 18px);
  z-index: 1999;
  border: 1px solid #00000042;
  box-shadow: 0px 1px 2px #00000029;
  border-radius: 0px 8px 8px 0px;
  &:hover {
    border: 2px solid rgba(var(--v-theme-primary));
  }
}
</style>
