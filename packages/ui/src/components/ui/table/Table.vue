<script setup lang="ts">
interface TableRow {
  id: string | number;
  [key: string]: unknown;
}

defineProps<{
  columns: string[];
  rows: TableRow[];
}>();
</script>

<template>
  <div class="rounded-md border">
    <table class="w-full text-sm">
      <thead class="border-b bg-muted/50">
        <tr>
          <th
            v-for="column in columns"
            :key="column"
            class="h-10 px-4 text-left font-medium"
          >
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id" class="border-b last:border-b-0">
          <td v-for="column in columns" :key="column" class="p-4">
            {{ row[column] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
