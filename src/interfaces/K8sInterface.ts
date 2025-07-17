export interface Flavor {
  id: string;
  name: string;
  gpu_count: number;
  gpu?: { count: number };
  vcpu: number;
  memory: number;
}

export interface IP {
  id: string;
  address: string;
}

export interface Network {
  name: string;
  floating: string;
  security_group: string[];
}

export interface EditNg {
  name: string;
  id: string;
  count?: number;
  newCount?: number;
}
