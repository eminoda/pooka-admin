import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { resolveUiPath } from './paths.js';

interface ComponentMap {
  localComponents: string[];
}

function readComponentMap(): ComponentMap {
  const file = resolveUiPath('component-map.json');
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw) as ComponentMap;
}

function ensureComponentsJson(cwd: string): void {
  const target = path.join(cwd, 'components.json');
  if (fs.existsSync(target)) {
    return;
  }

  const source = resolveUiPath('components.json');
  fs.copyFileSync(source, target);
}

function ensureTsconfigAliasFile(file: string, aliasPath: string): void {
  if (!fs.existsSync(file)) {
    return;
  }

  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw) as {
    compilerOptions?: { paths?: Record<string, string[]> };
  };

  data.compilerOptions ??= {};
  data.compilerOptions.paths ??= {};
  (data.compilerOptions as Record<string, unknown>).baseUrl ??= '.';

  if (!data.compilerOptions.paths['@/*']) {
    data.compilerOptions.paths['@/*'] = [aliasPath];
  }

  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function ensureTsconfigAlias(cwd: string): void {
  ensureTsconfigAliasFile(path.join(cwd, 'tsconfig.json'), './src/*');
  ensureTsconfigAliasFile(path.join(cwd, 'tsconfig.app.json'), './src/*');
}

function ensureUnoConfig(cwd: string): void {
  const target = path.join(cwd, 'uno.config.ts');
  if (fs.existsSync(target)) {
    return;
  }

  const content = [
    "import { defineConfig } from 'unocss';",
    "import { presetPooka } from '@pooka/ui/preset';",
    '',
    'export default defineConfig({',
    '  presets: [presetPooka()],',
    '});',
    '',
  ].join('\n');

  fs.writeFileSync(target, content, 'utf8');
}

function ensureShadcnUtils(cwd: string): void {
  const target = path.join(cwd, 'src', 'lib', 'utils.ts');
  if (fs.existsSync(target)) {
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  const content = [
    'import { clsx, type ClassValue } from "clsx";',
    'import { twMerge } from "tailwind-merge";',
    '',
    'export function cn(...inputs: ClassValue[]) {',
    '  return twMerge(clsx(inputs));',
    '}',
    '',
  ].join('\n');
  fs.writeFileSync(target, content, 'utf8');
}

function copyDir(sourceDir: string, targetDir: string): void {
  fs.mkdirSync(targetDir, { recursive: true });

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, target);
    } else {
      fs.copyFileSync(source, target);
    }
  }
}

function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`[pooka] command failed: ${command} ${args.join(' ')}`));
    });
  });
}

function pickPackageManager(): 'pnpm' | 'npm' {
  const ua = process.env.npm_config_user_agent ?? '';
  return ua.includes('pnpm') ? 'pnpm' : 'npm';
}

async function ensureDependencies(cwd: string, packages: string[]): Promise<void> {
  const pkgFile = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgFile)) {
    throw new Error('[pooka] 当前目录缺少 package.json，无法安装 CRUD 依赖');
  }
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const missing = packages.filter((item) => !pkg.dependencies?.[item] && !pkg.devDependencies?.[item]);
  if (missing.length === 0) {
    return;
  }
  const pm = pickPackageManager();
  if (pm === 'pnpm') {
    await runCommand('pnpm', ['add', ...missing], cwd);
    return;
  }
  await runCommand('npm', ['install', ...missing], cwd);
}

async function runShadcnAdd(cwd: string, component: string): Promise<void> {
  const pm = pickPackageManager();
  if (pm === 'pnpm') {
    await runCommand('pnpm', ['dlx', 'shadcn-vue@latest', 'add', component, '--yes'], cwd);
    return;
  }

  await runCommand('npx', ['shadcn-vue@latest', 'add', component, '--yes'], cwd);
}

function addLocalComponent(cwd: string, component: string): void {
  const sourceDir = resolveUiPath('src', 'components', 'ui', component);
  const targetDir = path.join(cwd, 'src', 'components', 'ui', component);

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`[pooka] 未找到本地组件模板: ${component}`);
  }

  copyDir(sourceDir, targetDir);
}

function ensureCrudDemoPage(cwd: string): void {
  const target = path.join(cwd, 'src', 'pooka-crud-demo.ts');
  if (fs.existsSync(target)) {
    return;
  }
  const content = [
    "import { computed } from 'vue';",
    "import { registerCrudUi, useCrud } from '@pooka/core';",
    "import { QueryForm, QueryTable } from '@pooka/ui';",
    '',
    "registerCrudUi({ table: QueryTable, form: QueryForm });",
    '',
    'interface UserRow {',
    '  id: number;',
    '  name: string;',
    '  status: number;',
    '}',
    '',
    'export function useCrudDemo() {',
    '  const crud = useCrud<UserRow, UserRow>({',
    "    api: '/api/user',",
    '    columns: [',
    "      { key: 'id', label: 'ID', type: 'number' },",
    "      { key: 'name', label: '姓名' },",
    "      { key: 'status', label: '状态', type: 'select', options: [",
    "        { label: '启用', value: 1 },",
    "        { label: '禁用', value: 0 },",
    '      ] },',
    '    ],',
    "    search: ['name', 'status'],",
    '  });',
    '',
    '  return {',
    '    tableProps: computed(() => ({',
    '      ...crud.tableProps.value,',
    "      onPageChange: (page: number) => crud.tableProps.value.onPageChange(page),",
    "      onPageSizeChange: (pageSize: number) => crud.tableProps.value.onPageSizeChange(pageSize),",
    "      onKeywordChange: (keyword: string) => crud.tableProps.value.onKeywordChange(keyword),",
    "      onCreateClick: () => crud.tableProps.value.onCreateClick(),",
    "      onEditClick: (row: UserRow) => crud.tableProps.value.onEditClick(row),",
    "      onDeleteClick: (row: UserRow) => crud.tableProps.value.onDeleteClick(row),",
    '    })),',
    '    formProps: crud.formProps,',
    '  };',
    '}',
    '',
  ].join('\n');
  fs.writeFileSync(target, content, 'utf8');
}

function ensureCrudDemoVue(cwd: string): void {
  const target = path.join(cwd, 'src', 'CrudPage.vue');
  if (fs.existsSync(target)) {
    return;
  }
  const content = [
    '<script setup lang="ts">',
    "import { QueryForm, QueryTable } from '@pooka/ui';",
    "import { useCrudDemo } from './pooka-crud-demo';",
    '',
    'const { tableProps, formProps } = useCrudDemo();',
    '</script>',
    '',
    '<template>',
    '  <main class="p-6">',
    '    <QueryTable',
    '      v-bind="tableProps"',
    '      @page-change="tableProps.onPageChange"',
    '      @page-size-change="tableProps.onPageSizeChange"',
    '      @keyword-change="tableProps.onKeywordChange"',
    '      @create-click="tableProps.onCreateClick"',
    '      @edit-click="tableProps.onEditClick"',
    '      @delete-click="tableProps.onDeleteClick"',
    '    />',
    '    <QueryForm',
    '      v-bind="formProps"',
    '      @close="formProps.onClose"',
    '      @submit="formProps.onSubmit"',
    '    />',
    '  </main>',
    '</template>',
    '',
  ].join('\n');
  fs.writeFileSync(target, content, 'utf8');
}

async function addCrud(cwd: string): Promise<void> {
  await ensureDependencies(cwd, ['@pooka/core', '@pooka/ui', '@tanstack/vue-query', '@tanstack/vue-table']);
  addLocalComponent(cwd, 'table');
  addLocalComponent(cwd, 'form');
  addLocalComponent(cwd, 'crud');
  ensureCrudDemoPage(cwd);
  ensureCrudDemoVue(cwd);
}

export async function addComponent(cwd: string, component: string): Promise<void> {
  const normalized = component.trim().toLowerCase();
  const map = readComponentMap();
  const localSet = new Set(map.localComponents.map((item) => item.toLowerCase()));

  ensureComponentsJson(cwd);
  ensureTsconfigAlias(cwd);
  ensureUnoConfig(cwd);
  ensureShadcnUtils(cwd);

  if (normalized === 'crud') {
    await addCrud(cwd);
    console.log('[pooka] add "crud" complete. created src/CrudPage.vue');
    return;
  }

  if (localSet.has(normalized)) {
    addLocalComponent(cwd, normalized);
    console.log(`[pooka] add "${normalized}" from @pooka/ui local templates`);
    return;
  }

  await runShadcnAdd(cwd, normalized);
  console.log(`[pooka] add "${normalized}" from shadcn-vue`);
}
