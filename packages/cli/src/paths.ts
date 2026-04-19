import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 在 monorepo 下定位到 packages 根目录。
 * dist 结构: packages/cli/dist/*.js
 */
const packagesRoot = path.resolve(dirname, '..', '..');

export const uiRoot = path.join(packagesRoot, 'ui');

export function resolveUiPath(...segments: string[]): string {
  return path.join(uiRoot, ...segments);
}
