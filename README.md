# pooka-admin

基于 **Vue 3 + pnpm + Turborepo** 的管理后台组件库 monorepo（第一阶段：骨架与工程化，无业务实现）。

## 包一览

| 包名 | 说明 |
|------|------|
| `@pooka/ui` | 用户侧主入口：基础 UI（shadcn-vue 本地化）、**UnoCSS 与 design token 相关 preset**、全局样式；**对外 re-export** 集成 TanStack 的 Table / Form 等（实现来自 `@pooka/core`，本包依赖并统一暴露） |
| `@pooka/core` | Table / Form / `pookaRender` 等：**与 TanStack 集成的业务级组件与逻辑**在此实现；不作为终端用户直接依赖的首选入口 |
| `@pooka/cli` | `pooka add <component>` 等 CLI（cac） |
| `@pooka/provider` | 未来国际化、主题、权限等 Provider |
| `@pooka/shared` | 共享工具与 composables |
| `@pooka/playground` | Vite 演示应用 |

### `@pooka/ui` 与 `@pooka/core` 的边界

- **UnoCSS / token preset**：由 `@pooka/ui` 提供（不再单独拆到 config 包）。
- **TanStack Table、Form 等**：在 `@pooka/core` 开发与维护；**使用者从 `@pooka/ui` 导入**对应组件或 API，`@pooka/ui` 内部引用 `@pooka/core`，避免业务侧同时依赖两套入口。

## 常用命令

```bash
pnpm install
pnpm dev:playground
pnpm build
pnpm lint
pnpm type-check
```

CLI（需先构建 `@pooka/cli`）：

```bash
pnpm build:cli
pnpm pooka add button
```

## 许可

MIT（若你需更换，请在仓库中自行修改。）
