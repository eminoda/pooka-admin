import type { CrudApi, CrudListParams, CrudListResult } from './types.js';

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
      return normalizeListResult<TItem>(json);
    },
    async create(data) {
      await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    async update(id, data) {
      await fetch(`${api}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    async delete(id) {
      await fetch(`${api}/${id}`, {
        method: 'DELETE',
      });
    },
  };
}
