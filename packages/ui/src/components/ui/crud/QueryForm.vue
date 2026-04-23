<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { CrudFormField } from '@pooka/core';

const props = defineProps<{
  open: boolean;
  mode: 'create' | 'edit';
  model: Record<string, any>;
  fields: CrudFormField[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: Record<string, any>];
}>();

const localModel = reactive<Record<string, any>>({});

watch(
  () => props.model,
  (value) => {
    Object.keys(localModel).forEach((key) => {
      delete localModel[key];
    });
    Object.assign(localModel, value ?? {});
  },
  { deep: true, immediate: true },
);

function submit(): void {
  emit('submit', { ...localModel });
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="w-full max-w-lg rounded-lg bg-background p-4 shadow-lg">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-semibold">{{ mode === 'create' ? '新增' : '编辑' }}</h3>
        <button class="text-sm text-muted-foreground" type="button" @click="emit('close')">关闭</button>
      </div>
      <form class="grid gap-3" @submit.prevent="submit">
        <label v-for="field in fields" :key="field.key" class="grid gap-1.5">
          <span class="text-sm">{{ field.key }}</span>
          <select
            v-if="field.component === 'select'"
            v-model="localModel[field.key]"
            class="h-9 rounded-md border px-3 text-sm"
          >
            <option v-for="option in field.options ?? []" :key="String(option.value)" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <textarea
            v-else-if="field.component === 'textarea'"
            v-model="localModel[field.key]"
            class="min-h-20 rounded-md border px-3 py-2 text-sm"
          />
          <input
            v-else
            v-model="localModel[field.key]"
            class="h-9 rounded-md border px-3 text-sm"
            type="text"
          />
        </label>
        <div class="mt-2 flex items-center justify-end gap-2">
          <button class="inline-flex h-9 items-center rounded-md border px-3 text-sm" type="button" @click="emit('close')">
            取消
          </button>
          <button class="inline-flex h-9 items-center rounded-md border px-3 text-sm" type="submit" :disabled="loading">
            {{ loading ? '提交中...' : '提交' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
