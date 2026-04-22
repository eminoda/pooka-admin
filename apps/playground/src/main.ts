import { createApp } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

import App from './App.vue';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';

import '@pooka/ui/styles.css';

const app = createApp(App);
const queryClient = new QueryClient();

app.use(VueQueryPlugin, { queryClient });
app.mount('#app');
