/**
 * Vuetify3 Plugin
 */
import {
  createVuetify,
  type VuetifyOptions,
  type ThemeDefinition,
} from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
// import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
// Translations provided by Vuetify
import { en } from 'vuetify/locale';

// Misc
import { loadFonts } from '@/plugins/webfontloader';

// Styles
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

const myCustomLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#2E71EB',
    secondary: '#2E71EB',
    icon_check_circle_color: '#2E71EB',
    icon_error_color: '#F50057',
    icon_initialize_color: '#FF9300',
    icon_running_color: '#FF9300',
    icon_default_color: '#78849E',
    icon_available_color: '#01BD7D',
    icon_review_color: '#FF9300',
    error: '#DC1940',
    border: '#000000',
    'hint-success': '#66DE98',
    'hint-error': '#FF7E7E',
    'alert-color': '#F50057',
    'app-bar-menu-bg': '#FFFFFF',
    'bg-breadcrumb': '#ffffff',
    'bg-default': '#FFFFFF',
    'bg-main': '#F5F5F7',
    'bg-card': '#FFFFFF',
    'bg-list': '#FAFAFA',
    'bg-hover': '#2A97FF',
    'bg-btn-texted': '#2E71EB',
    'bg-btn-texted-active': '#2A97FF',
    'bg-btn-contained-active': '#2A97FF',
    'bg-btn-contained-disabled': '#000000',
    'bg-btn-page': '#ffffff',
    'bg-btn-page-current': '#2E71EB',
    'bg-highlight': '#E7F5F8',
    'bg-tab-active-hover': '#3AAAC4',
    'bg-table-row-hover': '#f5f5f5',
    'bg-table-row-selected': '#e7f5f8',
    'bg-table-header-footer': '#F5F7F8',
    'bg-table-search-input': '#ffffff',
    'bg-tooltip': '#393939',
    'bg-chip': '#000000',
    'bg-dashboard-header': '#5f21A8',
    'bg-readonly-textarea': '#f5f5f5',
    'bg-dashboard-header-private': '#950014',
    'breadcrumb-disabled-text': '#2E71EB',
    'breadcrumb-normal-text': '#000000',
    'btn-contained-text': '#ffffff',
    'btn-contained-disabled-text': '#ffffff',
    'btn-page-border': '#707070',
    'btn-page-current-text': '#ffffff',
    'btn-texted': '#2E71EB',
    'btn-texted-active': '#2E71EB',
    'btn-texted-boarder': '#2E71EB',
    'btn-texted-disabled': '#000000',
    'btn-texted-disabled-border': '#000000',
    'circle-icon': '#000000',
    'info-icon': '#aab1c3',
    'input-default-border': '#000000',
    'menu-item-selected-color': '#2E71EB',
    'menu-text': '#000000',
    'drawer-item-selected-color': '#2a97ff',
    'tab-border': '#000000',
    'table-card-border': '#000000',
    'text-content': '#00000099',
    'text-disabled': '#000000',
    'text-general': '#000000',
    'text-highlight': '#2E71EB',
    'text-tooltip': '#FFFFFF',
    'text-service-type': '#0066CC',
    'svc-icon-round': '#aab1c3',
    'svc-icon-fill': '#ffffff',
    'ripple-color': '#2A97FF',
  },
  variables: {
    'app-bar-height-px': '64px',
    'app-bar-menu-hover-opacity': '0.07',
    'bg-general-opacity': '0.12',
    'bg-btn-texted-active-opacity': '0.12',
    'bg-btn-contained-disabled-opacity': '0.12',
    'bg-hover-opacity': '0.12',
    'border-opacity': 0.12, // #1f
    'breadcrumb-text-opacity': 0.87,
    'breadcrumb-disabled-text-opacity': 1,
    'btn-contained-disabled-text-opacity': '1',
    'btn-page-border-opacity': '0.26',
    'btn-texted-disabled-opacity': '0.26',
    'btn-texted-disabled-border-opacity': '0.26',
    'circle-icon-opacity': '0.6',
    'chip-opacity': '0.12',
    'chip-icon-opacity': '0.6',
    'content-min-width': '1200px',
    'footer-height-px': '56px',
    'input-default-border-opacity': '0.16',
    'menu-width': '260px',
    'tab-border-opacity': '0.26',
    'table-card-border-opacity': '0.12',
    'text-content-opacity': '0.6',
    'text-disabled-opacity': '0.26',
    'text-general-opacity': '0.87',
    'list-item-hover-opacity': '0.12',
    'drawer-item-hover-opacity': '0.06',
    'drawer-item-selected-opacity': '0.12',
    'drawer-item-selected-hover-opacity': '0.18',
    'border-disabled-opacity': '0.08',
    'ripple-opacity': '0.12',
    'box-shadow-opacity': '0.5',
    'list-border-opacity': '0.38',
  },
};

const myCustomDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    primary: '#2E71EB',
    secondary: '#27A5BD',
    icon_check_circle_color: '#a39fff',
    icon_error_color: '#F50057',
    icon_initialize_color: '#FFAF19',
    icon_running_color: '#Fd9560',
    icon_default_color: '#78849E',
    error: '#DC1940',
    border: '#FFFFFF',
    'hint-success': '#66DE98',
    'hint-error': '#FF7E7E',
    'alert-color': '#F50057',
    'app-bar-menu-bg': '#073346',
    'bg-breadcrumb': '#0d0d0d',
    'bg-default': '#000000',
    'bg-main': '#F5F5F7',
    'bg-card': '#272727',
    'bg-list': '#FAFAFA',
    'bg-hover': '#2A97FF',
    'bg-btn-texted': '#2E71EB',
    'bg-btn-texted-active': '#2A97FF',
    'bg-btn-contained-active': '#2A97FF',
    'bg-btn-contained-disabled': '#ffffff',
    'bg-btn-page': '#2e2e2e',
    'bg-btn-page-current': '#2E71EB',
    'bg-highlight': '#2b8294',
    'bg-tab-active-hover': '#3AAAC4',
    'bg-table-row-hover': '#3a3a3a',
    'bg-table-row-selected': '#3b3947',
    'bg-table-header-footer': '#F5F7F8',
    'bg-table-search-input': '#ffffff',
    'bg-tooltip': '#e8eaed',
    'bg-chip': '#000000',
    'breadcrumb-disabled-text': '#FFFFFF',
    'breadcrumb-normal-text': '#FFFFFF',
    'btn-contained-text': '#000000',
    'btn-contained-disabled-text': '#000000',
    'btn-page-border': '#ffffff',
    'btn-page-current-text': '#000000',
    'btn-texted': '#2E71EB',
    'btn-texted-active': '#ffffff',
    'btn-texted-boarder': '#2E71EB',
    'btn-texted-disabled': '#ffffff',
    'btn-texted-disabled-border': '#ffffff',
    'circle-icon': '#000000',
    'info-icon': '#FFFFFF',
    'input-default-border': '#FFFFFF',
    'menu-item-selected-color': '#00FFFF',
    'menu-text': '#ffffff',
    'drawer-item-selected-color': '#2a97ff',
    'tab-border': '#BCBCBC',
    'table-card-border': '#FFFFFF',
    'text-content': '#ffffff',
    'text-disabled': '#ffffff',
    'text-general': '#FFFFFF',
    'text-highlight': '#A39FFF',
    'text-tooltip': '#FFFFFF',
    'text-service-type': '#0066CC',
    'svc-icon-round': '#ffffff12',
    'svc-icon-fill': '#ffffffb3',
    'ripple-color': '#E5F2FF',
  },
  variables: {
    'app-bar-height-px': '64px',
    'app-bar-menu-hover-opacity': '0.07',
    'bg-general-opacity': '0.12',
    'bg-btn-texted-active-opacity': '0.12',
    'bg-btn-contained-disabled-opacity': '0.12',
    'bg-hover-opacity': '0.12',
    'border-opacity': 0.12, // #1f
    'breadcrumb-text-opacity': 0.6,
    'breadcrumb-disabled-text-opacity': 0.87,
    'btn-contained-disabled-text-opacity': '1',
    'btn-page-border-opacity': '0.3',
    'btn-texted-disabled-opacity': '0.38',
    'btn-texted-disabled-border-opacity': '0.12',
    'circle-icon-opacity': '0.6',
    'chip-opacity': '0.12',
    'chip-icon-opacity': '0.6',
    'content-min-width': '1200px',
    'footer-height-px': '56px',
    'input-default-border-opacity': '0.3',
    'menu-width': '260px',
    'tab-border-opacity': '1',
    'table-card-border-opacity': 0.16,
    'text-content-opacity': '0.6',
    'text-disabled-opacity': '0.38',
    'text-general-opacity': '0.87',
    'list-item-hover-opacity': '0.12',
    'drawer-item-hover-opacity': '0.06',
    'drawer-item-selected-opacity': '0.12',
    'drawer-item-selected-hover-opacity': '0.18',
    'border-disabled-opacity': '0.08',
    'box-shadow-opacity': '0.5',
    'list-border-opacity': '0.38',
  },
};

void loadFonts();

/**
 * Vuetify Components
 *
 * @see {@link https://vuetifyjs.com/en/features/treeshaking/}
 */
const vuetifyConfig: VuetifyOptions = {
  // Global configuration
  // https://vuetifyjs.com/en/features/global-configuration/
  /*
  defaults: {
    global: {
      ripple: false,
    },
    VSheet: {
      elevation: 4,
    },
  },
  */
  /*
  // Icon Fonts
  // https://vuetifyjs.com/en/features/icon-fonts/
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  */
  // Internationalization (i18n)
  // https://vuetifyjs.com/en/features/internationalization/#internationalization-i18n
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { en },
  },
  // Theme
  // https://vuetifyjs.com/en/features/theme/
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme,
      myCustomDarkTheme,
    },
  },
};

// if (import.meta.env.DEV) {
//   // Disable treeshaking for DEV mode.
//   vuetifyConfig = {
//     components: { components, labsComponents },
//     directives,
//     ...vuetifyConfig,
//   };
// }
export default createVuetify(vuetifyConfig);

// Export for test.
export { components, directives };
