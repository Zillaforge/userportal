import type { Component } from 'vue';

import type { ExternalLinkItem } from '@/interfaces/LayoutItemInterface';

export type TableItem = Record<string, any>;

export const enum MainActionType { // default actions
  CREATE = 'create',
}

export const enum ActionType { // default actions
  START = 'start',
  STOP = 'stop',
  EDIT = 'edit',
  DELETE = 'delete',
}

export interface MainAction {
  icon?: string;
  label?: string;
  disabled?: boolean;
  action: () => void;
  type?: MainActionType; // only for default action
}

export interface TableAction {
  visible?: () => boolean;
  disabled?: () => boolean;
  icon?: string;
  tips?: string;
  action?: () => void;
  type?: ActionType; // only for default action
}

export interface TableActionBtn {
  visible?: boolean;
  disabled: boolean;
  icon: string;
  tips: string;
  action: () => void;
}

export interface MoreAction {
  visible?: (item: TableItem) => boolean;
  disabled?: (item: TableItem) => boolean;
  label?: string;
  action?: (item: TableItem, itemIndex: number) => void;
  type?: ActionType; // only for default action
  resourceType?: string;
  message?: string;
}

export interface MoreActionListItem {
  disabled: boolean;
  label: string;
  action: (item: TableItem, itemIndex: number) => void;
}

export interface TableHeader {
  title: string;
  subTitle?: string;
  align?: string;
  key: string;
  // filterable?: boolean;
  sortable?: boolean;
  useDateFilter?: boolean;
  isStatus?: boolean;
}

export interface ResourceInfo {
  title: string;
  keyOfvalue: string;
}

export interface NoDataSetting {
  icon?: string;
  svgIcon?: Component;
  image?: string;
  message1: string;
  message2?: string;
  link?: ExternalLinkItem;
  buttonTitle?: string;
  action?: () => void;
}

export interface CustomBtn {
  label: string;
  action: () => void;
  disabled?: boolean;
}

export interface BatchDeleteSetting {
  items: Record<string, any>[];
  dialogTitle?: string;
  dialogMessage?: string;
  tableHeaders?: TableHeader[];
  tableItemKey?: string;
  sortKey?: string;
  action: (selectedItems: TableItem[]) => Promise<void>;
}
