import type {
  PookaAccessContext,
  PookaAccessMenuItem,
  PookaAccessRouteItem,
} from './types.js';

function sortByOrder<T extends { meta?: { order?: number } }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ao = a.meta?.order ?? 0;
    const bo = b.meta?.order ?? 0;
    return ao - bo;
  });
}

function hasIntersection(left: string[] | undefined, right: string[]): boolean {
  if (!left?.length) {
    return true;
  }
  return left.some((item) => right.includes(item));
}

export function canAccessRoute(route: PookaAccessRouteItem, context: PookaAccessContext): boolean {
  if (route.meta?.ignoreAccess) {
    return true;
  }
  if (!context.token) {
    return false;
  }
  const rolePass = hasIntersection(route.meta?.requiredRoles, context.roles);
  const codePass = hasIntersection(route.meta?.requiredCodes, context.codes);
  return rolePass && codePass;
}

export function filterAccessibleRoutes(
  routes: PookaAccessRouteItem[],
  context: PookaAccessContext,
): PookaAccessRouteItem[] {
  const filtered: PookaAccessRouteItem[] = [];

  for (const route of sortByOrder(routes)) {
    const children = route.children?.length
      ? filterAccessibleRoutes(route.children, context)
      : undefined;
    const allowed = canAccessRoute(route, context);
    const visibleWithForbidden = route.meta?.menuVisibleWithForbidden && !allowed;

    if (!allowed && !visibleWithForbidden) {
      continue;
    }

    filtered.push({
      ...route,
      meta: {
        ...route.meta,
        forbidden: visibleWithForbidden ? true : route.meta?.forbidden,
      },
      children,
    });
  }

  return filtered;
}

function routeToMenu(route: PookaAccessRouteItem): PookaAccessMenuItem | null {
  if (route.meta?.hideInMenu) {
    return null;
  }

  const children = route.children?.map(routeToMenu).filter((item): item is PookaAccessMenuItem => Boolean(item));
  return {
    name: route.name,
    path: route.path,
    title: route.meta?.title ?? route.name,
    icon: route.meta?.icon,
    order: route.meta?.order,
    forbidden: route.meta?.forbidden,
    children: children?.length ? children : undefined,
  };
}

export function deriveMenusFromRoutes(routes: PookaAccessRouteItem[]): PookaAccessMenuItem[] {
  return routes
    .map(routeToMenu)
    .filter((item): item is PookaAccessMenuItem => Boolean(item));
}

export function flattenRoutes(routes: PookaAccessRouteItem[]): PookaAccessRouteItem[] {
  const result: PookaAccessRouteItem[] = [];
  for (const route of routes) {
    result.push(route);
    if (route.children?.length) {
      result.push(...flattenRoutes(route.children));
    }
  }
  return result;
}
