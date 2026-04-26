<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    active?: boolean;
    /** vben: submenu title with active child uses text-only highlight */
    activeMode?: 'ancestor' | 'item';
    collapsed?: boolean;
  }>(),
  {
    active: false,
    activeMode: 'item',
    collapsed: false,
  },
);
</script>

<template>
  <button
    type="button"
    class="group/menu-btn relative my-0.5 flex h-[38px] w-full min-w-0 max-w-full items-center gap-2 rounded-lg border-0 bg-transparent text-sm font-normal text-sidebar-foreground/80 outline-none transition-[background,color] duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    data-slot="sidebar-menu-button"
    data-sidebar="menu-button"
    :data-active="props.active ? 'true' : 'false'"
    :class="[
      props.collapsed
        ? 'justify-center px-2 text-center'
        : 'justify-between px-3 text-left',
      props.active && props.activeMode === 'ancestor'
        ? 'bg-transparent text-accent-foreground'
        : props.active
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent hover:text-accent-foreground',
    ]"
  >
    <slot />
  </button>
</template>
