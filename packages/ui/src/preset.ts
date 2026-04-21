import { presetWind4 } from '@unocss/preset-wind4';
import { presetIcons } from '@unocss/preset-icons';
import { presetAnimations } from 'unocss-preset-animations';
import { presetShadcn } from 'unocss-preset-shadcn';
import antDesignIcons from '@iconify-json/ant-design/icons.json';

export interface PookaPresetOptions {
  shadcnColor?: 'zinc' | 'slate' | 'stone' | 'gray' | 'neutral' | 'red' | 'rose' | 'orange' | 'green' | 'blue' | 'yellow' | 'violet';
  icons?: boolean;
}
/**
 * Pooka 默认 UnoCSS preset。
 * 当前以 wind4 为基础。
 */
export function presetPooka(options: PookaPresetOptions = {}): any {
  const {
    shadcnColor = 'green',
    icons = true,
  } = options;

  // https://github.com/unocss-community/unocss-preset-shadcn
  return [
    presetWind4(),
    presetAnimations(),
    presetShadcn({
      color: shadcnColor,
    }),
    ...(icons
      ? [
        presetIcons({
          scale: 1,
          collections: {
            'ant-design': () => antDesignIcons as any,
          },
        }),
      ]
      : []),
  ];
}
