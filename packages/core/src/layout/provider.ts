import type { PookaProvider } from '../runtime/index.js';
import type { PookaAccessRouter } from '../access-router/types.js';
import { createLayoutController } from './controller.js';
import { deriveLayoutMenusFromAccessRouter } from './access-adapter.js';
import type { PookaLayoutController, PookaLayoutControllerOptions } from './types.js';

export interface PookaLayoutProviderOptions {
  providerName?: string;
  accessRouterProviderName?: string;
  controllerOptions?: PookaLayoutControllerOptions;
}

export function createLayoutProvider(
  options: PookaLayoutProviderOptions = {},
): PookaProvider<PookaLayoutController> {
  const providerName = options.providerName ?? 'layout';
  const accessRouterProviderName = options.accessRouterProviderName ?? 'accessRouter';

  return {
    name: providerName,
    dependsOn: [accessRouterProviderName],
    setup(context) {
      const accessRouter = context.get<PookaAccessRouter>(accessRouterProviderName);
      const controller = createLayoutController(options.controllerOptions);
      controller.setMenus(deriveLayoutMenusFromAccessRouter(accessRouter));
      return controller;
    },
  };
}
