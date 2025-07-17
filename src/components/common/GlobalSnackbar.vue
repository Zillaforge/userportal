<script lang="ts" setup>
import { useGlobal } from '@/store';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

const globalStore = useGlobal();

const showSnackbar = ref(false);
const { snackbarParams } = storeToRefs(globalStore);
watch(snackbarParams, val => {
  if (val.show) {
    showSnackbar.value = true;
  }
});
watch(showSnackbar, val => {
  if (!val) snackbarParams.value.show = false;
});
</script>

<template>
  <v-snackbar
    v-model="showSnackbar"
    :timeout="snackbarParams.timeout"
    min-width="auto"
  >
    {{ snackbarParams.content }}
  </v-snackbar>
</template>
