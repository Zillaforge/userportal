<script lang="ts" setup>
import { ref, watch } from 'vue';

interface PanelItem {
  title: string;
  value: string;
}
const props = defineProps({
  modelValue: {
    type: Array<PanelItem>,
    default: () => [],
  },
});

const panelValues = ref<string[]>([]);
watch(
  () => props.modelValue,
  val => {
    panelValues.value = val.map(i => i.value);
  },
  { immediate: true }
);
</script>
<template>
  <v-expansion-panels v-model="panelValues" multiple>
    <slot />
  </v-expansion-panels>
</template>
