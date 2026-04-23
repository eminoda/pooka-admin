import { http, HttpResponse } from 'msw';

interface UserRow {
  id: number;
  name: string;
  status: boolean;
  hobbies: string;
  description: string;
}

interface ApiResponse<TData = unknown> {
  code: number;
  data: TData;
  msg: string;
}

const hobbyPool = [
  { value: 'reading', label: '阅读' },
  { value: 'music', label: '音乐' },
  { value: 'sports', label: '运动' },
  { value: 'travel', label: '旅行' },
] as const;

const users: UserRow[] = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1;
  const hobby = hobbyPool[index % hobbyPool.length] ?? hobbyPool[0];
  return {
    id,
    name: `User ${id}`,
    status: id % 3 !== 0,
    hobbies: hobby.value,
    description: `这是第 ${id} 条 mock 数据，偏好${hobby.label}。`,
  };
});

function parseQueryNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function ok<TData>(data: TData, msg = 'ok'): ApiResponse<TData> {
  return { code: 0, data, msg };
}

function fail(msg: string, code = 1): ApiResponse<null> {
  return { code, data: null, msg };
}

export const handlers = [
  http.get('/api/user', ({ request }) => {
    const url = new URL(request.url);
    const name = (url.searchParams.get('name') ?? '').toLowerCase();
    const hobbies = (url.searchParams.get('hobbies') ?? '').toLowerCase();
    const statusRaw = url.searchParams.get('status');
    const page = parseQueryNumber(url.searchParams.get('page'), 1);
    const pageSize = parseQueryNumber(url.searchParams.get('pageSize'), 10);
    const statusFilter = statusRaw === null ? undefined : statusRaw === 'true';
    const filtered = users.filter((item) => {
      if (name && !item.name.toLowerCase().includes(name)) {
        return false;
      }
      if (hobbies && item.hobbies.toLowerCase() !== hobbies) {
        return false;
      }
      if (statusFilter !== undefined && item.status !== statusFilter) {
        return false;
      }
      return true;
    });
    const start = (page - 1) * pageSize;
    return HttpResponse.json(
      ok({
        list: filtered.slice(start, start + pageSize),
        total: filtered.length,
      }),
    );
  }),
  http.post('/api/user', async ({ request }) => {
    const payload = (await request.json()) as Partial<UserRow>;
    const created: UserRow = {
      id: Date.now(),
      name: String(payload.name ?? ''),
      status: Boolean(payload.status ?? true),
      hobbies: String(payload.hobbies ?? 'reading'),
      description: String(payload.description ?? ''),
    };
    users.unshift(created);
    return HttpResponse.json(ok(created, 'created'), { status: 201 });
  }),
  http.put('/api/user/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const payload = (await request.json()) as Partial<UserRow>;
    const idx = users.findIndex((item) => item.id === id);
    if (idx < 0) {
      return HttpResponse.json(fail('Not Found', 404), { status: 404 });
    }
    const current = users[idx];
    if (!current) {
      return HttpResponse.json(fail('Not Found', 404), { status: 404 });
    }
    users[idx] = {
      ...current,
      ...payload,
      id,
      name: String(payload.name ?? current.name),
      status: Boolean(payload.status ?? current.status),
      hobbies: String(payload.hobbies ?? current.hobbies),
      description: String(payload.description ?? current.description),
    };
    return HttpResponse.json(ok(users[idx], 'updated'));
  }),
  http.delete('/api/user/:id', ({ params }) => {
    const id = Number(params.id);
    const idx = users.findIndex((item) => item.id === id);
    if (idx < 0) {
      return HttpResponse.json(fail('Not Found', 404), { status: 404 });
    }
    const [deleted] = users.splice(idx, 1);
    return HttpResponse.json(ok(deleted ?? null, 'deleted'));
  }),
];
