<script lang="ts" setup>
import { ref, type PropType, watchEffect } from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import { type SecurityRule } from '@/interfaces/VmInterface';
import validation from '@/utils/validation';

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  securityRule: {
    type: Object as PropType<SecurityRule>,
    default: () => ({
      direction: 'ingress',
      port_min: '',
      port_max: '',
      protocol: 'tcp',
      remote_cidr: '',
    }),
  },
});

const tempRule = ref({ ...props.securityRule });
const emit = defineEmits(['submit']);
const submitRule = () => {
  emit('submit', tempRule.value);
};

const ruleValid = ref(false);
const trafficSelections = ref(['ingress', 'egress']);
const protocalSelections = ref(['any', 'ICMP', 'TCP', 'UDP']);

watchEffect(() => {
  if (showDialog.value) {
    tempRule.value = { ...props.securityRule };
  }
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('vm.sg.rule.create')"
    :disable-submit="!ruleValid"
    :submit-callback="submitRule"
  >
    <v-form v-model="ruleValid">
      <SelectWithHint
        v-model="tempRule.direction"
        :title="$t('vm.sg.traffic')"
        :items="trafficSelections"
        required
      />
      <TextFieldWithHint
        v-model="tempRule.port_min"
        :title="$t('vm.sg.port.range.min')"
        :max-val="65535"
        :type="'number'"
      />
      <TextFieldWithHint
        v-model="tempRule.port_max"
        :title="$t('vm.sg.port.range.max')"
        :type="'number'"
        :max-val="65535"
      />
      <SelectWithHint
        v-model="tempRule.protocol"
        :title="$t('basic.protocol')"
        :items="protocalSelections"
        required
      />
      <TextFieldWithHint
        v-model="tempRule.remote_cidr"
        :title="$t('basic.cidr')"
        :rules="[validation.ruleValidCidr]"
        :label="'eg. 10.0.0.0/24'"
        required
      />
    </v-form>
  </CommonDialog>
</template>
