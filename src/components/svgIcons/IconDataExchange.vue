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
        id="Union_7"
        x="6.169"
        y="11.498"
        width="42.498"
        height="37.836"
        filterUnits="userSpaceOnUse"
      >
        <feOffset dy="3" input="SourceAlpha" />
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood flood-opacity="0.161" />
        <feComposite operator="in" in2="blur" />
        <feComposite in="SourceGraphic" />
      </filter>
    </defs>
    <g id="icon_資料交換服務_56" transform="translate(-36 -81)">
      <circle
        id="Ellipse_1064"
        data-name="Ellipse 1064"
        cx="28"
        cy="28"
        r="28"
        transform="translate(36 81)"
        :fill="iconColor.round"
      />
      <g id="move_up_black_24dp" transform="translate(50 95)">
        <rect
          id="Rectangle_2157"
          data-name="Rectangle 2157"
          width="28"
          height="28"
          fill="none"
        />
        <g transform="matrix(1, 0, 0, 1, -14, -14)" filter="url(#Union_7)">
          <path
            id="Union_7-2"
            data-name="Union 7"
            d="M11430,18262.334a8.167,8.167,0,0,1-.967-16.275v-.068l-1.843-1.848,1.646-1.645,4.666,4.656-4.666,4.68-1.646-1.645,1.737-1.752A5.832,5.832,0,0,0,11430,18260h3.5v2.332Zm5.834,0v-8.162h10.5v8.162Zm2.333-2.328H11444v-3.5h-5.835Zm-2.333-8.168v-8.168h10.5v8.168Z"
            transform="translate(-11406.67 -18225)"
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
  return getSvgThemeColor(props.colorful, IconKeys.data_exchange);
});
</script>
