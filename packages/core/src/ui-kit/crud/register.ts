import type { Component } from 'vue';
import type { CrudUiRegistry } from './types.js';
import { pookaGetRegistered, pookaRegister } from '../../renderer/index.js';

const DEFAULT_CRUD_TYPE = 'crud.page';
const DEFAULT_TABLE_TYPE = 'crud.query-table';
const DEFAULT_FORM_TYPE = 'crud.query-form';
const DEFAULT_DRAWER_TYPE = 'crud.drawer';
const DEFAULT_INPUT_TYPE = 'crud.input';
const DEFAULT_SELECT_TYPE = 'crud.select';

export const REQUIRED_CRUD_REGISTRY_KEYS = ['table', 'form', 'drawer', 'input', 'select'] as const;
export type RequiredCrudRegistryKey = (typeof REQUIRED_CRUD_REGISTRY_KEYS)[number];

const POOKA_COMPONENT_TYPE_MAP: Record<string, string> = {
  Crud: DEFAULT_CRUD_TYPE,
  Table: DEFAULT_TABLE_TYPE,
  Form: DEFAULT_FORM_TYPE,
  Drawer: DEFAULT_DRAWER_TYPE,
  Input: DEFAULT_INPUT_TYPE,
  Select: DEFAULT_SELECT_TYPE,
  SelectTrigger: 'crud.select-trigger',
  SelectContent: 'crud.select-content',
  SelectGroup: 'crud.select-group',
  SelectValue: 'crud.select-value',
  SelectItem: 'crud.select-item',
  SelectLabel: 'crud.select-label',
  Button: 'crud.button',
};

export type PookaComponentRegistry = Record<string, Component | undefined>;
type CrudRegistryTypes = Pick<CrudUiRegistry, 'tableType' | 'formType' | 'drawerType' | 'inputType' | 'selectType'>;

export function registerLocalComponent(name: string, component: Component): void {
  pookaRegister(name, component);
}

export function registerLocalComponents(components: Record<string, Component>): void {
  for (const [name, component] of Object.entries(components)) {
    registerLocalComponent(name, component);
  }
}

export function registerPookaComponent(components: PookaComponentRegistry): void {
  for (const [name, component] of Object.entries(components)) {
    if (!component) {
      continue;
    }
    const resolvedType = POOKA_COMPONENT_TYPE_MAP[name] ?? name;
    registerLocalComponent(resolvedType, component);
  }
}

export function getPookaComponent(name: string, registryTypes: CrudRegistryTypes = {}): Component | undefined {
  const registryMap = getCrudRegistryTypeMap(registryTypes);
  const keyMap: Record<string, string> = {
    Table: registryMap.table,
    Form: registryMap.form,
    Drawer: registryMap.drawer,
    Input: registryMap.input,
    Select: registryMap.select,
  };
  const resolvedType = keyMap[name] ?? POOKA_COMPONENT_TYPE_MAP[name] ?? name;
  return pookaGetRegistered(resolvedType);
}

export function registerCrudComponents(registry: CrudUiRegistry): void {
  if (registry.crud) {
    registerLocalComponent(registry.crudType ?? DEFAULT_CRUD_TYPE, registry.crud);
  }
  if (registry.table) {
    registerLocalComponent(registry.tableType ?? DEFAULT_TABLE_TYPE, registry.table);
  }
  if (registry.form) {
    registerLocalComponent(registry.formType ?? DEFAULT_FORM_TYPE, registry.form);
  }
  if (registry.drawer) {
    registerLocalComponent(registry.drawerType ?? DEFAULT_DRAWER_TYPE, registry.drawer);
  }
  if (registry.input) {
    registerLocalComponent(registry.inputType ?? DEFAULT_INPUT_TYPE, registry.input);
  }
  if (registry.select) {
    registerLocalComponent(registry.selectType ?? DEFAULT_SELECT_TYPE, registry.select);
  }
}

export function getCrudRegistryTypeMap(registry: Pick<CrudUiRegistry, 'tableType' | 'formType' | 'drawerType' | 'inputType' | 'selectType'>) {
  return {
    table: registry.tableType ?? DEFAULT_TABLE_TYPE,
    form: registry.formType ?? DEFAULT_FORM_TYPE,
    drawer: registry.drawerType ?? DEFAULT_DRAWER_TYPE,
    input: registry.inputType ?? DEFAULT_INPUT_TYPE,
    select: registry.selectType ?? DEFAULT_SELECT_TYPE,
  };
}

export function assertCrudUiRegistered(
  registry: Pick<CrudUiRegistry, 'tableType' | 'formType' | 'drawerType' | 'inputType' | 'selectType'> = {},
): void {
  const typeMap = getCrudRegistryTypeMap(registry);
  const missing = REQUIRED_CRUD_REGISTRY_KEYS.filter((key) => !pookaGetRegistered(typeMap[key]));
  if (missing.length === 0) {
    return;
  }
  throw new Error(
    `[pooka] CRUD UI registry missing: ${missing.join(', ')}. Please call registerPookaComponent(...) before using <Crud />, or run "pooka add crud" to scaffold defaults.`,
  );
}
