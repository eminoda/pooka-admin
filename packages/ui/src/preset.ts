import { presetWind4 } from '@unocss/preset-wind4';
import { presetAnimations } from 'unocss-preset-animations';
import { presetShadcn } from 'unocss-preset-shadcn';
/**
 * Pooka 默认 UnoCSS preset。
 * 当前以 wind4 为基础。
 */
export function presetPooka(): any {
  // https://github.com/unocss-community/unocss-preset-shadcn
  return [presetWind4(), presetAnimations(), presetShadcn({
    color: 'green',
  })];
}
