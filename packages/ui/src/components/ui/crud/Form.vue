<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Component } from 'vue';
import type { CrudFormField } from 'pooka-core';

const props = defineProps<{
  open: boolean;
  mode: 'create' | 'edit';
  model: Record<string, any>;
  fields: CrudFormField[];
  loading: boolean;
  title?: string;
  embedded?: boolean;
  buttonComponent: Component | string;
  formComponent: Component | string;
  inputComponent: Component | string;
  textareaComponent: Component | string;
  switchComponent: Component | string;
  selectComponent: Component | string;
  selectTriggerComponent: Component | string;
  selectContentComponent: Component | string;
  selectGroupComponent: Component | string;
  selectItemComponent: Component | string;
  selectLabelComponent: Component | string;
  selectValueComponent: Component | string;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: Record<string, any>];
}>();

const localModel = reactive<Record<string, any>>({});

watch(
  () => props.model,
  (value) => {
    for (const key of Object.keys(localModel)) {
      delete localModel[key];
    }
    Object.assign(localModel, value ?? {});
  },
  { deep: true, immediate: true },
);

function submit(): void {
  emit('submit', { ...localModel });
}

function labelForField(field: CrudFormField): string {
  const map: Record<string, string> = {
    name: '姓名',
    hobbies: '爱好',
    description: '简介',
    status: '状态',
  };
  return map[field.key] ?? field.key;
}
</script>

<template>
  <section
    v-if="open"
    :class="embedded ? 'contents' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'"
  >
    <div :class="embedded ? 'h-full' : 'w-full max-w-xl rounded-lg bg-background p-4 shadow-lg'">
      <div v-if="!embedded" class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-semibold">{{ title ?? (mode === 'create' ? '新增' : '编辑') }}</h3>
        <component :is="buttonComponent" type="button" variant="ghost" size="sm" @click="emit('close')">
          <span class="i-ant-design:close-outlined text-sm" />
        </component>
      </div>
      <component :is="formComponent" :class="embedded ? 'flex h-full min-h-0 flex-col' : 'grid gap-3'" @submit.prevent="submit">
        <div :class="embedded ? 'min-h-0 flex-1 space-y-3 overflow-y-auto pr-1' : 'space-y-3'">
          <label
            v-for="field in fields"
            :key="field.key"
            :class="field.component === 'textarea' ? 'flex items-start gap-3' : 'flex items-center gap-3'"
          >
            <span class="w-16 shrink-0 text-right text-sm">{{ labelForField(field) }}</span>
            <component
              :is="selectComponent"
              v-if="field.component === 'select'"
              v-model="localModel[field.key]"
              class="flex-1"
            >
              <component :is="selectTriggerComponent" class="w-full">
                <component :is="selectValueComponent" placeholder="请选择" />
              </component>
              <component :is="selectContentComponent">
                <component :is="selectGroupComponent">
                  <component :is="selectLabelComponent">{{ field.key }}</component>
                  <component :is="selectItemComponent" v-for="option in field.options ?? []" :key="String(option.value)" :value="option.value">
                    {{ option.label }}
                  </component>
                </component>
              </component>
            </component>
            <component
              :is="textareaComponent"
              v-else-if="field.component === 'textarea'"
              v-model="localModel[field.key]"
              class="min-h-24 flex-1"
            />
            <div v-else-if="field.component === 'switch'" class="flex items-center gap-3">
              <component :is="switchComponent" v-model="localModel[field.key]" />
              <span class="text-xs text-muted-foreground">{{ localModel[field.key] ? '启用' : '禁用' }}</span>
            </div>
            <component
              :is="inputComponent"
              v-else
              v-model="localModel[field.key]"
              class="h-9 flex-1"
              type="text"
            />
          </label>
        </div>
        <div :class="embedded ? 'sticky bottom-0 mt-3 border-t bg-background pt-3' : 'mt-2'">
          <div class="flex items-center justify-end gap-2">
          <component :is="buttonComponent" variant="outline" type="button" @click="emit('close')">取消</component>
          <component :is="buttonComponent" type="submit" :disabled="loading">
            {{ loading ? '提交中...' : '提交' }}
          </component>
          </div>
        </div>
      </component>
    </div>
  </section>
</template>
