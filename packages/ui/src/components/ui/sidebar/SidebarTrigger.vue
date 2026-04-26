<script setup lang="ts">
defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <button
    type="button"
    class="size-7 inline-flex shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
    data-slot="sidebar-trigger"
    :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
    @click="emit('toggle')"
  >
    <!-- Lucide-style: panel-left-open（收起态） / panel-left-close（展开态），圆角线宽与品牌图形一致 -->
    <svg
      v-if="collapsed"
      class="size-4"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
    <svg
      v-else
      class="size-4"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  </button>
</template>
