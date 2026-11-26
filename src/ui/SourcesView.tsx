/**
 * Source index — #/sources[/<id>]
 * Every scientific source used by Voyager Ventures: full citation, link (DOI or official URL),
 * institution, licence, a short verified note on the authors, and where it is used.
 */
import { useEffect, useMemo, useState } from 'react';
import { navigate } from '@/shared/router';
import { SOURCES, type SourceKind } from '@/shared/sources/sources';

const KIND_LABEL: Record<SourceKind, string> = { 'journal-article': 'Peer-reviewed article', book: 'Book / textbook', database: 'Scientific database', standard: 'Standard / resolution', software: 'Scientific software', report: 'Technical report' };

export default function SourcesView({ id }: { id: string | null }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return SOURCES.filter((x) => !s || `${x.citation} ${x.institution} ${x.usedFor.join(' ')}`.toLowerCase().includes(s))
      .sort((a, b) => a.citation.localeCompare(b.citation));
  }, [q]);
  useEffect(() => { if (id) document.getElementById(`src-${id}`)?.scrollIntoView({ block: 'start' }); }, [id]);
  return (
    <div className="sources-page">
      <header>
        <h1>Source index</h1>
        <p className="note">Every value in Voyager Ventures traces to one of these {SOURCES.length} sources: peer-reviewed literature, academic texts, national scientific laboratories and international scientific or standards bodies. Author notes give only publicly documented roles and affiliations. Where an affiliation has not been verified, the entry says so instead of guessing.</p>
        <input type="search" className="text-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sources, institutions or topics" aria-label="Search sources" style={{ maxWidth: 420 }} />
      </header>
      <ol className="source-list">
        {list.map((s) => (
          <li key={s.id} id={`src-${s.id}`} className={s.id === id ? 'sel' : ''} aria-label={s.title}>
            <div className="kind">{KIND_LABEL[s.kind]} · {s.year}</div>
            <p className="cite">{s.citation}</p>
            <p className="note" style={{ margin: '4px 0' }}>
              <a href={s.url} target="_blank" rel="noreferrer">{s.doi ? `doi:${s.doi}` : s.url}</a> · {s.institution}{s.license ? ` · ${s.license}` : ''}
            </p>
            <p className="note" style={{ margin: '4px 0' }}><strong>About the authors:</strong> {s.authorBio ?? <em>biography not verified — no affiliation is asserted</em>}</p>
            <p className="note" style={{ margin: 0 }}><strong>Used for:</strong> {s.usedFor.join('; ')}</p>
            <button className="link-btn" style={{ fontSize: 11 }} onClick={() => navigate(`/sources/${s.id}`, { replace: true })}>permalink</button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Inline list of source links (to the index) for a record. */
export function SourceLinks({ ids }: { ids: string[] }) {
  return (
    <span className="note">
      {ids.map((id, i) => {
        const s = SOURCES.find((x) => x.id === id);
        return <span key={id}>{i > 0 && ' · '}<button className="link-btn" onClick={() => navigate(`/sources/${id}`)}>{s ? `${s.authors.split(',')[0]} (${s.year})` : id}</button></span>;
      })}
    </span>
  );
}
