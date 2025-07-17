<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref } from 'vue';

import i18n from '@/i18n';
const { t } = i18n.global;

interface CommandItem {
  name: string;
  content: string;
}

defineProps({
  title: {
    type: String,
    default: 'Reference Button',
  },
  description: {
    type: String,
    default: 'Reference Desc',
  },
  items: {
    type: Array<CommandItem>,
    default: () => [],
  },
});

const { triggerSnackbar } = useGlobal();

const commandMenu = ref(false);
const handleCopyToClipboard = async (index: number, command: string) => {
  await navigator.clipboard.writeText(command);
  triggerSnackbar({ content: t('basic.copied') });
};
</script>

<template>
  <v-menu
    v-model="commandMenu"
    :close-on-content-click="false"
    transition="scale-transition"
    :max-width="500"
  >
    <template #activator="{ props }">
      <v-btn class="btn-menu" variant="flat" v-bind="props">
        <span class="command-btn-text">
          {{ title }}
        </span>
        <v-icon v-if="commandMenu" size="24">mdi-menu-up</v-icon>
        <v-icon v-else size="24">mdi-menu-down</v-icon>
      </v-btn>
    </template>

    <v-list lines="three" class="pa-3 pr-0">
      <v-list-subheader class="subheader">
        {{ description }}
      </v-list-subheader>

      <v-list-item v-for="(cmd, index) in items" :key="index">
        <v-list-item-title>
          <div class="command-title-format">
            {{ cmd.name }}
          </div>
        </v-list-item-title>
        <v-list-item-title class="d-flex align-center">
          <div class="command-text-format">
            {{ cmd.content }}
            <v-tooltip activator="parent" location="bottom">
              {{ cmd.content }}
            </v-tooltip>
          </div>

          <v-icon
            class="copy-icon-menu"
            @click="handleCopyToClipboard(index, cmd.content)"
          >
            mdi-content-copy
          </v-icon>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped lang="scss">
.subheader {
  align-items: center;
  display: flex;
  height: 48px;
  font-size: 16px !important;
  font-weight: 500;
  padding: 0 24px;
  color: var(--text-general);
}
.command-btn-text {
  color: var(--text-general);
}

.btn-menu {
  height: 40px;
  border: rgba(var(--v-theme-border), var(--v-border-opacity)) 1px solid;
  background-color: white;
}

.copy-icon-menu {
  margin-left: 18px;
  width: 19px;
  height: 22px;
}

.command-title-format {
  width: 250px;
  margin-bottom: 14px;
  color: #00000099;
}

.command-text-format {
  text-overflow: ellipsis;
  clear: both;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  width: 400px;
}
</style>
