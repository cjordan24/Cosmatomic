/**
 * Minimal promise-based IndexedDB key/value store (no dependency).
 * Stores: 'http' (cached API responses), 'molecules' (user library), 'experiments' (Phase 3).
 * Fails soft: if IndexedDB is unavailable (private mode, tests), operations resolve to undefined.
 */
const DB_NAME = 'voyager-ventures';
const DB_VERSION = 1;
export type StoreName = 'http' | 'molecules' | 'experiments';

let dbPromise: Promise<IDBDatabase | null> | null = null;
function db(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  dbPromise ??= new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => { for (const s of ['http', 'molecules', 'experiments']) if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
  return dbPromise;
}

function tx<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return db().then((d) => d ? new Promise<T | undefined>((resolve) => {
    const r = fn(d.transaction(store, mode).objectStore(store));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => resolve(undefined);
  }) : undefined);
}

export const idbGet = <T>(store: StoreName, key: string) => tx<T>(store, 'readonly', (s) => s.get(key) as IDBRequest<T>);
export const idbSet = (store: StoreName, key: string, value: unknown) => tx(store, 'readwrite', (s) => s.put(value, key));
export const idbDelete = (store: StoreName, key: string) => tx(store, 'readwrite', (s) => s.delete(key));
export const idbAll = <T>(store: StoreName) => tx<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>);
