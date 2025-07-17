import { usePortalConfig } from '@/store';

const portalConfigStore = usePortalConfig();
const DOC_URL = portalConfigStore.portalConfig.DOCUMENT_URL;
const Document = {
  VM: {
    tw: `${DOC_URL}/virtual-machine`,
    en: `${DOC_URL}/virtual-machine-en`,
  },
  KEYPAIR: {
    tw: `${DOC_URL}/key-pair`,
    en: `${DOC_URL}/key-pair-en`,
  },
  VOLUME: {
    tw: `${DOC_URL}/virtual-volume`,
    en: `${DOC_URL}/virtual-volume-en`,
  },
  NETWORK: {
    tw: `${DOC_URL}/virtual-network`,
    en: `${DOC_URL}/virtual-network-en`,
  },
  SECURITY_GROUP: {
    tw: `${DOC_URL}/security-group`,
    en: `${DOC_URL}/security-group-en`,
  },
  FLOATING_IP: {
    tw: `${DOC_URL}/floating-ip`,
    en: `${DOC_URL}/floating-ip-en`,
  },
  LOAD_BALANCER: {
    tw: `${DOC_URL}/load-balancing`,
    en: `${DOC_URL}/load-balancing-en`,
  },
  AUTO_SCALING: {
    tw: `${DOC_URL}/auto-scaling`,
    en: `${DOC_URL}/auto-scaling-en`,
  },
  FILE_SHARING: {
    tw: `${DOC_URL}/file-sharing`,
    en: `${DOC_URL}/file-sharing-en`,
  },
  VM_IMAGE: {
    tw: `${DOC_URL}/vm-image`,
    en: `${DOC_URL}/vm-image-en`,
  },
  CONTAINER_IMAGE: {
    tw: `${DOC_URL}/container-image`,
    en: `${DOC_URL}/container-image-en`,
  },
  DATA_EXCHANGE: {
    tw: `${DOC_URL}/data-exchange`,
    en: `${DOC_URL}/data-exchange-en`,
  },
  RESOURCE_TRANSFER: {
    tw: `${DOC_URL}/resource-transfer`,
    en: `${DOC_URL}/resource-transfer-en`,
  },
  DATA_RELEASE: {
    tw: `${DOC_URL}/data-release`,
    en: `${DOC_URL}/data-release-en`,
  },
  K8S_CLUSTER: {
    tw: `${DOC_URL}/kubernetes`,
    en: `${DOC_URL}/kubernetes-en`,
  },
  APPLICATION: {
    tw: `${DOC_URL}/application`,
    en: `${DOC_URL}/application-en`,
  },
  HPC_REMOTE: {
    tw: `${DOC_URL}/hpc-remote`,
    en: `${DOC_URL}/hpc-remote-en`,
  },
  S3: {
    tw: `${DOC_URL}/storage`,
    en: `${DOC_URL}/storage-en`,
  },
  KEY: {
    tw: `${DOC_URL}/key`,
    en: `${DOC_URL}/key-en`,
  },
  USAGE_LOG: {
    tw: `${DOC_URL}/usage-log`,
    en: `${DOC_URL}/usage-log-en`,
  },
  PLATFORM_MGMT: {
    tw: `${DOC_URL}/platform-mgmt`,
    en: `${DOC_URL}/platform-mgmt-en`,
  },
  SIMULATION: {
    tw: `${DOC_URL}/simulation`,
    en: `${DOC_URL}/simulation-en`,
  },
  MFA: {
    tw: `${DOC_URL}/2fa`,
    en: `${DOC_URL}/2fa-en`,
  },
  PASSWORD: {
    tw: `${DOC_URL}/password`,
    en: `${DOC_URL}/password-en`,
  },
};

export default Document;
