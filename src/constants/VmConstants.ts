import { computed } from 'vue';

import i18n from '@/i18n';

const { t } = i18n.global;

export const PROTOCOL = {
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  TERMINATED_HTTPS: 'TERMINATED_HTTPS',
  TCP: 'TCP',
  UDP: 'UDP',
};

export const METHOD = {
  LEAST_CONNECTIONS: 'LEAST_CONNECTIONS',
  ROUND_ROBIN: 'ROUND_ROBIN',
  SOURCE_IP: 'SOURCE_IP',
};

export const snapShotDetailHeader = computed(() => [
  {
    title: t('label.name'),
    key: 'name',
  },
  {
    title: t('vm.volume.snapshot.size'),
    key: 'size',
  },
  {
    title: t('label.serviceState'),
    key: 'status',
    isStatus: true,
  },
  {
    title: t('label.createdAt'),
    key: 'createdAt',
  },
  {
    title: t('label.createdBy'),
    key: 'user.name',
  },
]);

export const networkHeaders = computed(() => [
  {
    title: t('label.name'),
    width: '50%',
    key: 'name',
  },
  {
    title: t('services.securityGroup'),
    key: 'security_groups.name',
    width: '50%',
  },
]);

export const volumeHeaders = computed(() => [
  {
    title: t('label.name'),
    key: 'name',
  },
  {
    title: t('vm.volume.size'),
    key: 'size',
  },
  {
    title: t('label.type'),
    key: 'type',
  },
]);

export const securityGroupHeaders = computed(() => [
  {
    title: t('vm.sg.traffic'),
    key: 'name',
  },
  {
    title: t('vm.volume.size'),
    key: 'size',
  },
  {
    title: t('label.type'),
    key: 'type',
  },
  {
    title: t('label.createdAt'),
    key: 'created_at',
  },
]);

export const timeoutHeaders = computed(() => [
  {
    title: t('vm.lb.client.inactive.timeout'),
    key: 'timeoutClientData',
  },
  {
    title: t('vm.lb.server.timeout'),
    key: 'timeoutMemberConnect',
  },
  {
    title: t('vm.lb.server.inactive.timeout'),
    key: 'timeoutMemberData',
  },
  {
    title: t('vm.lb.tcp.timeout'),
    key: 'timeoutTcpInspect',
  },
]);
