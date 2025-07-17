<script lang="ts" setup>
import { useGlobal } from '@/store';
import {
  ref,
  computed,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  type Ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchLoadBalancerDetail,
  fetchLoadloadBalancerPool,
  fetchAutoScalingList,
  fetchAutoScalingDetail,
  fetchVmNetworkPorts,
  updateLoadBalancerPool,
  deleteLoadBalancerPool,
  loadBalancerPoolUpdateMembers,
  loadBalancerPoolRemoveMember,
} from '@/api';
import VmLoadBalancerMemberDialog from '@/components/VmLoadBalancerMemberDialog.vue';
import VmLoadBalancerPoolAsgDialog from '@/components/VmLoadBalancerPoolAsgDialog.vue';
import DetailActionBtn from '@/components/common/DetailActionBtn.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import EditValueDialog from '@/components/common/EditValueDialog.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { METHOD } from '@/constants/VmConstants';
import i18n from '@/i18n';
import { formatDateSec } from '@/utils/utils';

const UPDATE_KEYS = {
  NAME: 'name',
  METHOD: 'method',
  MEMBER_PORT: 'member_port',
  MEMBER: 'member',
};

const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;
const route = useRoute();
const router = useRouter();

const timer = ref(0);
const vmList = ref([]);
const loadBalancerItem = ref<Record<string, any>>({});
const autoScalingList = ref([]);
const poolItem = ref<Record<string, any>>({});
const lastUpdatedTime: Ref<Date | string> = ref('');

const editingKey = ref('');
const editingLabel = ref('');
const editingValue = ref('');
const showEditValueDialog = ref(false);
const showEditMethodDialog = ref(false);
const showPoolMemberDialog = ref(false);
const showAutoscalingDialog = ref(false);

const isStatusActive = computed(
  () => poolItem.value?.status?.toLowerCase() === 'active'
);
const expansionPanels = computed(() => {
  return [{ title: poolItem.value.name, value: poolItem.value.name }];
});
const { setBreadcrumbsParams, openDeleteDialog } = useGlobal();
onBeforeMount(() => {
  setBreadcrumbsParams({
    itemName: route.params.itemName,
  });
});
onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_LOAD_BALANCER_LIST })
  );
});
onBeforeUnmount(() => cancelAutoReload());

const fetchData = async (skipProgress: boolean = true) => {
  loadBalancerItem.value = await makeApiCall({
    skipProgress,
    apiCallFn: fetchLoadBalancerDetail,
    payload: route.params.loadBalancerId,
    successCallback: res => ({
      ...res,
      fipAddress: res.floating_ip?.address,
    }),
  });
  const poolItemApiCall = makeApiCall({
    skipProgress,
    apiCallFn: fetchLoadloadBalancerPool,
    payload: {
      loadBalancerId: route.params.loadBalancerId,
      poolId: route.params.poolId,
    },
    successCallback: res => {
      return {
        ...res,
        fromAutoScaling: !!res.asg,
      };
    },
    errorCallback: backToDetail,
  });

  const autoScalingApiCall = makeApiCall({
    apiCallFn: fetchAutoScalingList,
  });
  if (loadBalancerItem.value.network_id) {
    vmList.value = await makeApiCall({
      skipProgress: true,
      apiCallFn: fetchVmNetworkPorts,
      payload: loadBalancerItem.value.network_id,
      successCallback: res => {
        const servers = res.reduce(
          (
            accumulator: Record<string, any>[],
            item: { server?: Record<string, any> }
          ) => {
            if (item.server) {
              accumulator.push(item.server);
            }
            return accumulator;
          },
          []
        );
        return servers.map((vm: Record<string, any>) => ({
          ...vm,
          address: vm.private_ips[0],
        }));
      },
    });
  }
  poolItem.value = await poolItemApiCall;
  if (poolItem.value.fromAutoScaling) {
    poolItem.value.members = await makeApiCall({
      skipProgress: true,
      apiCallFn: fetchAutoScalingDetail,
      payload: poolItem.value.asg.id,
      successCallback: res => {
        return res.servers.map((server: Record<string, any>) => ({
          asg_name: res.name,
          name: server.name,
          address: server.private_ips[0],
        }));
      },
      errorCallback: backToDetail,
    });
  }
  autoScalingList.value = await autoScalingApiCall;

  setBreadcrumbsParams({
    loadBalancerId: route.params.loadBalancerId,
    itemName: poolItem.value?.name,
  });
  const hasNeededReloadItems = poolItem.value?.status
    .toLowerCase()
    .includes('pending');
  if (hasNeededReloadItems) {
    if (!timer.value) {
      timer.value = window.setInterval(() => {
        void fetchData(true);
      }, 10000);
    }
  } else {
    if (timer.value) cancelAutoReload();
  }
  lastUpdatedTime.value = new Date();
};

const cancelAutoReload = () => {
  clearInterval(timer.value);
  timer.value = 0;
};

const updatePool = ($event: any, type: string) => {
  const updateKeys = [
    UPDATE_KEYS.NAME,
    UPDATE_KEYS.METHOD,
    UPDATE_KEYS.MEMBER_PORT,
  ];

  let item = null;
  if (updateKeys.includes(type)) {
    item = {
      [type]: type === UPDATE_KEYS.MEMBER_PORT ? Number($event) : $event,
    };
  } else if (type === UPDATE_KEYS.MEMBER) {
    if ($event.fromAutoScaling) {
      item = { asg_id: $event.id };
    } else {
      return handleMembersUpdate($event.members as any[]);
    }
  }
  if (item) {
    return makeApiCall({
      apiCallFn: updateLoadBalancerPool,
      payload: {
        loadBalancerId: route.params.loadBalancerId,
        poolId: route.params.poolId,
        valuesToUpdate: item,
      },
      successCallback: fetchData,
    });
  }
};
const handleMembersUpdate = async (newMembers: any[]) => {
  await makeApiCall({
    apiCallFn: loadBalancerPoolUpdateMembers,
    payload: {
      loadBalancerId: route.params.loadBalancerId,
      poolId: route.params.poolId,
      members: poolItem.value.members.concat(newMembers),
    },
  });
  await fetchData();
};

const backToDetail = async () => {
  void router.push({
    name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
    params: { id: route.params.loadBalancerId },
  });
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp :title="poolItem.name || ''" />
      <v-card width="100%">
        <v-card-title class="pa-2">
          <v-row no-gutters>
            <v-col cols="12">
              <DetailActionBtn
                v-for="item in [
                  {
                    text: t('table.action.delete'),
                    icon: 'mdi-delete-outline',
                    visible: true,
                    action: () =>
                      openDeleteDialog({
                        item: poolItem,
                        resourceType: $t('vm.lb.target.pool'),
                        message: $t('dialog.delete.message.type', {
                          type: $t('vm.lb.target.pool'),
                        }),
                        deleteAction: () =>
                          makeApiCall({
                            apiCallFn: deleteLoadBalancerPool,
                            payload: {
                              loadBalancerId: route.params.loadBalancerId,
                              poolId: route.params.poolId,
                            },
                            successCallback: backToDetail,
                          }),
                      }),
                  },
                  {
                    text: t('table.action.refresh'),
                    icon: 'mdi-refresh',
                    visible: true,
                    action: fetchData,
                  },
                ]"
                :key="item.text"
                :btn="item"
                :btn-tips="item.text"
                :btn-icon="item.icon"
                :last-updated-time="lastUpdatedTime"
                @item-click="item.action"
              />

              <span class="ocis-last-updated-time pt-4 pr-4">
                {{ $t('label.lastUpdated') }}
                {{ formatDateSec(lastUpdatedTime) }}
              </span>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text class="ocis-detail-scroll-view">
          <v-row>
            <v-col cols="12" class="pa-4">
              <DetailPanelGroup v-model="expansionPanels">
                <DetailPanel
                  :title="poolItem.name + t('basic.info')"
                  :value="poolItem.name"
                >
                  <v-row no-gutters>
                    <v-col cols="6">
                      <DetailItem
                        :title="
                          $t('basic.name', { type: $t('vm.lb.target.pool') })
                        "
                        :content="poolItem.name"
                      >
                        <OutlinedBtn
                          class="ml-2"
                          :text="$t('basic.edit')"
                          :disabled="!isStatusActive"
                          @click="
                            () => {
                              editingKey = UPDATE_KEYS.NAME;
                              editingLabel = $t('basic.name', {
                                type: $t('vm.lb.target.pool'),
                              });
                              editingValue = poolItem.name;
                              showEditValueDialog = true;
                            }
                          "
                        />
                      </DetailItem>
                      <DetailItem
                        class="pt-6"
                        :title="$t('vm.lb.target.pool.protocol')"
                        :content="poolItem.protocol"
                      />
                      <DetailItem
                        class="pt-6"
                        :title="$t('vm.lb.method')"
                        :content="poolItem.method"
                      >
                        <OutlinedBtn
                          class="ml-2"
                          :text="$t('basic.change')"
                          :disabled="!isStatusActive"
                          @click="
                            () => {
                              editingKey = UPDATE_KEYS.METHOD;
                              editingLabel = $t('vm.lb.method');
                              editingValue = poolItem.method;
                              showEditMethodDialog = true;
                            }
                          "
                        />
                      </DetailItem>
                    </v-col>
                    <v-col cols="6">
                      <DetailItem
                        class="pt-6"
                        :title="$t('label.serviceState')"
                        :content="poolItem.status"
                        is-status
                      />
                      <DetailItem
                        class="pt-6"
                        :title="
                          $t('basic.port', { type: $t('vm.lb.target.pool') })
                        "
                        :content="poolItem.member_port"
                      >
                        <OutlinedBtn
                          class="ml-2"
                          :text="$t('basic.change')"
                          :disabled="!isStatusActive"
                          @click="
                            () => {
                              editingKey = UPDATE_KEYS.MEMBER_PORT;
                              editingLabel = $t('basic.port', {
                                type: $t('vm.lb.target.pool'),
                              });
                              editingValue = poolItem.member_port;
                              showEditValueDialog = true;
                            }
                          "
                        />
                      </DetailItem>
                    </v-col>
                    <v-col cols="12">
                      <v-row no-gutters>
                        <v-col cols="2" class="pt-6">
                          <span class="text-body-2">
                            {{ $t('vm.lb.target.pool.members') }}
                          </span>
                        </v-col>
                        <v-col class="pt-6">
                          <span class="text-body-2">
                            {{
                              poolItem.fromAutoScaling
                                ? $t('vm.lb.target.pool.source.as')
                                : $t('vm.lb.target.pool.source.ip')
                            }}
                          </span>
                          <v-data-table
                            v-if="poolItem.fromAutoScaling"
                            class="mt-2 ocis-table-border"
                            :group-by="[{ key: 'asg_name' }]"
                            :headers="[
                              {
                                title: $t('vm.lb.target.pool.members'),
                                key: 'data-table-group',
                                width: '20%',
                              },
                              {
                                title: $t('vm.instance'),
                                value: 'name',
                                width: '50%',
                              },
                              { title: 'IP', value: 'address', width: '30%' },
                            ]"
                            :items="poolItem.members"
                            hide-default-footer
                          >
                            <template
                              #group-header="{
                                item,
                                columns,
                                toggleGroup,
                                isGroupOpen,
                              }"
                            >
                              <tr>
                                <td :colspan="columns.length">
                                  <v-btn
                                    :icon="
                                      isGroupOpen(item) ? '$expand' : '$next'
                                    "
                                    size="small"
                                    variant="text"
                                    @click="toggleGroup(item)"
                                  />
                                  {{ item.value }}
                                </td>
                              </tr>
                            </template>
                          </v-data-table>
                          <DetailTable
                            v-else
                            class="pt-2"
                            :headers="[
                              {
                                title: $t('vm.lb.target.pool.members'),
                                value: 'name',
                              },
                              { title: 'IP', value: 'address' },
                            ]"
                            :items="
                              poolItem.members?.map(
                                (member: Record<string, any>) => ({
                                  ...member,
                                  name:
                                    member.name ||
                                    t('vm.lb.target.pool.custom'),
                                })
                              )
                            "
                            :actions="[
                              {
                                label: t('table.action.delete'),
                                action: member =>
                                  openDeleteDialog({
                                    item: member,
                                    deleteAction: () =>
                                      makeApiCall({
                                        apiCallFn: loadBalancerPoolRemoveMember,
                                        payload: {
                                          loadBalancerId:
                                            route.params.loadBalancerId,
                                          poolId: route.params.poolId,
                                          memberId: member.id,
                                        },
                                        successCallback: fetchData,
                                      }),
                                  }),
                              },
                            ]"
                          />
                          <OutlinedBtn
                            v-if="poolItem.asg"
                            :disabled="!isStatusActive"
                            class="mt-2"
                            :text="$t('basic.setting')"
                            @click="showAutoscalingDialog = true"
                          />
                          <OutlinedBtn
                            v-else
                            class="mt-2"
                            :disabled="!isStatusActive"
                            :text="$t('basic.setting')"
                            @click="showPoolMemberDialog = true"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </DetailPanel>
              </DetailPanelGroup>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-row>
    <EditValueDialog
      v-model:show="showEditValueDialog"
      :label="editingLabel"
      :value="editingValue"
      :input-type="editingKey === UPDATE_KEYS.MEMBER_PORT ? 'number' : 'text'"
      :max-val="editingKey === UPDATE_KEYS.MEMBER_PORT ? 65535 : 100"
      @update-value="$event => updatePool($event, editingKey)"
    />
    <EditValueDialog
      v-model:show="showEditMethodDialog"
      :label="editingLabel"
      :value="editingValue"
      use-select
      :select-items="Object.values(METHOD)"
      @update-value="$event => updatePool($event, editingKey)"
    />
    <VmLoadBalancerMemberDialog
      v-model:show="showPoolMemberDialog"
      :vm-list="vmList"
      :selected-members="poolItem.members"
      @submit="updatePool($event, UPDATE_KEYS.MEMBER)"
    />
    <VmLoadBalancerPoolAsgDialog
      v-model:show="showAutoscalingDialog"
      :as-list="
        autoScalingList.filter(
          (asg: any) =>
            !asg.lb_pool_id && asg.status?.toLowerCase() === 'active'
        )
      "
      :asg-id="poolItem.asg?.id"
      @submit="updatePool($event, UPDATE_KEYS.MEMBER)"
    />
  </UiContainer>
</template>
<style lang="scss" scoped>
.display-block {
  display: block;
}
</style>
