import type { PookaAccessRouteMeta, PookaAccessRouter } from './types.js';

export interface PookaTanstackGuardArgs {
  toPath: string;
  routeMeta?: PookaAccessRouteMeta;
}

export interface PookaTanstackGuardRedirect {
  to: string;
  replace: boolean;
}

/**
 * Framework-agnostic adapter for TanStack Router style beforeLoad usage.
 * Caller can throw/redirect based on returned payload.
 */
export async function runTanstackAccessGuard(
  accessRouter: PookaAccessRouter,
  args: PookaTanstackGuardArgs,
): Promise<null | PookaTanstackGuardRedirect> {
  const result = await accessRouter.guard(args.toPath, args.routeMeta);
  if (result.allowed) {
    return null;
  }
  return {
    to: result.redirectTo,
    replace: true,
  };
}
