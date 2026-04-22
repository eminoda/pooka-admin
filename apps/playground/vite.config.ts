import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { defineConfig, type PluginOption } from 'vite';

export default defineConfig({
  plugins: [vue(), UnoCSS() as PluginOption],
  resolve: {
    alias: [
      {
        find: '@pooka/ui/preset',
        replacement: path.resolve(__dirname, '../../packages/ui/src/preset.ts'),
      },
      {
        find: /^@pooka\/ui$/,
        replacement: path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: '@pooka/ui/styles.css',
        replacement: path.resolve(__dirname, '../../packages/ui/src/styles.css'),
      },
      {
        find: '@pooka/core',
        replacement: path.resolve(__dirname, '../../packages/core/src/index.ts'),
      },
      {
        find: '@pooka/shared',
        replacement: path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      },
      {
        find: '@pooka/provider',
        replacement: path.resolve(__dirname, '../../packages/provider/src/index.ts'),
      },
    ],
  },
});
