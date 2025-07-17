<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="120"
    height="120"
    viewBox="0 0 120 120"
  >
    <g
      id="icon_API_金鑰_120_grey"
      data-name="icon_API 金鑰_120_grey"
      transform="translate(-1090 -686)"
    >
      <circle
        id="Ellipse_116"
        data-name="Ellipse 116"
        cx="60"
        cy="60"
        r="60"
        transform="translate(1090 686)"
        :fill="iconColor.round"
      />
      <g
        id="_4824dp_5F6368"
        data-name="4824dp_5F6368"
        transform="translate(1126 722)"
      >
        <rect
          id="Rectangle_6319"
          data-name="Rectangle 6319"
          width="48"
          height="48"
          fill="none"
        />
        <g id="Group_17080" data-name="Group 17080" transform="translate(2 4)">
          <path
            id="Key"
            d="M41,14H24.3a12,12,0,1,0,0,8H25l4,4,4-4,4,4,8-8.08ZM13,24a6,6,0,1,1,6-6A6.018,6.018,0,0,1,13,24Z"
            transform="translate(-1 -6)"
            :fill="iconColor.icon"
          />
          <path
            id="Path_22900"
            data-name="Path 22900"
            d="M0,3.563H-3.761l-.656,2.125h-2.93L-3.175-5.687H-.6l4.2,11.375H.661ZM-3.1,1.445H-.659L-1.886-2.5Zm11.881.383V5.688H6.034V-5.687h4.539a5.287,5.287,0,0,1,2.309.48A3.621,3.621,0,0,1,14.437-3.84a3.734,3.734,0,0,1,.551,2.012A3.291,3.291,0,0,1,13.8.832a4.943,4.943,0,0,1-3.27,1Zm0-2.117h1.8a1.7,1.7,0,0,0,1.215-.4,1.48,1.48,0,0,0,.418-1.125,1.83,1.83,0,0,0-.43-1.273A1.522,1.522,0,0,0,10.6-3.57H8.777ZM20.97,5.688H18.236V-5.687H20.97Z"
            transform="translate(14.653 34.313)"
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
  return getSvgThemeColor(props.colorful, IconKeys.api_key);
});
</script>
