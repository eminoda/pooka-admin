<script setup lang="ts">
import { reactive } from 'vue';

const emit = defineEmits<{
  submit: [payload: { name: string; email: string }];
}>();

const model = reactive({
  name: '',
  email: '',
});

function onSubmit() {
  emit('submit', { ...model });
}
</script>

<template>
  <form class="grid gap-4 rounded-md border p-4" @submit.prevent="onSubmit">
    <label class="grid gap-1.5">
      <span class="text-sm font-medium">Name</span>
      <input v-model="model.name" class="h-9 rounded-md border px-3" type="text" />
    </label>

    <label class="grid gap-1.5">
      <span class="text-sm font-medium">Email</span>
      <input v-model="model.email" class="h-9 rounded-md border px-3" type="email" />
    </label>

    <button class="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium" type="submit">
      Submit
    </button>
  </form>
</template>
