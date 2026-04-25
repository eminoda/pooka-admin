<script setup lang="ts">
import type { Component } from 'vue';

const props = defineProps<{
  open: boolean;
  title?: string;
  direction?: 'top' | 'right' | 'bottom' | 'left';
  buttonComponent: Component | string;
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
    <component
      :is="props.drawerComponent"
      :open="props.open"
      :direction="props.direction ?? 'right'"
      @update:open="(value: boolean) => (!value ? emit('close') : undefined)"
    >
      <component :is="props.drawerContentComponent" class="max-w-xl h-full">
        <component :is="props.drawerHeaderComponent" class="relative pr-10">
          <component :is="props.drawerTitleComponent">{{ props.title ?? '编辑' }}</component>
          <component
            :is="props.buttonComponent"
            variant="ghost"
            size="sm"
            class="absolute top-0 right-0 h-8 w-8 p-0"
            type="button"
            @click="emit('close')"
          >
            <span class="i-ant-design:close-outlined text-sm" />
          </component>
        </component>
        <div class="min-h-0 flex-1 px-4 pb-4">
          <slot />
        </div>
      </component>
    </component>
  </section>
</template>
