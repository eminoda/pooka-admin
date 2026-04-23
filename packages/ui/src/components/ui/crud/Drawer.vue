<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  open: boolean;
  title?: string;
  drawerComponent: Component | string;
  drawerContentComponent: Component | string;
  drawerHeaderComponent: Component | string;
  drawerTitleComponent: Component | string;
  drawerDescriptionComponent: Component | string;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <section>
    <component :is="drawerComponent" :open="open" @update:open="(value: boolean) => (!value ? emit('close') : undefined)">
      <component :is="drawerContentComponent" class="max-w-xl">
        <component :is="drawerHeaderComponent">
          <component :is="drawerTitleComponent">{{ title ?? '编辑' }}</component>
          <component :is="drawerDescriptionComponent">在此编辑当前数据行并提交更新。</component>
        </component>
        <div class="px-4 pb-4">
          <slot />
        </div>
      </component>
    </component>
  </section>
</template>
