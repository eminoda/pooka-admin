# pooka-admin

基于 **Vue 3 + pnpm + Turborepo** 的管理后台组件库 monorepo（第一阶段：骨架与工程化，无业务实现）。

## 包一览

| 包名 | 说明 |
|------|------|
| `@pooka/ui` | 基础 UI（shadcn-vue 本地化 + UnoCSS 配置占位） |
| `@pooka/core` | Table / Form / `pookaRender` 占位 |
| `@pooka/cli` | `pooka add <component>` 等 CLI（cac） |
| `@pooka/provider` | 未来国际化、主题、权限等 Provider |
| `@pooka/shared` | 共享工具与 composables |
| `@pooka/config` | ESLint、Prettier、TS 基线、Uno/Tailwind 占位 |
| `@pooka/playground` | Vite 演示应用 |

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
