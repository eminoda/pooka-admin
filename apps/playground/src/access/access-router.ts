import {
  createAccessRouterProvider,
  createLayoutProvider,
  createPookaRuntime,
  type PookaAccessContext,
  type PookaLayoutController,
  type PookaAccessRouter,
  type PookaAccessRouteItem,
} from 'pooka-core';
import { getAuthState } from './auth';

async function fetchAccessRoutes(context: PookaAccessContext): Promise<PookaAccessRouteItem[]> {
  const role = context.roles[0] ?? 'viewer';
  const response = await fetch(`/api/access-routes?role=${encodeURIComponent(role)}`);
  const json = (await response.json()) as {
    code: number;
    data: PookaAccessRouteItem[];
  };
  return json.data ?? [];
}

export const runtime = createPookaRuntime();

runtime.register(
  createAccessRouterProvider({
    accessRouterOptions: {
      mode: 'backend',
      loginPath: '/login',
      forbiddenPath: '/403',
      defaultHomePath: '/',
      getContext: () => getAuthState(),
      fetchRoutes: fetchAccessRoutes,
    },
  }),
);
runtime.register(createLayoutProvider());

let initialized = false;

export async function initRuntime(): Promise<void> {
  if (initialized) {
    return;
  }
  await runtime.init();
  initialized = true;
}

export function getAccessRouter(): PookaAccessRouter {
  return runtime.get<PookaAccessRouter>('accessRouter');
}

export function getLayoutController(): PookaLayoutController {
  return runtime.get<PookaLayoutController>('layout');
}
