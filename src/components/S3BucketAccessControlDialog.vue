<template>
  <CommonDialog
    v-model:show="showDialog"
    :title="$t('s3.accessControl')"
    :show-cancel-btn="hasPermission"
    :submit-callback="submitAction"
  >
    <template v-if="!hasPermission">
      {{ $t('s3.accessControl.noPermission') }}
    </template>
    <template v-else>
      <RadioButtonSwitch
        :title="$t('s3.accessControl')"
        :options="[
          { label: $t('basic.enabled'), value: true },
          { label: $t('basic.disabled'), value: false },
        ]"
        :tooltip="$t('s3.accessControl.tooltip')"
        :init-value="enableAcl"
        is-required
        @selected="value => (enableAcl = value)"
      />
      <SelectWithHint
        v-model="selectedMember"
        :title="$t('s3.accessControl.addMember')"
        :items="selectableMemberList"
        item-text="displayName"
        item-value="id"
        :selection-cols="8"
        :disabled="!enableAcl"
        hide-details
        return-object
      />
      <v-row no-gutters>
        <v-col :cols="3" class="ocis-form-title" />
        <v-col :cols="8">
          <OutlinedBtn
            :text="$t('s3.accessControl.memberList.add')"
            :disabled="!enableAcl || !selectedMember"
            class="my-6"
            @click="addMember"
          />
        </v-col>
        <v-spacer />
        <v-col
          :cols="3"
          class="ocis-form-title"
          :class="{ 'ocis-text-disabled': !enableAcl }"
        >
          {{ $t('s3.accessControl.memberList') }}
        </v-col>
        <v-col
          :cols="8"
          class="chip-area rounded"
          :class="{ disabled: !enableAcl }"
        >
          <v-chip
            v-for="(member, index) in memberList"
            :key="`member${member.id}`"
            :disabled="!enableAcl"
            class="ma-2"
            closable
            @click:close="removeMember(index)"
          >
            <span>{{ member.displayName }}</span>
          </v-chip>
        </v-col>
        <v-spacer />
      </v-row>
    </template>
  </CommonDialog>
</template>

<script setup lang="ts">
import { useGlobal, useUser } from '@/store';
import { ref, computed, type Ref, watch } from 'vue';

import { fetchProjectMembershipList } from '@/api';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useCloudStorage from '@/composables/useCloudStorage';

const show = defineModel<boolean>('show', { required: true });

const props = defineProps({
  bucketName: {
    type: String,
    default: '',
  },
  submitCallback: {
    type: Function,
    default: undefined,
  },
});

const globalStore = useGlobal();
const userStore = useUser();
const { execFetchS3BucketAcl, execUpdateS3BucketAcl } = useCloudStorage();

const showDialog: Ref<boolean> = ref(false);
const hasPermission: Ref<boolean> = ref(true);
const enableAcl: Ref<boolean> = ref(false);
const allMemberList: Ref<any[]> = ref([]);
const memberList: Ref<any[]> = ref([]);
const selectedMember: Ref<Record<string, any> | undefined> = ref(undefined);

const selectableMemberList = computed(() => {
  return allMemberList.value
    .filter(
      member =>
        member.id !== userStore.getUserInfo.userId &&
        !memberList.value.find(el => el.id === member.id)
    )
    .sort((a, b) => {
      return a.displayName.toUpperCase() > b.displayName.toUpperCase() ? 1 : -1;
    });
});

const fetchData = async () => {
  const projectMemberList = await fetchProjectMembershipList();
  allMemberList.value = projectMemberList.map(
    (member: Record<string, any>) => ({
      displayName:
        member?.user?.displayName ||
        member?.user?.account ||
        member?.user?.email ||
        member?.user?.userId ||
        '',
      id: member?.user?.userId,
    })
  );
  await execFetchS3BucketAcl(
    props.bucketName,
    acl => {
      memberList.value = acl.map((id: string) =>
        allMemberList.value.find(member => member?.id === id)
      );
    },
    () => {
      hasPermission.value = false;
      enableAcl.value = false;
    }
  );
  if (memberList.value.length > 0) {
    enableAcl.value = true;
  }
  showDialog.value = true;
  globalStore.uiHideProgressDlg();
};

const submitAction = () => {
  if (!hasPermission.value) {
    return;
  }
  const idList = memberList.value.map(member => member.id as string);
  void execUpdateS3BucketAcl(
    props.bucketName,
    enableAcl.value ? idList : [],
    () => {
      props.submitCallback?.();
    }
  );
};

const addMember = () => {
  memberList.value.push(selectedMember.value);
  selectedMember.value = undefined;
};

const removeMember = (index: number) => {
  memberList.value.splice(index, 1);
};

watch(show, newVal => {
  if (newVal) {
    hasPermission.value = true;
    selectedMember.value = undefined;
    memberList.value = [];
    allMemberList.value = [];
    enableAcl.value = false;
    globalStore.uiShowProgressDlg();
    void fetchData();
  }
});

watch(showDialog, val => {
  if (!val) {
    show.value = false;
  }
});
</script>

<style scoped lang="scss">
@use '@/styles/common/v-chip';
.chip-area {
  height: 180px;
  padding: 16px;
  overflow-y: auto;
  border: 1px solid rgba(var(--v-theme-border), var(--v-border-opacity));
}
</style>
