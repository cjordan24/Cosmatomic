/**
 * Encyclopedia UI (Gate E.1).
 *  - EncyclopediaDrawer (lazy-loaded): a collapsible corner menu with every entry, opened from the top-bar
 *    button in TopBar.tsx and deep-linkable with ?enc=index or ?enc=<entry id> on any route.
 *  - EncyclopediaBio: a collapsible "About" section shown in a panel when an item is selected.
 * All text is quoted verbatim from the cited source (see src/shared/encyclopedia/encyclopedia.ts).
 */
import { useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { useVoyager } from '@/shared/store';
import { CATEGORIES, entriesIn, entryForEntity, getEntry, searchEntries, useEncyclopedia, type EncyclopediaEntry } from '@/shared/encyclopedia/encyclopedia';
import { getSource } from '@/shared/sources/sources';
import { SourceLinks } from './SourcesView';

/** Quoted entry text with its credit line. `limit` shows only the first n sections. */
export function EntryBody({ entry, limit }: { entry: EncyclopediaEntry; limit?: number }) {
  const sections = limit ? entry.sections.slice(0, limit) : entry.sections;
  const src = getSource(entry.source);
  return (
    <div className="enc-entry">
      <p className="enc-source" aria-label="Source of this entry">
        Source: <a href={entry.url} target="_blank" rel="noreferrer">“{entry.pageTitle}”</a>{src && <>, <i>{src.title}</i>, {src.authors} ({src.year})</>} · <button className="link-btn" onClick={() => navigate(`/sources/${entry.source}`)}>Source index entry</button>
      </p>
      {sections.map((s, i) => (
        <div key={i}>
          {s.heading && <div className="enc-heading">{s.heading}</div>}
          {s.paragraphs.map((p, j) => <blockquote key={j} className="enc-quote" cite={entry.url}>{p}</blockquote>)}
        </div>
      ))}
      <p className="enc-credit">
        Quoted from “<a href={entry.url} target="_blank" rel="noreferrer">{entry.pageTitle}</a>”, {getSource(entry.source)?.title} · <SourceLinks ids={[entry.source]} />.{' '}
        {entry.omittedSentences > 0 && <>{entry.omittedSentences} {entry.omittedSentences === 1 ? 'sentence is' : 'sentences are'} omitted: text that describes pictures on the source page ([…]) or a reviewed section that is not about the subject’s science. </>}
        {entry.license}
      </p>
    </div>
  );
}

/** Collapsible "About" section for the selected item(s). Collapse state is shared across views. */
export function EncyclopediaBio({ entries, what = 'this' }: { entries: EncyclopediaEntry[]; what?: string }) {
  const collapsed = useVoyager((s) => !!s.panelsCollapsed['enc-bio']);
  const toggle = useVoyager((s) => s.togglePanel);
  const [full, setFull] = useState<string | null>(null);
  return (
    <section className="enc-bio" aria-label="Encyclopedia">
      <button className="enc-bio-head" aria-expanded={!collapsed} onClick={() => toggle('enc-bio')}>
        <span>📖 About {what}{entries.length && entries.map((e) => e.title).join(' · ').replace(/^The /, '').toLowerCase() !== what.toLowerCase() ? `: ${entries.map((e) => e.title).join(' · ')}` : ''}</span><span>{collapsed ? '▸' : '▾'}</span>
      </button>
      {!collapsed && (entries.length === 0
        ? <p className="note">No encyclopedia entry covers this range yet.</p>
        : entries.map((e) => (
          <div key={e.id} className="enc-bio-entry">
            {entries.length > 1 && <div className="section-title">{e.title}</div>}
            <EntryBody entry={e} limit={full === e.id ? undefined : 1} />
            <div className="chip-row" style={{ gap: 6 }}>
              {e.sections.length > 1 && <button className="chip" onClick={() => setFull(full === e.id ? null : e.id)}>{full === e.id ? 'Show less' : `Read more (${e.sections.length - 1} more sections)`}</button>}
              <button className="chip" onClick={() => setQuery({ enc: e.id })}>Open in encyclopedia</button>
            </div>
          </div>
        )))}
    </section>
  );
}

export default function EncyclopediaDrawer() {
  const { query, path } = useRoute();
  useEncyclopedia();
  const enc = query.get('enc');
  const [q, setQ] = useState('');
  const collapsed = useVoyager((s) => !!s.panelsCollapsed['enc-drawer']);
  const toggle = useVoyager((s) => s.togglePanel);
  if (!enc) return null;
  const entry = enc !== 'index' ? getEntry(enc) : undefined;
  const hits = new Set(searchEntries(q).map((e) => e.id));
  const route = entry?.category === 'radiation' ? `/spectral?lambda=${entry.exampleWavelengthM}` : entry?.category === 'celestial' ? `/cosmic/${entry.entity.split(':')[1]}` : entry?.category === 'element' ? `/atomic/element/${entry.entity.split(':')[1]}` : entry?.category === 'molecule' ? `/atomic/molecules/${entry.entity.split(':')[1]}` : null;
  const openRoute = (r: string) => { const sep = r.includes('?') ? '&' : '?'; navigate(`${r}${sep}enc=${entry!.id}`); };
  return (
    <aside className={`panel enc-drawer ${collapsed ? 'collapsed' : ''}`} aria-label="Encyclopedia drawer">
      <header className="panel-head">
        {entry && <button onClick={() => setQuery({ enc: 'index' })} aria-label="Back to the encyclopedia index">‹</button>}
        <span className="title">Encyclopedia{entry ? ` · ${entry.title}` : ''}</span>
        <button onClick={() => toggle('enc-drawer')} aria-expanded={!collapsed} aria-label={collapsed ? 'Expand encyclopedia' : 'Collapse encyclopedia'}>{collapsed ? '▸' : '▾'}</button>
        <button onClick={() => setQuery({ enc: null })} aria-label="Close encyclopedia">✕</button>
      </header>
      <div className="panel-body">
        {entry ? (
          <>
            <h2 style={{ margin: '0 0 6px', fontWeight: 400 }}>{entry.title}</h2>
            {route && `#${route}`.split('?')[0] !== `#/${path.join('/')}` && <button className="chip" onClick={() => openRoute(route)}>{entry!.category === 'radiation' ? 'Show in the Spectral atlas →' : entry!.category === 'celestial' ? 'Open in Cosmic mode →' : 'Open in Atomic mode →'}</button>}
            {route && path[0] === 'spectral' && (path[1] ?? '') === '' && <button className="chip" onClick={() => openRoute(route)}>Go to a typical wavelength →</button>}
            <EntryBody entry={entry} />
            {entry.seeAlso.length > 0 && <>
              <div className="section-title">See also</div>
              <div className="chip-row" style={{ gap: 6, flexWrap: 'wrap' }}>{entry.seeAlso.map((id) => getEntry(id)).filter(Boolean).map((e) => <button key={e!.id} className="chip" onClick={() => setQuery({ enc: e!.id })}>{e!.title}</button>)}</div>
            </>}
          </>
        ) : (
          <>
            <p className="note">Explanations quoted from cited sources, never written by Voyager. Each entry links to its source and licence.</p>
            <input className="text-input" style={{ width: '100%' }} placeholder="Search the encyclopedia" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the encyclopedia" />
            {CATEGORIES.map((c) => {
              const list = entriesIn(c.id).filter((e) => hits.has(e.id));
              return (
                <div key={c.id}>
                  <div className="section-title">{c.label} {c.status === 'planned' && <span className="badge" style={{ color: 'var(--text-faint)' }}>coming soon</span>}</div>
                  {c.status === 'available' && (list.length ? (
                    <div className="mol-list" role="list" aria-label={`${c.label} entries`}>
                      {list.map((e) => <button key={e.id} role="listitem" onClick={() => setQuery({ enc: e.id })}><span>{e.title}</span><span className="f">{getSource(e.source)?.authors}</span></button>)}
                    </div>
                  ) : <p className="note">No matches.</p>)}
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
}

/** About section for one registry entity; loads the lazy categories (elements, molecules) when needed. */
export function EntityBio({ entity, what }: { entity: string; what: string }) {
  useEncyclopedia();
  const e = entryForEntity(entity);
  return e ? <EncyclopediaBio entries={[e]} what={what} /> : null;
}
