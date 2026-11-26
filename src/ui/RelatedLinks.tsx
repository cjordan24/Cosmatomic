/**
 * Cross-mode links for one registry entity, in both directions (Gate 4.7). Every link comes from a
 * typed, sourced edge in src/shared/scientific-relationships/registry.ts; planned entities render as
 * plain text, never as working links.
 */
import { getEntity, relationshipsFrom, relationshipsTo, type Relationship } from '@/shared/scientific-relationships/registry';
import { navigate } from '@/shared/router';
import { SourceLinks } from './SourcesView';
import { getSource } from '@/shared/sources/sources';

const VERB: Partial<Record<Relationship['type'], [string, string]>> = {
  'has-spectrum': ['spectrum', 'spectrum of'],
  'has-property': ['property', 'property of'],
  emits: ['emits', 'emitted by'],
  explains: ['explains', 'explained by'],
  'participates-in': ['part of', 'involves'],
};

export function RelatedLinks({ id, title = 'Related across modes', filter }: { id: string; title?: string | null; filter?: (r: Relationship, dir: 'out' | 'in') => boolean }) {
  const rows = [
    ...relationshipsFrom(id).filter((r) => !filter || filter(r, 'out')).map((r) => ({ r, other: r.to, verb: VERB[r.type]?.[0] ?? r.type })),
    ...relationshipsTo(id).filter((r) => !filter || filter(r, 'in')).map((r) => ({ r, other: r.from, verb: VERB[r.type]?.[1] ?? r.type })),
  ];
  if (!rows.length) return null;
  return (
    <div className="related-links" data-entity={id}>
      {title && <div className="section-title">{title}</div>}
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
      </ul>
    </div>
  );
}
