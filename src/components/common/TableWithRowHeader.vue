<script lang="ts" setup>
defineProps({
  headers: {
    type: Array<Record<string, any>>,
    default: () => [],
  },
  items: {
    type: Array,
    default: () => [],
  },
});
</script>
<template>
  <v-data-table-virtual
    :headers="headers"
    :items="items"
    class="ocis-table-border"
  >
    <template #headers="{ columns }">
      <tr>
        <th class="text-center right-border table-background" width="15%">
          {{ columns[0].title }}
        </th>
        <th
          v-for="(header, idx) in columns.slice(1)"
          :key="idx"
          class="text-center"
        >
          {{ header.title }}
          <div>
            {{ header.subTitle }}
          </div>
        </th>
      </tr>
    </template>
    <template #item="{ item }">
      <tr>
        <td
          v-if="item.rowHeader"
          class="text-center right-border text-center table-background"
          :rowspan="item.rowSpan"
        >
          {{ item.rowHeader }}
        </td>
        <td
          v-for="header in headers.slice(1)"
          :key="header.key"
          class="text-center"
        >
          {{ item[header.key] }}
        </td>
      </tr>
    </template>
  </v-data-table-virtual>
</template>
<style lang="scss" scoped>
tbody {
  tr:hover {
    background-color: transparent !important;
    box-shadow: none !important;
    border-bottom: none !important;
  }
}

.right-border {
  border-right: 1px solid #e0e0e0;
}

.table-background {
  background-color: rgb(var(--v-theme-bg-main)) !important;
}
</style>
