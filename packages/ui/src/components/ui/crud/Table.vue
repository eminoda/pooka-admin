<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue';
import { functionalUpdate, getCoreRowModel, useVueTable, type RowSelectionState } from '@tanstack/vue-table';
import type { CrudActionConfig, CrudColumn, CrudRowSelectionConfig } from '@pooka/core';

interface TableRow {
  id?: string | number;
  [key: string]: unknown;
}

const props = defineProps<{
  rows: TableRow[];
  columns: CrudColumn[];
  loading: boolean;
  actions: CrudActionConfig;
  rowSelection?: CrudRowSelectionConfig<TableRow>;
  tableComponent: Component | string;
  buttonComponent: Component | string;
  checkboxComponent: Component | string;
  switchComponent: Component | string;
}>();

const emit = defineEmits<{
  createClick: [];
  editClick: [row: TableRow];
  deleteClick: [row: TableRow];
  batchDeleteClick: [keys: Array<string | number>, rows: TableRow[]];
}>();

const rowSelectionState = ref<RowSelectionState>({});

const rowSelectionEnabled = computed(() => props.rowSelection?.enabled === true);
const rowSelectionMode = computed(() => props.rowSelection?.mode ?? 'multiple');
const preserveSelectedRowKeys = computed(() => props.rowSelection?.preserveSelectedRowKeys !== false);

const tanstackColumns = computed(() =>
  props.columns.map((column) => ({
    id: column.key,
    accessorKey: column.key,
    header: column.label,
  })),
);

const table = useVueTable({
  get data() {
    return props.rows;
  },
  get columns() {
    return tanstackColumns.value;
  },
  state: {
    get rowSelection() {
      return rowSelectionState.value;
    },
  },
  getRowId: (originalRow, index) => String(originalRow.id ?? index),
  getCoreRowModel: getCoreRowModel(),
  enableRowSelection: (row) => rowSelectionEnabled.value && !props.rowSelection?.disableRowWhen?.(row.original as TableRow),
  enableMultiRowSelection: () => rowSelectionMode.value === 'multiple',
  onRowSelectionChange: (updater) => {
    rowSelectionState.value = functionalUpdate(updater, rowSelectionState.value);
    syncSelectedRows();
  },
});

function rowKeyOf(row: TableRow, index = 0): string {
  return String(row.id ?? index);
}

function applySelectedKeys(keys: Array<string | number>): void {
  const nextState: RowSelectionState = {};
  for (const key of keys) {
    nextState[String(key)] = true;
  }
  rowSelectionState.value = nextState;
}

watch(
  () => props.rowSelection?.selectedRowKeys,
  (keys) => {
    if (!keys) {
      return;
    }
    applySelectedKeys(keys);
  },
  { immediate: true },
);

watch(
  () => props.rows,
  (rows) => {
    if (preserveSelectedRowKeys.value) {
      return;
    }
    const currentKeys = new Set(rows.map((row, index) => rowKeyOf(row, index)));
    rowSelectionState.value = Object.fromEntries(
      Object.entries(rowSelectionState.value).filter(([key, selected]) => selected && currentKeys.has(key)),
    );
    syncSelectedRows();
  },
  { deep: true },
);

function syncSelectedRows(): void {
  const keys = Object.keys(rowSelectionState.value).filter((key) => rowSelectionState.value[key]);
  const selectedMap = new Set(keys);
  const rows = props.rows.filter((row, index) => selectedMap.has(rowKeyOf(row, index)));
  props.rowSelection?.onSelectedRowKeysChange?.(
    rows.map((row, index) => row.id ?? rowKeyOf(row, index)),
    rows,
  );
}

const selectedRowCount = computed(() => Object.values(rowSelectionState.value).filter(Boolean).length);
const selectedKeys = computed<Array<string | number>>(() =>
  Object.keys(rowSelectionState.value).filter((key) => rowSelectionState.value[key]).map((key) => {
    const matchedRow = props.rows.find((row, index) => rowKeyOf(row, index) === key);
    return (matchedRow?.id as string | number | undefined) ?? key;
  }),
);
const selectedRows = computed<TableRow[]>(() => {
  const selectedMap = new Set(Object.keys(rowSelectionState.value).filter((key) => rowSelectionState.value[key]));
  return props.rows.filter((row, index) => selectedMap.has(rowKeyOf(row, index)));
});
const allRowsSelected = computed(() => table.getIsAllRowsSelected());
const someRowsSelected = computed(() => table.getIsSomeRowsSelected());
const headerCheckboxValue = computed<boolean | 'indeterminate'>(() => {
  if (allRowsSelected.value) {
    return true;
  }
  if (someRowsSelected.value) {
    return 'indeterminate';
  }
  return false;
});
const useNativeCheckbox = computed(() => props.checkboxComponent === 'input');

function clearSelection(): void {
  rowSelectionState.value = {};
  syncSelectedRows();
}

function actionLabel(action: boolean | { label?: string; confirm?: string } | undefined, fallback: string): string {
  if (!action || typeof action === 'boolean') {
    return fallback;
  }
  return action.label ?? fallback;
}

function onHeaderCheckboxChange(value: unknown): void {
  table.toggleAllRowsSelected(Boolean(value));
  syncSelectedRows();
}

function onRowCheckboxChange(row: ReturnType<typeof table.getRowModel>['rows'][number], value: unknown): void {
  if (isRowDisabled(row.original)) {
    return;
  }
  row.toggleSelected(Boolean(value));
  syncSelectedRows();
}

function handleBatchDelete(): void {
  emit('batchDeleteClick', selectedKeys.value, selectedRows.value);
}

function isRowDisabled(row: TableRow): boolean {
  return props.rowSelection?.disableRowWhen?.(row) === true;
}
</script>

<template>
  <section class="rounded-md border">
    <div class="flex items-center justify-end gap-2 border-b p-3">
      <div v-if="rowSelectionEnabled && selectedRowCount > 0" class="mr-auto flex items-center gap-2 text-xs text-muted-foreground">
        <span>已选 {{ selectedRowCount }} 项</span>
        <component
          :is="buttonComponent"
          v-if="actions.delete !== false"
          variant="ghost"
          size="sm"
          class="h-7 px-2 text-xs text-destructive"
          type="button"
          @click="handleBatchDelete"
        >
          批量删除
        </component>
        <component :is="buttonComponent" variant="ghost" size="sm" class="h-7 px-2 text-xs" type="button" @click="clearSelection">
          清空
        </component>
      </div>
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
    </div>
    <component :is="tableComponent" class="w-full min-w-[760px] text-sm">
      <thead class="bg-muted/50">
        <tr>
          <th v-if="rowSelectionEnabled" class="h-10 w-14 px-2 text-center font-medium">
            <template v-if="rowSelectionMode === 'multiple'">
              <input
                v-if="useNativeCheckbox"
                :checked="allRowsSelected"
                :indeterminate.prop="someRowsSelected && !allRowsSelected"
                type="checkbox"
                class="h-4 w-4 cursor-pointer align-middle"
                aria-label="Select all"
                @change="onHeaderCheckboxChange(($event.target as HTMLInputElement).checked)"
              >
              <component
                :is="checkboxComponent"
                v-else
                :model-value="headerCheckboxValue"
                aria-label="Select all"
                @update:model-value="onHeaderCheckboxChange"
              />
            </template>
          </th>
          <th v-for="header in table.getFlatHeaders()" :key="header.id" class="h-10 px-3 text-left font-medium">
            {{ String(header.column.columnDef.header ?? '') }}
          </th>
          <th class="h-10 w-44 px-3 text-left font-medium">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="table.getFlatHeaders().length + (rowSelectionEnabled ? 2 : 1)" class="p-4 text-center text-muted-foreground">
            Loading...
          </td>
        </tr>
        <tr v-else-if="rows.length === 0">
          <td :colspan="table.getFlatHeaders().length + (rowSelectionEnabled ? 2 : 1)" class="p-4 text-center text-muted-foreground">
            No data
          </td>
        </tr>
        <tr
          v-for="row in table.getRowModel().rows"
          v-else
          :key="row.id"
          class="border-b last:border-b-0"
          :class="{ 'bg-muted/30': row.getIsSelected() }"
        >
          <td v-if="rowSelectionEnabled" class="p-2 text-center align-middle">
            <input
              v-if="useNativeCheckbox"
              :checked="row.getIsSelected()"
              type="checkbox"
              class="h-4 w-4 cursor-pointer align-middle"
              aria-label="Select row"
              :disabled="isRowDisabled(row.original)"
              @change="onRowCheckboxChange(row, ($event.target as HTMLInputElement).checked)"
            >
            <component
              :is="checkboxComponent"
              v-else
              :model-value="row.getIsSelected()"
              aria-label="Select row"
              :disabled="isRowDisabled(row.original)"
              @update:model-value="(value: unknown) => onRowCheckboxChange(row, value)"
            />
          </td>
          <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="p-3 align-middle">
            <template v-if="columns.find((column) => column.key === cell.column.id)?.type === 'switch'">
              <component :is="switchComponent" :model-value="Boolean(cell.getValue())" disabled />
            </template>
            <template v-else>
              {{
                columns.find((column) => column.key === cell.column.id)?.formatter
                  ? columns.find((column) => column.key === cell.column.id)?.formatter?.(cell.getValue(), row.original)
                  : cell.getValue()
              }}
            </template>
          </td>
          <td class="p-3">
            <div class="flex items-center gap-2">
              <component
                :is="buttonComponent"
                v-if="actions.edit !== false"
                variant="ghost"
                size="sm"
                class="h-8 gap-1 px-2 text-xs"
                type="button"
                @click="emit('editClick', row.original)"
              >
                <span class="i-ant-design:edit-outlined text-sm" />
                {{ actionLabel(actions.edit, '编辑') }}
              </component>
              <component
                :is="buttonComponent"
                v-if="actions.delete !== false"
                variant="ghost"
                size="sm"
                class="h-8 gap-1 px-2 text-xs text-destructive"
                type="button"
                @click="emit('deleteClick', row.original)"
              >
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
