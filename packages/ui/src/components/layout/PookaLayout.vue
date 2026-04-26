<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from '../ui/sidebar/index.js';

interface PookaLayoutProps {
  collapsed?: boolean;
  collapsedWidth?: number;
  menuWidth?: number;
  variant?: 'inset' | 'sidebar';
  collapsible?: 'icon' | 'offcanvas';
  /** 侧栏左上角品牌图（由应用侧 `import url from '...png?url'` 传入） */
  logoSrc?: string;
  logoAlt?: string;
  /** 展开侧栏时在 Logo 旁显示的文字；收起时仅显示图 */
  logoText?: string;
}

const props = withDefaults(defineProps<PookaLayoutProps>(), {
  collapsed: false,
  collapsedWidth: 72,
  menuWidth: 240,
  variant: 'sidebar',
  collapsible: 'icon',
  logoAlt: 'pooka-admin',
  logoText: 'Pooka Admin',
});

const emit = defineEmits<{
  'update:collapsed': [value: boolean];
}>();

function toggleCollapsed() {
  emit('update:collapsed', !props.collapsed);
}
</script>

<template>
  <div
    class="pooka-layout min-h-screen flex bg-background text-foreground"
    data-slot="layout-shell"
    :data-variant="props.variant"
    :data-collapsible="props.collapsible"
    :data-state="props.collapsed ? 'collapsed' : 'expanded'"
  >
    <Sidebar
      :collapsed="props.collapsed"
      :collapsed-width="props.collapsedWidth"
      :menu-width="props.menuWidth"
    >
      <SidebarHeader :collapsed="props.collapsed">
        <div class="min-w-0 flex-1">
          <slot name="logo">
            <template v-if="props.logoSrc">
              <div
                v-if="!props.collapsed"
                class="flex min-w-0 flex-1 items-center gap-2"
              >
                <img
                  :src="props.logoSrc"
                  :alt="props.logoAlt"
                  class="h-10 w-10 shrink-0 rounded-lg object-contain object-center select-none"
                  draggable="false"
                />
                <strong
                  class="truncate text-sm font-semibold tracking-wide text-sidebar-foreground"
                >
                  {{ props.logoText }}
                </strong>
              </div>
              <img
                v-else
                :src="props.logoSrc"
                :alt="props.logoAlt"
                class="mx-auto block h-9 w-9 rounded-lg object-contain object-center select-none"
                draggable="false"
              />
            </template>
            <strong
              v-else
              class="block truncate text-sm font-semibold tracking-wide text-sidebar-foreground"
            >
              {{ props.logoText }}
            </strong>
          </slot>
        </div>
        <slot name="trigger" :collapsed="props.collapsed" :toggle="toggleCollapsed">
          <SidebarTrigger :collapsed="props.collapsed" @toggle="toggleCollapsed" />
        </slot>
      </SidebarHeader>
      <SidebarContent>
        <slot />
      </SidebarContent>
    </Sidebar>

    <SidebarInset data-slot="layout-main-shell">
      <header class="h-14 border-b px-4 flex items-center" data-slot="layout-header">
        <slot name="header" />
      </header>
      <div class="flex-1 overflow-auto" data-slot="layout-content">
        <slot name="main" />
      </div>
      <footer
        class="border-t px-4 py-2 text-xs text-muted-foreground"
        data-slot="layout-footer"
      >
        <slot name="footer" />
      </footer>
    </SidebarInset>
  </div>
</template>
