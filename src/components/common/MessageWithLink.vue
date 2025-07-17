<script setup lang="ts">
import { computed } from 'vue';

// message format: {messagePrefix}<a :href="{linkUrl}">{linkText}</a>{messageSuffix}
const props = defineProps({
  message: {
    type: String,
    default: '',
  },
});

const anchorStartIndex = computed(() => props.message.indexOf('<a'));
const anchorEndIndex = computed(() => props.message.indexOf('</a>'));

const linkUrl = computed(() => {
  const startKeyword = 'href="';
  const start = props.message.indexOf(startKeyword);
  const endKeyword = '"';
  const end = props.message.lastIndexOf(endKeyword);
  return start >= 0
    ? props.message.substring(start + startKeyword.length, end)
    : '';
});

const linkText = computed(() => {
  if (anchorStartIndex.value >= 0 && anchorEndIndex.value >= 0) {
    const firstIndex = props.message.indexOf('>');
    return props.message.substring(firstIndex + 1, anchorEndIndex.value);
  }
  return '';
});

const messagePrefix = computed(() => {
  if (linkText.value) {
    return props.message.substring(0, anchorStartIndex.value);
  }
  return props.message;
});

const messageSuffix = computed(() => {
  if (linkText.value) {
    const lastIndex = props.message.lastIndexOf('>');
    return props.message.substring(lastIndex + 1, props.message.length);
  }
  return '';
});
</script>

<template>
  {{ messagePrefix }}
  <a
    v-if="linkText"
    :href="linkUrl"
    class="ocis-external-link"
    rel="noopener noreferrer"
  >
    {{ linkText }}
  </a>
  {{ messageSuffix }}
</template>
