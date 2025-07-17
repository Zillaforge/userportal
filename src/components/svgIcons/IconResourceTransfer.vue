<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="56"
    height="56"
    viewBox="0 0 56 56"
  >
    <defs>
      <filter
        id="Path_22847"
        x="5"
        y="12"
        width="46"
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
    <g id="icon_資源轉移服務_56" transform="translate(12978 17745)">
      <circle
        id="Ellipse_1116"
        data-name="Ellipse 1116"
        cx="28"
        cy="28"
        r="28"
        transform="translate(-12978 -17745)"
        :fill="iconColor.round"
      />
      <g id="screen_share_24dp_5F6368" transform="translate(-12964 -17731)">
        <path
          id="Path_22846"
          data-name="Path 22846"
          d="M0,0H28V28H0Z"
          fill="none"
        />
        <g transform="matrix(1, 0, 0, 1, -14, -14)" filter="url(#Path_22847)">
          <path
            id="Path_22847-2"
            data-name="Path 22847"
            d="M23.333,21.5A2.419,2.419,0,0,0,25.655,19l.012-12.5A2.42,2.42,0,0,0,23.333,4H4.667A2.413,2.413,0,0,0,2.333,6.5V19a2.42,2.42,0,0,0,2.333,2.5H0V24H28V21.5ZM4.667,19V6.5H23.333V19.013Zm10.5-8.587c-4.538.675-6.347,4-7,7.337,1.622-2.337,3.757-3.4,7-3.4v2.738l4.667-4.675L15.167,7.75Z"
            transform="translate(14 14)"
            :fill="iconColor.icon"
          />
        </g>
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
  return getSvgThemeColor(props.colorful, IconKeys.resource_transfer);
});
</script>
