// store/user.ts
import { create } from 'zustand';

export type User = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
};

type UserState = {
  user: User | null;
  loaded: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoaded: (loaded: boolean) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loaded: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoaded: (loaded) => set({ loaded }),
}));
