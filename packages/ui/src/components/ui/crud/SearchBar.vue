<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Component } from 'vue';
import type { CrudSearchField } from 'pooka-core';

const props = defineProps<{
  filters: Record<string, unknown>;
  searchFields: CrudSearchField[];
  formComponent: Component | string;
  formItemComponent: Component | string;
  labelComponent: Component | string;
  inputComponent: Component | string;
  selectComponent: Component | string;
  selectTriggerComponent: Component | string;
  selectContentComponent: Component | string;
  selectGroupComponent: Component | string;
  selectItemComponent: Component | string;
  selectLabelComponent: Component | string;
  selectValueComponent: Component | string;
  buttonComponent: Component | string;
}>();

const emit = defineEmits<{
  submit: [filters: Record<string, unknown>];
  reset: [];
}>();

const localFilters = reactive<Record<string, unknown>>({});

watch(
  () => props.filters,
  (value) => {
    for (const key of Object.keys(localFilters)) {
      delete localFilters[key];
    }
    Object.assign(localFilters, value ?? {});
  },
  { deep: true, immediate: true },
);

function handleSubmit(): void {
  emit('submit', { ...localFilters });
}

function handleReset(): void {
  for (const field of props.searchFields) {
    delete localFilters[field.key];
  }
  emit('reset');
}

function shouldUseSelect(component?: CrudSearchField['component']): boolean {
  return component === 'select' || component === 'switch' || component === 'checkbox' || component === 'radio';
}

function resolveOptions(field: CrudSearchField): Array<{ label: string; value: string | number | boolean }> {
  if (field.options?.length) {
    return field.options;
  }
  if (field.component === 'switch' || field.component === 'checkbox' || field.component === 'radio') {
    return [
      { label: '启用', value: true },
      { label: '禁用', value: false },
    ];
  }
  return [];
}
</script>

<template>
  <section class="rounded-md border p-3">
    <component :is="formComponent" class="flex flex-wrap items-end gap-3" @submit.prevent="handleSubmit">
      <component
        :is="formItemComponent"
        v-for="field in searchFields"
        :key="field.key"
        class="flex min-w-72 items-center gap-3"
      >
        <component :is="labelComponent" class="w-16 shrink-0 justify-end text-right">
          {{ field.label ?? field.key }}
        </component>
        <component
          :is="selectComponent"
          v-if="shouldUseSelect(field.component)"
          v-model="localFilters[field.key]"
          class="flex-1"
        >
          <component :is="selectTriggerComponent" class="w-full">
            <component :is="selectValueComponent" placeholder="请选择" />
          </component>
          <component :is="selectContentComponent">
            <component :is="selectGroupComponent">
              <component :is="selectLabelComponent">{{ field.label ?? field.key }}</component>
              <component :is="selectItemComponent" v-for="option in resolveOptions(field)" :key="String(option.value)" :value="option.value">
                {{ option.label }}
              </component>
            </component>
          </component>
        </component>
        <component
          :is="inputComponent"
          v-else
          v-model="localFilters[field.key]"
          class="h-9 flex-1"
          type="text"
          :placeholder="`请输入${field.label ?? field.key}`"
        />
      </component>
      <div class="ml-auto flex items-center gap-2 self-end">
        <component
          :is="buttonComponent"
          class="h-9"
          type="submit"
        >
          查询
        </component>
        <component
          :is="buttonComponent"
          class="h-9"
          type="button"
          variant="outline"
          @click="handleReset"
        >
          重置
        </component>
      </div>
    </component>
  </section>
</template>
