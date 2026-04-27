<script setup lang="ts">
import type { Component } from 'vue';
import type { CrudActionConfig } from 'pooka-core';

defineProps<{
  actions: CrudActionConfig;
  buttonComponent: Component | string;
}>();

const emit = defineEmits<{
  createClick: [];
  refreshClick: [];
}>();

function actionLabel(action: boolean | { label?: string } | undefined, fallback: string): string {
  if (!action || typeof action === 'boolean') {
    return fallback;
  }
  return action.label ?? fallback;
}
</script>

<template>
  <section class="rounded-md border p-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <component
        :is="buttonComponent"
        v-if="actions.create !== false"
        class="h-9 gap-1.5 px-3 text-sm"
        type="button"
        @click="emit('createClick')"
      >
        <span class="i-ant-design:plus-outlined text-base" />
        {{ actionLabel(actions.create, '新增') }}
      </component>
      <component :is="buttonComponent" class="h-9 gap-1.5 px-3 text-sm" type="button" @click="emit('refreshClick')">
        <span class="i-ant-design:reload-outlined text-base" />
        刷新
      </component>
    </div>
  </section>
</template>
