import { ref } from 'vue';

export interface CrudTableState {
  page: number;
  pageSize: number;
  keyword: string;
}

export function createCrudTableState(defaultPageSize = 10) {
  const page = ref(1);
  const pageSize = ref(defaultPageSize);
  const keyword = ref('');

  function setPage(nextPage: number): void {
    page.value = Math.max(1, nextPage);
  }

  function setPageSize(nextPageSize: number): void {
    pageSize.value = Math.max(1, nextPageSize);
    page.value = 1;
  }

  function setKeyword(nextKeyword: string): void {
    keyword.value = nextKeyword;
    page.value = 1;
  }

  return {
    page,
    pageSize,
    keyword,
    setPage,
    setPageSize,
    setKeyword,
  };
}
