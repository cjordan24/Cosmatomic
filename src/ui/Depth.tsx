/**
 * Three depths of explanation (Meteorology brief §14): Explore (intuitive), Understand (mechanisms), Research
 * (equations, datasets, uncertainty). Kept in the URL (?depth=) so it survives navigation and links; each level shows
 * the levels below it too. Changing depth never leaves the current visualisation.
 */
import type { ReactNode } from 'react';
import { setQuery, useRoute } from '@/shared/router';

export type Depth = 'explore' | 'understand' | 'research';
const ORDER: Depth[] = ['explore', 'understand', 'research'];
const LABEL: Record<Depth, string> = { explore: 'Explore', understand: 'Understand', research: 'Research' };

export function useDepth(): Depth {
  const { query } = useRoute();
  const d = query.get('depth') as Depth | null;
  return d && ORDER.includes(d) ? d : 'explore';
}

export function DepthSwitch() {
  const d = useDepth();
  return (
    <div role="radiogroup" aria-label="Depth" className="view-switch depth-switch" style={{ position: 'static', transform: 'none', display: 'inline-flex', marginLeft: 10 }}>
      {ORDER.map((o) => <button key={o} role="radio" aria-checked={o === d} className={o === d ? 'active' : ''} onClick={() => setQuery({ depth: o === 'explore' ? null : o })}>{LABEL[o]}</button>)}
    </div>
  );
}

/** Render children only at this depth or deeper. */
export function AtDepth({ level, children }: { level: Depth; children: ReactNode }) {
  const d = useDepth();
  return ORDER.indexOf(d) >= ORDER.indexOf(level) ? <>{children}</> : null;
}
