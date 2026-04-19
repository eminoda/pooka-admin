<script setup lang="ts">
import { Button } from '@/components/ui/button';
import Form from '@/components/ui/form/Form.vue';
import Table from '@/components/ui/table/Table.vue';

const rows = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'Editor' },
];

const columns = ['name', 'role'];
</script>

<template>
  <main class="grid gap-6 p-6">
    <section class="grid gap-2">
      <h2 class="text-lg font-semibold">Button</h2>
      <Button>Shadcn Button</Button>
    </section>

    <section class="grid gap-2">
      <h2 class="text-lg font-semibold">Form</h2>
      <Form />
    </section>

    <section class="grid gap-2">
      <h2 class="text-lg font-semibold">Table</h2>
      <Table :columns="columns" :rows="rows" />
    </section>
  </main>
</template>
