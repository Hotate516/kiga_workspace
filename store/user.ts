// store/user.ts
import { create } from 'zustand';
import { Timestamp } from "firebase/firestore";

export type User = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
};

export interface NoteMeta {
    id: string;
    title: string;
    lastModified: Timestamp;
}

type UserState = {
  user: User | null;
  loaded: boolean;
  notes: NoteMeta[];
  selectedNoteId: string | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoaded: (loaded: boolean) => void;
  setNotes: (notes: NoteMeta[]) => void;
  addNote: (note: NoteMeta) => void;
  setSelectedNoteId: (id: string | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loaded: false,
  notes: [],
  selectedNoteId: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null, notes: [], selectedNoteId: null }),
  setLoaded: (loaded) => set({ loaded }),
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes].sort((a, b) => (b.lastModified?.toMillis() || 0) - (a.lastModified?.toMillis() || 0)) })),
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
}));
