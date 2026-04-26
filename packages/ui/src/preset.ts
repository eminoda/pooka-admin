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
type PookaTheme = 'antd' | 'element' | 'shadcn';

type PookaPresetInnerOptions = {
  primary?: ShadcnBuiltinColor | string;
  icon?: string;
  presetIcons?: Parameters<typeof presetIcons>[0];
};

export interface PookaPresetOptions {
  theme?: PookaTheme;
  options?: PookaPresetInnerOptions;
}
/**
 * Pooka 默认 UnoCSS preset。
 * 当前以 wind4 为基础。
 */
export function presetPooka(options: PookaPresetOptions = {}): any {
  const { theme = 'shadcn', options: presetOptions = {} } = options;
  const {
    primary: primaryOption,
    icon = 'ant-design',
    presetIcons: presetIconsOptions = {},
  } = presetOptions;

  const primary = primaryOption ?? (theme === 'antd' ? '#1677ff' : theme === 'element' ? '#409eff' : 'green');
  const shadcnPrimary = SHADCN_BUILTIN_COLORS.includes(primary as ShadcnBuiltinColor)
    ? (primary as ShadcnBuiltinColor)
    : 'green';
  const iconCollections = {
    ...(icon === 'ant-design' ? { 'ant-design': () => antDesignIcons as any } : {}),
    ...(presetIconsOptions.collections ?? {}),
  };

  // https://github.com/unocss-community/unocss-preset-shadcn
  return [
    presetWind4(),
    presetAnimations(),
    presetShadcn({
      color: shadcnPrimary,
    }),
    ...(theme === 'antd' ? [presetAntd({ primary })] : []),
    ...(theme === 'element'
      ? [presetElementPlus({
      primary,
      preferCssVariables: false
    })]
      : []),
    presetIcons({
      scale: 1,
      ...presetIconsOptions,
      collections: iconCollections,
    }),
  ];
}
