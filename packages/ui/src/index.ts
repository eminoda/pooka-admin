/**
 * @pooka/ui — 基础组件导出入口。
 * shadcn-vue 组件将位于 `src/components/ui/*`（或按 components.json 的 aliases）。
 */
export const pookaUiVersion = '0.0.0';
export { default as table } from './components/ui/table/Table.vue';
export { default as form } from './components/ui/form/Form.vue';
export { QueryForm, QueryTable } from './components/ui/crud/index.js';
