<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { PookaLayout, PookaLayoutMain, PookaLayoutMenus } from 'pooka-ui';
import { Button } from '@/components/ui';
import logoUrl from '@pooka/docs/logo-inner.png?url';
import { getAccessRouter, getLayoutController, initRuntime } from '@/access/access-router';
import { layoutMenusRevision } from '@/access/layout-menu-sync';
import { signOut } from '@/access/auth';

const route = useRoute();
const router = useRouter();
const collapsed = ref(false);
const MENU_OPEN_KEYS_STORAGE_KEY = 'pooka-playground-layout-open-keys';
const openKeys = ref<string[]>([]);

try {
  const raw = localStorage.getItem(MENU_OPEN_KEYS_STORAGE_KEY);
  openKeys.value = raw ? (JSON.parse(raw) as string[]) : [];
} catch {
  openKeys.value = [];
}

watch(openKeys, (keys) => {
  localStorage.setItem(MENU_OPEN_KEYS_STORAGE_KEY, JSON.stringify(keys));
}, { deep: true });

function onUpdateOpenKeys(keys: string[]) {
  openKeys.value = keys;
}

const menus = computed(() => {
  layoutMenusRevision.value;
  void route.path;
  return getLayoutController().getState().menus;
});

async function logout() {
  await initRuntime();
  const accessRouter = getAccessRouter();
  signOut();
  accessRouter.reset();
  await router.replace('/login');
}

async function onSelectMenu(path: string) {
  await router.push(path);
}
</script>

<template>
  <PookaLayout v-model:collapsed="collapsed" :logo-src="logoUrl" logo-alt="pooka-admin">
    <PookaLayoutMenus
      :menus="menus"
      :active-path="route.path"
      :collapsed="collapsed"
      :open-keys="openKeys"
      @update:openKeys="onUpdateOpenKeys"
      @select="onSelectMenu"
    />
    <template #header>
      <div class="w-full flex items-center">
        <strong>Pooka Playground</strong>
        <Button
          variant="outline"
          size="sm"
          class="ml-auto"
          @click="logout"
        >
          退出登录
        </Button>
      </div>
    </template>
    <template #main>
      <PookaLayoutMain>
        <RouterView />
      </PookaLayoutMain>
    </template>
    <template #footer>
      <span>pooka-admin layout mvp</span>
    </template>
  </PookaLayout>
</template>
