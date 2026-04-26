import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { deriveLayoutMenusFromAccessRouter } from '@pooka/core';
import { getAccessRouter, getLayoutController, initRuntime } from '@/access/access-router';
import { bumpLayoutMenusRevision } from '@/access/layout-menu-sync';
import { getAuthState } from '@/access/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      ignoreAccess: true,
      title: '登录',
    },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: {
      ignoreAccess: true,
      title: '403',
    },
  },
  {
    path: '/',
    component: () => import('@/views/AuthenticatedLayoutView.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: {
          title: '首页',
          icon: 'i-ant-design-home-outlined',
        },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: {
          title: '个人中心',
          icon: 'i-ant-design-user-outlined',
        },
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/AdminView.vue'),
        meta: {
          title: '管理台',
          icon: 'i-ant-design-dashboard-outlined',
          requiredRoles: ['admin'],
        },
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/ReportsView.vue'),
        meta: {
          title: '报表中心',
          icon: 'i-ant-design-bar-chart-outlined',
          requiredCodes: ['report:view'],
        },
      },
      {
        path: 'system/users',
        name: 'SystemUsers',
        component: () => import('@/views/SystemUsersView.vue'),
        meta: {
          title: '用户管理',
          icon: 'i-ant-design-team-outlined',
        },
      },
      {
        path: 'system/roles',
        name: 'SystemRoles',
        component: () => import('@/views/SystemRolesView.vue'),
        meta: {
          title: '角色管理',
          icon: 'i-ant-design-safety-certificate-outlined',
        },
      },
      {
        path: 'ops',
        name: 'Ops',
        component: () => import('@/views/OpsView.vue'),
        meta: {
          title: '运维中心',
          icon: 'i-ant-design-cloud-server-outlined',
          requiredRoles: ['admin'],
          menuVisibleWithForbidden: true,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      ignoreAccess: true,
      title: '404',
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  await initRuntime();
  const accessRouter = getAccessRouter();
  const layout = getLayoutController();
  const auth = getAuthState();
  if (to.path === '/login' && auth.token) {
    return '/';
  }

  const result = await accessRouter.guard(to.path, to.meta as any);
  layout.setMenus(deriveLayoutMenusFromAccessRouter(accessRouter));
  bumpLayoutMenusRevision();
  layout.setActivePath(to.path);
  if (!result.allowed) {
    return result.redirectTo;
  }
  return true;
});
