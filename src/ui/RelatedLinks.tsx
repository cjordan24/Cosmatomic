/**
 * Cross-mode links for one registry entity, in both directions (Gate 4.7); "map ↗" opens it in #/relations (Gate 8.2). Every link comes from a
 * typed, sourced edge in src/shared/scientific-relationships/registry.ts; planned entities render as
 * plain text, never as working links.
 */
import { getEntity, relationshipsFrom, relationshipsTo, type Relationship } from '@/shared/scientific-relationships/registry';
import { navigate } from '@/shared/router';
import { SourceLinks } from './SourcesView';
import { getSource } from '@/shared/sources/sources';
import { VERBS } from '@/shared/scientific-relationships/graph';

export function RelatedLinks({ id, title = 'Related across modes', filter, limit, first, map = true }: { id: string; title?: string | null; filter?: (r: Relationship, dir: 'out' | 'in') => boolean; limit?: number; first?: string; /** show the link into the relationship explorer (Gate 8.2) */ map?: boolean }) {
  const all = [
    ...relationshipsFrom(id).filter((r) => !filter || filter(r, 'out')).map((r) => ({ r, other: r.to, verb: VERBS[r.type][0] })),
    ...relationshipsTo(id).filter((r) => !filter || filter(r, 'in')).map((r) => ({ r, other: r.from, verb: VERBS[r.type][1] })),
  ];
  if (!all.length) return null;
  if (first) all.sort((a, b) => Number(b.other === first) - Number(a.other === first));
  const rows = limit ? all.slice(0, limit) : all;
  return (
    <div className="related-links" data-entity={id}>
      {title && <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span>{title}</span>
        {map && <button className="link-btn" style={{ fontSize: 11, textTransform: 'none', letterSpacing: 0 }} aria-label="Relationship map" title="Show these links in the relationship explorer" onClick={() => navigate(`/relations?e=${encodeURIComponent(id)}`)}>map ↗</button>}</div>}
      <ul className="note" style={{ paddingLeft: 16, margin: 0 }} aria-label={`Related to ${getEntity(id)?.label ?? id}`}>
        {rows.map(({ r, other, verb }) => {
          const e = getEntity(other);
          return (
            <li key={`${r.from}-${r.to}-${r.type}`}>
              <span style={{ color: 'var(--text-faint)' }}>{verb}{r.context ? ` (${r.context})` : ''} → </span>
              {e?.route ? <button className="link-btn" onClick={() => navigate(e.route!.slice(1))}>{e.label}</button> : <span>{e?.label ?? other}</span>}
              {e?.status === 'planned' && <em style={{ color: 'var(--text-faint)' }}> · planned{e.note ? ` (${e.note})` : ''}</em>}
              {getSource(r.source) && <> <SourceLinks ids={[r.source]} /></>}
            </li>
          );
        })}
        {rows.length < all.length && <li style={{ color: 'var(--text-faint)', listStyle: 'none' }}>… and {all.length - rows.length} more</li>}
      </ul>
    </div>
  );
}
