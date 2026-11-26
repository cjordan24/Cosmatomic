/**
 * Tiny hash router. Routes are deep-linkable (used by screenshots and bookmarks):
 *   #/                         landing
 *   #/atomic                   periodic table
 *   #/atomic/element/26?view=cloud&diagram=bohr&A=56&q=2
 *   #/atomic/molecules[/<id>]
 *   #/cosmic[/<bodyId>]
 */
import { useSyncExternalStore } from 'react';

export interface Route { path: string[]; query: URLSearchParams; raw: string }

function parse(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const [p, q = ''] = h.split('?');
  return { path: p.split('/').filter(Boolean), query: new URLSearchParams(q), raw: hash };
}

let current = parse(typeof window === 'undefined' ? '' : window.location.hash);
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => { current = parse(window.location.hash); listeners.forEach((l) => l()); });
}

export function useRoute(): Route {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => current);
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const hash = to.startsWith('#') ? to : `#${to}`;
  if (opts.replace) {
    history.replaceState(null, '', hash);
    current = parse(hash);
    listeners.forEach((l) => l());
  } else window.location.hash = hash;
}

/** Update query parameters on the current route without adding history entries. */
export function setQuery(patch: Record<string, string | number | null>) {
  const q = new URLSearchParams(current.query);
  for (const [k, v] of Object.entries(patch)) v === null ? q.delete(k) : q.set(k, String(v));
  const s = q.toString();
  navigate(`#/${current.path.join('/')}${s ? `?${s}` : ''}`, { replace: true });
}
