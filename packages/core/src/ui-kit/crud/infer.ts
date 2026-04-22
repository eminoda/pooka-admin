import type { CrudColumn, CrudFormField, CrudSearchField } from './types.js';

export function inferSearchFields(
  search: CrudSearchField[] | string[] | undefined,
  columns: CrudColumn[],
): CrudSearchField[] {
  if (Array.isArray(search) && search.length > 0 && typeof search[0] === 'object') {
    return search as CrudSearchField[];
  }
  if (Array.isArray(search) && search.length > 0 && typeof search[0] === 'string') {
    return (search as string[]).map((key) => ({ key, component: 'input' }));
  }
  return columns.slice(0, 2).map((column) => ({
    key: column.key,
    component: column.type === 'select' ? 'select' : 'input',
  }));
}

export function inferFormFields(fields: CrudFormField[] | undefined, columns: CrudColumn[]): CrudFormField[] {
  if (fields?.length) {
    return fields;
  }
  return columns.map((column) => ({
    key: column.key,
    component: column.type === 'select' ? 'select' : 'input',
    options: column.options,
  }));
}
