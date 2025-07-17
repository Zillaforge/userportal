<script lang="ts" setup>
import { useGlobal } from '@/store';
import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  makeApiCall,
  fetchLoadBalancerListener,
  updateLoadBalancerListener,
  deleteLoadBalancerListener,
  fetchLoadBalancerPoolList,
  fetchAutoScalingDetail,
} from '@/api';
import CertificateDialog from '@/components/CertificateDialog.vue';
import VmLoadBalancerHeaderDialog from '@/components/VmLoadBalancerHeaderDialog.vue';
import VmLoadBalancerPoolDialog from '@/components/VmLoadBalancerPoolDialog.vue';
import VmTimeoutDialog from '@/components/VmLoadBalancerTimeoutDialog.vue';
import VmLoadBalancerWhitelistDialog from '@/components/VmLoadBalancerWhitelistDialog.vue';
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
import { PROTOCOL } from '@/constants/VmConstants';
import i18n from '@/i18n';
import { formatDateSec, getPoolProtocol } from '@/utils/utils';

const UPDATE_KEYS = {
  NAME: 'name',
  PROTOCOL_PORT: 'protocol_port',
  INSERT_HEADERS: 'insert_headers',
  CERTIFICATE: 'certificate',
  TIMEOUT: 'timeout',
  ALLOWED_CIDRS: 'allowed_cidrs',
  POOL: 'pool',
};

const route = useRoute();
const router = useRouter();

const globalStore = useGlobal();
const { setProjectSwitchCallback } = useProjectSwitch();
const { t } = i18n.global;

const timer = ref(0);
const listenerItem = ref<Record<string, any>>({});
const poolList = ref<Record<string, any>[]>([]);
const lastUpdatedTime: Ref<Date | string> = ref('');

const showEditValueDialog = ref(false);
const editingKey = ref('');
const editingLabel = ref('');
const editingValue = ref('');

const showCertDialog = ref(false);
const showHeaderDialog = ref(false);
const showTimeoutDialog = ref(false);
const showWhitelistDialog = ref(false);
const showAssignPoolDialog = ref(false);

const isStatusActive = computed(
  () => listenerItem.value?.status?.toLowerCase() === 'active'
);
const expansionPanels = computed(() => {
  return [{ title: listenerItem.value.name, value: listenerItem.value.name }];
});
const filteredPoolList = computed(() =>
  poolList.value.filter(
    pool =>
      pool.protocol === getPoolProtocol(listenerItem.value.protocol as string)
  )
);

const backToDetail = async (id: string) => {
  void router.push({
    name: PAGE_TYPES.VM_LOAD_BALANCER_DETAIL,
    params: { id: route.params.loadBalancerId },
  });
};

onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_LOAD_BALANCER_LIST })
  );
});
onBeforeUnmount(() => cancelAutoReload());

const fetchData = async () => {
  listenerItem.value = await makeApiCall({
    apiCallFn: fetchLoadBalancerListener,
    payload: {
      loadBalancerId: route.params.loadBalancerId,
      listenerId: route.params.listenerId,
    },
    successCallback: res => {
      return {
        ...res,
        pool: res.pool
          ? { ...res.pool, fromAutoScaling: !!res.pool?.asg }
          : null,
        allowed_cidrs: res.allowed_cidrs.map((ip: string) => ({ cidr: ip })),
        timeout_client_data: res.timeout_client_data / 1000,
        timeout_member_connect: res.timeout_member_connect / 1000,
        timeout_member_data: res.timeout_member_data / 1000,
        timeout_tcp_inspect: res.timeout_tcp_inspect / 1000,
      };
    },
    errorCallback: backToDetail,
  });
  poolList.value = await makeApiCall({
    skipProgress: true,
    apiCallFn: fetchLoadBalancerPoolList,
    payload: route.params.loadBalancerId,
  });
  if (listenerItem.value.pool?.fromAutoScaling) {
    listenerItem.value.pool.members = await makeApiCall({
      skipProgress: true,
      apiCallFn: fetchAutoScalingDetail,
      payload: listenerItem.value.pool?.asg?.id,
      successCallback: res => {
        return res.servers.map((server: Record<string, any>) => ({
          asg_name: res.name,
          name: server.name,
          address: server.private_ips?.[0],
        }));
      },
      errorCallback: backToDetail,
    });
  }

  globalStore.setBreadcrumbsParams({
    loadBalancerId: route.params.loadBalancerId,
    itemName: listenerItem.value?.name,
  });

  const hasNeededReloadItem = listenerItem.value.status
    .toLowerCase()
    .includes('pending');
  if (hasNeededReloadItem) {
    if (!timer.value) {
      timer.value = window.setInterval(() => {
        void fetchData();
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

const updateListener = ($event: any, type: string) => {
  const updateKeys = [UPDATE_KEYS.NAME];

  let item: Record<string, any> = {
    insert_headers: listenerItem.value.insert_headers,
    allowed_cidrs: listenerItem.value.allowed_cidrs.map(
      (cidr: any) => cidr.cidr
    ),
  };
  if (updateKeys.includes(type)) {
    item = { ...item, [type]: $event };
  } else if (type === UPDATE_KEYS.CERTIFICATE) {
    item = {
      ...item,
      secret: {
        certificate: window.btoa($event.certificate as string),
        key: window.btoa($event.key as string),
      },
    };
  } else if (type === UPDATE_KEYS.PROTOCOL_PORT) {
    item = { ...item, [type]: Number($event) };
  } else if (type === UPDATE_KEYS.ALLOWED_CIDRS) {
    item = {
      ...item,
      allowed_cidrs: $event.map((i: { cidr: string }) => i.cidr),
    };
  } else if (type === UPDATE_KEYS.INSERT_HEADERS) {
    item = { ...item, ...getHeadersPayload($event as Record<string, boolean>) };
  } else if (type === UPDATE_KEYS.TIMEOUT) {
    item = { ...item, ...getTimeoutPayload($event) };
  } else if (type === UPDATE_KEYS.POOL) {
    if (!listenerItem.value.pool || $event.id !== listenerItem.value.pool?.id) {
      item = { ...item, pool_id: $event.id };
    }
  }

  if (item) {
    return makeApiCall({
      apiCallFn: updateLoadBalancerListener,
      payload: {
        loadBalancerId: route.params.loadBalancerId,
        listenerId: route.params.listenerId,
        valuesToUpdate: item,
      },
      successCallback: fetchData,
    });
  }
};
const getHeadersPayload = ($event: Record<string, boolean>) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const insert_headers: Record<string, string> = {};
  Object.keys($event).forEach((key: any) => {
    insert_headers[key] = String($event[key]);
  });
  return { insert_headers };
};
const getTimeoutPayload = ($event: any) => {
  const {
    timeoutClientData,
    timeoutMemberData,
    timeoutMemberConnect,
    timeoutTcpInspect,
  } = $event.timeout;
  return {
    timeout_client_data: Number(timeoutClientData) * 1000,
    timeout_member_connect: Number(timeoutMemberConnect) * 1000,
    timeout_member_data: Number(timeoutMemberData) * 1000,
    timeout_tcp_inspect: Number(timeoutTcpInspect) * 1000,
  };
};
</script>
<template>
  <UiContainer>
    <v-row class="ocis-main-content">
      <TitleComp :title="listenerItem.name || ''" />
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
                      globalStore.openDeleteDialog({
                        item: listenerItem,
                        resourceType: $t('vm.lb.listener'),
                        message: $t('dialog.delete.message.type', {
                          type: $t('vm.lb.listener'),
                        }),
                        deleteAction: () =>
                          makeApiCall({
                            apiCallFn: deleteLoadBalancerListener,
                            payload: {
                              loadBalancerId: route.params.loadBalancerId,
                              listenerId: listenerItem.id,
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
                  :title="listenerItem.name + t('basic.info')"
                  :value="listenerItem.name"
                >
                  <v-row no-gutters>
                    <v-col cols="12" class="pb-4 font-weight-bold">
                      <span>{{ $t('vm.lb.listener') }}</span>
                    </v-col>
                    <v-col cols="6">
                      <DetailItem
                        class="pt-6"
                        :title="$t('vm.lb.listener') + $t('basic.name')"
                        :content="listenerItem.name"
                      >
                        <OutlinedBtn
                          class="ml-2"
                          :text="$t('table.action.edit')"
                          :disabled="!isStatusActive"
                          @click="
                            () => {
                              editingKey = UPDATE_KEYS.NAME;
                              editingLabel =
                                $t('vm.lb.listener') + $t('label.name');
                              editingValue = listenerItem.name;
                              showEditValueDialog = true;
                            }
                          "
                        />
                      </DetailItem>
                      <DetailItem
                        class="pt-6"
                        :title="$t('vm.lb.listener') + $t('basic.protocol')"
                        :content="listenerItem.protocol"
                      />

                      <DetailItem
                        v-if="
                          listenerItem.protocol === PROTOCOL.TERMINATED_HTTPS
                        "
                        class="pt-6"
                        :title="$t('basic.certification')"
                        :content="
                          listenerItem.default_tls_cert_container_ref
                            ? $t('vm.lb.cert.set.already')
                            : ''
                        "
                      >
                        <OutlinedBtn
                          class="ml-3"
                          :disabled="!isStatusActive"
                          :text="$t('basic.setting')"
                          @click="showCertDialog = true"
                        />
                      </DetailItem>
                    </v-col>
                    <v-col cols="6" class="pt-2">
                      <DetailItem
                        class="pt-6"
                        :title="$t('label.serviceState')"
                        :content="listenerItem.status"
                        is-status
                      />
                      <DetailItem
                        class="pt-6 mt-2"
                        :title="$t('vm.lb.listener.port')"
                        :content="listenerItem.protocol_port"
                      />
                      <DetailItem
                        v-if="
                          listenerItem.protocol === PROTOCOL.HTTP ||
                          listenerItem.protocol === PROTOCOL.TERMINATED_HTTPS
                        "
                        class="pt-6"
                        :title="$t('basic.insert') + 'Headers'"
                      >
                        <v-chip
                          v-for="(header, index) in Object.keys(
                            listenerItem.insert_headers
                          ).filter(
                            header =>
                              listenerItem.insert_headers[header] === 'true'
                          )"
                          :key="index"
                          class="mr-2"
                        >
                          {{ header }}
                        </v-chip>
                        <OutlinedBtn
                          :text="$t('basic.change')"
                          :disabled="!isStatusActive"
                          @click="showHeaderDialog = true"
                        />
                      </DetailItem>
                    </v-col>

                    <v-col cols="12" class="pt-6">
                      <v-row no-gutters>
                        <v-col cols="2">
                          <span class="text-body-2">
                            {{ $t('vm.network') }}
                          </span>
                        </v-col>
                        <v-col>
                          <DetailTable
                            :headers="[
                              {
                                title: t('vm.lb.client.inactive.timeout'),
                                key: 'timeout_client_data',
                              },
                              {
                                title: t('vm.lb.server.timeout'),
                                key: 'timeout_member_connect',
                              },
                              {
                                title: t('vm.lb.server.inactive.timeout'),
                                key: 'timeout_member_data',
                              },
                              {
                                title: t('vm.lb.tcp.timeout'),
                                key: 'timeout_tcp_inspect',
                              },
                            ]"
                            :items="[listenerItem]"
                          />
                          <OutlinedBtn
                            class="mt-4"
                            :disabled="!isStatusActive"
                            :text="$t('basic.setting')"
                            @click="showTimeoutDialog = true"
                          />
                        </v-col>
                      </v-row>
                    </v-col>

                    <v-col cols="6" class="py-6">
                      <DetailItem :title="$t('basic.whitelist')">
                        <v-chip
                          v-for="(
                            list, index
                          ) in listenerItem.allowed_cidrs?.filter(
                            (list: any) => list.cidr
                          ) || []"
                          :key="index"
                          class="mr-2"
                        >
                          {{ list.cidr }}
                        </v-chip>
                        <OutlinedBtn
                          :text="$t('basic.edit')"
                          :disabled="!isStatusActive"
                          @click="showWhitelistDialog = true"
                        />
                      </DetailItem>
                    </v-col>

                    <v-divider />

                    <v-col cols="12" class="py-6 font-weight-bold">
                      <span>{{ $t('vm.lb.target.pool') }}</span>
                    </v-col>
                    <v-col cols="12">
                      <v-row no-gutters>
                        <v-col cols="2" class="pt-2">
                          <span>
                            {{ $t('vm.lb.target.pool') }}
                          </span>
                        </v-col>
                        <v-col>
                          <span>
                            {{
                              !!listenerItem.pool
                                ? $t('vm.lb.target.pool.assign')
                                : ''
                            }}
                          </span>
                          <OutlinedBtn
                            :class="{
                              'ml-4': listenerItem.pool && listenerItem.pool_id,
                            }"
                            :text="$t('basic.setting')"
                            :disabled="!isStatusActive"
                            @click="showAssignPoolDialog = true"
                          />
                          <OutlinedBtn
                            v-if="listenerItem.pool && listenerItem.pool_id"
                            class="ml-3"
                            :text="$t('basic.detach')"
                            :disabled="!isStatusActive"
                            @click="
                              globalStore.uiShowDialog({
                                title: $t('dialog.detach.title', {
                                  resource: $t('vm.lb.target.pool'),
                                }),
                                resourceInfo: [
                                  {
                                    title: $t('label.name'),
                                    value: listenerItem.pool?.name,
                                  },
                                ],
                                callback: () => {
                                  makeApiCall({
                                    apiCallFn: updateLoadBalancerListener,
                                    payload: {
                                      loadBalancerId:
                                        route.params.loadBalancerId,
                                      listenerId: route.params.listenerId,
                                      valuesToUpdate: { pool_id: '' },
                                    },
                                    successCallback: fetchData,
                                  });
                                },
                              })
                            "
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="6">
                      <DetailItem
                        class="pt-6"
                        :title="$t('vm.lb.target.pool') + $t('basic.name')"
                        :content="listenerItem.pool?.name"
                      />
                      <DetailItem
                        class="pt-6"
                        :title="$t('vm.lb.target.pool') + $t('basic.protocol')"
                        :content="listenerItem.pool?.protocol"
                      />
                      <DetailItem
                        class="pt-6"
                        :title="$t('vm.lb.method')"
                        :content="listenerItem.pool?.method"
                      />
                    </v-col>
                    <v-col cols="6">
                      <DetailItem
                        class="pt-6"
                        :title="$t('label.serviceState')"
                        :content="listenerItem.pool?.status"
                        :is-status="!!listenerItem.pool?.status"
                      />
                      <DetailItem
                        class="pt-6"
                        :title="$t('vm.lb.target.pool') + $t('content.port')"
                        :content="listenerItem.pool?.member_port"
                      />
                    </v-col>
                    <v-col cols="12" class="pt-6">
                      <v-row no-gutters>
                        <v-col cols="2">
                          <span class="text-body-2">
                            {{ $t('vm.lb.target.pool.members') }}
                          </span>
                        </v-col>
                        <v-col>
                          <v-data-table
                            v-if="listenerItem.pool?.fromAutoScaling"
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
                            :items="listenerItem.pool?.members"
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
                            :headers="[
                              {
                                title: $t('vm.lb.target.pool.members'),
                                value: 'name',
                              },
                              { title: 'IP', value: 'address' },
                            ]"
                            :items="listenerItem.pool?.members || []"
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
      :input-type="editingKey === UPDATE_KEYS.PROTOCOL_PORT ? 'number' : 'text'"
      :max-val="editingKey === UPDATE_KEYS.PROTOCOL_PORT ? 65535 : 100"
      @update-value="$event => updateListener($event, editingKey)"
    />
    <CertificateDialog
      v-model:show="showCertDialog"
      @submit="$event => updateListener($event, UPDATE_KEYS.CERTIFICATE)"
    />
    <VmLoadBalancerHeaderDialog
      v-model:show="showHeaderDialog"
      :insert-headers="listenerItem.insert_headers || {}"
      @update-value="
        $event => updateListener($event, UPDATE_KEYS.INSERT_HEADERS)
      "
    />
    <VmTimeoutDialog
      v-model:show="showTimeoutDialog"
      :timeout="{
        timeoutClientData: listenerItem.timeout_client_data,
        timeoutMemberConnect: listenerItem.timeout_member_connect,
        timeoutMemberData: listenerItem.timeout_member_data,
        timeoutTcpInspect: listenerItem.timeout_tcp_inspect,
      }"
      @submit="$event => updateListener($event, UPDATE_KEYS.TIMEOUT)"
    />
    <VmLoadBalancerWhitelistDialog
      v-model:show="showWhitelistDialog"
      :allowed-cidrs="listenerItem.allowed_cidrs || []"
      @update-value="
        $event => updateListener($event, UPDATE_KEYS.ALLOWED_CIDRS)
      "
    />
    <VmLoadBalancerPoolDialog
      v-model:show="showAssignPoolDialog"
      :pool-list="filteredPoolList"
      :selected-pool="listenerItem.pool"
      @update-value="$event => updateListener($event, UPDATE_KEYS.POOL)"
    />
  </UiContainer>
</template>
<style lang="scss" scoped>
.display-block {
  display: block;
}
</style>
