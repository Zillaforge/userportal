import { defineAsyncComponent } from 'vue';

import { useTheme } from 'vuetify';

// https://blog.codeminer42.com/how-to-use-dynamic-components-in-vue/
const vmIcon = async () => await import('@/components/svgIcons/IconVm.vue');
const applicationIcon = async () =>
  await import('@/components/svgIcons/IconApplication.vue');
const autoScalingIcon = async () =>
  await import('@/components/svgIcons/IconAutoScaling.vue');
const ctrImageIcon = async () =>
  await import('@/components/svgIcons/IconCtrImage.vue');
const dataExchangeIcon = async () =>
  await import('@/components/svgIcons/IconDataExchange.vue');
const dataReleaseIcon = async () =>
  await import('@/components/svgIcons/IconDataRelease.vue');
const resourceTransferIcon = async () =>
  await import('@/components/svgIcons/IconResourceTransfer.vue');
const fileSharingIcon = async () =>
  await import('@/components/svgIcons/IconFileSharing.vue');
const firewallIcon = async () =>
  await import('@/components/svgIcons/IconFirewall.vue');
const hpcDeliverIcon = async () =>
  await import('@/components/svgIcons/IconHpcDeliver.vue');
const k8sClusterIcon = async () =>
  await import('@/components/svgIcons/IconK8sCluster.vue');
const loadBalanceIcon = async () =>
  await import('@/components/svgIcons/IconLoadBalance.vue');
const pilotIcon = async () =>
  await import('@/components/svgIcons/IconPilot.vue');
const securityGroupIcon = async () =>
  await import('@/components/svgIcons/IconSecurityGroup.vue');
const virualVolumeIcon = async () =>
  await import('@/components/svgIcons/IconVirtualVolume.vue');
const virtualNetworkIcon = async () =>
  await import('@/components/svgIcons/IconVirtualNetwork.vue');
const vmImageIcon = async () =>
  await import('@/components/svgIcons/IconVmImage.vue');
const storageIcon = async () =>
  await import('@/components/svgIcons/IconStorage.vue');
const addFileIcon = async () =>
  await import('@/components/svgIcons/IconAddFile.vue');
const apiKeyIcon = async () =>
  await import('@/components/svgIcons/IconApiKey.vue');
const logIcon = async () => await import('@/components/svgIcons/IconLog.vue');
const keypairIcon = async () =>
  await import('@/components/svgIcons/IconKeypair.vue');
const floatingIpIcon = async () =>
  await import('@/components/svgIcons/IconFloatingIp.vue');

const IconKeys = {
  vm: 'vm',
  keypair: 'keypair',
  application: 'application',
  auto_scaling: 'auto_scaling',
  ctr_image: 'ctr_image',
  data_exchange: 'data_exchange',
  data_release: 'data_release',
  resource_transfer: 'resource_transfer',
  file_sharing: 'file_sharing',
  firewall: 'firewall',
  hpc_deliver: 'hpc_deliver',
  k8s_cluster: 'k8s_cluster',
  load_balance: 'load_balance',
  pilot: 'pilot',
  security_group: 'security_group',
  floating_ip: 'floating_ip',
  virtual_volume: 'virtual_volume',
  virtual_network: 'virtual_network',
  vm_image: 'vm_image',
  storage: 'storage',
  add_file: 'add_file',
  api_key: 'api_key',
  log: 'log',
};
const ServiceIcons = {
  [IconKeys.vm]: {
    svg: defineAsyncComponent(vmIcon),
    colorful: '#1488ac',
  },
  [IconKeys.application]: {
    svg: defineAsyncComponent(applicationIcon),
    colorful: '#6359b2',
  },
  [IconKeys.auto_scaling]: {
    svg: defineAsyncComponent(autoScalingIcon),
    colorful: '#0186c5',
  },
  [IconKeys.ctr_image]: {
    svg: defineAsyncComponent(ctrImageIcon),
    colorful: '#2aa092',
  },
  [IconKeys.data_exchange]: {
    svg: defineAsyncComponent(dataExchangeIcon),
    colorful: '#ed7e1e',
  },
  [IconKeys.data_release]: {
    svg: defineAsyncComponent(dataReleaseIcon),
    colorful: '#3977d9',
  },
  [IconKeys.resource_transfer]: {
    svg: defineAsyncComponent(resourceTransferIcon),
    colorful: '#9d4680',
  },
  [IconKeys.file_sharing]: {
    svg: defineAsyncComponent(fileSharingIcon),
    colorful: '#f5a93d',
  },
  [IconKeys.firewall]: {
    svg: defineAsyncComponent(firewallIcon),
    colorful: '#bf5050',
  },
  [IconKeys.hpc_deliver]: {
    svg: defineAsyncComponent(hpcDeliverIcon),
    colorful: '#3e5da2',
  },
  [IconKeys.k8s_cluster]: {
    svg: defineAsyncComponent(k8sClusterIcon),
    colorful: '#607e52',
  },
  [IconKeys.load_balance]: {
    svg: defineAsyncComponent(loadBalanceIcon),
    colorful: '#6071bf',
  },
  [IconKeys.pilot]: {
    svg: defineAsyncComponent(pilotIcon),
    colorful: '#1875c4',
  },
  [IconKeys.security_group]: {
    svg: defineAsyncComponent(securityGroupIcon),
    colorful: '#2c7e97',
  },
  [IconKeys.virtual_volume]: {
    svg: defineAsyncComponent(virualVolumeIcon),
    colorful: '#a65842',
  },
  [IconKeys.virtual_network]: {
    svg: defineAsyncComponent(virtualNetworkIcon),
    colorful: '#18a8c6',
  },
  [IconKeys.vm_image]: {
    svg: defineAsyncComponent(vmImageIcon),
    colorful: '#735fa8',
  },
  [IconKeys.storage]: {
    svg: defineAsyncComponent(storageIcon),
    colorful: '#0194d5',
  },
  [IconKeys.add_file]: {
    svg: defineAsyncComponent(addFileIcon),
    colorful: '#aab1c3',
  },
  [IconKeys.api_key]: {
    svg: defineAsyncComponent(apiKeyIcon),
    colorful: '#aab1c3',
  },
  [IconKeys.log]: {
    svg: defineAsyncComponent(logIcon),
    colorful: '#aab1c3',
  },
  [IconKeys.keypair]: {
    svg: defineAsyncComponent(keypairIcon),
    colorful: '#1488ac',
  },
  [IconKeys.floating_ip]: {
    svg: defineAsyncComponent(floatingIpIcon),
    colorful: '#1488ac',
  },
};

const getColor = (isSelected: any) => {
  const theme = useTheme();
  const themeColor = theme.computedThemes.value[theme.global.name.value].colors;
  return isSelected ? themeColor['menu-item-selected-color'] : 'white';
};

const getSvgThemeColor = (isColorful: any, iconName: string | number) => {
  if (isColorful) {
    return {
      round: ServiceIcons[iconName].colorful,
      icon: 'white',
    };
  }

  const theme = useTheme();
  const themeColor = theme.computedThemes.value[theme.global.name.value].colors;
  return {
    round: themeColor['svc-icon-round'],
    icon: themeColor['svc-icon-fill'],
  };
};

const useComposable = () => {
  return {
    IconKeys,
    ServiceIcons,

    getColor,
    getSvgThemeColor,
  };
};
export default useComposable;
