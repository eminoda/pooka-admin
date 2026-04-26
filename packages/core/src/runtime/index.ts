export interface PookaProviderSetupContext {
  get<T = unknown>(name: string): T;
  has(name: string): boolean;
}

export interface PookaProvider<T = unknown> {
  name: string;
  dependsOn?: string[];
  setup: (context: PookaProviderSetupContext) => T | Promise<T>;
  dispose?: (instance: T) => void | Promise<void>;
}

export interface PookaRuntime {
  register<T>(provider: PookaProvider<T>): void;
  registerMany(providers: PookaProvider[]): void;
  init(): Promise<void>;
  get<T = unknown>(name: string): T;
  has(name: string): boolean;
  dispose(): Promise<void>;
}

function toSetupContext(instances: Map<string, unknown>): PookaProviderSetupContext {
  return {
    get<T = unknown>(name: string): T {
      if (!instances.has(name)) {
        throw new Error(`[pooka] provider instance not found: ${name}`);
      }
      return instances.get(name) as T;
    },
    has(name: string): boolean {
      return instances.has(name);
    },
  };
}

function sortProviders(providers: PookaProvider[]): PookaProvider[] {
  const byName = new Map(providers.map((provider) => [provider.name, provider]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const sorted: PookaProvider[] = [];

  function visit(name: string): void {
    if (visited.has(name)) {
      return;
    }
    if (visiting.has(name)) {
      throw new Error(`[pooka] provider circular dependency: ${name}`);
    }
    const provider = byName.get(name);
    if (!provider) {
      throw new Error(`[pooka] provider not found: ${name}`);
    }

    visiting.add(name);
    for (const dep of provider.dependsOn ?? []) {
      if (!byName.has(dep)) {
        throw new Error(`[pooka] provider dependency missing: ${name} -> ${dep}`);
      }
      visit(dep);
    }
    visiting.delete(name);
    visited.add(name);
    sorted.push(provider);
  }

  for (const provider of providers) {
    visit(provider.name);
  }

  return sorted;
}

export function createPookaRuntime(): PookaRuntime {
  const providers = new Map<string, PookaProvider>();
  const instances = new Map<string, unknown>();
  let initialized = false;

  function register<T>(provider: PookaProvider<T>): void {
    providers.set(provider.name, provider as PookaProvider);
  }

  function registerMany(nextProviders: PookaProvider[]): void {
    for (const provider of nextProviders) {
      register(provider);
    }
  }

  async function init(): Promise<void> {
    if (initialized) {
      return;
    }
    const sortedProviders = sortProviders([...providers.values()]);
    const setupContext = toSetupContext(instances);
    for (const provider of sortedProviders) {
      const instance = await provider.setup(setupContext);
      instances.set(provider.name, instance);
    }
    initialized = true;
  }

  function get<T = unknown>(name: string): T {
    if (!instances.has(name)) {
      throw new Error(`[pooka] provider instance not found: ${name}`);
    }
    return instances.get(name) as T;
  }

  function has(name: string): boolean {
    return instances.has(name);
  }

  async function dispose(): Promise<void> {
    const sortedProviders = sortProviders([...providers.values()]).reverse();
    for (const provider of sortedProviders) {
      const instance = instances.get(provider.name);
      if (instance !== undefined && provider.dispose) {
        await provider.dispose(instance as never);
      }
    }
    instances.clear();
    initialized = false;
  }

  return {
    register,
    registerMany,
    init,
    get,
    has,
    dispose,
  };
}
