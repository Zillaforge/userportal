<template>
  <v-container fluid class="container-style">
    <slot />
  </v-container>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.container-style {
  max-height: calc(100vh - 102px);
  overflow: auto;
  padding: 0px;
  margin: 0px;
}
</style>
