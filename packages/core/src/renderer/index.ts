import { defineComponent, h, type Component, type VNode } from 'vue';

export interface PookaNode {
  type: string;
  id?: string;
  props?: Record<string, unknown>;
  children?: PookaNode[];
}

export type PookaSchema = PookaNode | PookaNode[];

export interface PookaRenderOptions {
  data?: Record<string, unknown>;
  registry?: Record<string, Component>;
}

export interface PookaRegisterAllOptions {
  namespace?: string;
  conflict?: 'warn' | 'error' | 'overwrite';
  resolveName?: (modulePath: string, moduleExports: Record<string, unknown>) => string;
  pickComponent?: (moduleExports: Record<string, unknown>) => Component | undefined;
}

export interface PookaRegisterAllResult {
  registered: string[];
  skipped: string[];
}

const globalRegistry = new Map<string, Component>();

export function pookaRegister(name: string, component: Component): void {
  globalRegistry.set(name, component);
}

export function pookaUnregister(name: string): void {
  globalRegistry.delete(name);
}

export function pookaGetRegistered(name: string): Component | undefined {
  return globalRegistry.get(name);
}

function toKebabCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function defaultResolveName(modulePath: string): string {
  const normalized = modulePath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  const file = parts[parts.length - 1] ?? '';
  const parent = parts[parts.length - 2] ?? '';
  const base = file.replace(/\.vue$/, '');
  const baseKebab = toKebabCase(base);
  const parentKebab = toKebabCase(parent);

  if (baseKebab === parentKebab) {
    return parentKebab;
  }
  if (baseKebab.startsWith(parentKebab)) {
    const rest = baseKebab.slice(parentKebab.length).replace(/^-/, '');
    return rest ? `${parentKebab}-${rest}` : parentKebab;
  }
  return parentKebab ? `${parentKebab}-${baseKebab}` : baseKebab;
}

function defaultPickComponent(moduleExports: Record<string, unknown>): Component | undefined {
  if (moduleExports.default) {
    return moduleExports.default as Component;
  }
  for (const [key, value] of Object.entries(moduleExports)) {
    if (/^[A-Z]/.test(key) && value) {
      return value as Component;
    }
  }
  return undefined;
}

export function pookaRegisterAll(
  modules: Record<string, Record<string, unknown>>,
  options: PookaRegisterAllOptions = {},
): PookaRegisterAllResult {
  const {
    namespace,
    conflict = 'warn',
    resolveName = defaultResolveName,
    pickComponent = defaultPickComponent,
  } = options;

  const result: PookaRegisterAllResult = { registered: [], skipped: [] };

  for (const [modulePath, moduleExports] of Object.entries(modules)) {
    const component = pickComponent(moduleExports);
    if (!component) {
      result.skipped.push(modulePath);
      continue;
    }

    const rawName = resolveName(modulePath, moduleExports);
    const key = namespace ? `${namespace}.${rawName}` : rawName;

    if (globalRegistry.has(key) && conflict !== 'overwrite') {
      if (conflict === 'error') {
        throw new Error(`[pooka] duplicate registry key: ${key}`);
      }
      if (conflict === 'warn') {
        console.warn(`[pooka] duplicate registry key skipped: ${key}`);
      }
      result.skipped.push(key);
      continue;
    }

    globalRegistry.set(key, component);
    result.registered.push(key);
  }

  return result;
}

function renderChildren(children: PookaNode[] | undefined): VNode[] | undefined {
  if (!children?.length) {
    return undefined;
  }
  return children.map((item) => renderNode(item)).filter((item): item is VNode => Boolean(item));
}

function resolveComponent(
  type: string,
  overrideRegistry?: Record<string, Component>,
): Component | string {
  return overrideRegistry?.[type] ?? globalRegistry.get(type) ?? type ?? 'div';
}

function renderNode(node: PookaNode, overrideRegistry?: Record<string, Component>): VNode {
  return h(resolveComponent(node.type, overrideRegistry) as any, node.props ?? {}, renderChildren(node.children));
}

export function pookaRender(schema: PookaSchema, options: PookaRenderOptions = {}) {
  return defineComponent({
    name: 'PookaRender',
    setup() {
      return () => {
        if (Array.isArray(schema)) {
          return h(
            'div',
            { class: 'pooka-render-root' },
            schema.map((item) => renderNode(item, options.registry)),
          );
        }
        return renderNode(schema, options.registry);
      };
    },
  });
}
