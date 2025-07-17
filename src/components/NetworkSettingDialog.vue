<script lang="ts" setup>
import { ref, watch, type Ref, type PropType, computed } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import IconBtn from '@/components/common/button/IconBtn.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import { type Network } from '@/interfaces/VmInterface';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  editingNetwork: {
    type: Object as PropType<Network | null>,
    default: () => {},
  },
  editingIndex: {
    type: Number,
    default: -1,
  },
  networkOptions: {
    type: Array<any>,
    default: null,
  },
  securityGroupOptions: {
    type: Array<Record<string, any>>,
    default: () => [],
  },
});

const emit = defineEmits(['add-new-network', 'update-network', 'close-dialog']);

const selectedNetwork: Ref<Record<string, any>> = ref({});
const selectedSecurityGroups: Ref<Record<string, any>[]> = ref([]);

const disableSumbit = computed(
  () =>
    selectedSecurityGroups.value.some(sg => sg?.name === undefined) ||
    selectedNetwork.value === undefined ||
    selectedNetwork.value.name === ''
);

watch(showDialog, val => {
  if (val) {
    const editingNetwork = props.editingNetwork;
    if (editingNetwork) {
      selectedNetwork.value = editingNetwork;
      selectedSecurityGroups.value = [];
      editingNetwork.security_groups?.id?.forEach((item: any) => {
        selectedSecurityGroups.value.push(
          props.securityGroupOptions.find(el => el.id === item) ?? {}
        );
      });
    } else {
      selectedNetwork.value = props.networkOptions?.length
        ? props.networkOptions[0]
        : { name: '' };
      selectedSecurityGroups.value = [];
      selectedSecurityGroups.value.push(props.securityGroupOptions[0]);
    }
  }
});

const networkSubmit = () => {
  if (props.editingIndex > -1) {
    emit('update-network', {
      index: props.editingIndex,
      networkItem: {
        ...selectedNetwork.value,
        security_groups: {
          name: selectedSecurityGroups.value.map(el => el.name),
          id: selectedSecurityGroups.value.map(el => el.id),
        },
      },
    });
  } else {
    emit('add-new-network', {
      ...selectedNetwork.value,
      security_groups: {
        name: selectedSecurityGroups.value.map(el => el.name),
        id: selectedSecurityGroups.value.map(el => el.id),
      },
    });
  }
};

const sgOptions = computed(() => {
  return props.securityGroupOptions.filter(
    sg =>
      !selectedSecurityGroups.value.some(selectedSg => selectedSg.id === sg.id)
  );
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('vm.network.add')"
    :submit-callback="networkSubmit"
    :cancel-callback="() => $emit('close-dialog')"
    :disable-submit="disableSumbit"
    disable-auto-close-dialog
  >
    <SelectWithHint
      v-if="networkOptions"
      v-model="selectedNetwork"
      :title="$t('vm.network')"
      :items="networkOptions"
      return-object
      required
    />
    <TextFieldWithHint
      v-else
      v-model="selectedNetwork.name"
      :title="$t('services.virtualNetwork')"
      plain-text
    />
    <SelectWithHint
      v-for="(securityGroup, index) in selectedSecurityGroups"
      :key="index"
      v-model="selectedSecurityGroups[index]"
      :title="$t('services.securityGroup')"
      :items="sgOptions"
      return-object
      required
    >
      <IconBtn
        icon="mdi-delete-outline"
        class="pt-2"
        :disabled="selectedSecurityGroups.length === 1"
        @click="() => selectedSecurityGroups.splice(index, 1)"
      />
    </SelectWithHint>
    <v-row v-if="sgOptions?.length > 0" no-gutters>
      <v-col cols="8" offset="3">
        <OutlinedBtn
          :text="$t('basic.add')"
          @click="() => selectedSecurityGroups.push(sgOptions[0])"
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>
