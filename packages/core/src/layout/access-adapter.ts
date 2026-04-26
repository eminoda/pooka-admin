import type { PookaAccessMenuItem, PookaAccessRouter } from '../access-router/types.js';
import type { PookaLayoutMenuItem } from './types.js';

function mapMenuItem(item: PookaAccessMenuItem): PookaLayoutMenuItem {
  return {
    name: item.name,
    path: item.path,
    title: item.title,
    icon: item.icon,
    order: item.order,
    forbidden: item.forbidden,
    children: item.children?.map(mapMenuItem),
  };
}

export function deriveLayoutMenusFromAccessRouter(
  accessRouter: PookaAccessRouter,
): PookaLayoutMenuItem[] {
  return accessRouter.getMenus().map(mapMenuItem);
}
