export const enum AlertType {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
}

export interface Alert {
  type: AlertType;
  msg: string;
}

interface ObjectDataItem<T = any> {
  [x: string]: any;
  value: any;
  raw: T;
}

export interface IamUserInfo {
  account: string;
  createdAt: Date | string | null;
  description: string;
  displayName: string;
  email: string;
  extra?: ObjectDataItem;
  frozen: boolean;
  lastLoginAt: Date | string | null;
  mfa: boolean;
  namespace: string;
  updatedAt: Date | string | null;
  userId: string;
}
