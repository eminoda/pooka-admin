export interface PlaygroundAuthState {
  token: null | string;
  roles: string[];
  codes: string[];
}

const AUTH_STORAGE_KEY = 'pooka-playground-auth';

const ROLE_CODES: Record<string, string[]> = {
  admin: ['report:view', 'report:export'],
  editor: ['report:view'],
  viewer: [],
};

export function getAuthState(): PlaygroundAuthState {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return {
      token: null,
      roles: [],
      codes: [],
    };
  }
  try {
    return JSON.parse(raw) as PlaygroundAuthState;
  } catch {
    return {
      token: null,
      roles: [],
      codes: [],
    };
  }
}

export function signInByRole(role: 'admin' | 'editor' | 'viewer'): PlaygroundAuthState {
  const state: PlaygroundAuthState = {
    token: `token-${role}`,
    roles: [role],
    codes: ROLE_CODES[role] ?? [],
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function signOut(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
