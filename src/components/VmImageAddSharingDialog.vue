<script setup lang="ts">
import { ref, watch } from 'vue';

import ComboboxMultiSelect from '@/components/common/ComboboxMultiSelect.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';

defineEmits(['update-value', 'close-dialog']);

const showDialog = defineModel<boolean>('show', { required: true });

defineProps({
  versionList: {
    type: Array<Record<string, string>>,
    default: () => [],
  },
  memberList: {
    type: Array<any>,
    default: () => [],
  },
});
const selectedVersions = ref<{ tagName: string; id: string }[]>([]);
const selectedMembers = ref<{ name: string; id: string }[]>([]);

watch(showDialog, newVal => {
  if (newVal) {
    selectedVersions.value = [];
    selectedMembers.value = [];
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.add.type', { type: $t('label.sharing') })"
    :submit-callback="
      () => $emit('update-value', { selectedVersions, selectedMembers })
    "
    :cancel-callback="() => $emit('close-dialog')"
    :disable-submit="
      selectedVersions.length === 0 || selectedMembers.length === 0
    "
    disable-auto-close-dialog
  >
    <v-row no-gutters>
      <v-col cols="3" class="ocis-form-title ocis-input-required">
        {{ $t('label.sharingVersions') }}
      </v-col>
      <v-col :cols="9" class="align-self-center">
        <ComboboxMultiSelect
          v-model="selectedVersions"
          :items="versionList"
          item-title="tagName"
          item-value="id"
          required
        />
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-6">
      <v-col cols="3" class="ocis-form-title ocis-input-required">
        {{ $t('label.sharingMembers') }}
      </v-col>
      <v-col cols="9" class="align-self-center">
        <ComboboxMultiSelect
          v-model="selectedMembers"
          :items="memberList"
          item-title="name"
          item-value="id"
          required
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>
