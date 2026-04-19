/**
 * shadcn-vue 常用 `cn()` 合并类名工具占位。
 * 安装 `clsx` + `tailwind-merge`（或项目选定方案）后在此实现。
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
