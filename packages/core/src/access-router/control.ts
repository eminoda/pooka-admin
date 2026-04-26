import {
  canAccessRoute,
  deriveMenusFromRoutes,
  filterAccessibleRoutes,
  flattenRoutes,
} from './filter.js';
import type {
  PookaAccessContext,
  PookaAccessGuardResult,
  PookaAccessRouteItem,
  PookaAccessRouteMeta,
  PookaAccessRouter,
  PookaAccessRouterOptions,
  PookaAccessRouterState,
} from './types.js';

function mergeRoutes(
  localRoutes: PookaAccessRouteItem[],
  remoteRoutes: PookaAccessRouteItem[],
): PookaAccessRouteItem[] {
  const map = new Map<string, PookaAccessRouteItem>();
  for (const route of [...localRoutes, ...remoteRoutes]) {
    map.set(route.path, route);
  }
  return [...map.values()];
}

function appendRedirect(path: string, redirectPath: string): string {
  const url = new URL(path, 'https://pooka.local');
  url.searchParams.set('redirect', encodeURIComponent(redirectPath));
  const query = url.searchParams.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

export function createAccessRouter(options: PookaAccessRouterOptions): PookaAccessRouter {
  const mode = options.mode ?? 'frontend';
  let sourceRoutes: PookaAccessRouteItem[] = [];
  let routeMap = new Map<string, PookaAccessRouteItem>();
  const state: PookaAccessRouterState = {
    isAccessRouterChecked: false,
    routes: [],
    menus: [],
  };

  async function resolveContext(): Promise<PookaAccessContext> {
    return await options.getContext();
  }

  async function resolveSourceRoutes(context: PookaAccessContext): Promise<PookaAccessRouteItem[]> {
    const localRoutes = options.routes ?? [];
    const remoteRoutes = options.fetchRoutes ? await options.fetchRoutes(context) : [];

    if (mode === 'frontend') {
      return localRoutes;
    }
    if (mode === 'backend') {
      return remoteRoutes;
    }
    return mergeRoutes(localRoutes, remoteRoutes);
  }

  async function ensureLoaded(): Promise<void> {
    if (state.isAccessRouterChecked) {
      return;
    }

    const context = await resolveContext();
    sourceRoutes = await resolveSourceRoutes(context);
    state.routes = filterAccessibleRoutes(sourceRoutes, context);
    state.menus = deriveMenusFromRoutes(state.routes);
    routeMap = new Map(flattenRoutes(sourceRoutes).map((item) => [item.path, item]));
    state.isAccessRouterChecked = true;
  }

  async function guard(path: string, routeMeta?: PookaAccessRouteMeta): Promise<PookaAccessGuardResult> {
    const context = await resolveContext();
    const ignoreAccess = routeMeta?.ignoreAccess ?? false;
    const isLoginPath = path === options.loginPath;
    const isForbiddenPath = path === options.forbiddenPath;

    if (!context.token && !ignoreAccess && !isLoginPath) {
      return {
        allowed: false,
        reason: 'unauthorized',
        redirectTo: appendRedirect(options.loginPath, path),
      };
    }

    if (isLoginPath || isForbiddenPath || ignoreAccess) {
      return { allowed: true };
    }

    await ensureLoaded();

    const route = routeMap.get(path);
    if (!route) {
      return { allowed: true };
    }

    if (!canAccessRoute(route, context)) {
      return {
        allowed: false,
        reason: 'forbidden',
        redirectTo: options.forbiddenPath,
      };
    }

    return { allowed: true };
  }

  function getRoutes(): PookaAccessRouteItem[] {
    return state.routes;
  }

  function getMenus() {
    return state.menus;
  }

  function getState(): PookaAccessRouterState {
    return { ...state };
  }

  function reset(): void {
    state.isAccessRouterChecked = false;
    state.routes = [];
    state.menus = [];
    sourceRoutes = [];
    routeMap = new Map();
  }

  return {
    ensureLoaded,
    guard,
    getMenus,
    getRoutes,
    getState,
    reset,
  };
}
