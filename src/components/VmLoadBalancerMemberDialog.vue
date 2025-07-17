<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';
import SearchTextField from '@/components/common/SearchTextField.vue';
import validation from '@/utils/validation';

const showDialog = defineModel<boolean>('show', { required: true });
const emit = defineEmits(['submit']);

const props = defineProps({
  vmList: {
    type: Array<any>,
    default: () => [],
  },
  selectedMembers: {
    type: Array<any>,
    default: () => [],
  },
});

const refSetter = ref<any>(null);
const searchStr = ref('');
const useCustomMember = ref(false);

const vmMembers = ref<Record<string, any>[]>([]);
const customMember = ref<Record<string, any>[]>([]);

const filteredVmList = computed(() => {
  const selectedAddressses = props.selectedMembers.map(
    member => member.address
  );
  return props.vmList.filter(
    vm => vm.address && !selectedAddressses.includes(vm.address)
  );
});
const hasErrors = computed(() => {
  const memberLength = vmMembers.value.length + customMember.value.length;
  return memberLength === 0 || refSetter.value?.hasErrors === true;
});
watch(showDialog, () => {
  useCustomMember.value = false;
  vmMembers.value = [];
  customMember.value = [];
});
const submit = () => {
  emit('submit', { members: vmMembers.value.concat(customMember.value) });
};
</script>
<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('basic.add', { type: $t('vm.lb.target.pool.members') })"
    :disable-submit="hasErrors"
    :submit-callback="submit"
  >
    <RadioButtonSwitch
      :title="$t('vm.lb.target.pool.members')"
      :options="[
        { label: $t('vm.instance'), value: false },
        { label: $t('vm.lb.target.pool.custom'), value: true },
      ]"
      :init-value="useCustomMember"
      is-required
      @selected="value => (useCustomMember = value)"
    />

    <SearchTextField v-if="!useCustomMember" v-model="searchStr" class="py-4" />
    <v-data-table-virtual
      v-if="!useCustomMember"
      v-model="vmMembers"
      class="ocis-table-border ocis-scrollable-table"
      :items="filteredVmList"
      :search="searchStr"
      table-item-key="id"
      :headers="[
        {
          title: $t('basic.name', { type: $t('vm.instance') }),
          key: 'name',
        },
        {
          title: 'IP',
          key: 'address',
        },
      ]"
      show-select
      return-object
      fixed-header
    >
      <template
        #header.data-table-select="{ allSelected, selectAll, someSelected }"
      >
        <v-checkbox-btn
          :indeterminate="someSelected && !allSelected"
          :model-value="allSelected"
          color="primary"
          @update:model-value="selectAll(!allSelected)"
        />
      </template>
      <template
        #item.data-table-select="{ internalItem, isSelected, toggleSelect }"
      >
        <v-checkbox-btn
          :model-value="isSelected(internalItem)"
          color="primary"
          @update:model-value="toggleSelect(internalItem)"
        />
      </template>
    </v-data-table-virtual>
    <MultipleInputSetter
      v-show="useCustomMember"
      ref="refSetter"
      title="IP"
      :params="customMember"
      :column-infos="[
        {
          type: 'text-input',
          colsNumber: 6,
          required: true,
        },
      ]"
      :input-rules="[validation.ruleValidIp]"
      @add-new-item="
        () => {
          customMember.push({ address: '' });
          nextTick(() => {
            refSetter?.validate();
          });
        }
      "
      @delete-item="(index: number) => customMember.splice(index, 1)"
    />
  </CommonDialog>
</template>
