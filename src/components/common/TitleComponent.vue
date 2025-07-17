<template>
  <v-row class="mx-0 title-layout mb-4" no-gutters>
    <v-col class="pa-0">
      <div>
        <span class="title-text">
          {{ title }}
        </span>
        <!-- For Learn More-->
        <ExternalLink v-if="linkUrl" :link="linkData" />
        <!-- For common link -->
        <ExternalLink v-if="link" :link="link" />
        <InfoTooltip v-if="tooltip" :tooltip="tooltip" class="ml-1" />
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, type Ref, type PropType, watch } from 'vue';

import type { ExternalLinkItem } from '@/interfaces/LayoutItemInterface';

import ExternalLink from '@/components/common/ExternalLink.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';
import i18n from '@/i18n';

const { t } = i18n.global;
const linkData: Ref<ExternalLinkItem> = ref<ExternalLinkItem>({
  text: '',
  linkTo: '',
});

// Props
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  tooltip: {
    type: String,
    default: '',
  },
  link: {
    type: Object as PropType<ExternalLinkItem>,
    default: null,
  },
  linkUrl: {
    type: Object as PropType<Record<string, string>>,
    default: () => {},
  },
});

const init = () => {
  linkData.value = {
    text: '',
    linkTo: '',
  };
  if (props.linkUrl) {
    linkData.value = {
      text: t('basic.understand'),
      linkTo: props.linkUrl[i18n.global.locale],
      isBreakLine: false,
    };
  }
};
init();

watch(
  () => i18n.global.locale,
  () => {
    init();
  }
);
</script>

<style lang="scss" scoped>
.title-layout {
  width: -webkit-fill-available;
  width: -moz-available;
}
span .v-icon {
  vertical-align: unset;
}
.title-text {
  font-size: 32px !important;
}
</style>
