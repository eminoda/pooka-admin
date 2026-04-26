<script setup lang="ts">
interface SidebarProps {
  collapsed?: boolean;
  collapsedWidth?: number;
  menuWidth?: number;
}

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsed: false,
  collapsedWidth: 72,
  menuWidth: 240,
});
</script>

<template>
  <aside
    class="relative border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear"
    data-slot="sidebar"
    :data-state="props.collapsed ? 'collapsed' : 'expanded'"
    :style="{ width: `${props.collapsed ? props.collapsedWidth : props.menuWidth}px` }"
  >
    <slot />
  </aside>
</template>
