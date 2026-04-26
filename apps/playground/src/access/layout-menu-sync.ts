import { ref } from 'vue';

/** 与 layout.setMenus 联动，驱动侧栏菜单 computed 刷新（layout 非响应式） */
export const layoutMenusRevision = ref(0);

export function bumpLayoutMenusRevision(): void {
  layoutMenusRevision.value += 1;
}
