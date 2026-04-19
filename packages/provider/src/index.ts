/**
 * @pooka/provider
 *
 * 插件化上下文层：通过 Vue `provide/inject` 或组合式函数向应用注入横切能力。
 *
 * 规划中的能力（仅占位说明，不在本阶段实现）：
 * - `pookaI18n`：国际化文案与 locale 切换
 * - `pookaTheme`：亮暗色与设计令牌
 * - `pookaAccess`：权限、菜单、路由守卫
 *
 * 设计原则：各特性以独立子模块导出，应用侧按需组合，避免单一巨型 Provider。
 */
export function pookaProviderPlaceholder(): string {
  return 'pooka-provider';
}
