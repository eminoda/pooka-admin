export interface PookaLayoutMenuItem {
  name: string;
  path: string;
  title: string;
  icon?: string;
  order?: number;
  forbidden?: boolean;
  children?: PookaLayoutMenuItem[];
}

export interface PookaLayoutState {
  collapsed: boolean;
  activePath: string;
  openKeys: string[];
  menus: PookaLayoutMenuItem[];
}

export interface PookaLayoutController {
  getState(): PookaLayoutState;
  setCollapsed(collapsed: boolean): PookaLayoutState;
  toggleCollapsed(): PookaLayoutState;
  setActivePath(path: string): PookaLayoutState;
  setOpenKeys(keys: string[]): PookaLayoutState;
  setMenus(menus: PookaLayoutMenuItem[]): PookaLayoutState;
}

export interface PookaLayoutControllerOptions {
  collapsed?: boolean;
  activePath?: string;
  openKeys?: string[];
  menus?: PookaLayoutMenuItem[];
}
