<script setup lang="ts">
import { computed } from 'vue';
import { registerCrudUi, useCrud, type CrudListParams } from '@pooka/core';
import { QueryForm, QueryTable } from '@pooka/ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserRow {
  [key: string]: unknown;
  id: number;
  name: string;
  status: number;
}

const mockRows: UserRow[] = [
  { id: 1, name: 'Alice', status: 1 },
  { id: 2, name: 'Bob', status: 0 },
  { id: 3, name: 'Cathy', status: 1 },
  { id: 4, name: 'David', status: 0 },
  { id: 5, name: 'Ethan', status: 1 },
];

registerCrudUi({
  table: QueryTable,
  form: QueryForm,
});

const crud = useCrud<UserRow, UserRow>({
  api: {
    async list(params: Partial<CrudListParams> = {}) {
      const keyword = String(params.keyword ?? '').toLowerCase();
      const page = Number(params.page ?? 1);
      const pageSize = Number(params.pageSize ?? 10);
      const filtered = keyword
        ? mockRows.filter((item) => item.name.toLowerCase().includes(keyword))
        : mockRows;
      const start = (page - 1) * pageSize;
      return {
        list: filtered.slice(start, start + pageSize),
        total: filtered.length,
      };
    },
    async create(payload: Partial<UserRow> = {}) {
      mockRows.push({
        id: Date.now(),
        name: String(payload.name ?? ''),
        status: Number(payload.status ?? 1),
      });
    },
    async update(id, payload: Partial<UserRow> = {}) {
      const idx = mockRows.findIndex((item) => item.id === Number(id));
      if (idx >= 0) {
        const current = mockRows[idx];
        if (!current) {
          return;
        }
        mockRows[idx] = {
          ...current,
          ...payload,
          id: Number(id),
          name: String(payload.name ?? current.name ?? ''),
          status: Number(payload.status ?? current.status ?? 1),
        };
      }
    },
    async delete(id) {
      const idx = mockRows.findIndex((item) => item.id === Number(id));
      if (idx >= 0) {
        mockRows.splice(idx, 1);
      }
    },
  },
  columns: [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'name', label: '姓名' },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
      formatter: (value) => (Number(value) === 1 ? '启用' : '禁用'),
    },
  ],
  search: ['name'],
});

const tableProps = crud.tableProps;
const formProps = crud.formProps;
const tableViewProps = computed(() => {
  const {
    onPageChange: _onPageChange,
    onPageSizeChange: _onPageSizeChange,
    onKeywordChange: _onKeywordChange,
    onCreateClick: _onCreateClick,
    onEditClick: _onEditClick,
    onDeleteClick: _onDeleteClick,
    ...rest
  } = tableProps.value;
  return rest;
});
const formViewProps = computed(() => {
  const { onClose: _onClose, onSubmit: _onSubmit, ...rest } = formProps.value;
  return rest;
});
</script>

<template>
  <main class="mx-auto max-w-5xl p-6">
    <h1 class="mb-4 text-xl font-semibold">Pooka CRUD MVP Playground</h1>
    <div class="mb-4 flex flex-wrap items-center gap-2 md:flex-row">
      <Button>
        Button
      </Button>
      <Button variant="destructive">
        Button
      </Button>
      <Button variant="outline">
        <div class="i-ant-design:user-outlined"></div>
      </Button>
    </div>

    <Dialog>
      <form class="mb-4">
        <DialogTrigger as-child>
          <Button variant="outline">
            Open Dialog
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4">
            <div class="grid gap-3">
              <Label for="name-1">Name</Label>
              <Input id="name-1" name="name" default-value="Pedro Duarte" />
            </div>
            <div class="grid gap-3">
              <Label for="username-1">Username</Label>
              <Input id="username-1" name="username" default-value="@peduarte" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>

    <QueryTable
      v-bind="tableViewProps"
      @page-change="tableProps.onPageChange"
      @page-size-change="tableProps.onPageSizeChange"
      @keyword-change="tableProps.onKeywordChange"
      @create-click="tableProps.onCreateClick"
      @edit-click="(row) => tableProps.onEditClick(row as UserRow)"
      @delete-click="(row) => tableProps.onDeleteClick(row as UserRow)"
    />
    <QueryForm
      v-bind="formViewProps"
      @close="formProps.onClose"
      @submit="formProps.onSubmit"
    />
  </main>
</template>
