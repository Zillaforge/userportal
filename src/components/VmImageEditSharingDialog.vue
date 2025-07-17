<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';

import ComboboxMultiSelect from '@/components/common/ComboboxMultiSelect.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';

defineEmits(['update-value', 'close-dialog']);

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  sharingVersion: {
    type: Object as PropType<Record<string, any>>,
    required: true,
  },
  selectedMembers: {
    type: Array<{ id: string; name: string; aclId: string }>,
    default: () => [],
  },
  memberList: {
    type: Array<any>,
    default: () => [],
  },
});
const dlgSelectedMembers = ref<{ id: string; name: string }[]>([]);

watch(showDialog, newVal => {
  if (newVal) {
    dlgSelectedMembers.value = props.selectedMembers;
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('action.edit.type', { type: $t('label.sharing') })"
    :submit-callback="
      () =>
        $emit('update-value', {
          sharingVersion: sharingVersion.id,
          selectedMembers: dlgSelectedMembers,
        })
    "
    :cancel-callback="() => $emit('close-dialog')"
    disable-auto-close-dialog
  >
    <v-row no-gutters>
      <v-col cols="3" class="ocis-form-title">
        {{ $t('label.sharingVersions') }}
      </v-col>
      <v-col :cols="9" class="ocis-form-title">
        {{ sharingVersion.name }}
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-6">
      <v-col cols="3" class="ocis-form-title">
        {{ $t('label.sharingMembers') }}
      </v-col>
      <v-col cols="9" class="align-self-center">
        <ComboboxMultiSelect
          v-model="dlgSelectedMembers"
          :items="memberList"
          item-title="name"
          item-value="id"
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>
