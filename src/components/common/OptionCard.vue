<script setup lang="ts">
import { computed, type PropType } from 'vue';

import type { OptionCardItem } from '@/interfaces/LayoutItemInterface';
const props = defineProps({
  item: {
    type: Object as PropType<OptionCardItem>,
    required: true,
  },
});

const emits = defineEmits(['update']);

const handleCardClick = (event: any) => {
  emits('update', event);
};

const letterColor = computed(() => {
  switch (props.item.name?.charAt(0)?.toUpperCase()) {
    case 'A':
      return '#E25241';
    case 'B':
      return '#C73461';
    case 'C':
      return '#9035AA';
    case 'D':
      return '#6140B1';
    case 'E':
      return '#4253AF';
    case 'F':
      return '#4188DE';
    case 'G':
      return '#4BA8EE';
    case 'H':
      return '#54BAD1';
    case 'I':
      return '#429488';
    case 'J':
      return '#67AC5C';
    case 'K':
      return '#97C15C';
    case 'L':
      return '#AFB42C';
    case 'M':
      return '#F2C24F';
    case 'N':
      return '#F2A43A';
    case 'O':
      return '#E68231';
    case 'P':
      return '#D5552E';
    case 'Q':
      return '#8D6E63';
    case 'R':
      return '#9E9E9E';
    case 'S':
      return '#657C89';
    case 'T':
      return '#F09085';
    case 'U':
      return '#EC5282';
    case 'V':
      return '#CF53F3';
    case 'W':
      return '#7555F6';
    case 'X':
      return '#5870F5';
    case 'Y':
      return '#7987C7';
    case 'Z':
      return '#56BCA6';
    default:
      return '#C49719';
  }
});

const sliceDescription = (desc: string | undefined) => {
  const langLength = 55;
  if (desc) {
    if (desc.length > langLength) {
      return desc.slice(0, langLength) + '...';
    }
    return desc;
  }
  if (desc && typeof desc === 'string') {
    return desc;
  }
  return '';
};
</script>
<template>
  <v-card hover class="option-card" @click="handleCardClick(item)">
    <v-row class="pa-4" align="center">
      <div class="pa-3">
        <div v-if="!item.img">
          <span class="icon-frame-format icon-alphabet">
            {{ item.name?.charAt(0)?.toUpperCase() }}
          </span>
        </div>
        <div v-else>
          <v-img class="icon-frame-format" :src="item.img" />
        </div>
      </div>
      <v-col>
        <div>
          <span class="display-font">{{ item.name }}</span>
        </div>
        <div>
          <slot name="info" />
        </div>
        <span class="line-break">{{ sliceDescription(item.description) }}</span>
        <v-tooltip v-if="item.description" activator="parent" location="bottom">
          <span>{{ item.description }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-card>
</template>
<style lang="scss" scoped>
.line-style {
  margin-right: 15px;
}

.icon-frame-format {
  border: 1px rgba(var(--v-theme-border), var(--v-border-opacity)) solid;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
}

.icon-alphabet {
  font-size: 48px !important;
  font-weight: bold;
  color: v-bind(letterColor);
}

.v-card {
  background-color: #ffffff !important;
  box-shadow: 0px 2px 6px #00000029;
  text-decoration: none;
  &.option-card {
    max-height: 180px;
    border: rgba(var(--v-theme-border), var(--v-border-opacity)) solid 1px !important;
    height: 100%;
    background-color: #fafafa !important;
  }
}

.v-card--hover {
  border: 1px solid transparent;
  box-shadow: 0px 2px 3px #00000029;
  &:hover {
    outline: 2px solid rgb(var(--v-theme-primary)) !important;
    outline-offset: -2px;
    box-shadow: 0px 2px 3px #00000029 !important;
  }
}

.line-break {
  word-break: break-word;
}
</style>
