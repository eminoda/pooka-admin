<script setup lang="ts">
import { pookaRender } from '@pooka/core';
import { pookaSharedPing } from '@pooka/shared';
import { pookaUiVersion } from '@pooka/ui';

const PookaSchemaView = pookaRender({ type: 'placeholder' });
const shared = pookaSharedPing();
</script>

<template>
  <main style="padding: 1.5rem; font-family: system-ui, sans-serif">
    <h1>Pooka Playground</h1>
    <p>@pooka/ui: {{ pookaUiVersion }}</p>
    <p>@pooka/shared: {{ shared }}</p>
    <component :is="PookaSchemaView" />
  </main>
</template>
