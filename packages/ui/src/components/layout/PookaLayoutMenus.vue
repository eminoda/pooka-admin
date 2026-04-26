<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PookaLayoutMenuItem } from '@pooka/core';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../ui/sidebar/index.js';

interface PookaLayoutMenusProps {
  menus: PookaLayoutMenuItem[];
  activePath?: string;
  collapsed?: boolean;
  openKeys?: string[];
}

const props = withDefaults(defineProps<PookaLayoutMenusProps>(), {
  activePath: '',
  collapsed: false,
});

const emit = defineEmits<{
  select: [path: string];
  'update:openKeys': [keys: string[]];
}>();

function onSelect(path: string) {
  emit('select', path);
}

function isActive(menu: PookaLayoutMenuItem): boolean {
  if (props.activePath === menu.path) {
    return true;
  }
  return Boolean(menu.children?.some(isActive));
}

const expandedParentPath = computed(() => {
  const parent = props.menus.find(
    (menu) => menu.children?.length && menu.children.some((child) => isActive(child)),
  );
  return parent?.path ?? '';
});

const manualExpandedParentPath = ref('');
const isControlled = computed(() => Array.isArray(props.openKeys));

watch(
  expandedParentPath,
  (path) => {
    if (isControlled.value) {
      return;
    }
    if (path) {
      manualExpandedParentPath.value = path;
    }
  },
  { immediate: true },
);

watch(
  () => props.openKeys,
  (keys) => {
    if (!isControlled.value) {
      return;
    }
    manualExpandedParentPath.value = keys?.[0] ?? '';
  },
  { immediate: true },
);

function isExpanded(menu: PookaLayoutMenuItem): boolean {
  if (!menu.children?.length) {
    return false;
  }
  return manualExpandedParentPath.value === menu.path;
}

function toggleParent(menu: PookaLayoutMenuItem): void {
  if (!menu.children?.length || props.collapsed) {
    return;
  }
  const next = manualExpandedParentPath.value === menu.path ? '' : menu.path;
  if (isControlled.value) {
    emit('update:openKeys', next ? [next] : []);
    return;
  }
  manualExpandedParentPath.value = next;
}

function onClickMenu(menu: PookaLayoutMenuItem): void {
  if (menu.children?.length) {
    toggleParent(menu);
    return;
  }
  onSelect(menu.path);
}

function menuButtonActiveMode(menu: PookaLayoutMenuItem): 'ancestor' | 'item' {
  if (!menu.children?.length) {
    return 'item';
  }
  const childActive = menu.children.some(isActive);
  const selfActive = props.activePath === menu.path;
  if (childActive && !selfActive) {
    return 'ancestor';
  }
  return 'item';
}
</script>

<template>
  <nav class="pooka-layout-menus w-full py-1 text-left" data-slot="layout-menu-root" aria-label="Main navigation">
    <SidebarMenu data-slot="layout-menu-list">
      <SidebarMenuItem v-for="menu in props.menus" :key="menu.path" data-slot="layout-menu-entry">
        <SidebarMenuButton
          :active="isActive(menu)"
          :active-mode="menuButtonActiveMode(menu)"
          :collapsed="props.collapsed"
          data-slot="layout-menu-item"
          @click="onClickMenu(menu)"
        >
          <slot name="menu-item" :menu="menu" :collapsed="props.collapsed">
            <div
              class="flex min-w-0 w-full items-center gap-2 text-left"
              :class="props.collapsed ? 'justify-center' : 'flex-1'"
            >
              <span
                v-if="menu.icon"
                class="size-4 shrink-0 text-[1rem] leading-none"
                :class="menu.icon"
                aria-hidden="true"
              />
              <span
                v-if="!props.collapsed"
                class="min-w-0 flex-1 truncate text-left"
              >
                {{ menu.title }}
              </span>
              <span
                v-else-if="!menu.icon"
                class="text-xs font-medium"
              >
                {{ menu.title.slice(0, 1) }}
              </span>
              <span
                v-if="menu.forbidden && !props.collapsed"
                class="shrink-0 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive"
              >
                403
              </span>
              <svg
                v-if="menu.children?.length && !props.collapsed"
                class="size-4 shrink-0 text-sidebar-foreground/55 transition-transform duration-200 ease-in-out"
                :class="{ 'rotate-180': isExpanded(menu) }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </slot>
        </SidebarMenuButton>

        <SidebarMenuSub
          v-if="menu.children?.length && !props.collapsed && isExpanded(menu)"
          data-slot="layout-menu-sub"
        >
          <SidebarMenuSubItem
            v-for="child in menu.children"
            :key="child.path"
            data-slot="layout-menu-sub-entry"
          >
            <SidebarMenuSubButton
              :active="isActive(child)"
              data-slot="layout-menu-sub-item"
              @click="onSelect(child.path)"
            >
              <span
                v-if="child.icon"
                class="size-4 shrink-0 text-[1rem] leading-none"
                :class="child.icon"
                aria-hidden="true"
              />
              <span class="min-w-0 flex-1 truncate text-left">
                {{ child.title }}
              </span>
              <span
                v-if="child.forbidden"
                class="shrink-0 rounded bg-destructive/10 px-1 py-0.5 text-[10px] text-destructive"
              >
                403
              </span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </SidebarMenuItem>
    </SidebarMenu>
  </nav>
</template>
