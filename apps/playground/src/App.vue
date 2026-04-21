<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import {
  FlexRender,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/vue-table';
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

type UserStatus = 'active' | 'paused' | 'disabled';

interface UserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: UserStatus;
  children?: UserRow[];
}

type SortField = 'name' | 'username' | 'status' | 'email' | 'role';

const MOCK_ROWS: UserRow[] = [
  {
    id: '1',
    name: 'Alice',
    username: '@alice',
    email: 'alice@example.com',
    role: 'Admin',
    status: 'active',
    children: [
      {
        id: '1-1',
        name: 'Alice Child A',
        username: '@alice-a',
        email: 'alice.a@example.com',
        role: 'Viewer',
        status: 'paused',
      },
    ],
  },
  { id: '2', name: 'Bob', username: '@bob', email: 'bob@example.com', role: 'Editor', status: 'active' },
  { id: '3', name: 'Cathy', username: '@cathy', email: 'cathy@example.com', role: 'Viewer', status: 'disabled' },
  { id: '4', name: 'David', username: '@david', email: 'david@example.com', role: 'Editor', status: 'paused' },
  { id: '5', name: 'Ethan', username: '@ethan', email: 'ethan@example.com', role: 'Viewer', status: 'active' },
  { id: '6', name: 'Fiona', username: '@fiona', email: 'fiona@example.com', role: 'Admin', status: 'active' },
  { id: '7', name: 'Grace', username: '@grace', email: 'grace@example.com', role: 'Editor', status: 'disabled' },
  { id: '8', name: 'Henry', username: '@henry', email: 'henry@example.com', role: 'Viewer', status: 'active' },
];

const loading = ref(false);
const errorMessage = ref('');
const keyword = ref('');
const statusFilter = ref<'all' | UserStatus>('all');
const sorting = ref<SortingState>([]);
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
const rowSelection = ref<RowSelectionState>({});
const expanded = ref<ExpandedState>({});
const totalRows = ref(0);
const rows = ref<UserRow[]>([]);

async function fetchRows() {
  loading.value = true;
  errorMessage.value = '';

  try {
    // [1] 分页（服务端联动）+ [2] 排序（服务端）+ [3] 筛选（服务端）
    await new Promise((resolve) => setTimeout(resolve, 180));
    let next = [...MOCK_ROWS];

    if (keyword.value.trim()) {
      const kw = keyword.value.trim().toLowerCase();
      next = next.filter((item) =>
        [item.name, item.username, item.email, item.role]
          .join(' ')
          .toLowerCase()
          .includes(kw),
      );
    }

    if (statusFilter.value !== 'all') {
      next = next.filter((item) => item.status === statusFilter.value);
    }

    const currentSort = sorting.value[0];
    if (currentSort) {
      const { id, desc } = currentSort;
      const getSortValue = (item: UserRow, key: SortField) => {
        const map: Record<SortField, string> = {
          name: item.name,
          username: item.username,
          status: item.status,
          email: item.email,
          role: item.role,
        };
        return map[key];
      };
      next.sort((a, b) => {
        const av = getSortValue(a, id as SortField);
        const bv = getSortValue(b, id as SortField);
        return desc ? bv.localeCompare(av) : av.localeCompare(bv);
      });
    }

    totalRows.value = next.length;
    const start = pagination.value.pageIndex * pagination.value.pageSize;
    rows.value = next.slice(start, start + pagination.value.pageSize);
  } catch {
    // [8] 错误态
    errorMessage.value = '加载失败，请稍后重试。';
    rows.value = [];
    totalRows.value = 0;
  } finally {
    loading.value = false;
  }
}

function onKeywordChange(value: string) {
  keyword.value = value;
  pagination.value.pageIndex = 0;
  fetchRows();
}

function onStatusFilterChange(value: 'all' | UserStatus) {
  statusFilter.value = value;
  pagination.value.pageIndex = 0;
  fetchRows();
}

const columnHelper = createColumnHelper<UserRow>();
const columns = [
  // [4] 行选择
  columnHelper.display({
    id: 'select',
    size: 54,
    header: () =>
      h('input', {
        type: 'checkbox',
        checked: table.getIsAllPageRowsSelected(),
        onChange: table.getToggleAllPageRowsSelectedHandler(),
      }),
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        checked: row.getIsSelected(),
        disabled: !row.getCanSelect(),
        onChange: row.getToggleSelectedHandler(),
      }),
  }),
  // [10] 展开行 + [11] 树形数据
  columnHelper.display({
    id: 'expander',
    size: 64,
    cell: ({ row }) =>
      row.getCanExpand()
        ? h(
            Button,
            {
              size: 'icon',
              variant: 'ghost',
              onClick: row.getToggleExpandedHandler(),
            },
            { default: () => (row.getIsExpanded() ? '−' : '+') },
          )
        : null,
  }),
  columnHelper.accessor('name', {
    header: () => 'Name',
    size: 180,
    cell: ({ row, getValue }) =>
      h(
        'div',
        {
          class: 'truncate',
          title: getValue(),
          style: { paddingLeft: `${row.depth * 16}px` },
        },
        getValue(),
      ),
  }),
  columnHelper.accessor('username', { header: () => 'Username', size: 150 }),
  // [7] 自定义单元格渲染（状态）
  columnHelper.accessor('status', {
    header: () => 'Status',
    size: 130,
    cell: ({ getValue }) => {
      const value = getValue();
      const styleMap: Record<UserStatus, string> = {
        active: 'bg-green-100 text-green-700',
        paused: 'bg-amber-100 text-amber-700',
        disabled: 'bg-gray-100 text-gray-600',
      };
      return h('span', { class: `rounded px-2 py-1 text-xs font-medium ${styleMap[value]}` }, value);
    },
  }),
  // [6] 列宽控制 + 省略 tooltip
  columnHelper.accessor('email', {
    header: () => 'Email',
    size: 280,
    cell: ({ getValue }) => h('div', { class: 'max-w-64 truncate', title: getValue() }, getValue()),
  }),
  columnHelper.accessor('role', { header: () => 'Role', size: 120 }),
  // [7] 自定义操作列 + [9] 固定列
  columnHelper.display({
    id: 'actions',
    size: 170,
    header: () => 'Actions',
    cell: () =>
      h('div', { class: 'flex gap-2' }, [
        h(Button, { size: 'sm', variant: 'outline' }, { default: () => 'Edit' }),
        h(Button, { size: 'sm', variant: 'destructive' }, { default: () => 'Delete' }),
      ]),
  }),
];

const table = useVueTable({
  get data() {
    return rows.value;
  },
  columns,
  state: {
    get sorting() {
      return sorting.value;
    },
    get pagination() {
      return pagination.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get expanded() {
      return expanded.value;
    },
  },
  getSubRows: (row) => row.children,
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater;
    pagination.value.pageIndex = 0;
    fetchRows();
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater;
    fetchRows();
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater;
  },
  onExpandedChange: (updater) => {
    expanded.value = typeof updater === 'function' ? updater(expanded.value) : updater;
  },
  manualSorting: true,
  manualPagination: true,
  enableRowSelection: true,
  getRowCanExpand: (row) => !!row.original.children?.length,
  pageCount: computed(() => Math.max(1, Math.ceil(totalRows.value / pagination.value.pageSize))).value,
});

function toggleSort(field: SortField) {
  const current = sorting.value[0];
  if (!current || current.id !== field) {
    sorting.value = [{ id: field, desc: false }];
    fetchRows();
    return;
  }
  if (!current.desc) {
    sorting.value = [{ id: field, desc: true }];
    fetchRows();
    return;
  }
  sorting.value = [];
  fetchRows();
}

const selectedCount = computed(() => Object.keys(rowSelection.value).length);

onMounted(() => {
  fetchRows();
});
</script>

<template>
  <main class="grid gap-4 p-6">
    <h1 class="text-xl font-bold">TanStack Table Playground</h1>

    <div class="flex flex-wrap items-center gap-2 md:flex-row">
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
      <form class="my-2">
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

    <!-- [3] 筛选 -->
    <div class="flex flex-wrap items-center gap-3">
      <Input
        :model-value="keyword"
        placeholder="Search name / role / email"
        class="max-w-64"
        @update:model-value="(value) => onKeywordChange(String(value ?? ''))"
      />
      <select
        :value="statusFilter"
        class="h-9 rounded-md border px-3 text-sm"
        @change="onStatusFilterChange(($event.target as HTMLSelectElement).value as 'all' | UserStatus)"
      >
        <option value="all">All status</option>
        <option value="active">active</option>
        <option value="paused">paused</option>
        <option value="disabled">disabled</option>
      </select>
      <Button variant="outline" @click="fetchRows">
        Refresh
      </Button>
      <span class="text-sm text-muted-foreground">Selected: {{ selectedCount }}</span>
    </div>

    <!-- [5] 固定表头 + 横向滚动 -->
    <div class="max-h-96 overflow-auto rounded-md border">
      <table class="min-w-[1200px] border-collapse text-sm">
        <thead class="sticky top-0 z-20 bg-background">
          <tr>
            <th
              v-for="header in table.getFlatHeaders()"
              :key="header.id"
              :style="{ width: `${header.getSize()}px` }"
              class="border-b p-2 text-left font-medium"
              :class="{
                'sticky left-0 z-30 bg-background': header.id === 'select',
                'sticky right-0 z-30 bg-background': header.id === 'actions',
              }"
            >
              <button
                v-if="['name', 'username', 'status', 'email', 'role'].includes(header.id)"
                class="inline-flex items-center gap-1"
                @click="toggleSort(header.id as SortField)"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                <span class="text-xs text-muted-foreground">
                  {{
                    sorting[0]?.id === header.id
                      ? (sorting[0]?.desc ? '↓' : '↑')
                      : ''
                  }}
                </span>
              </button>
              <FlexRender v-else :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- [8] 加载态 -->
          <tr v-if="loading">
            <td :colspan="table.getFlatHeaders().length" class="p-4 text-center text-muted-foreground">
              Loading...
            </td>
          </tr>
          <!-- [8] 错误态 -->
          <tr v-else-if="errorMessage">
            <td :colspan="table.getFlatHeaders().length" class="p-4 text-center text-destructive">
              {{ errorMessage }}
            </td>
          </tr>
          <!-- [8] 空态 -->
          <tr v-else-if="table.getRowModel().rows.length === 0">
            <td :colspan="table.getFlatHeaders().length" class="p-4 text-center text-muted-foreground">
              No data found.
            </td>
          </tr>
          <tr
            v-for="row in table.getRowModel().rows"
            v-else
            :key="row.id"
            class="border-b hover:bg-muted/30"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="p-2 align-middle"
              :class="{
                'sticky left-0 z-10 bg-background': cell.column.id === 'select',
                'sticky right-0 z-10 bg-background': cell.column.id === 'actions',
              }"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- [1] 分页（服务端联动） -->
    <div class="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        :disabled="pagination.pageIndex === 0"
        @click="table.previousPage()"
      >
        Prev
      </Button>
      <Button
        variant="outline"
        :disabled="(pagination.pageIndex + 1) * pagination.pageSize >= totalRows"
        @click="table.nextPage()"
      >
        Next
      </Button>
      <span class="text-sm text-muted-foreground">
        Page {{ pagination.pageIndex + 1 }} / {{ Math.max(1, Math.ceil(totalRows / pagination.pageSize)) }}
      </span>
      <select
        :value="pagination.pageSize"
        class="h-9 rounded-md border px-3 text-sm"
        @change="table.setPageSize(Number(($event.target as HTMLSelectElement).value))"
      >
        <option :value="5">5 / page</option>
        <option :value="10">10 / page</option>
      </select>
    </div>
  </main>
</template>
