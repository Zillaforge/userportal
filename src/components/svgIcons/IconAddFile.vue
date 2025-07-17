<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 120"
    width="120"
    height="120"
  >
    <g id="round" data-name="round" transform="translate(280 -973)">
      <circle
        id="Ellipse_320"
        data-name="Ellipse 320"
        cx="60"
        cy="60"
        r="60"
        transform="translate(-280 973)"
        :fill="iconColor.round"
      />
      <g id="icon" transform="translate(-244 1009) scale(2)">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          :fill="iconColor.icon"
          d="M13 11h-2v3H8v2h3v3h2v-3h3v-2h-3zm1-9H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
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
  return getSvgThemeColor(props.colorful, IconKeys.add_file);
});
</script>
