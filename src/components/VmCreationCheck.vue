<script lang="ts" setup>
import { ref, computed, type PropType } from 'vue';

import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import { networkHeaders, volumeHeaders } from '@/constants/VmConstants';
import * as VM from '@/interfaces/VmInterface';
const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  desc: {
    type: String,
    default: '',
  },
  imageName: {
    type: String,
    default: '',
  },
  imageTag: {
    type: String,
    default: '',
  },
  flavor: {
    type: Object as PropType<VM.Flavor>,
    default: () => {},
  },
  network: {
    type: Array<VM.Network>,
    default: [],
  },
  volume: {
    type: Array<VM.Volume>,
    default: [],
  },
  keypair: {
    type: Object as PropType<VM.Keypair>,
    default: () => {},
  },
  initScript: {
    type: String,
    default: '',
  },
  formError: {
    type: Object as PropType<VM.FormError>,
    default: () => {},
  },
});

const showPwd = ref(false);
const showAlert = computed(() => {
  return (
    Object.values(props.formError).filter(item => item !== undefined).length > 0
  );
});
</script>

<template>
  <v-row>
    <v-col v-if="showAlert" class="pa-0" cols="12">
      <AlertComponent :message="$t('form.error.alert')" />
    </v-col>

    <CheckItem
      :key-name="$t('label.name')"
      :value="name"
      :error-msg="formError.name"
    />

    <CheckItem :key-name="$t('basic.desc')" :value="desc" />
    <CheckItem :key-name="$t('image.source')" :value="imageName" />
    <CheckItem :key-name="$t('image.tag')" :value="imageTag" />
    <CheckItem :key-name="$t('creation.step.flavor')" :value="flavor.name" />
    <CheckItem :key-name="$t('services.virtualNetwork')">
      <v-col cols="9">
        <DetailTable :items="network" :headers="networkHeaders" required />
      </v-col>
    </CheckItem>
    <CheckItem :key-name="$t('services.virtualVolume')">
      <v-col cols="9">
        <DetailTable :items="volume" :headers="volumeHeaders" />
      </v-col>
    </CheckItem>
    <CheckItem
      :key-name="$t('services.keypairs')"
      :value="keypair.enable ? keypair.name : $t('basic.close')"
    />
    <CheckItem
      :key-name="$t('basic.password')"
      :error-msg="formError.keypair"
      password
    >
      <v-col>
        <v-text-field
          v-if="keypair.password"
          :model-value="keypair.password"
          :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPwd ? 'text' : 'password'"
          variant="plain"
          readonly
          :width="`${keypair.password.length + 2}rem`"
          hide-details
          @click:append="showPwd = !showPwd"
        />
      </v-col>
    </CheckItem>
    <CheckItem
      :key-name="$t('creation.step.script')"
      :value="initScript"
      is-text-area
    />
  </v-row>
</template>
