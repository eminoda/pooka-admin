import { ref, type Ref } from 'vue';

export type CrudFormMode = 'create' | 'edit';

export interface CrudFormState {
  open: Ref<boolean>;
  mode: Ref<CrudFormMode>;
  model: Ref<Record<string, unknown>>;
  openCreate: () => void;
  openEdit: (data: Record<string, unknown>) => void;
  close: () => void;
}

export function createCrudFormState(): CrudFormState {
  const open = ref(false);
  const mode = ref<CrudFormMode>('create');
  const model = ref<Record<string, unknown>>({});

  function openCreate(): void {
    mode.value = 'create';
    model.value = {};
    open.value = true;
  }

  function openEdit(data: Record<string, unknown>): void {
    mode.value = 'edit';
    model.value = { ...data };
    open.value = true;
  }

  function close(): void {
    open.value = false;
  }

  return {
    open,
    mode,
    model,
    openCreate,
    openEdit,
    close,
  };
}
