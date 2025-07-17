<template>
  <svg
    id="icon_應用服務_APP_56"
    data-name="icon_應用服務 APP_56"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="56"
    height="56"
    viewBox="0 0 56 56"
  >
    <defs>
      <filter
        id="Path_17243"
        x="9"
        y="12"
        width="38"
        height="38"
        filterUnits="userSpaceOnUse"
      >
        <feOffset dy="3" input="SourceAlpha" />
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood flood-opacity="0.161" />
        <feComposite operator="in" in2="blur" />
        <feComposite in="SourceGraphic" />
      </filter>
    </defs>
    <circle
      id="Ellipse_1064"
      data-name="Ellipse 1064"
      cx="28"
      cy="28"
      r="28"
      :fill="iconColor.round"
    />
    <g id="apps_black_24dp" transform="translate(14 14)">
      <path
        id="Path_17242"
        data-name="Path 17242"
        d="M0,0H28V28H0Z"
        fill="none"
      />
      <g transform="matrix(1, 0, 0, 1, -14, -14)" filter="url(#Path_17243)">
        <path
          id="Path_17243-2"
          data-name="Path 17243"
          d="M4,9H9V4H4Zm7.5,15h5V19h-5ZM4,24H9V19H4Zm0-7.5H9v-5H4Zm7.5,0h5v-5h-5ZM19,4V9h5V4ZM11.5,9h5V4h-5ZM19,16.5h5v-5H19ZM19,24h5V19H19Z"
          transform="translate(14 14)"
          :fill="iconColor.icon"
        />
      </g>
    </g>
  </svg>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

import useSvgIcons from '@/composables/useSvgIcons';

const props = defineProps({
  colorful: {
    type: Boolean,
    default: true,
  },
});
const { getSvgThemeColor, IconKeys } = useSvgIcons();
const iconColor = computed(() => {
  return getSvgThemeColor(props.colorful, IconKeys.application);
});
</script>
