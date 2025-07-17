<script lang="ts" setup>
interface hint {
  icon: string;
  text: string;
  color: string;
}

defineProps({
  showHint: {
    type: Boolean,
    default: false,
  },
  hints: {
    type: Array as () => hint[],
    default: () => [],
  },
});
</script>
<template>
  <div v-show="showHint" class="hint-container">
    <div class="hint-div">
      <div class="hint-arrow" />
      <v-row
        v-for="(item, index) in hints"
        :key="index"
        :class="{
          'mb-2': index !== hints.length - 1,
          'flex-nowrap': true,
        }"
        no-gutters
      >
        <div class="min-width_32px" pa-1>
          <v-icon size="large" :color="item.color">{{ item.icon }}</v-icon>
        </div>
        <div pa-1>
          <span>{{ item.text }}</span>
        </div>
      </v-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.inline_block {
  display: inline-block;
}

.min-width_32px {
  min-width: 32px;
}
.hint-div {
  padding: 3px 0px !important;
  max-width: 300px !important;
}
.hint-container {
  position: relative;
  z-index: 1;
}
.hint-arrow {
  position: absolute;
  border-style: solid;
  left: -30px;
  top: 40%;
  margin-top: -5px;
  border-width: 10px 15px 10px 0;
  border-color: transparent rgba(var(--v-theme-bg-tooltip)) transparent
    transparent;
}
.v-tooltip__content.menuable__content__active {
  z-index: 300 !important;
}
</style>
