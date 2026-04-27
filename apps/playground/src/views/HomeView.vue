<script setup lang="ts">
import { ref } from 'vue';
import { registerPookaComponent, type UseCrudOptions } from 'pooka-core';
import { Crud } from 'pooka-ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Form,
  FormItem,
  FormLabel,
  Input,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  Textarea,
} from '@/components/ui';

interface UserRow {
  id: number;
  name: string;
  status: boolean;
  hobbies: string;
  description: string;
}

const selectedRowKeys = ref<Array<string | number>>([]);

registerPookaComponent({
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Form,
  FormItem,
  FormLabel,
  Input,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  Textarea,
});

const crudOptions: UseCrudOptions<UserRow, UserRow> = {
  api: '/api/user',
  columns: [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'name', label: '姓名' },
    {
      key: 'hobbies',
      label: '爱好',
      type: 'select',
      options: [
        { label: '阅读', value: 'reading' },
        { label: '音乐', value: 'music' },
        { label: '运动', value: 'sports' },
        { label: '旅行', value: 'travel' },
      ],
    },
    { key: 'description', label: '简介', type: 'text' },
    {
      key: 'status',
      label: '状态',
      type: 'switch',
      formatter: (value) => (Boolean(value) ? '启用' : '禁用'),
    },
  ],
  search: [
    { key: 'name', label: '姓名', component: 'input' },
    {
      key: 'hobbies',
      label: '爱好',
      component: 'select',
      options: [
        { label: '阅读', value: 'reading' },
        { label: '音乐', value: 'music' },
        { label: '运动', value: 'sports' },
        { label: '旅行', value: 'travel' },
      ],
    },
    { key: 'status', label: '状态', component: 'switch' },
  ],
  form: {
    fields: [
      { key: 'name', component: 'input', required: true },
      {
        key: 'hobbies',
        component: 'select',
        options: [
          { label: '阅读', value: 'reading' },
          { label: '音乐', value: 'music' },
          { label: '运动', value: 'sports' },
          { label: '旅行', value: 'travel' },
        ],
      },
      { key: 'description', component: 'textarea' },
      { key: 'status', component: 'switch' },
    ],
  },
  tableProps: {
    rowSelection: {
      enabled: true,
      mode: 'multiple',
      preserveSelectedRowKeys: true,
      disableRowWhen: (row: UserRow) => row.status === true,
      onSelectedRowKeysChange: (keys: Array<string | number>) => {
        selectedRowKeys.value = keys;
      },
    },
  },
};
</script>

<template>
  <main class="mx-auto max-w-5xl p-6">
    <h1 class="mb-2 text-xl font-semibold">Pooka 增删改查 Example</h1>
    <p class="mb-4 text-sm text-muted-foreground">当前选中行 keys：{{ selectedRowKeys.join(', ') || '无' }}</p>
    <Crud :options="crudOptions as any" />
  </main>
</template>
