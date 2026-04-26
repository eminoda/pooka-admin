import type { PookaProvider } from '../runtime/index.js';
import { createAccessRouter } from './control.js';
import type { PookaAccessRouter, PookaAccessRouterOptions } from './types.js';

export interface PookaAccessRouterProviderOptions {
  providerName?: string;
  accessRouterOptions: PookaAccessRouterOptions;
}

export function createAccessRouterProvider(
  options: PookaAccessRouterProviderOptions,
): PookaProvider<PookaAccessRouter> {
  return {
    name: options.providerName ?? 'accessRouter',
    setup: () => createAccessRouter(options.accessRouterOptions),
  };
}
