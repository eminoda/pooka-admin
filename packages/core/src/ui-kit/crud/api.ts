import type { CrudApi, CrudListParams, CrudListResult } from './types.js';

interface ApiEnvelope<TData = unknown> {
  code: number;
  data: TData;
  msg?: string;
}

function isApiEnvelope(input: unknown): input is ApiEnvelope {
  if (!input || typeof input !== 'object') {
    return false;
  }
  const payload = input as Record<string, unknown>;
  return typeof payload.code === 'number' && 'data' in payload;
}

function unwrapApiEnvelope<TData = unknown>(input: unknown): TData {
  if (!isApiEnvelope(input)) {
    return input as TData;
  }
  if (input.code !== 0) {
    throw new Error(input.msg ?? `[pooka] request failed with code ${input.code}`);
  }
  return input.data as TData;
}

function normalizeListResult<TItem>(input: unknown): CrudListResult<TItem> {
  if (!input || typeof input !== 'object') {
    return { list: [], total: 0 };
  }
  const payload = input as Record<string, unknown>;
  const list = Array.isArray(payload.list) ? (payload.list as TItem[]) : [];
  const total = typeof payload.total === 'number' ? payload.total : list.length;
  return { list, total };
}

function toQueryString(params: CrudListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function createCrudApi<TItem = Record<string, unknown>, TForm = Record<string, unknown>>(
  api: string | CrudApi<TItem, TForm>,
): CrudApi<TItem, TForm> {
  if (typeof api !== 'string') {
    return api;
  }

  return {
    async list(params) {
      const res = await fetch(`${api}${toQueryString(params)}`);
      const json = (await res.json()) as unknown;
      return normalizeListResult<TItem>(unwrapApiEnvelope(json));
    },
    async create(data) {
      const res = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as unknown;
      unwrapApiEnvelope(json);
    },
    async update(id, data) {
      const res = await fetch(`${api}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as unknown;
      unwrapApiEnvelope(json);
    },
    async delete(id) {
      const res = await fetch(`${api}/${id}`, {
        method: 'DELETE',
      });
      const json = (await res.json()) as unknown;
      unwrapApiEnvelope(json);
    },
  };
}
