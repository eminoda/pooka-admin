# pooka-admin

> A fully controllable admin toolkit designed for frontend developers.

## Features

### UI 自主可控

### 开箱即用

内置 `Crud` 增删改查组件，基于 `@pooka/core` + `@pooka/ui`，可通过配置快速组装：

- 表格列配置：`columns`（支持文本、选择、开关等展示）
- 查询区配置：`search`（input/select/switch）
- 表单配置：`form.fields`（新增/编辑统一 schema）
- 行选择能力：`tableProps.rowSelection`（多选、禁选、批量删除）

完整示例见 `apps/playground/src/App.vue`，核心用法如下：

```ts
const crudOptions: UseCrudOptions<UserRow, UserRow> = {
  api: '/api/user',
  columns: [...],
  search: [...],
  form: { fields: [...] },
  tableProps: {
    rowSelection: {
      enabled: true,
      mode: 'multiple',
      disableRowWhen: (row) => row.status === true,
    },
  },
}
```

Playground 效果图：

![Playground CRUD 示例](./docs/playground-crud-1.png)

### LowCode

## TODO List

- [ ] UI 自主可控
  - [x] 集成 shadcn-vue
  - [x] 集成 unocss
  - [ ] 设计多种主题预设
- [ ] 开箱即用
  - [ ] 正删改查
  - [ ] 权限路由
  - [ ] 国际化
  - [ ] Mock
- [ ] 低代码 Schema

## quick start

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

## License

MIT
