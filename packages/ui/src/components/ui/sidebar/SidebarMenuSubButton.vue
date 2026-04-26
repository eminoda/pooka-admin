<script setup lang="ts">
defineProps<{
  active?: boolean;
}>();
</script>

<template>
  <button
    type="button"
    class="group/submenu-item relative my-0.5 mx-2 flex h-[38px] w-full items-center gap-2 rounded-lg border-0 bg-transparent pl-8 pr-3 text-left text-sm font-normal text-sidebar-foreground/80 outline-none transition-[background,color] duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-ring"
    data-slot="sidebar-menu-sub-button"
    data-sidebar="menu-sub-button"
    :data-active="active ? 'true' : 'false'"
    :class="{
      'bg-accent text-accent-foreground': active,
      'hover:bg-accent hover:text-accent-foreground': !active,
    }"
  >
    <slot />
  </button>
</template>
