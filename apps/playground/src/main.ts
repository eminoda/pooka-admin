import { createApp } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

import App from './App.vue';
import { router } from './router';
import { initRuntime } from './access/access-router';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';

import '@pooka/ui/styles.css';

async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) {
    return;
  }
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

async function bootstrap(): Promise<void> {
  await enableMocking();
  await initRuntime();
  const app = createApp(App);
  const queryClient = new QueryClient();
  app.use(VueQueryPlugin, { queryClient });
  app.use(router);
  app.mount('#app');
}

void bootstrap();
