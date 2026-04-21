import { defineComponent, h, reactive, ref, type Component, type VNode } from 'vue';

export interface PookaAction {
  actionType: 'setValue' | 'toggle';
  name: string;
  value?: unknown;
}

export interface PookaNode {
  type: string;
  id?: string;
  props?: Record<string, unknown>;
  data?: Record<string, unknown>;
  children?: PookaNode[];
  visibleOn?: string;
  hiddenOn?: string;
  onEvent?: Record<string, { actions: PookaAction[] }>;
}

export type PookaSchema = PookaNode | PookaNode[];

export interface PookaRenderOptions {
  data?: Record<string, unknown>;
  registry?: Record<string, Component>;
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

function toEventHandlerName(eventName: string): string {
  return `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
}

function getByPath(source: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((cursor, key) => {
    if (!cursor || typeof cursor !== 'object') {
      return undefined;
    }
    return (cursor as Record<string, unknown>)[key];
  }, source);
}

function setByPath(source: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  const lastKey = keys[keys.length - 1];
  if (!lastKey) {
    return;
  }

  let cursor: Record<string, unknown> = source;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (!key) {
      continue;
    }
    const current = cursor[key];
    if (!current || typeof current !== 'object') {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[lastKey] = value;
}

function evaluateExpression(expression: string, scope: Record<string, unknown>): unknown {
  try {
    const fn = new Function('scope', `with (scope) { return (${expression}); }`);
    return fn(scope);
  } catch {
    return undefined;
  }
}

function resolveDynamicValue(input: unknown, scope: Record<string, unknown>): unknown {
  if (typeof input === 'string') {
    if (input.startsWith('${') && input.endsWith('}')) {
      const expression = input.slice(2, -1).trim();
      return evaluateExpression(expression, scope);
    }
    return input;
  }
  if (Array.isArray(input)) {
    return input.map((item) => resolveDynamicValue(item, scope));
  }
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      out[key] = resolveDynamicValue(value, scope);
    }
    return out;
  }
  return input;
}

function resolveVisible(node: PookaNode, scope: Record<string, unknown>): boolean {
  if (node.hiddenOn) {
    return !Boolean(evaluateExpression(node.hiddenOn, scope));
  }
  if (node.visibleOn) {
    return Boolean(evaluateExpression(node.visibleOn, scope));
  }
  return true;
}

export function pookaRender(schema: PookaSchema, options: PookaRenderOptions = {}) {
  return defineComponent({
    name: 'PookaRender',
    setup() {
      const rootData = reactive<Record<string, unknown>>(options.data ?? {});
      const forceTick = ref(0);

      const resolveComponent = (type: string): Component | string => {
        return options.registry?.[type] ?? globalRegistry.get(type) ?? 'div';
      };

      const runActions = (actions: PookaAction[], scope: Record<string, unknown>): void => {
        for (const action of actions) {
          if (action.actionType === 'setValue') {
            const resolved = resolveDynamicValue(action.value, scope);
            setByPath(rootData, action.name, resolved);
            continue;
          }
          if (action.actionType === 'toggle') {
            const current = Boolean(getByPath(rootData, action.name));
            setByPath(rootData, action.name, !current);
          }
        }
        forceTick.value += 1;
      };

      const renderNode = (node: PookaNode, parentScope: Record<string, unknown>): VNode | null => {
        const localData = resolveDynamicValue(node.data ?? {}, parentScope) as Record<string, unknown>;
        const scope = { ...parentScope, ...localData };

        if (!resolveVisible(node, scope)) {
          return null;
        }

        const component = resolveComponent(node.type);
        const props = (resolveDynamicValue(node.props ?? {}, scope) as Record<string, unknown>) ?? {};

        for (const [eventName, config] of Object.entries(node.onEvent ?? {})) {
          const key = toEventHandlerName(eventName);
          const previous = props[key];
          props[key] = (...args: unknown[]) => {
            if (typeof previous === 'function') {
              previous(...args);
            }
            runActions(config.actions ?? [], { ...scope, eventArgs: args });
          };
        }

        const children = node.children
          ?.map((child) => renderNode(child, scope))
          .filter((item): item is VNode => Boolean(item));

        return h(component as any, props, children);
      };

      return () => {
        void forceTick.value;
        const rootScope = { ...rootData };
        if (Array.isArray(schema)) {
          const children = schema
            .map((item) => renderNode(item, rootScope))
            .filter((item): item is VNode => Boolean(item));
          return h('div', { class: 'pooka-render-root' }, children);
        }
        return renderNode(schema, rootScope);
      };
    },
  });
}
