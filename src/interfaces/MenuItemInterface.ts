import type { RouteParamsRaw, RouteRecordName } from 'vue-router';

/** Drawer Menu Item Interface */
export default interface MenuItem {
  title: string | '-' /** Item Name */;
  icon?: string /** Item Icon */;
  routeName?: RouteRecordName | '' /** Router Location */;
  routeParams?: RouteParamsRaw /** Params of the router location */;
  relatedPath?: string[];
  hide?: boolean /** is active */;
  group?: MenuItem[] /** Sub Items */;
  active?: boolean;
  iconSize?: string;
  img?: any;
  assessKey?: string | null | undefined;
  samePathCallback?: () => void;
  linkUrl?: string | null | undefined;
  onColor?: boolean;
}
