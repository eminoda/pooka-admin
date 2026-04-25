import type { Component, ComputedRef } from 'vue';

export interface CrudListResult<TItem = Record<string, unknown>> {
  list: TItem[];
  total: number;
}

export interface CrudListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  [key: string]: unknown;
}

export interface CrudApi<TItem = Record<string, unknown>, TForm = Record<string, unknown>> {
  list: (params: CrudListParams) => Promise<CrudListResult<TItem>>;
  create?: (data: TForm) => Promise<unknown>;
  update?: (id: string | number, data: TForm) => Promise<unknown>;
  delete?: (id: string | number) => Promise<unknown>;
  batchDelete?: (ids: Array<string | number>) => Promise<unknown>;
}

export interface CrudColumn {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'number' | 'switch';
  options?: Array<{ label: string; value: string | number | boolean }>;
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
}

export interface CrudSearchField {
  key: string;
  label?: string;
  component?: 'input' | 'select' | 'switch' | 'checkbox' | 'radio';
  options?: Array<{ label: string; value: string | number | boolean }>;
}

export interface CrudFormField {
  key: string;
  component?: 'input' | 'select' | 'textarea' | 'switch';
  label?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string | number | boolean }>;
}

export interface CrudHooks<TItem = Record<string, unknown>> {
  beforeFetch?: (params: CrudListParams) => CrudListParams;
  afterFetch?: (result: CrudListResult<TItem>) => CrudListResult<TItem>;
  onError?: (error: unknown) => void;
}

export interface CrudActionConfig {
  create?: boolean | { label?: string };
  edit?: boolean | { label?: string };
  delete?: boolean | { label?: string; confirm?: string };
}

export interface CrudRowSelectionConfig<TItem = Record<string, unknown>> {
  enabled?: boolean;
  mode?: 'single' | 'multiple';
  preserveSelectedRowKeys?: boolean;
  disableRowWhen?: (row: TItem) => boolean;
  selectedRowKeys?: Array<string | number>;
  onSelectedRowKeysChange?: (keys: Array<string | number>, rows: TItem[]) => void;
}

export interface CrudState<TItem = Record<string, unknown>, TForm = Record<string, unknown>> {
  page: number;
  pageSize: number;
  total: number;
  keyword: string;
  filters: Record<string, unknown>;
  rows: TItem[];
  selectedRow?: TItem;
  formMode: 'create' | 'edit';
  formOpen: boolean;
  formModel: Partial<TForm>;
}

export interface CrudFormConfig {
  fields?: CrudFormField[];
}

export interface CrudQueryTableProps<TItem = Record<string, unknown>> {
  rows: TItem[];
  columns: CrudColumn[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  filters: Record<string, unknown>;
  searchFields: CrudSearchField[];
  actions: CrudActionConfig;
  rowSelection?: CrudRowSelectionConfig<TItem>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onFiltersChange: (filters: Record<string, unknown>) => void;
  onResetFilters: () => void;
  onCreateClick: () => void;
  onEditClick: (row: TItem) => void;
  onDeleteClick: (row: TItem) => void;
  onBatchDeleteClick: (keys: Array<string | number>, rows: TItem[]) => Promise<void>;
}

export interface CrudQueryFormProps<TForm = Record<string, unknown>> {
  open: boolean;
  mode: 'create' | 'edit';
  model: Partial<TForm>;
  fields: CrudFormField[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<TForm>) => Promise<void>;
}

export interface CrudUiRegistry {
  crud?: Component;
  table?: Component;
  form?: Component;
  drawer?: Component;
  input?: Component;
  select?: Component;
  crudType?: string;
  tableType?: string;
  formType?: string;
  drawerType?: string;
  inputType?: string;
  selectType?: string;
}

export interface UseCrudOptions<TItem = Record<string, unknown>, TForm = Record<string, unknown>> {
  api: string | CrudApi<TItem, TForm>;
  columns?: CrudColumn[];
  search?: CrudSearchField[] | string[];
  form?: CrudFormConfig;
  actions?: CrudActionConfig;
  pagination?: boolean | { pageSize?: number };
  hooks?: CrudHooks<TItem>;
  tableProps?: Record<string, unknown>;
  formProps?: Record<string, unknown>;
  queryOptions?: Record<string, unknown>;
}

export interface UseCrudReturn<TItem = Record<string, unknown>, TForm = Record<string, unknown>> {
  tableProps: ComputedRef<CrudQueryTableProps<TItem> & Record<string, unknown>>;
  formProps: ComputedRef<CrudQueryFormProps<TForm> & Record<string, unknown>>;
  data: ComputedRef<TItem[]>;
  loading: ComputedRef<boolean>;
  openCreate: () => void;
  openEdit: (row: TItem) => void;
  refresh: () => Promise<void>;
}

export interface CrudSchema extends Omit<UseCrudOptions, 'tableProps' | 'formProps' | 'queryOptions'> {
  type: 'crud';
}
