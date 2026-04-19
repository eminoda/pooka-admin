import { defineComponent, h } from 'vue';

/** JSON Schema 或 Pooka 自有描述结构的占位类型 */
export type PookaSchema = Record<string, unknown>;

/**
 * 根据 schema 返回可挂载的 Vue 组件（占位实现）。
 * 后续可改为 h 渲染、异步组件或基于 amis-like 的 JSON 渲染管线。
 */
export function pookaRender(schema: PookaSchema) {
  return defineComponent({
    name: 'PookaRenderPlaceholder',
    setup() {
      return () =>
        h(
          'div',
          {
            class: 'pooka-render-placeholder',
            'data-pooka': 'renderer',
            'data-schema-keys': Object.keys(schema).length ? 'non-empty' : 'empty',
          },
          'pookaRender() placeholder — 接入 schema 引擎后替换',
        );
    },
  });
}
