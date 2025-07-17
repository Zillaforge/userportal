<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';

import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
const props = defineProps({
  source: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  headers: {
    type: Array,
    required: true,
  },
});

const keyList = computed(() => Object.keys(props.source[0] || {}));

const emit = defineEmits([
  'formError',
  'addSource',
  'deleteSource',
  'update:modelValue',
]);
const refTextfield = ref<any>(null);

watchEffect(() => {
  if (Array.isArray(refTextfield.value)) {
    refTextfield.value.forEach((item: any) => {
      item.validate();
    });
  }
});
</script>

<template>
  <v-row no-gutters>
    <v-col cols="3">
      <span>{{ title }}</span>
    </v-col>
    <v-col cols="9">
      <div v-if="source.length">
        <v-row>
          <v-col cols="5">
            <span>{{ headers[0] }}</span>
          </v-col>
          <v-col cols="5">
            <span>{{ headers[1] }}</span>
          </v-col>
        </v-row>
        <v-row v-for="(item, index) in source" :key="index" no-gutters>
          <v-col cols="5">
            <TextFieldWithHint
              ref="refTextfield"
              v-model="item[keyList[0]]"
              class="pr-2"
              :text-field-col="12"
              :label="headers[0]"
              required
              :show-hint="false"
              @form-error="
                event => {
                  emit('formError', index, event);
                }
              "
            />
          </v-col>
          <v-col cols="5">
            <TextFieldWithHint
              ref="refTextfield"
              v-model="item[keyList[1]]"
              :text-field-col="12"
              :label="headers[1]"
              class="pl-2"
              required
              :show-hint="false"
              @form-error="
                event => {
                  emit('formError', index, event);
                }
              "
            />
          </v-col>
          <v-col cols="1">
            <v-btn
              size="36"
              color="primary"
              icon
              class="mt-2"
              variant="text"
              @click="
                (event: any) => {
                  emit('deleteSource', index);
                }
              "
            >
              <v-icon size="24">mdi-delete-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <v-row no-gutters>
        <v-btn
          :class="['text-btn', source.length ? 'mt-4' : '']"
          variant="outlined"
          @click="
            (event: any) => {
              emit('addSource');
            }
          "
        >
          {{ '新增' }}
        </v-btn>
      </v-row>
    </v-col>
  </v-row>
</template>
