<template>
  <v-dialog
    v-model="showDialog"
    :width="width"
    :min-width="360"
    scrollable
    :persistent="persistent"
  >
    <v-card class="px-2">
      <v-card-title class="text-h6 pa-4">
        {{ title }}
        <ExternalLink v-if="externalLink" :link="externalLink" />
        <InfoTooltip v-if="titleTooltip" :tooltip="titleTooltip" />
      </v-card-title>

      <slot name="info" />

      <v-card-text class="px-4 pt-2 pb-6">
        <slot />
        <DialogAlert v-if="alert" :message="alert" />
      </v-card-text>

      <slot name="custom-alert" />

      <v-card-actions class="mt-3">
        <slot name="actions-prepend" />
        <v-spacer />
        <TextBtn
          v-show="showCancelBtn"
          :text="cancelBtnText ? cancelBtnText : $t('basic.cancel')"
          @click="handleClose"
        />
        <slot name="more-actions" />
        <ContainedBtn
          v-show="submitBtnHighlight && showSubmitBtn"
          :text="submitBtnText ? submitBtnText : $t('basic.ok')"
          :disabled="disableSubmit"
          class="ml-2"
          @click="handleSubmit"
        />
        <TextBtn
          v-show="!submitBtnHighlight && showSubmitBtn"
          :text="submitBtnText ? submitBtnText : $t('basic.ok')"
          :disabled="disableSubmit"
          @click="handleSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

import type { ExternalLinkItem } from '@/interfaces/LayoutItemInterface';

import DialogAlert from '@/components/common/DialogAlert.vue';
import ExternalLink from '@/components/common/ExternalLink.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  disableSubmit: {
    type: Boolean,
    default: false,
  },
  persistent: {
    type: Boolean,
    default: true,
  },
  showSubmitBtn: {
    type: Boolean,
    default: true,
  },
  showCancelBtn: {
    type: Boolean,
    default: true,
  },
  submitBtnText: {
    type: String,
    default: '',
  },
  cancelBtnText: {
    type: String,
    default: '',
  },
  alert: {
    type: String,
    default: '',
  },
  disableAutoCloseDialog: {
    type: Boolean,
    default: false,
  },
  externalLink: {
    type: Object as PropType<ExternalLinkItem>,
    default: null,
  },
  titleTooltip: {
    type: String,
    default: '',
  },
  width: {
    type: [Number, String],
    default: 800,
  },
  submitCallback: {
    type: Function,
    default: undefined,
  },
  cancelCallback: {
    type: Function,
    default: undefined,
  },
  submitBtnHighlight: {
    type: Boolean,
    default: false,
  },
});

const handleSubmit = () => {
  if (!props.disableAutoCloseDialog) {
    showDialog.value = false;
  }
  props.submitCallback?.();
};
const handleClose = () => {
  if (!props.disableAutoCloseDialog) {
    showDialog.value = false;
  }
  props.cancelCallback?.();
};
</script>
