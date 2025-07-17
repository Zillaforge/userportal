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
        id="Path_17254"
        x="7.333"
        y="10.334"
        width="41.333"
        height="41.334"
        filterUnits="userSpaceOnUse"
      >
        <feOffset dy="3" input="SourceAlpha" />
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood flood-opacity="0.161" />
        <feComposite operator="in" in2="blur" />
        <feComposite in="SourceGraphic" />
      </filter>
    </defs>
    <g id="icon_虛擬網路_56" transform="translate(-36 -81)">
      <circle
        id="Ellipse_1064"
        data-name="Ellipse 1064"
        cx="28"
        cy="28"
        r="28"
        transform="translate(36 81)"
        :fill="iconColor.round"
      />
      <g id="language_black_24dp" transform="translate(50 95)">
        <path
          id="Path_17253"
          data-name="Path 17253"
          d="M0,0H28V28H0Z"
          fill="none"
        />
        <g transform="matrix(1, 0, 0, 1, -14, -14)" filter="url(#Path_17254)">
          <path
            id="Path_17254-2"
            data-name="Path 17254"
            d="M13.655,2A11.667,11.667,0,1,0,25.333,13.667,11.661,11.661,0,0,0,13.655,2ZM21.74,9H18.3a18.257,18.257,0,0,0-1.61-4.153A9.368,9.368,0,0,1,21.74,9ZM13.667,4.38A16.435,16.435,0,0,1,15.895,9H11.438A16.435,16.435,0,0,1,13.667,4.38ZM4.637,16a9.126,9.126,0,0,1,0-4.667H8.58a19.268,19.268,0,0,0-.163,2.333A19.268,19.268,0,0,0,8.58,16Zm.957,2.333H9.035a18.257,18.257,0,0,0,1.61,4.153,9.318,9.318,0,0,1-5.052-4.153ZM9.035,9H5.593a9.318,9.318,0,0,1,5.052-4.153A18.257,18.257,0,0,0,9.035,9Zm4.632,13.953a16.435,16.435,0,0,1-2.228-4.62h4.457A16.435,16.435,0,0,1,13.667,22.953ZM16.4,16h-5.46a17.165,17.165,0,0,1-.187-2.333,17.016,17.016,0,0,1,.187-2.333H16.4a17.016,17.016,0,0,1,.187,2.333A17.165,17.165,0,0,1,16.4,16Zm.292,6.487a18.257,18.257,0,0,0,1.61-4.153H21.74A9.368,9.368,0,0,1,16.688,22.487ZM18.753,16a19.268,19.268,0,0,0,.163-2.333,19.268,19.268,0,0,0-.163-2.333H22.7A9.126,9.126,0,0,1,22.7,16Z"
            transform="translate(14.33 14.33)"
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
  return getSvgThemeColor(props.colorful, IconKeys.virtual_network);
});
</script>
