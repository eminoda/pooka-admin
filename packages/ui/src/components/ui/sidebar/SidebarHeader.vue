<script setup lang="ts">
defineProps<{
  collapsed?: boolean;
}>();
</script>

<template>
  <div
    class="h-14 shrink-0 border-b border-sidebar-border flex items-center justify-between gap-2"
    :class="collapsed ? 'px-2' : 'px-3'"
    data-slot="sidebar-header"
    :data-collapsed="collapsed ? 'true' : 'false'"
  >
    <slot />
  </div>
</template>
