import type { CrudColumn, CrudFormField, CrudSearchField } from './types.js';

export function inferSearchFields(
  search: CrudSearchField[] | string[] | undefined,
  columns: CrudColumn[],
): CrudSearchField[] {
  const columnMap = new Map(columns.map((column) => [column.key, column]));
  if (Array.isArray(search) && search.length > 0 && typeof search[0] === 'object') {
    return search as CrudSearchField[];
  }
  if (Array.isArray(search) && search.length > 0 && typeof search[0] === 'string') {
    return (search as string[]).map((key) => {
      const matched = columnMap.get(key);
      return {
        key,
        label: matched?.label ?? key,
        component: matched?.type === 'select' || matched?.type === 'switch' ? 'select' : 'input',
        options: matched?.options,
      };
    });
  }
  return columns.slice(0, 2).map((column) => ({
    key: column.key,
    label: column.label,
    component: column.type === 'select' || column.type === 'switch' ? 'select' : 'input',
    options: column.options,
  }));
}

export function inferFormFields(fields: CrudFormField[] | undefined, columns: CrudColumn[]): CrudFormField[] {
  if (fields?.length) {
    return fields;
  }
  return columns.map((column) => ({
    key: column.key,
    label: column.label,
    component: column.type === 'select' ? 'select' : column.type === 'switch' ? 'switch' : 'input',
    options: column.options,
  }));
}
