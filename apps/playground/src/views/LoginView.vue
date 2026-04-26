<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { deriveLayoutMenusFromAccessRouter } from '@pooka/core';
import { getAccessRouter, getLayoutController, initRuntime } from '@/access/access-router';
import { bumpLayoutMenusRevision } from '@/access/layout-menu-sync';
import { signInByRole } from '@/access/auth';

const role = ref<'admin' | 'editor' | 'viewer'>('viewer');
const router = useRouter();
const route = useRoute();

async function submitLogin() {
  await initRuntime();
  const accessRouter = getAccessRouter();
  const layout = getLayoutController();
  signInByRole(role.value);
  accessRouter.reset();
  await accessRouter.ensureLoaded();
  layout.setMenus(deriveLayoutMenusFromAccessRouter(accessRouter));
  bumpLayoutMenusRevision();

  const redirect = typeof route.query.redirect === 'string'
    ? decodeURIComponent(route.query.redirect)
    : '/';
  await router.replace(redirect);
}
</script>

<template>
  <main class="mx-auto max-w-md p-6 space-y-4">
    <h1 class="text-xl font-semibold">登录</h1>
    <p class="text-sm text-muted-foreground">选择角色模拟权限路由返回结果。</p>
    <label class="block text-sm">
      角色
      <select v-model="role" class="mt-1 w-full rounded border px-3 py-2">
        <option value="admin">admin</option>
        <option value="editor">editor</option>
        <option value="viewer">viewer</option>
      </select>
    </label>
    <button class="rounded bg-primary px-4 py-2 text-primary-foreground" @click="submitLogin">
      登录并进入系统
    </button>
  </main>
</template>
