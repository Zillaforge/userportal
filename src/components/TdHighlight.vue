<template>
  <td v-if="isStatus">
    <Light
      v-show="item"
      :status="item as string"
      :label="!disableStatusLabel ? handleString(item) : ''"
      :hint="statusExtraMsg"
      :margin-pixel="iconMarginPixel"
      :pending-to-review="statusPendingToReview"
    />
  </td>
  <td v-else-if="useDateFilter">
    <span>{{ formatDate(item as string | Date) }}</span>
  </td>
  <td v-else>
    <v-row v-if="isItemInstanceOfArray" class="ma-0 pa-0" :class="alignment">
      <v-icon v-if="icon" class="icon-margin td-icon">
        {{ icon }}
      </v-icon>
      <v-tooltip
        v-for="(elem, index) in item"
        :key="index"
        :disabled="disabledTooltip"
        location="bottom"
        max-width="'80vw'"
        :class="isCursorPointer ? 'cursor-pointer' : 'cursor-default'"
      >
        <template #activator="{ props }">
          <v-chip
            v-if="isHighlight && !textLink"
            v-bind="props"
            class="chip-td"
            @click="($event: Event) => handleClickChip($event, elem)"
          >
            {{ handleString(elem, strSliceLength, isDescription) }}
          </v-chip>

          <v-chip
            v-else-if="isHighlight && textLink"
            class="chip-td"
            v-bind="props"
            @click="$event.stopPropagation()"
          >
            <router-link :to="textLink">
              {{ handleString(elem, strSliceLength, isDescription) }}
            </router-link>
          </v-chip>
          <v-chip v-else v-bind="props" class="chip-td">
            {{ item }}
          </v-chip>
        </template>
        <span>{{ item }}</span>
      </v-tooltip>
    </v-row>
    <v-row v-else class="ma-0 pa-0 align-center" :class="alignment">
      <v-icon v-if="icon" class="icon-margin td-icon">
        {{ icon }}
      </v-icon>
      <v-tooltip
        :disabled="disabledTooltip"
        location="bottom"
        max-width="'80vw'"
        :class="isCursorPointer ? 'cursor-pointer' : 'cursor-default'"
      >
        <template #activator="{ props }">
          <div
            v-if="isHighlight && !textLink"
            v-bind="props"
            class="my-1 mx-0 content-color"
          >
            {{ handleString(item, strSliceLength, isDescription) }}
          </div>
          <div v-else-if="isHighlight && textLink" v-bind="props">
            <router-link
              :to="textLink"
              class="text-decoration-underline"
              @click="$event.stopPropagation()"
            >
              {{ handleString(item, strSliceLength, isDescription) }}
            </router-link>
          </div>
          <div v-else v-bind="props" v-text="item" />
        </template>
        <span>
          <pre>{{ item }}</pre>
        </span>
      </v-tooltip>
      <slot />
    </v-row>
  </td>
</template>

<script setup lang="ts">
import { useGlobal } from '@/store';
import { computed, type PropType } from 'vue';

import Light from '@/components/LightComponent.vue';
import { UUIDRegex } from '@/constants/Constants';
import i18n from '@/i18n';
import { formatDate, handleString } from '@/utils/utils';

const props = defineProps({
  item: {
    // show items
    type: [String, Number, Array, Date],
    default: undefined,
  },
  search: {
    // search key word
    type: String,
    default: '',
  },
  isStatus: {
    type: Boolean,
    default: false,
  },
  useDateFilter: {
    type: Boolean,
    default: false,
  },
  statusExtraMsg: {
    type: String,
    default: '',
  },
  isHighlight: {
    default: true,
    type: Boolean,
  },
  icon: {
    type: String,
    default: '',
  },
  textLink: {
    type: Object as PropType<Record<string, any> | null>,
    default: null,
  },
  isCursorPointer: {
    type: Boolean,
    default: true,
  },
  isDescription: {
    type: Boolean,
    default: true,
  },
  isMultiline: {
    type: Boolean,
    default: false,
  },
  disableStatusLabel: {
    type: Boolean,
    default: false,
  },
  strSliceLength: {
    type: Number,
    default: 32,
  },
  isAlignCenter: {
    type: Boolean,
    default: false,
  },
  iconMarginPixel: {
    type: Number,
    default: 36,
  },
  statusPendingToReview: {
    type: Boolean,
    default: true,
  },
});

const globalStore = useGlobal();
const { t } = i18n.global;

const disabledTooltip = computed(() => {
  // if content is empty or type is not 'string', always disable tooltip
  if (
    !props.isHighlight ||
    !props.item ||
    (props.item && typeof props.item !== 'string')
  ) {
    return true;
  }
  const newStr = handleString(
    props.item,
    props.strSliceLength,
    props.isDescription
  );
  return !(UUIDRegex.test(props.item as string) || newStr.endsWith('...'));
  // return !UUIDRegex.test(props.item as string);
});
const isItemInstanceOfArray = computed(() => {
  return props.item instanceof Array;
});
const alignment = computed(() => {
  if (props.isAlignCenter) {
    return { 'justify-center': true };
  } else {
    return { 'justify-center': false };
  }
});

const handleClickChip = ($event: Event, value: string | any) => {
  $event.stopPropagation();
  void navigator.clipboard.writeText(value as string);
  globalStore.triggerSnackbar({ content: t('basic.copied') });
};
</script>

<style lang="scss" scoped>
.icon-margin {
  margin-right: 10px;
}
.chip-td {
  padding: 2px 4px !important;
}
.td-icon {
  width: 24px;
  text-align: center;
}
.status-icon {
  height: inherit;
}

.v-row {
  margin: 0px;
}
</style>
