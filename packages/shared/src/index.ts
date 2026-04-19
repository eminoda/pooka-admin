/**
 * @pooka/shared
 *
 * 共享工具层：后续可集中放置
 * - 与 VueUse 对齐的 composables 封装
 * - 纯函数工具（日期、字符串、请求封装等）
 * - 跨包复用的 TypeScript 类型
 *
 * 保持无业务语义，避免循环依赖；仅依赖 vue / 浏览器标准 API。
 */
export function pookaSharedPing(): string {
  return 'pooka-shared';
}
