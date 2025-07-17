import type { Component } from 'vue';

export default interface serviceItem {
  text: string;
  icon?: Component;
  menuIcon?: string;
  routeName?: string;
  hide?: boolean;
}
