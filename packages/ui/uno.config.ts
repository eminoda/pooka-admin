import { defineConfig } from 'unocss';
import { presetPooka } from './src/preset';

export default defineConfig({
  presets: [presetPooka()],
});
