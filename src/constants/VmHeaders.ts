import { computed } from 'vue';

import i18n from '@/i18n';

const { t } = i18n.global;

export const networkHeaders = computed(() => [
  {
    title: t('label.name'),
    width: '50%',
    value: 'name',
  },
  {
    title: t('services.securityGroup'),
    value: 'security_group',
    width: '50%',
  },
]);

export const volumeHeaders = computed(() => [
  {
    title: t('label.name'),
    value: 'name',
  },
  {
    title: t('vm.volume.size'),
    value: 'size',
  },
  {
    title: t('label.type'),
    value: 'type',
  },
]);

export const securityGroupHeaders = computed(() => [
  {
    title: t('vm.sg.traffic'),
    value: 'name',
  },
  {
    title: t('vm.volume.size'),
    value: 'size',
  },
  {
    title: t('label.type'),
    value: 'type',
  },
  {
    title: t('label.createdAt'),
    value: 'created_at',
  },
]);
