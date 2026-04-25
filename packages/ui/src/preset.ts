import { presetWind4 } from '@unocss/preset-wind4';
import { presetIcons } from '@unocss/preset-icons';
import { presetAnimations } from 'unocss-preset-animations';
import { presetAntd } from 'unocss-preset-antd';
import { presetElementPlus } from 'unocss-preset-element-plus';
import { presetShadcn } from 'unocss-preset-shadcn';
import antDesignIcons from '@iconify-json/ant-design/icons.json';

const SHADCN_BUILTIN_COLORS = [
  'zinc',
  'slate',
  'stone',
  'gray',
  'neutral',
  'red',
  'rose',
  'orange',
  'green',
  'blue',
  'yellow',
  'violet',
] as const;
type ShadcnBuiltinColor = (typeof SHADCN_BUILTIN_COLORS)[number];

export interface PookaPresetOptions {
  primary?: ShadcnBuiltinColor | string;
  antd?: boolean;
  element?: boolean;
  icons?: boolean;
}
/**
 * Pooka 默认 UnoCSS preset。
 * 当前以 wind4 为基础。
 */
export function presetPooka(options: PookaPresetOptions = {}): any {
  const {
    antd = false,
    element = false,
    icons = true,
  } = options;
  const primary = options.primary ?? (antd ? '#1677ff' : element ? '#409eff' : 'green');
  const shadcnPrimary = SHADCN_BUILTIN_COLORS.includes(primary as ShadcnBuiltinColor)
    ? (primary as ShadcnBuiltinColor)
    : 'green';

  // https://github.com/unocss-community/unocss-preset-shadcn
  return [
    presetWind4(),
    presetAnimations(),
    presetShadcn({
      color: shadcnPrimary,
    }),
    ...(antd ? [presetAntd({ primary })] : []),
    ...(element ? [presetElementPlus({
      primary
    })] : []),
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
