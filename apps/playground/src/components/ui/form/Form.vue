<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"

interface Props extends PrimitiveProps {
  class?: HTMLAttributes["class"]
}

const emit = defineEmits<{
  (e: "submit", payload: SubmitEvent): void
}>()

const props = withDefaults(defineProps<Props>(), {
  as: "form",
})

function onSubmit(event: Event) {
  emit("submit", event as SubmitEvent)
}
</script>

<template>
  <Primitive
    data-slot="form"
    :as="as"
    :as-child="asChild"
    :class="cn('grid gap-3', props.class)"
    @submit="onSubmit"
  >
    <slot />
  </Primitive>
</template>
