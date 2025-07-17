export interface ExternalLinkItem {
  linkTo: Record<string, any> | string;
  text: string;
  isBreakLine?: boolean;
  unique?: boolean;
}

export interface ResourceInfo {
  title: string;
  value: string | string[];
}

export interface GlobalDlgParams {
  show?: boolean;
  width?: number;
  showWarningIcon?: boolean;
  title: string;
  message?: string;
  messageWithLink?: boolean;
  errorCode?: string;
  resourceInfo?: ResourceInfo[];
  callback?: (...args: any[]) => any | null | undefined;
  hideCancelBtn?: boolean;
  apiName?: string | undefined;
  errorResponse?: Record<string, any>;
}

export interface OptionCardItem {
  name?: string;
  description?: string;
  value?: string;
  img?: string | undefined | null;
}
export interface ProgressDlgParams {
  show?: boolean;
  message?: string;
}

export interface RadioButtonOptions {
  label?: string;
  value?: any;
  disabled?: boolean;
}

export interface SnackbarParams {
  show?: boolean;
  content: string;
  timeout?: number;
}
