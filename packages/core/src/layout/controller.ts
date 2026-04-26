import type {
  PookaLayoutController,
  PookaLayoutControllerOptions,
  PookaLayoutMenuItem,
  PookaLayoutState,
} from './types.js';

function cloneState(state: PookaLayoutState): PookaLayoutState {
  return {
    collapsed: state.collapsed,
    activePath: state.activePath,
    openKeys: [...state.openKeys],
    menus: state.menus,
  };
}

export function createLayoutController(
  options: PookaLayoutControllerOptions = {},
): PookaLayoutController {
  const state: PookaLayoutState = {
    collapsed: options.collapsed ?? false,
    activePath: options.activePath ?? '/',
    openKeys: options.openKeys ?? [],
    menus: options.menus ?? [],
  };

  function getState(): PookaLayoutState {
    return cloneState(state);
  }

  function setCollapsed(collapsed: boolean): PookaLayoutState {
    state.collapsed = collapsed;
    return getState();
  }

  function toggleCollapsed(): PookaLayoutState {
    state.collapsed = !state.collapsed;
    return getState();
  }

  function setActivePath(path: string): PookaLayoutState {
    state.activePath = path;
    return getState();
  }

  function setOpenKeys(keys: string[]): PookaLayoutState {
    state.openKeys = [...keys];
    return getState();
  }

  function setMenus(menus: PookaLayoutMenuItem[]): PookaLayoutState {
    state.menus = menus;
    return getState();
  }

  return {
    getState,
    setCollapsed,
    toggleCollapsed,
    setActivePath,
    setOpenKeys,
    setMenus,
  };
}
