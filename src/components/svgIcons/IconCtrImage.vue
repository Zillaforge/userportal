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
        id="File"
        x="6.833"
        y="7.5"
        width="42.333"
        height="47"
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
        y="17.539"
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
    <g id="icon_容器映像檔管理_56" transform="translate(-36 -81)">
      <circle
        id="Ellipse_1064"
        data-name="Ellipse 1064"
        cx="28"
        cy="28"
        r="28"
        transform="translate(36 81)"
        :fill="iconColor.round"
      />
      <g
        id="Image_icon"
        data-name="Image icon"
        transform="translate(50 94.999)"
      >
        <path id="Bound" d="M0,0H28V28H0Z" fill="none" />
        <g transform="matrix(1, 0, 0, 1, -14, -14)" filter="url(#File)">
          <path
            id="File-2"
            data-name="File"
            d="M19.5,0H4.333A2.34,2.34,0,0,0,2,2.333V25.667A2.333,2.333,0,0,0,4.322,28H23a2.34,2.34,0,0,0,2.333-2.333V5.833ZM23,25.667H4.333V2.333h14V7H23Z"
            transform="translate(14.33 14)"
            :fill="iconColor.icon"
            stroke="rgba(0,0,0,0)"
            stroke-miterlimit="10"
            stroke-width="1"
          />
        </g>
        <g transform="matrix(1, 0, 0, 1, -14, -14)" filter="url(#Cube)">
          <path
            id="Cube-2"
            data-name="Cube"
            d="M18.281,7.811c-.028-.048-.082-.076-.118-.118a.868.868,0,0,0-.195-.2l-.01,0-.008-.008L13.225,4.86a.873.873,0,0,0-.849,0L7.65,7.485l-.008.008-.01,0a.86.86,0,0,0-.2.2c-.034.04-.084.065-.111.111A.88.88,0,0,0,7.2,8.25V13.5a.874.874,0,0,0,.45.764l4.705,2.615h0l.019.009a.869.869,0,0,0,.849,0l4.725-2.625a.874.874,0,0,0,.45-.764V8.25A.88.88,0,0,0,18.281,7.811ZM12.8,6.626,15.724,8.25,12.8,9.874,9.878,8.25ZM8.95,9.738l1.909,1.06,1.066.592v3.249L8.95,12.986Z"
            transform="translate(15.2 18.79)"
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
  return getSvgThemeColor(props.colorful, IconKeys.ctr_image);
});
</script>
