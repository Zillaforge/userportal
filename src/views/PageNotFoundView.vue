<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import PageNotFound from '@/components/PageNotFound.vue';
</script>

<template>
  <v-container class="page-not-found d-flex justify-center align-center" fluid>
    <PageNotFound />
  </v-container>
</template>

<style scoped>
.page-not-found {
  height: 100%;
  background-image: url('../assets/images/loading_page_bg.png');
}
</style>
