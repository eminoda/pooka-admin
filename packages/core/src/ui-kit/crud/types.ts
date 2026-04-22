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
}

export interface CrudColumn {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'number';
  options?: Array<{ label: string; value: string | number }>;
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
}

export interface CrudSearchField {
  key: string;
  component?: 'input' | 'select';
}

export interface CrudFormField {
  key: string;
  component?: 'input' | 'select' | 'textarea';
  required?: boolean;
  options?: Array<{ label: string; value: string | number }>;
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
  keyword: string;
  searchFields: CrudSearchField[];
  actions: CrudActionConfig;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onKeywordChange: (keyword: string) => void;
  onCreateClick: () => void;
  onEditClick: (row: TItem) => void;
  onDeleteClick: (row: TItem) => void;
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
  table: Component;
  form: Component;
  tableType?: string;
  formType?: string;
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
