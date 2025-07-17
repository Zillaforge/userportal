<template>
  <span class="ocis-action-button-style">
    <IconBtn
      :tooltip="btnTips"
      :icon="btnIcon"
      :is-svg-icon="isSvgIcon"
      :disabled="btn?.disabled"
      :visible="btn?.visible"
      @click="handleClick"
    />
  </span>
</template>
<script setup lang="ts">
import IconBtn from '@/components/common/button/IconBtn.vue';

const emit = defineEmits(['itemClick']);
defineProps({
  btn: {
    type: Object,
    required: true,
  },
  btnIcon: {
    type: String,
    required: true,
  },
  isSvgIcon: {
    type: Boolean,
    default: false,
  },
  btnTips: {
    type: String,
    default: '',
  },
});

const handleClick = () => {
  emit('itemClick');
};
</script>
