<script lang="ts">
export default {
  name: 'SearchTextField',
};
</script>

<script setup lang="ts">
defineProps({
  searchStr: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['update:model-value']);
</script>

<template>
  <v-text-field
    :model-value="searchStr"
    :label="$t('table.action.search')"
    class="searchInput"
    type="text"
    prepend-inner-icon="mdi-magnify"
    density="compact"
    variant="solo"
    hide-details
    single-line
    color="primary"
    @update:model-value="(val: string) => $emit('update:model-value', val)"
  />
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';
</style>
