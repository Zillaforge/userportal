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
        id="Device"
        x="6.167"
        y="10.334"
        width="43.667"
        height="41.334"
        filterUnits="userSpaceOnUse"
      >
        <feOffset dy="3" input="SourceAlpha" />
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood flood-opacity="0.161" />
        <feComposite operator="in" in2="blur" />
        <feComposite in="SourceGraphic" />
      </filter>
      <filter
        id="Cube"
        x="13.4"
        y="13.541"
        width="29.2"
        height="30.25"
        filterUnits="userSpaceOnUse"
      >
        <feOffset dy="3" input="SourceAlpha" />
        <feGaussianBlur stdDeviation="3" result="blur-2" />
        <feFlood flood-opacity="0.161" />
        <feComposite operator="in" in2="blur-2" />
        <feComposite in="SourceGraphic" />
      </filter>
    </defs>
    <g id="icon_虛擬機器_56" transform="translate(-36 -81)">
      <circle
        id="Ellipse_1064"
        data-name="Ellipse 1064"
        cx="28"
        cy="28"
        r="28"
        transform="translate(36 81)"
        :fill="iconColor.round"
      />
      <g id="VM" transform="translate(50 95)">
        <rect id="bound" width="28" height="28" fill="none" />
        <g transform="matrix(1, 0, 0, 1, -14, -14)" filter="url(#Device)">
          <path
            id="Device-2"
            data-name="Device"
            d="M24.333,2h-21A2.34,2.34,0,0,0,1,4.333v14a2.34,2.34,0,0,0,2.333,2.333H11.5l-2.333,3.5v1.167H18.5V24.167l-2.333-3.5h8.167a2.34,2.34,0,0,0,2.333-2.333v-14A2.34,2.34,0,0,0,24.333,2Zm0,16.333h-21v-14h21Z"
            transform="translate(14.17 14.33)"
            :fill="iconColor.icon"
          />
        </g>
        <g transform="matrix(1, 0, 0, 1, -14, -14)" filter="url(#Cube)">
          <path
            id="Cube-2"
            data-name="Cube"
            d="M18.281,7.811c-.028-.048-.082-.076-.118-.118a.868.868,0,0,0-.195-.2l-.01,0-.008-.008L13.225,4.86a.873.873,0,0,0-.849,0L7.65,7.485l-.008.008-.01,0a.86.86,0,0,0-.2.2c-.034.04-.084.065-.111.111A.88.88,0,0,0,7.2,8.25V13.5a.874.874,0,0,0,.45.764l4.705,2.615h0l.019.009a.869.869,0,0,0,.849,0l4.725-2.625a.874.874,0,0,0,.45-.764V8.25A.88.88,0,0,0,18.281,7.811ZM12.8,6.626,15.724,8.25,12.8,9.874,9.878,8.25ZM8.95,9.738l1.909,1.06,1.066.592v3.249L8.95,12.986Z"
            transform="translate(15.2 14.79)"
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
  return getSvgThemeColor(props.colorful, IconKeys.vm);
});
</script>
