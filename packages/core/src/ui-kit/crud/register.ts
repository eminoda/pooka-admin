import type { CrudUiRegistry } from './types.js';
import { pookaRegister } from '../../renderer/index.js';

const DEFAULT_TABLE_TYPE = 'crud.query-table';
const DEFAULT_FORM_TYPE = 'crud.query-form';

export function registerCrudUi(registry: CrudUiRegistry): void {
  pookaRegister(registry.tableType ?? DEFAULT_TABLE_TYPE, registry.table);
  pookaRegister(registry.formType ?? DEFAULT_FORM_TYPE, registry.form);
}
