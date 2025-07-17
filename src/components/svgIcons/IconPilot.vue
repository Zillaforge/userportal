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
        id="Path_22713"
        x="7.333"
        y="11.5"
        width="41.333"
        height="39"
        filterUnits="userSpaceOnUse"
      >
        <feOffset dy="3" input="SourceAlpha" />
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood flood-opacity="0.161" />
        <feComposite operator="in" in2="blur" />
        <feComposite in="SourceGraphic" />
      </filter>
    </defs>
    <g id="icon_前導案介接服務_56" transform="translate(-36 -81)">
      <circle
        id="Ellipse_1064"
        data-name="Ellipse 1064"
        cx="28"
        cy="28"
        r="28"
        transform="translate(36 81)"
        :fill="iconColor.round"
      />
      <g id="account_tree_black_24dp" transform="translate(50 95)">
        <path
          id="Path_22712"
          data-name="Path 22712"
          d="M0,0H28V28H0Z"
          fill="none"
        />
        <g transform="matrix(1, 0, 0, 1, -14, -14)" filter="url(#Path_22713)">
          <path
            id="Path_22713-2"
            data-name="Path 22713"
            d="M25.333,12.333V3H17.167V6.5h-7V3H2v9.333h8.167v-3.5H12.5V20.5h4.667V24h8.167V14.667H17.167v3.5H14.833V8.833h2.333v3.5Z"
            transform="translate(14.33 14.5)"
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
  return getSvgThemeColor(props.colorful, IconKeys.pilot);
});
</script>
