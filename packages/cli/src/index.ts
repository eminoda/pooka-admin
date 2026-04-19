import cac from 'cac';

export function run(argv: string[] = process.argv): void {
  const program = cac('pooka');

  program
    .command('add <component>', '添加组件到项目（占位，后续对接 shadcn-vue / 本地模板）')
    .action((component: string) => {
      console.log(`[pooka] add "${component}" — 尚未实现，将复制组件至目标应用。`);
    });

  program.version('0.0.0');
  program.help();
  program.parse(argv);
}
