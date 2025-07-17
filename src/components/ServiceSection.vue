<script setup lang="ts">
import { useRouter } from 'vue-router';

import type serviceItem from '@/interfaces/ServiceItemInterface';

const router = useRouter();
defineProps({
  title: { type: String, default: '' },
  services: {
    type: Array<serviceItem>,
    default: () => [],
  },
});

const goto = async (routeName: string) => {
  void router.push({ name: routeName });
};
</script>

<template>
  <v-card>
    <v-card-text class="py-2 service-group-title">
      {{ title }}
    </v-card-text>
    <v-divider />
    <div class="pl-4 pb-4">
      <v-row no-gutters wrap>
        <template v-for="service in services" :key="service.text">
          <v-col
            v-if="!service.hide"
            cols="12"
            xs="12"
            sm="6"
            md="4"
            lg="3"
            class="pt-4 pr-4"
          >
            <v-card
              class="service-card pa-2"
              @click="service.routeName ? goto(service.routeName) : null"
            >
              <v-row no-gutters>
                <component
                  :is="service.icon"
                  :colorful="true"
                  class="service-icon-style service-icon ml-2"
                />
                <div class="align-self-center ml-4 service-text">
                  {{ service.text }}
                </div>
              </v-row>
            </v-card>
          </v-col>
        </template>
      </v-row>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.service-card {
  height: 100%;
  border: 1px solid rgba(var(--v-theme-border), var(--v-border-opacity)) !important;
  cursor: pointer;
  background-color: rgba(250, 250, 250, 1);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  &:hover {
    outline: 2px solid rgb(var(--v-theme-primary)) !important;
    outline-offset: -2px;
  }
  .service-text {
    font-size: 18px !important;
  }
}
.service-icon {
  height: 56px;
  width: 56px;
}

.service-icon-style {
  height: 100%;
  max-height: -webkit-fill-available;
  max-height: -moz-available;
  max-height: fill-available;
}
</style>
