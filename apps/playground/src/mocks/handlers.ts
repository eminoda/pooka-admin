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

interface AccessRouteMeta {
  title?: string;
  icon?: string;
  order?: number;
  ignoreAccess?: boolean;
  hideInMenu?: boolean;
  requiredRoles?: string[];
  requiredCodes?: string[];
  menuVisibleWithForbidden?: boolean;
}

interface AccessRouteItem {
  name: string;
  path: string;
  component?: string;
  meta?: AccessRouteMeta;
  children?: AccessRouteItem[];
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

/** Uno presetIcons：`i-ant-design-*`（需在 uno safelist 中声明以便运行时菜单动态类名生效） */
const ACCESS_ROUTE_BASE: AccessRouteItem[] = [
  {
    name: 'Home',
    path: '/',
    component: 'home',
    meta: {
      icon: 'i-ant-design-home-outlined',
      order: 1,
      title: '首页',
    },
  },
  {
    name: 'Profile',
    path: '/profile',
    component: 'profile',
    meta: {
      icon: 'i-ant-design-user-outlined',
      order: 2,
      title: '个人中心',
    },
  },
  {
    name: 'System',
    path: '/system',
    meta: {
      icon: 'i-ant-design-setting-outlined',
      order: 8,
      title: '系统管理',
    },
    children: [
      {
        name: 'SystemUsers',
        path: '/system/users',
        component: 'system-users',
        meta: {
          icon: 'i-ant-design-team-outlined',
          order: 1,
          title: '用户管理',
        },
      },
      {
        name: 'SystemRoles',
        path: '/system/roles',
        component: 'system-roles',
        meta: {
          icon: 'i-ant-design-safety-certificate-outlined',
          order: 2,
          title: '角色管理',
        },
      },
    ],
  },
];

const ACCESS_ROUTES_BY_ROLE: Record<string, AccessRouteItem[]> = {
  admin: [
    ...ACCESS_ROUTE_BASE,
    {
      name: 'Admin',
      path: '/admin',
      component: 'admin',
      meta: {
        icon: 'i-ant-design-dashboard-outlined',
        order: 10,
        title: '管理台',
        requiredRoles: ['admin'],
      },
    },
    {
      name: 'Ops',
      path: '/ops',
      component: 'ops',
      meta: {
        icon: 'i-ant-design-cloud-server-outlined',
        order: 11,
        title: '运维中心',
        requiredRoles: ['admin'],
        menuVisibleWithForbidden: true,
      },
    },
  ],
  editor: [
    ...ACCESS_ROUTE_BASE,
    {
      name: 'Reports',
      path: '/reports',
      component: 'reports',
      meta: {
        icon: 'i-ant-design-bar-chart-outlined',
        order: 9,
        title: '报表中心',
        requiredCodes: ['report:view'],
      },
    },
    {
      name: 'Admin',
      path: '/admin',
      component: 'admin',
      meta: {
        icon: 'i-ant-design-dashboard-outlined',
        order: 10,
        title: '管理台',
        requiredRoles: ['admin'],
        menuVisibleWithForbidden: true,
      },
    },
  ],
  viewer: ACCESS_ROUTE_BASE,
};

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
  http.get('/api/access-routes', ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get('role') ?? 'viewer';
    const routes = ACCESS_ROUTES_BY_ROLE[role] ?? ACCESS_ROUTES_BY_ROLE.viewer ?? [];
    return HttpResponse.json(ok(routes));
  }),
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
