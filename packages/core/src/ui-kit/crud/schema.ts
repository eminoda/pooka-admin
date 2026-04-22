import { useCrud } from './useCrud.js';
import type { CrudSchema, UseCrudReturn } from './types.js';

export function renderSchema<TItem extends Record<string, unknown>, TForm extends Record<string, unknown>>(
  schema: CrudSchema,
): UseCrudReturn<TItem, TForm> {
  if (schema.type !== 'crud') {
    throw new Error('[pooka] renderSchema only supports type="crud"');
  }
  const { type: _type, ...options } = schema;
  void _type;
  return useCrud<TItem, TForm>(options as unknown as Parameters<typeof useCrud<TItem, TForm>>[0]);
}
