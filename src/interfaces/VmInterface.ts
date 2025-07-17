export interface Nics {
  network_id: string;
  sg_ids: string[];
}

export interface VmCreation {
  name: string;
  description?: string;
  image_id: string;
  flavor_id: string;
  nics: Nics[];
  floating_ip?: string;
  keypair_id?: string;
  volumes_ids: string[];
  boot_script: string;
  password: string;
}

export interface Image {
  name: string;
  referenceTarget: string;
  description?: string | null;
  value: string;
  img?: string | null;
  tags: Record<string, string>[];
}

export interface Flavor {
  id: string;
  name: string;
  gpu: string;
  gpu_count: number;
  cpu: string;
  memory: string;
  bandwidth: string;
  status: string;
  tags?: string[];
}

export interface Sg {
  id: string[];
  name: string[];
}
export interface SecurityRule {
  direction: string;
  port_min: string;
  port_max: string;
  protocol: string;
  remote_cidr: string;
  network_type?: string;
}

export interface Network {
  id?: string;
  name?: string;
  from?: FloatingIPOptions;
  floating_ip?: string;
  security_groups?: Sg;
  cidr?: string;
  gateway?: string;
}

export interface Volume {
  id: string;
  status?: string;
  name: string;
  desc?: string;
  size?: number;
  type: string;
  create_at?: string;
  from?: string;
}

export interface Snapshot {
  id?: string;
  name: string;
  description?: string;
  volume_id?: string;
  size?: number;
}

export interface Keypair {
  id: string;
  enable?: string | boolean;
  public_key?: string;
  private_key?: string;
  description?: string;
  name?: string;
  password?: string;
}

export interface SecurityGroup {
  id: string;
  name: string;
  desc?: string;
  rules?: string;
}

export interface LoadBalancer {
  name: string;
  desc?: string;
  network?: string;
  listener?: Listener[];
}

export const enum FloatingIPOptions {
  NONE = 'none',
  AUTO = 'auto',
  PREBUILT = 'prebuilt',
}

export const enum VolumeOptions {
  CREATE = 'create',
  PREBUILT = 'prebuilt',
}

export type FormError = Record<string, string>;

export interface LoadBalancerTimeout {
  timeoutClientData: string;
  timeoutMemberConnect: string;
  timeoutMemberData: string;
  timeoutTcpInspect: string;
}

export interface Pool {
  name: string;
  fromAs?: boolean;
  status?: string;
  protocol: string;
  port: string;
  method: string;
  members: Record<string, any>[];
}

export interface Listener {
  status?: string;
  name: string;
  protocol: string;
  port: string;
  key: string;
  certificate: string;
  timeout: LoadBalancerTimeout;
  headers: Record<string, boolean>;
  whitelist: Record<string, any>[];
  enablePool: boolean;
  pool: Pool;
}

export const enum SERVER_ACTION {
  START = 'start',
  STOP = 'stop',
  REBOOT = 'reboot',
  RESIZE = 'resize',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXTEND_ROOT = 'extend_root',
  GET_PWD = 'get_pwd',
}

export const enum REBOOT_TYPE {
  SOFT = 'soft',
  HARD = 'hard',
}
