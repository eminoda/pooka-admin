import { defineConfig } from 'unocss';
import { presetPooka } from 'pooka-ui/preset';

/** 菜单 `meta.icon` 为运行时字符串，需 safelist 才能生成对应图标 CSS */
const MENU_ICON_SAFELIST = [
  'i-ant-design-home-outlined',
  'i-ant-design-user-outlined',
  'i-ant-design-setting-outlined',
  'i-ant-design-team-outlined',
  'i-ant-design-safety-certificate-outlined',
  'i-ant-design-dashboard-outlined',
  'i-ant-design-cloud-server-outlined',
  'i-ant-design-bar-chart-outlined',
] as const;

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.(vue|ts|tsx|js|jsx|html)$/],
    },
  },
  safelist: [...MENU_ICON_SAFELIST],
  presets: presetPooka({ theme: 'antd' }),
});
