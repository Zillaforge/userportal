<template>
  <MenuComponent :content="props.menuContent" />
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

import type MenuItem from '@/interfaces/MenuItemInterface';

import MenuComponent from '@/components/common/MenuComponent.vue';

const props = defineProps({
  menuContent: {
    type: Array as PropType<MenuItem[]>,
    required: true,
  },
});
</script>
