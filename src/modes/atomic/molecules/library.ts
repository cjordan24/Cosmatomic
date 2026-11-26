/**
 * Runtime molecule library = curated static records + user records (PubChem lookups, imports,
 * later builder output), persisted in IndexedDB under shared identifiers (PubChem CID where known).
 */
import { create } from 'zustand';
import { idbAll, idbDelete, idbSet } from '@/shared/idb';
import { MOLECULES, type MoleculeRecord } from './molecules';

interface LibraryState {
  user: MoleculeRecord[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (m: MoleculeRecord) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useMoleculeLibrary = create<LibraryState>((set, get) => ({
  user: [],
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const all = ((await idbAll<MoleculeRecord>('molecules')) ?? []).filter((m) => m && Array.isArray(m.atoms));
    set({ user: all, loaded: true });
  },
  add: async (m) => {
    if (MOLECULES.some((x) => x.id === m.id)) return; // already curated (same identifier)
    await idbSet('molecules', m.id, m);
    set((s) => ({ user: [...s.user.filter((x) => x.id !== m.id), m] }));
  },
  remove: async (id) => {
    await idbDelete('molecules', id);
    set((s) => ({ user: s.user.filter((x) => x.id !== id) }));
  },
}));

export function findMolecule(id: string | null | undefined, user: MoleculeRecord[]): MoleculeRecord | undefined {
  if (!id) return undefined;
  return MOLECULES.find((m) => m.id === id) ?? user.find((m) => m.id === id);
}
