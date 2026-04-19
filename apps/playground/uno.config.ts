import { defineConfig } from 'unocss';
import { presetPooka } from '@pooka/ui/preset';

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.(vue|ts|tsx|js|jsx|html)$/],
    },
  },
  presets: presetPooka(),
});
