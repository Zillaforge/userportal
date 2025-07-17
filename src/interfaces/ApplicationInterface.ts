export interface Flavor {
  name: string;
  // gpu: string;
  gpu_count: number;
  cpu: string;
  memory: string;
  // bandwidth: string;
  // status: string;
}

export interface Network {
  name: string;
  security_group: string[];
}

// export interface Volume {
//   name?: string;
//   desc?: string;
//   size?: string;
//   type?: string;
//   create_at?: string;
//   from?: string;
// }

export interface Keypair {
  label?: string | number | boolean | Record<string, any> | undefined;
  enable: string | boolean;
  name?: string;
  password?: string;
}

// export interface SecurityGroup {
//   name: string;
//   desc?: string;
//   rules?: string;
// }

// export interface LoadBalancer {
//   name: string;
//   desc?: string;
//   network?: string;
//   policy?: Record<string, any>[];
// }

// export type FormError = Record<string, string>;

// export const enum FloatingIPOptions {
//   NONE = 'none',
//   AUTO = 'auto',
//   PREBUILT = 'prebuilt',
// }

// export const enum VolumeOptions {
//   CREATE = 'create',
//   PREBUILT = 'prebuilt',
// }
