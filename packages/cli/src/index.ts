import cac from 'cac';
import path from 'node:path';
import { addComponent } from './add.js';

export function run(argv: string[] = process.argv): void {
  const program = cac('pooka');

  program
    .command('add <component>', '添加组件。table/form 从 pooka-ui 本地模板拉取，其余走 shadcn-vue。')
    .option('--cwd <cwd>', '目标项目路径，默认当前目录')
    .action(async (component: string, options?: { cwd?: string }) => {
      const targetCwd = path.resolve(options?.cwd ?? process.cwd());
      await addComponent(targetCwd, component);
    });

  program.version('0.0.0');
  program.help();
  program.parse(argv, { run: false });
  Promise.resolve(program.runMatchedCommand()).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
