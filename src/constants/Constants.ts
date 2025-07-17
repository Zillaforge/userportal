export const UUIDRegex =
  // eslint-disable-next-line no-useless-escape
  /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;

export const Constants = {
  APP_BAR_HEIGHT: 56,
  APP_BAR_HEIGHT_PX: '56px',
  MENU_NORMAL_WIDTH: 260,
  MENU_MINI_WIDTH: 56,
  MENU_ICON_DEFAULT_SIZE: 18,
  MENU_FOOTER_ICON_SIZE: 24,
  MENU_FOOTER_BTN_SIZE: 28,
};

export const COOKIE_CONFIG = {
  TOKEN: {
    NAME: 'trusted-cloud-token',
    DOMAIN: 'localhost',
  },
  ADMIN_TOKEN: {
    NAME: 'atoken',
  },
  PROJECT: {
    ID: 'trusted-cloud-project-id',
  },
};

export const LOCAL_DOMAIN = 'localhost';

export const DOMAIN = {
  LOCAL: '',
  BASE: '',
};

export const OS = { win: 0, mac: 1, linux: 2 };

export const IMAGE_TYPES: Record<string, string> = {
  common: 'image.type.common',
  increase: 'image.type.incremental',
};

export const LOG_TYPES = {
  PROJECT: 'project',
  USER: 'user',
};

export const MEMBER_TYPES = {
  TENANT_ADMIN: 'TENANT_ADMIN',
  TENANT_MEMBER: 'TENANT_MEMBER',
};

export const RESOURCE_REGION_TYPE = {
  PILOT: 'tw-tc-ad2',
  TRUSTED_PLATFORM: 'tw-tc-ad1',
};

export const DEFAULT_RESOURCE_REGION = RESOURCE_REGION_TYPE.TRUSTED_PLATFORM;
