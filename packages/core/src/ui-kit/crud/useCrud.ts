import { computed, reactive } from 'vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { createCrudApi } from './api.js';
import { inferFormFields, inferSearchFields } from './infer.js';
import { createCrudFormState } from '../form/index.js';
import { createCrudTableState } from '../table/index.js';
import type { CrudColumn, UseCrudOptions, UseCrudReturn } from './types.js';

function normalizeColumns(columns: CrudColumn[] | undefined): CrudColumn[] {
  return columns?.length
    ? columns
    : [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'name', label: 'Name', type: 'text' },
      ];
}

export function useCrud<TItem extends Record<string, unknown>, TForm extends Record<string, unknown>>(
  options: UseCrudOptions<TItem, TForm>,
): UseCrudReturn<TItem, TForm> {
  const columns = normalizeColumns(options.columns);
  const searchFields = inferSearchFields(options.search, columns);
  const formFields = inferFormFields(options.form?.fields, columns);
  const tableState = createCrudTableState(
    options.pagination && typeof options.pagination === 'object' ? options.pagination.pageSize ?? 10 : 10,
  );
  const formState = createCrudFormState();
  const resolvedApi = createCrudApi<TItem, TForm>(options.api);
  const filters = reactive<Record<string, unknown>>({});

  function normalizeFilters(source: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(source).filter(([, value]) => value !== '' && value !== undefined && value !== null),
    );
  }

  const listQuery = useQuery({
    queryKey: computed(() => [
      'pooka-crud',
      options.api,
      tableState.page.value,
      tableState.pageSize.value,
      normalizeFilters(filters),
    ]),
    queryFn: async () => {
      const params = {
        page: tableState.page.value,
        pageSize: tableState.pageSize.value,
        ...normalizeFilters(filters),
      };
      const requestParams = options.hooks?.beforeFetch ? options.hooks.beforeFetch(params) : params;
      const payload = await resolvedApi.list(requestParams);
      return options.hooks?.afterFetch ? options.hooks.afterFetch(payload) : payload;
    },
    ...(options.queryOptions ?? {}),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<TForm>) => {
      if (!resolvedApi.create) {
        return;
      }
      await resolvedApi.create(payload as TForm);
    },
    onError: options.hooks?.onError,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<TForm>) => {
      if (!resolvedApi.update) {
        return;
      }
      const row = formState.model.value as Record<string, unknown>;
      const id = row.id as string | number | undefined;
      if (id === undefined) {
        throw new Error('[pooka] update requires row id');
      }
      await resolvedApi.update(id, payload as TForm);
    },
    onError: options.hooks?.onError,
  });

  const deleteMutation = useMutation({
    mutationFn: async (payload: TItem) => {
      if (!resolvedApi.delete) {
        return;
      }
      const id = payload.id as string | number | undefined;
      if (id === undefined) {
        throw new Error('[pooka] delete requires row id');
      }
      await resolvedApi.delete(id);
    },
    onError: options.hooks?.onError,
  });

  async function refresh(): Promise<void> {
    await listQuery.refetch();
  }

  async function submitForm(payload: Partial<TForm>): Promise<void> {
    if (formState.mode.value === 'create') {
      await createMutation.mutateAsync(payload);
    } else {
      await updateMutation.mutateAsync(payload);
    }
    formState.close();
    await refresh();
  }

  async function deleteRow(row: TItem): Promise<void> {
    await deleteMutation.mutateAsync(row);
    await refresh();
  }

  async function batchDeleteRows(keys: Array<string | number>, rows: TItem[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    if (resolvedApi.batchDelete) {
      await resolvedApi.batchDelete(keys);
      await refresh();
      return;
    }
    await Promise.all(rows.map((row) => deleteMutation.mutateAsync(row)));
    await refresh();
  }

  function setFilters(next: Record<string, unknown>): void {
    for (const key of Object.keys(filters)) {
      delete filters[key];
    }
    Object.assign(filters, next);
    tableState.setPage(1);
  }

  function resetFilters(): void {
    setFilters({});
  }

  const tableProps = computed(() => ({
    rows: listQuery.data.value?.list ?? [],
    columns,
    loading: listQuery.isFetching.value || deleteMutation.isPending.value,
    page: tableState.page.value,
    pageSize: tableState.pageSize.value,
    total: listQuery.data.value?.total ?? 0,
    filters: { ...filters },
    searchFields,
    actions: options.actions ?? { create: true, edit: true, delete: true },
    onPageChange: tableState.setPage,
    onPageSizeChange: tableState.setPageSize,
    onFiltersChange: setFilters,
    onResetFilters: resetFilters,
    onCreateClick: formState.openCreate,
    onEditClick: (row: TItem) => formState.openEdit(row as Record<string, unknown>),
    onDeleteClick: deleteRow,
    onBatchDeleteClick: batchDeleteRows,
    ...(options.tableProps ?? {}),
  }));

  const formProps = computed(() => ({
    open: formState.open.value,
    mode: formState.mode.value,
    model: formState.model.value as Partial<TForm>,
    fields: formFields,
    loading: createMutation.isPending.value || updateMutation.isPending.value,
    onClose: formState.close,
    onSubmit: submitForm,
    ...(options.formProps ?? {}),
  }));

  return {
    tableProps,
    formProps,
    data: computed(() => listQuery.data.value?.list ?? []),
    loading: computed(() => listQuery.isFetching.value),
    openCreate: formState.openCreate,
    openEdit: (row) => formState.openEdit(row as Record<string, unknown>),
    refresh,
  };
}
