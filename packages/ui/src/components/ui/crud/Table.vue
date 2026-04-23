<script setup lang="ts">
import type { Component } from 'vue';
import type { CrudActionConfig, CrudColumn } from '@pooka/core';

interface TableRow {
  id?: string | number;
  [key: string]: unknown;
}

defineProps<{
  rows: TableRow[];
  columns: CrudColumn[];
  loading: boolean;
  actions: CrudActionConfig;
  tableComponent: Component | string;
  buttonComponent: Component | string;
  switchComponent: Component | string;
}>();

const emit = defineEmits<{
  createClick: [];
  refreshClick: [];
  editClick: [row: TableRow];
  deleteClick: [row: TableRow];
}>();

function actionLabel(action: boolean | { label?: string; confirm?: string } | undefined, fallback: string): string {
  if (!action || typeof action === 'boolean') {
    return fallback;
  }
  return action.label ?? fallback;
}
</script>

<template>
  <section class="rounded-md border">
    <div class="flex items-center justify-end gap-2 border-b p-3">
      <component
        :is="buttonComponent"
        v-if="actions.create !== false"
        class="h-9 gap-1.5 px-3 text-sm"
        type="button"
        @click="emit('createClick')"
      >
        <span class="i-ant-design:plus-outlined text-base" />
        {{ actionLabel(actions.create, '新增') }}
      </component>
      <component :is="buttonComponent" class="h-9 gap-1.5 px-3 text-sm" type="button" @click="emit('refreshClick')">
        <span class="i-ant-design:reload-outlined text-base" />
        刷新
      </component>
    </div>
    <component :is="tableComponent" class="w-full min-w-[760px] text-sm">
      <thead class="bg-muted/50">
        <tr>
          <th v-for="column in columns" :key="column.key" class="h-10 px-3 text-left font-medium">
            {{ column.label }}
          </th>
          <th class="h-10 w-44 px-3 text-left font-medium">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length + 1" class="p-4 text-center text-muted-foreground">Loading...</td>
        </tr>
        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length + 1" class="p-4 text-center text-muted-foreground">No data</td>
        </tr>
        <tr v-for="(row, rowIndex) in rows" v-else :key="row.id ?? rowIndex" class="border-b last:border-b-0">
          <td v-for="column in columns" :key="column.key" class="p-3 align-middle">
            <template v-if="column.type === 'switch'">
              <component :is="switchComponent" :model-value="Boolean(row[column.key])" disabled />
            </template>
            <template v-else>
              {{ column.formatter ? column.formatter(row[column.key], row as Record<string, unknown>) : row[column.key]
                }}
            </template>
          </td>
          <td class="p-3">
            <div class="flex items-center gap-2">
              <component :is="buttonComponent" variant="ghost" size="sm" v-if="actions.edit !== false"
                class="h-8 gap-1 px-2 text-xs" type="button" @click="emit('editClick', row)">
                <span class="i-ant-design:edit-outlined text-sm" />
                {{ actionLabel(actions.edit, '编辑') }}
              </component>
              <component :is="buttonComponent" variant="ghost" size="sm" v-if="actions.delete !== false"
                class="h-8 gap-1 px-2 text-xs text-destructive" type="button" @click="emit('deleteClick', row)">
                <span class="i-ant-design:delete-outlined text-sm" />
                {{ actionLabel(actions.delete, '删除') }}
              </component>
            </div>
          </td>
        </tr>
      </tbody>
    </component>
  </section>
</template>
