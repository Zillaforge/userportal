<template>
  <div class="footer">
    <v-btn
      :disabled="pageCurrent === 1"
      size="small"
      class="page-button width-60"
      @click="
        () => {
          pageCurrent = 1;
          $emit('update-current-page', pageCurrent);
        }
      "
    >
      {{ $t('basic.first') }}
    </v-btn>

    <v-btn
      size="small"
      class="page-button"
      :disabled="pageCurrent <= 1"
      @click="prePage()"
    >
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-btn
      v-for="(page, index) in pageList"
      :key="index"
      size="small"
      :class="pageCurrent === page ? 'current-page' : ''"
      class="page-button"
      @click="
        () => {
          pageCurrent = page;
          $emit('update-current-page', pageCurrent);
        }
      "
    >
      {{ page }}
    </v-btn>
    <v-btn
      v-if="showFetchMoreData && pageCurrent >= totalPage"
      key="more-data"
      size="small"
      class="page-button"
      @click="fetchMoreData()"
    >
      <v-icon>mdi-dots-horizontal</v-icon>
    </v-btn>
    <v-btn
      v-else
      key="next-page"
      size="small"
      class="page-button"
      :disabled="pageCurrent >= totalPage"
      @click="nextPage()"
    >
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
    <v-btn
      :disabled="pageCurrent >= totalPage"
      size="small"
      class="page-button width-60"
      @click="
        () => {
          pageCurrent = totalPage;
          $emit('update-current-page', pageCurrent);
        }
      "
    >
      {{ $t('basic.last') }}
    </v-btn>
    <span class="item-count-text">
      {{ totalTitle }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Ref, watch } from 'vue';

const pageCurrent: Ref<number> = ref(1);
const emit = defineEmits(['fetch-more-data', 'update-current-page']);
const props = defineProps({
  pagination: {
    type: Object,
    required: true,
  },
  itemTitle: {
    type: String,
    required: true,
  },
  showFetchMoreData: {
    type: Boolean,
    default: false,
  },
});
const totalTitle = computed(() => props.itemTitle);
const totalPage = computed(() => {
  return Math.ceil(props.pagination.totalItems / props.pagination.rowsPerPage);
});
const pageList = computed(() => {
  const list = [1, 2, 3, 4, 5].map(
    i => i + Math.floor((props.pagination.page - 1) / 5) * 5
  );
  const pageDiff = list[4] - totalPage.value;
  if (pageDiff > 0) {
    list.splice(5 - pageDiff);
  }
  return list;
});
const prePage = () => {
  if (pageCurrent.value > 1) {
    if (pageCurrent.value > totalPage.value) {
      pageCurrent.value = totalPage.value;
    } else {
      pageCurrent.value--;
    }
    emit('update-current-page', pageCurrent.value);
  }
};
const nextPage = () => {
  if (pageCurrent.value < totalPage.value) {
    pageCurrent.value++;
    emit('update-current-page', pageCurrent.value);
  }
};
const fetchMoreData = () => {
  emit('fetch-more-data');
};

watch(
  () => props.pagination.page,
  () => {
    if (props.pagination.page !== pageCurrent.value) {
      pageCurrent.value = props.pagination.page;
    }
  }
);
</script>

<style lang="scss" scoped>
.footer {
  background-color: rgb(var(--v-theme-bg-table-header-footer));
}

.page-button {
  background-color: rgb(var(--v-theme-bg-btn-page)) !important;
  border: 1px solid
    rgba(var(--v-theme-btn-page-border), var(--v-btn-page-border-opacity));
  margin: 8px 4px;
  min-width: 32px;
  width: 32px;
  height: 32px;
  font-weight: 400;
  &:hover {
    &:not(.current-page) {
      border: 1px solid rgb(var(--v-theme-primary));
    }
  }
  :deep(.v-ripple__container) {
    color: rgb(var(--v-theme-ripple-color)) !important;
  }
  &:disabled {
    color: rgba(
      var(--v-theme-btn-texted-disabled),
      var(--v-btn-texted-disabled-opacity)
    ) !important;
    background-color: rgba(
      var(--v-theme-bg-btn-contained-disabled),
      var(--v-bg-btn-contained-disabled-opacity)
    ) !important;
  }
}
.width-60 {
  width: 60px !important;
}
.current-page {
  background-color: rgb(var(--v-theme-bg-btn-page-current)) !important;
  color: rgb(var(--v-theme-btn-page-current-text));
  &:hover {
    background-color: rgb(var(--v-theme-bg-hover)) !important;
  }
}
.item-count-text {
  color: rgb(var(--v-theme-text-highlight));
  padding-left: 19px;
}
</style>
