export type PookaAccessRouterMode = 'frontend' | 'backend' | 'mixed';

export interface PookaAccessRouteMeta {
  title?: string;
  icon?: string;
  order?: number;
  ignoreAccess?: boolean;
  hideInMenu?: boolean;
  requiredRoles?: string[];
  requiredCodes?: string[];
  menuVisibleWithForbidden?: boolean;
  forbidden?: boolean;
}

export interface PookaAccessRouteItem {
  name: string;
  path: string;
  component?: string;
  redirect?: string;
  children?: PookaAccessRouteItem[];
  meta?: PookaAccessRouteMeta;
}

export interface PookaAccessMenuItem {
  name: string;
  path: string;
  title: string;
  icon?: string;
  order?: number;
  forbidden?: boolean;
  children?: PookaAccessMenuItem[];
}

export interface PookaAccessContext {
  token: null | string;
  roles: string[];
  codes: string[];
}

export interface PookaAccessRouterOptions {
  mode?: PookaAccessRouterMode;
  loginPath: string;
  forbiddenPath: string;
  defaultHomePath: string;
  routes?: PookaAccessRouteItem[];
  fetchRoutes?: (context: PookaAccessContext) => Promise<PookaAccessRouteItem[]>;
  getContext: () => PookaAccessContext | Promise<PookaAccessContext>;
}

export interface PookaAccessRouterState {
  isAccessRouterChecked: boolean;
  routes: PookaAccessRouteItem[];
  menus: PookaAccessMenuItem[];
}

export type PookaAccessGuardResult =
  | { allowed: true }
  | { allowed: false; reason: 'forbidden' | 'unauthorized'; redirectTo: string };

export interface PookaAccessRouter {
  ensureLoaded(): Promise<void>;
  guard(path: string, routeMeta?: PookaAccessRouteMeta): Promise<PookaAccessGuardResult>;
  getRoutes(): PookaAccessRouteItem[];
  getMenus(): PookaAccessMenuItem[];
  getState(): PookaAccessRouterState;
  reset(): void;
}
