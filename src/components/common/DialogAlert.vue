<script lang="ts">
import MessageWithLink from '@/components/common/MessageWithLink.vue';

export default {
  name: 'DialogAlert',
};
</script>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: '',
  },
  messageWithLink: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <v-alert class="dialog-alert pt-5 pb-2 px-0" icon="mdi-alert">
    <MessageWithLink v-if="messageWithLink" :message="message" />
    <span v-else>{{ message }}</span>
  </v-alert>
</template>

<style lang="scss" scoped>
.dialog-alert {
  background-color: transparent !important;
  min-height: 48px;
  border-width: 0;
  color: rgb(var(--v-theme-text-general)) !important;

  :deep(.v-icon) {
    color: rgb(var(--v-theme-error)) !important;
  }
}
</style>
