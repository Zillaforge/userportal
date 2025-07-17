<script lang="ts">
import { ref, onMounted, type Ref, watch } from 'vue';

import { VCard } from 'vuetify/components';

export default {
  name: 'TabsComponent',
};
</script>

<script setup lang="ts">
const props = defineProps({
  tabNames: {
    type: Array<string>,
    default: () => [],
  },
  modelValue: {
    type: Number,
    default: 0,
  },
  isCardStyle: {
    type: Boolean,
    default: false,
  },
});

const currentIndex: Ref<number> = ref(0);

const emit = defineEmits(['update:modelValue']);

const init = () => {
  if (props.modelValue > 0) {
    currentIndex.value = props.modelValue;
  }
};

onMounted(() => {
  init();
});

watch(
  () => props.modelValue,
  newVal => {
    currentIndex.value = newVal;
  }
);
watch(
  () => currentIndex.value,
  newVal => {
    if (newVal !== props.modelValue) emit('update:modelValue', newVal);
  }
);
</script>

<template>
  <component :is="isCardStyle ? VCard : 'div'" class="tab-component">
    <div class="tabs">
      <v-tabs
        v-model="currentIndex"
        color="primary"
        density="compact"
        height="48"
      >
        <v-tab
          v-for="(tab, index) in tabNames"
          :key="`tab${index}`"
          :value="index"
        >
          {{ tab }}
        </v-tab>
      </v-tabs>
    </div>
    <div class="tab-windows">
      <v-tabs-window v-model="currentIndex">
        <v-tabs-window-item
          v-for="(tab, index) in tabNames"
          :key="`tab-window-${index}`"
          :value="index"
        >
          <slot :name="`tab-${index}`" />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </component>
</template>

<style lang="scss" scoped>
.tab-component {
  width: 100%;
  .tabs {
    border-bottom: 1px solid
      rgba(var(--v-theme-border), var(--v-border-opacity)) !important;
  }
  &.v-card {
    border: 1px solid rgba(var(--v-theme-border), var(--v-border-opacity)) !important;
    box-shadow: 0px 2px 6px rgba(var(--v-theme-border), var(--v-border-opacity)) !important;
    .tabs {
      box-shadow: 0px 2px 6px
        rgba(var(--v-theme-border), var(--v-border-opacity)) !important;
    }
  }
}

.tabs {
  height: 48px !important;
  .v-btn {
    :deep(.v-ripple__container) {
      color: rgb(var(--v-theme-ripple-color));
    }
    :deep(.v-ripple__animation--in) {
      opacity: var(--v-ripple-opacity) !important;
    }
    &:hover {
      background-color: rgba(
        var(--v-theme-bg-btn-texted-active),
        var(--v-bg-btn-texted-active-opacity)
      ) !important;
    }
    :deep(.v-btn__overlay) {
      opacity: 0 !important;
    }
  }
}
</style>
