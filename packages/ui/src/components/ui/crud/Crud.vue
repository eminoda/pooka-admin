<script setup lang="ts">
import { computed, ref, type Component } from 'vue';
import {
  assertCrudUiRegistered,
  getPookaComponent,
  useCrud,
  type CrudUiRegistry,
  type UseCrudOptions,
} from '@pooka/core';
import Drawer from './Drawer.vue';
import Form from './Form.vue';
import Pagination from './Pagination.vue';
import SearchBar from './SearchBar.vue';
import Table from './Table.vue';

const props = withDefaults(
  defineProps<{
    options: UseCrudOptions<any, any>;
    registryTypes?: Pick<CrudUiRegistry, 'tableType' | 'formType' | 'drawerType' | 'inputType' | 'selectType'>;
    drawerTitle?: string;
  }>(),
  {
    registryTypes: () => ({}),
    drawerTitle: '编辑',
  },
);

assertCrudUiRegistered(props.registryTypes);
const warnedMissingComponents = new Set<string>();
const installHintMap: Record<string, string> = {
  Button: 'button',
  Table: 'table',
  Form: 'form',
  FormItem: 'form',
  Label: 'label',
  Input: 'input',
  Checkbox: 'checkbox',
  Textarea: 'textarea',
  Switch: 'switch',
  Select: 'select',
  SelectTrigger: 'select',
  SelectContent: 'select',
  SelectGroup: 'select',
  SelectItem: 'select',
  SelectLabel: 'select',
  SelectValue: 'select',
  Drawer: 'drawer',
  DrawerContent: 'drawer',
  DrawerHeader: 'drawer',
  DrawerTitle: 'drawer',
  DrawerDescription: 'drawer',
  Pagination: 'pagination',
  PaginationContent: 'pagination',
  PaginationEllipsis: 'pagination',
  PaginationItem: 'pagination',
  PaginationNext: 'pagination',
  PaginationPrevious: 'pagination',
  AlertDialog: 'alert-dialog',
  AlertDialogContent: 'alert-dialog',
  AlertDialogHeader: 'alert-dialog',
  AlertDialogTitle: 'alert-dialog',
  AlertDialogDescription: 'alert-dialog',
  AlertDialogFooter: 'alert-dialog',
  AlertDialogCancel: 'alert-dialog',
  AlertDialogAction: 'alert-dialog',
};

function resolveRegisteredComponent(name: string, fallback: string): Component | string {
  const component = getPookaComponent(name, props.registryTypes);
  if (component) {
    return component;
  }
  if (!warnedMissingComponents.has(name)) {
    warnedMissingComponents.add(name);
    const hint = installHintMap[name] ?? name.toLowerCase();
    console.warn(`[pooka] Missing registered component "${name}". Falling back to "${fallback}". Please install and register it (e.g. "pnpm pooka add ${hint}").`);
  }
  return fallback;
}

const tableComponent = resolveRegisteredComponent('Table', 'table');
const buttonComponent = resolveRegisteredComponent('Button', 'button');
const formComponent = resolveRegisteredComponent('Form', 'form');
const formItemComponent = resolveRegisteredComponent('FormItem', 'div');
const labelComponent = resolveRegisteredComponent('Label', 'label');
const inputComponent = resolveRegisteredComponent('Input', 'input');
const checkboxComponent = resolveRegisteredComponent('Checkbox', 'input');
const textareaComponent = resolveRegisteredComponent('Textarea', 'textarea');
const switchComponent = resolveRegisteredComponent('Switch', 'button');
const selectComponent = resolveRegisteredComponent('Select', 'select');
const selectTriggerComponent = resolveRegisteredComponent('SelectTrigger', 'button');
const selectContentComponent = resolveRegisteredComponent('SelectContent', 'div');
const selectGroupComponent = resolveRegisteredComponent('SelectGroup', 'div');
const selectItemComponent = resolveRegisteredComponent('SelectItem', 'option');
const selectLabelComponent = resolveRegisteredComponent('SelectLabel', 'span');
const selectValueComponent = resolveRegisteredComponent('SelectValue', 'span');
const drawerComponent = resolveRegisteredComponent('Drawer', 'aside');
const drawerContentComponent = resolveRegisteredComponent('DrawerContent', 'aside');
const drawerHeaderComponent = resolveRegisteredComponent('DrawerHeader', 'header');
const drawerTitleComponent = resolveRegisteredComponent('DrawerTitle', 'h3');
const drawerDescriptionComponent = resolveRegisteredComponent('DrawerDescription', 'p');
const paginationComponent = resolveRegisteredComponent('Pagination', 'nav');
const paginationContentComponent = resolveRegisteredComponent('PaginationContent', 'div');
const paginationEllipsisComponent = resolveRegisteredComponent('PaginationEllipsis', 'span');
const paginationItemComponent = resolveRegisteredComponent('PaginationItem', 'button');
const paginationNextComponent = resolveRegisteredComponent('PaginationNext', 'button');
const paginationPreviousComponent = resolveRegisteredComponent('PaginationPrevious', 'button');
const alertDialogComponent = resolveRegisteredComponent('AlertDialog', 'div');
const alertDialogContentComponent = resolveRegisteredComponent('AlertDialogContent', 'div');
const alertDialogHeaderComponent = resolveRegisteredComponent('AlertDialogHeader', 'div');
const alertDialogTitleComponent = resolveRegisteredComponent('AlertDialogTitle', 'h3');
const alertDialogDescriptionComponent = resolveRegisteredComponent('AlertDialogDescription', 'p');
const alertDialogFooterComponent = resolveRegisteredComponent('AlertDialogFooter', 'div');
const alertDialogCancelComponent = resolveRegisteredComponent('AlertDialogCancel', 'button');
const alertDialogActionComponent = resolveRegisteredComponent('AlertDialogAction', 'button');

const drawerOpen = ref(false);
const deleteDialogOpen = ref(false);
const pendingDeleteRow = ref<Record<string, unknown> | null>(null);
const crud = useCrud<any, any>(props.options);
const tableProps = computed(() => crud.tableProps.value);
const formProps = computed(() => crud.formProps.value);

function handleEdit(row: Record<string, unknown>): void {
  tableProps.value.onEditClick(row);
  drawerOpen.value = true;
}

function handleDelete(row: Record<string, unknown>): void {
  pendingDeleteRow.value = row;
  deleteDialogOpen.value = true;
}

async function handleBatchDelete(keys: Array<string | number>, rows: Record<string, unknown>[]): Promise<void> {
  await tableProps.value.onBatchDeleteClick(keys, rows);
}

async function confirmDelete(): Promise<void> {
  if (!pendingDeleteRow.value) {
    return;
  }
  await tableProps.value.onDeleteClick(pendingDeleteRow.value);
  pendingDeleteRow.value = null;
  deleteDialogOpen.value = false;
}

function closeDeleteDialog(): void {
  pendingDeleteRow.value = null;
  deleteDialogOpen.value = false;
}

function handleCreate(): void {
  tableProps.value.onCreateClick();
}

function handleEditClose(): void {
  drawerOpen.value = false;
  formProps.value.onClose();
}

async function handleEditSubmit(payload: Record<string, unknown>): Promise<void> {
  await formProps.value.onSubmit(payload);
  drawerOpen.value = false;
}
</script>

<template>
  <section class="grid gap-3">
    <SearchBar
      :filters="tableProps.filters"
      :search-fields="tableProps.searchFields"
      :form-component="formComponent"
      :form-item-component="formItemComponent"
      :label-component="labelComponent"
      :input-component="inputComponent"
      :select-component="selectComponent"
      :select-trigger-component="selectTriggerComponent"
      :select-content-component="selectContentComponent"
      :select-group-component="selectGroupComponent"
      :select-item-component="selectItemComponent"
      :select-label-component="selectLabelComponent"
      :select-value-component="selectValueComponent"
      :button-component="buttonComponent"
      @submit="tableProps.onFiltersChange"
      @reset="tableProps.onResetFilters"
    />

    <Table
      :rows="tableProps.rows"
      :columns="tableProps.columns"
      :loading="tableProps.loading"
      :actions="tableProps.actions"
      :row-selection="tableProps.rowSelection"
      :table-component="tableComponent"
      :button-component="buttonComponent"
      :checkbox-component="checkboxComponent"
      :switch-component="switchComponent"
      @create-click="handleCreate"
      @edit-click="handleEdit"
      @delete-click="handleDelete"
      @batch-delete-click="handleBatchDelete"
    />

    <Pagination
      :page="tableProps.page"
      :page-size="tableProps.pageSize"
      :total="tableProps.total"
      :pagination-component="paginationComponent"
      :pagination-content-component="paginationContentComponent"
      :pagination-ellipsis-component="paginationEllipsisComponent"
      :pagination-item-component="paginationItemComponent"
      :pagination-next-component="paginationNextComponent"
      :pagination-previous-component="paginationPreviousComponent"
      :select-component="selectComponent"
      :select-trigger-component="selectTriggerComponent"
      :select-content-component="selectContentComponent"
      :select-group-component="selectGroupComponent"
      :select-item-component="selectItemComponent"
      :select-value-component="selectValueComponent"
      @page-change="tableProps.onPageChange"
      @page-size-change="tableProps.onPageSizeChange"
    />

    <Form
      :open="formProps.open && formProps.mode === 'create'"
      :mode="formProps.mode"
      title="新增"
      :model="formProps.model as Record<string, unknown>"
      :fields="formProps.fields"
      :loading="formProps.loading"
      :button-component="buttonComponent"
      :form-component="formComponent"
      :input-component="inputComponent"
      :textarea-component="textareaComponent"
      :switch-component="switchComponent"
      :select-component="selectComponent"
      :select-trigger-component="selectTriggerComponent"
      :select-content-component="selectContentComponent"
      :select-group-component="selectGroupComponent"
      :select-item-component="selectItemComponent"
      :select-label-component="selectLabelComponent"
      :select-value-component="selectValueComponent"
      @close="formProps.onClose"
      @submit="formProps.onSubmit"
    />

    <Drawer
      :open="drawerOpen"
      :title="drawerTitle"
      :button-component="buttonComponent"
      :drawer-component="drawerComponent"
      :drawer-content-component="drawerContentComponent"
      :drawer-header-component="drawerHeaderComponent"
      :drawer-title-component="drawerTitleComponent"
      :drawer-description-component="drawerDescriptionComponent"
      @close="handleEditClose"
    >
      <Form
        :open="drawerOpen && formProps.mode === 'edit'"
        :mode="formProps.mode"
        title="编辑"
        embedded
        :model="formProps.model as Record<string, unknown>"
        :fields="formProps.fields"
        :loading="formProps.loading"
        :button-component="buttonComponent"
        :form-component="formComponent"
        :input-component="inputComponent"
        :textarea-component="textareaComponent"
        :switch-component="switchComponent"
        :select-component="selectComponent"
        :select-trigger-component="selectTriggerComponent"
        :select-content-component="selectContentComponent"
        :select-group-component="selectGroupComponent"
        :select-item-component="selectItemComponent"
        :select-label-component="selectLabelComponent"
        :select-value-component="selectValueComponent"
        @close="handleEditClose"
        @submit="handleEditSubmit"
      />
    </Drawer>

    <component :is="alertDialogComponent" :open="deleteDialogOpen" @update:open="(value: boolean) => (deleteDialogOpen = value)">
      <component :is="alertDialogContentComponent">
        <component :is="alertDialogHeaderComponent">
          <component :is="alertDialogTitleComponent">确认删除</component>
          <component :is="alertDialogDescriptionComponent">删除后数据不可恢复，确认继续吗？</component>
        </component>
        <component :is="alertDialogFooterComponent">
          <component :is="alertDialogCancelComponent" @click="closeDeleteDialog">取消</component>
          <component :is="alertDialogActionComponent" @click="confirmDelete">确认删除</component>
        </component>
      </component>
    </component>
  </section>
</template>
