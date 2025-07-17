<script setup lang="ts">
import { ref, computed } from 'vue';

import OptionCard from '@/components/common/OptionCard.vue';
import TabsComponent from '@/components/common/TabsComponent.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';
import i18n from '@/i18n';
const props = defineProps({
  title: {
    type: String,
    default: 'Image Selector',
  },
  dialogTitle: {
    type: String,
    default: 'Dialog Title',
  },
  displayItems: {
    type: Object,
    default: () => {
      return {
        public: [],
        private: [],
      };
    },
  },
  displayTabs: {
    type: Object,
    default: () => {
      return { public: 'Public', private: 'Private' };
    },
  },
  selected: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['close', 'update', 'formError']);
const { t } = i18n.global;
const handleCardClick = (event: any, type: string) => {
  open.value = false;
  emits('update', event, type);
};

const open = ref(false);
const tabNames = computed(() => {
  return Object.values(props.displayTabs);
});
const tabKeys = computed(() => {
  return Object.keys(props.displayTabs);
});

const showWarning = ref(false);
const validate = () => {
  showWarning.value = props.required && !props.selected;
  emits('formError', showWarning.value ? t('form.required') : '');
};
defineExpose({ validate });
</script>

<template>
  <v-dialog v-model="open" max-width="70%" scrollable>
    <template #activator="{ props: activatorProps }">
      <div class="my-4">
        <v-row no-gutters>
          <v-col cols="3">
            <span :class="{ 'ocis-input-required': required }">
              {{ title }}
            </span>
          </v-col>
          <v-col>
            <OutlinedBtn v-bind="activatorProps" :text="$t('basic.select')" />
            <span class="pl-4">{{ selected }}</span>
            <span
              v-if="required && !selected && showWarning"
              class="pl-4 ocis-text-alert"
            >
              {{ $t('form.required') }}
            </span>
          </v-col>
        </v-row>
      </div>
    </template>

    <template #default="{ isActive }">
      <v-card :title="dialogTitle" class="pa-1">
        <v-card-text>
          <TabsComponent :tab-names="tabNames">
            <template
              v-for="(tabName, index) in tabNames"
              :key="index"
              #[`tab-${index}`]
            >
              <v-row class="pt-2">
                <v-divider class="mt-1" />
                <v-col
                  v-for="(item, idx) in displayItems[tabKeys[index]]"
                  :key="idx"
                  cols="6"
                >
                  <OptionCard
                    :item="item"
                    @update="event => handleCardClick(event, tabKeys[index])"
                  >
                    <template #info>
                      <span class="line-break">{{ item.info }}</span>
                    </template>
                  </OptionCard>
                </v-col>
              </v-row>
            </template>
          </TabsComponent>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <TextBtn :text="$t('basic.cancel')" @click="isActive.value = false" />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
<style lang="scss" scoped>
.line-break {
  word-break: break-word;
}
</style>
