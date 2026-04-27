<script setup lang="ts">
import type { CrudActionConfig, CrudColumn, CrudSearchField } from 'pooka-core';

interface TableRow {
  id?: string | number;
  [key: string]: any;
}

const props = defineProps<{
  rows: TableRow[];
  columns: CrudColumn[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  keyword?: string;
  searchFields?: CrudSearchField[];
  actions?: CrudActionConfig;
}>();

const emit = defineEmits<{
  pageChange: [page: number];
  pageSizeChange: [pageSize: number];
  keywordChange: [keyword: string];
  createClick: [];
  editClick: [row: TableRow];
  deleteClick: [row: TableRow];
}>();

function canShow(action: boolean | { label?: string } | undefined): boolean {
  return action !== false;
}

function actionLabel(
  action: boolean | { label?: string; confirm?: string } | undefined,
  fallback: string,
): string {
  if (!action || typeof action === 'boolean') {
    return fallback;
  }
  return action.label ?? fallback;
}

function totalPages(): number {
  return Math.max(1, Math.ceil(props.total / props.pageSize));
}
</script>

<template>
  <section class="grid gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <input
          :value="keyword ?? ''"
          class="h-9 w-56 rounded-md border px-3 text-sm"
          :placeholder="searchFields?.length ? `搜索：${searchFields.map((item) => item.key).join(', ')}` : '搜索'"
          @input="emit('keywordChange', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <button
        v-if="canShow(actions?.create)"
        class="inline-flex h-9 items-center rounded-md border px-3 text-sm"
        type="button"
        @click="emit('createClick')"
      >
        {{ actionLabel(actions?.create, '新增') }}
      </button>
    </div>

    <div class="overflow-auto rounded-md border">
      <table class="w-full min-w-[640px] text-sm">
        <thead class="border-b bg-muted/50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="h-10 px-3 text-left font-medium"
            >
              {{ column.label }}
            </th>
            <th class="h-10 w-40 px-3 text-left font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + 1" class="p-4 text-center text-muted-foreground">Loading...</td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length + 1" class="p-4 text-center text-muted-foreground">No data</td>
          </tr>
          <tr v-for="(row, index) in rows" v-else :key="row.id ?? index" class="border-b last:border-b-0">
            <td v-for="column in columns" :key="column.key" class="p-3 align-middle">
              {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
            </td>
            <td class="p-3">
              <div class="flex items-center gap-2">
                <button
                  v-if="canShow(actions?.edit)"
                  class="inline-flex h-8 items-center rounded-md border px-2 text-xs"
                  type="button"
                  @click="emit('editClick', row)"
                >
                  {{ actionLabel(actions?.edit, '编辑') }}
                </button>
                <button
                  v-if="canShow(actions?.delete)"
                  class="inline-flex h-8 items-center rounded-md border px-2 text-xs text-destructive"
                  type="button"
                  @click="emit('deleteClick', row)"
                >
                  {{ actionLabel(actions?.delete, '删除') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-end gap-3 text-sm">
      <select
        :value="pageSize"
        class="h-9 rounded-md border px-2"
        @change="emit('pageSizeChange', Number(($event.target as HTMLSelectElement).value))"
      >
        <option :value="10">10 / page</option>
        <option :value="20">20 / page</option>
        <option :value="50">50 / page</option>
      </select>
      <button
        class="inline-flex h-9 items-center rounded-md border px-3"
        type="button"
        :disabled="page <= 1"
        @click="emit('pageChange', page - 1)"
      >
        Prev
      </button>
      <span>{{ page }} / {{ totalPages() }}</span>
      <button
        class="inline-flex h-9 items-center rounded-md border px-3"
        type="button"
        :disabled="page >= totalPages()"
        @click="emit('pageChange', page + 1)"
      >
        Next
      </button>
    </div>
  </section>
</template>
