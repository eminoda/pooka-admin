<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Component } from 'vue';

const props = defineProps<{
  page: number;
  pageSize: number;
  total: number;
  selectComponent: Component | string;
  selectTriggerComponent: Component | string;
  selectContentComponent: Component | string;
  selectGroupComponent: Component | string;
  selectItemComponent: Component | string;
  selectValueComponent: Component | string;
  paginationComponent: Component | string;
  paginationContentComponent: Component | string;
  paginationEllipsisComponent: Component | string;
  paginationItemComponent: Component | string;
  paginationNextComponent: Component | string;
  paginationPreviousComponent: Component | string;
}>();

const emit = defineEmits<{
  pageChange: [page: number];
  pageSizeChange: [pageSize: number];
}>();

const jumpPage = ref('');

function totalPages(): number {
  return Math.max(1, Math.ceil(props.total / props.pageSize));
}

const pages = computed(() => {
  const total = totalPages();
  const current = props.page;
  const result: Array<number | 'ellipsis'> = [];

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  result.push(1);
  if (current > 4) {
    result.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let value = start; value <= end; value += 1) {
    result.push(value);
  }

  if (current < total - 3) {
    result.push('ellipsis');
  }
  result.push(total);
  return result;
});

watch(
  () => props.page,
  (value) => {
    jumpPage.value = String(value);
  },
  { immediate: true },
);

function handleJump(): void {
  const value = Number(jumpPage.value);
  if (!Number.isFinite(value)) {
    jumpPage.value = String(props.page);
    return;
  }
  const target = Math.min(totalPages(), Math.max(1, Math.trunc(value)));
  emit('pageChange', target);
  jumpPage.value = String(target);
}
</script>

<template>
  <section class="flex flex-nowrap items-center justify-end gap-1.5 overflow-x-auto px-2 py-1.5 text-xs whitespace-nowrap">
    <span class="text-muted-foreground">共 {{ total }} 条</span>

    <component :is="selectComponent" :model-value="String(pageSize)" @update:model-value="emit('pageSizeChange', Number($event))">
      <component :is="selectTriggerComponent" class="h-8 w-24 text-xs">
        <component :is="selectValueComponent" placeholder="每页条数" />
      </component>
      <component :is="selectContentComponent">
        <component :is="selectGroupComponent">
          <component :is="selectItemComponent" value="10">10 条/页</component>
          <component :is="selectItemComponent" value="20">20 条/页</component>
          <component :is="selectItemComponent" value="50">50 条/页</component>
        </component>
      </component>
    </component>
    <component
      :is="paginationComponent"
      :items-per-page="pageSize"
      :total="total"
      :page="page"
      @update:page="emit('pageChange', $event)"
    >
      <component :is="paginationContentComponent" v-slot="{ page: slotPage }">
        <component
          :is="paginationPreviousComponent"
          size="icon"
          href="#"
          class="h-8 w-8"
          @click.prevent="emit('pageChange', Math.max(1, slotPage - 1))"
        >
          <span class="i-ant-design:left-outlined text-xs" />
        </component>
        <template v-for="(item, index) in pages" :key="`${item}-${index}`">
          <component
            :is="paginationItemComponent"
            v-if="item !== 'ellipsis'"
            href="#"
            :value="item"
            size="icon"
            class="h-8 w-8 text-xs"
            :is-active="slotPage === item"
            @click.prevent="emit('pageChange', Number(item))"
          >
            {{ item }}
          </component>
          <component :is="paginationEllipsisComponent" v-else />
        </template>
        <component
          :is="paginationNextComponent"
          size="icon"
          href="#"
          class="h-8 w-8"
          @click.prevent="emit('pageChange', Math.min(totalPages(), slotPage + 1))"
        >
          <span class="i-ant-design:right-outlined text-xs" />
        </component>
      </component>
    </component>

    <div class="flex flex-nowrap items-center gap-1">
      <span class="text-muted-foreground">前往</span>
      <input
        v-model="jumpPage"
        class="h-8 w-10 rounded-md border px-1 text-center text-xs"
        type="number"
        min="1"
        :max="totalPages()"
        @keydown.enter.prevent="handleJump"
        @blur="handleJump"
      >
      <span class="text-muted-foreground">页</span>
    </div>
  </section>
</template>
