<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="120"
    height="120"
    viewBox="0 0 120 120"
  >
    <g id="icon_操作記錄_120_grey" transform="translate(-1090 -686)">
      <circle
        id="Ellipse_116"
        data-name="Ellipse 116"
        cx="60"
        cy="60"
        r="60"
        transform="translate(1090 686)"
        :fill="iconColor.round"
      />
      <g id="icon_操作記錄_48" transform="translate(1126 722)">
        <path
          id="Path_22840"
          data-name="Path 22840"
          d="M0,0H48V48H0Z"
          fill="none"
        />
        <path
          id="Subtraction_1"
          data-name="Subtraction 1"
          d="M28,40H3.975a4,4,0,0,1-3.975-4V4A4,4,0,0,1,4,0H20L32,12v24A4,4,0,0,1,28,40ZM23.094,27.141a3.617,3.617,0,0,0-3.654,3.895,3.481,3.481,0,0,0,3.685,3.816,3.649,3.649,0,0,0,2.484-.91V30.465H22.835v1.457h1.18v1.2a1.209,1.209,0,0,1-.7.2c-1.334,0-2.039-.809-2.039-2.34,0-1.406.739-2.316,1.884-2.316a1.906,1.906,0,0,1,1.376.578l.942-1.137A3.281,3.281,0,0,0,23.094,27.141Zm-8.105,0c-2.107,0-3.416,1.457-3.416,3.809,0,2.371,1.341,3.9,3.416,3.9s3.406-1.531,3.406-3.9C18.395,28.6,17.089,27.141,14.989,27.141Zm-8.612.137h0v7.441h4.679v-1.5H8.167V27.277ZM4,4H4V22H28V14H18V4ZM14.989,33.32c-.977,0-1.583-.91-1.583-2.371,0-1.43.592-2.285,1.583-2.285s1.584.855,1.584,2.285C16.573,32.41,15.966,33.32,14.989,33.32Z"
          transform="translate(8.007 4.004)"
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
  return getSvgThemeColor(props.colorful, IconKeys.log);
});
</script>
