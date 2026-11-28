/**
 * Relationship explorer — #/relations?tab=map|path|pathways|links|planned   (Gate 8.2; pathways: Gate 8.6, &p=<id>&s=<step>)
 *   map:     &e=<entity>&depth=1|2&types=<comma list>&stars=1
 *   path:    &from=<entity>&to=<entity>&types=…
 *   links:   &q=<text>&types=…
 *
 * Everything shown is read from the relationship registry (src/shared/scientific-relationships/registry.ts):
 * the typed, sourced edges the views already display. Nothing is inferred; a path is a chain of existing
 * edges, each with its own source.
 */
import { PATHWAYS, getPathway, resolvePathway } from '@/shared/pathways/pathways';
import { EntityBio } from '@/ui/Encyclopedia';
import { useEffect, useMemo, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { allEntities, allRelationships, getEntity, type RelationshipType } from '@/shared/scientific-relationships/registry';
import {
  ALL_TYPES, VERBS, components, degree, edgeSource, edgesWithin, entityMode, label, neighbourhood, shortestPath, stepVerb, type EntityMode, type Step, type TypeFilter,
} from '@/shared/scientific-relationships/graph';
import { Panel } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';

const MODE_COL: Record<EntityMode, string> = { atomic: '#7df9ff', cosmic: '#b18cff', spectral: '#f5c76b', biologic: '#5cf2a6', planned: '#7d8597' };
const MODE_LABEL: Record<EntityMode, string> = { atomic: 'Atomic', cosmic: 'Cosmic', spectral: 'Spectral', biologic: 'Biologic', planned: 'Planned (no view yet)' };
const TYPE_COL: Record<RelationshipType, string> = {
  'participates-in': '#5cf2a6', produces: '#9be564', consumes: '#e5c364', emits: '#ffb36b', absorbs: '#ff7a90', 'has-spectrum': '#f5c76b',
  'has-property': '#7df9ff', 'observed-with': '#c38cff', 'located-in': '#8fb5ff', 'part-of': '#6fd6ff', drives: '#ff9fd2', explains: '#b18cff',
};
const TABS = [['map', 'Neighbourhood'], ['path', 'Path between two'], ['pathways', 'Pathways'], ['links', 'All links'], ['planned', 'Planned']] as const;
type Tab = (typeof TABS)[number][0];
const DEFAULT_ENTITY = 'element:1';
const trunc = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function useTypes(): [TypeFilter, (t: RelationshipType) => void] {
  const { query } = useRoute();
  const raw = query.get('types');
  const set = raw ? new Set(raw.split(',').filter((t): t is RelationshipType => (ALL_TYPES as string[]).includes(t))) : null;
  const toggle = (t: RelationshipType) => {
    const cur = new Set(set ?? ALL_TYPES);
    if (cur.has(t)) cur.delete(t); else cur.add(t);
    setQuery({ types: cur.size === ALL_TYPES.length ? null : [...cur].join(',') || 'none' });
  };
  return [set, toggle];
}

/** Text search over every registered entity (label and id). */
function EntityPicker({ label: lab, value, onPick }: { label: string; value: string | null; onPick: (id: string) => void }) {
  const [q, setQ] = useState('');
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 1) return [];
    return allEntities()
      .map((e) => ({ e, score: e.label.toLowerCase() === s ? 3 : e.label.toLowerCase().startsWith(s) ? 2 : e.label.toLowerCase().includes(s) || e.id.includes(s) ? 1 : 0 }))
      .filter((h) => h.score > 0).sort((a, b) => b.score - a.score || a.e.label.length - b.e.label.length).slice(0, 8);
  }, [q]);
  return (
    <div style={{ marginBottom: 10 }}>
      <label className="slider-row" style={{ margin: '4px 0' }}><span style={{ minWidth: 38 }}>{lab}</span>
        <input className="text-input" type="search" value={q} placeholder={value ? label(value) : 'Search entities…'} aria-label={`${lab} entity`} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 0 }} /></label>
      {hits.length > 0 && (
        <ul aria-label={`${lab} matches`} style={{ listStyle: 'none', padding: 0, margin: '0 0 6px' }}>
          {hits.map(({ e }) => <li key={e.id}><button className="link-btn" onClick={() => { onPick(e.id); setQ(''); }} style={{ padding: '2px 0' }}><span style={{ color: MODE_COL[entityMode(e)] }}>●</span> {e.label} <span style={{ color: 'var(--text-faint)' }}>({e.kind})</span></button></li>)}
        </ul>
      )}
    </div>
  );
}

function TypeChecks({ types, toggle, present }: { types: TypeFilter; toggle: (t: RelationshipType) => void; present: Set<RelationshipType> }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: '6px 0' }} aria-label="Relationship types">
      <legend className="note" style={{ marginBottom: 4 }}>Relationship types</legend>
      {ALL_TYPES.filter((t) => present.has(t)).map((t) => (
        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, margin: '2px 0' }}>
          <input type="checkbox" checked={!types || types.has(t)} onChange={() => toggle(t)} />
          <span style={{ width: 14, height: 3, background: TYPE_COL[t], display: 'inline-block' }} /> {t} <span style={{ color: 'var(--text-faint)' }}>({allRelationships().filter((r) => r.type === t).length})</span>
        </label>
      ))}
    </fieldset>
  );
}

// ------------------------------------------------------------------ neighbourhood map

function MapSvg({ center, depth, types }: { center: string; depth: number; types: TypeFilter }) {
  const [hover, setHover] = useState<string | null>(null);
  const { rings, via } = neighbourhood(center, depth, types);
  const MAX2 = 90;
  const ring1 = rings[1] ?? [], ring2All = rings[2] ?? [];
  const W = 1000, H = 800, cx = W / 2, cy = H / 2, R1 = depth > 1 && ring2All.length ? 150 : 230, R2 = 262;
  const pos = new Map<string, [number, number, number]>(); // x, y, angle
  pos.set(center, [cx, cy, 0]);
  ring1.forEach((id, i) => { const a = (2 * Math.PI * i) / ring1.length - Math.PI / 2; pos.set(id, [cx + R1 * Math.cos(a), cy + R1 * Math.sin(a), a]); });
  // second ring: grouped under the parent that reached them, so branches stay together
  const ring2 = [...ring2All].sort((p, q) => (pos.get(via.get(p)!.from)![2] - pos.get(via.get(q)!.from)![2])).slice(0, MAX2);
  const a0 = ring2.length ? pos.get(via.get(ring2[0])!.from)![2] : 0;
  ring2.forEach((id, i) => { const a = a0 + (2 * Math.PI * i) / ring2.length; pos.set(id, [cx + R2 * Math.cos(a), cy + R2 * Math.sin(a), a]); });
  const shown = [...pos.keys()];
  const edges = edgesWithin(shown, types);
  const touches = (r: { from: string; to: string }) => hover !== null && (r.from === hover || r.to === hover);
  const radial = (n: number) => n > 14;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Relationship neighbourhood of ${label(center)}`} style={{ width: '100%', maxWidth: 820, display: 'block', margin: '0 auto' }}>
      <defs>{ALL_TYPES.map((t) => <marker key={t} id={`arr-${t}`} viewBox="0 0 10 10" refX="16" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={TYPE_COL[t]} /></marker>)}</defs>
      {edges.map((r) => {
        const [x1, y1] = pos.get(r.from)!, [x2, y2] = pos.get(r.to)!;
        const on = touches(r);
        return <line key={`${r.from}|${r.to}|${r.type}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TYPE_COL[r.type]} strokeOpacity={hover ? (on ? 0.95 : 0.12) : 0.5} strokeWidth={on ? 2 : 1.2} markerEnd={`url(#arr-${r.type})`}>
          <title>{`${label(r.from)} — ${VERBS[r.type][0]}${r.context ? ` (${r.context})` : ''} → ${label(r.to)} · ${edgeSource(r).text}`}</title></line>;
      })}
      {shown.map((id) => {
        const [x, y, a] = pos.get(id)!; const e = getEntity(id)!; const isC = id === center;
        const ringN = ring1.includes(id) ? ring1.length : ring2.length;
        const rad = !isC && radial(ringN);
        const deg = (a * 180) / Math.PI, flip = Math.cos(a) < 0;
        const text = trunc(e.label, isC ? 40 : ring2.includes(id) ? 18 : 26);
        return (
          <g key={id} style={{ cursor: 'pointer' }} onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)} onClick={() => setQuery({ e: id })}>
            <title>{`${e.label} (${e.kind}, ${MODE_LABEL[entityMode(e)]})${isC ? '' : ' — click to centre'}`}</title>
            <circle cx={x} cy={y} r={isC ? 11 : 6} fill={MODE_COL[entityMode(e)]} fillOpacity={e.status === 'planned' ? 0.25 : 0.9} stroke={MODE_COL[entityMode(e)]} strokeWidth={1.5} />
            {isC
              ? <text x={x} y={y + 32} textAnchor="middle" fontSize={20} fill="#ffffff">{text}</text>
              : rad
                ? <text x={x} y={y} fontSize={15} fill={hover === id ? '#ffffff' : 'var(--text-dim)'} dominantBaseline="middle" textAnchor={flip ? 'end' : 'start'}
                    transform={`rotate(${flip ? deg + 180 : deg} ${x} ${y}) translate(${flip ? -10 : 10} 0)`}>{text}</text>
                : <text x={x + (Math.cos(a) >= 0 ? 10 : -10)} y={y + 5} fontSize={16} fill={hover === id ? '#ffffff' : 'var(--text-dim)'} textAnchor={Math.cos(a) >= 0 ? 'start' : 'end'}>{text}</text>}
          </g>
        );
      })}
      {ring2All.length > MAX2 && <text x={12} y={H - 10} fontSize={13} fill="var(--text-faint)">Showing {MAX2} of {ring2All.length} second-step entities.</text>}
    </svg>
  );
}

function MapTab({ types }: { types: TypeFilter }) {
  const { query } = useRoute();
  const center = getEntity(query.get('e') ?? '') ? query.get('e')! : DEFAULT_ENTITY;
  const depth = query.get('depth') === '1' ? 1 : 2;
  const { rings } = neighbourhood(center, depth, types);
  const present = new Set(edgesWithin(rings.flat(), types).map((r) => r.type));
  return (
    <div className="center-stage hr-stage">
      <div className="stage-head">
        <h1>{label(center)}</h1>
        <p className="note">Entities linked to it within {depth} step{depth > 1 ? 's' : ''}: {(rings[1] ?? []).length} directly{depth > 1 ? `, ${(rings[2] ?? []).length} at two steps` : ''}. Each line is a sourced edge from the registry (arrow = its direction; hover for its context and source). Dots are coloured by the environment that opens the entity; faint dots are planned. Click a dot to centre it.</p>
      </div>
      <MapSvg center={center} depth={depth} types={types} />
      <p className="note" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 11 }}>
        {(Object.keys(MODE_COL) as EntityMode[]).map((m) => <span key={m}><span style={{ color: MODE_COL[m] }}>●</span> {MODE_LABEL[m]}</span>)}
        {ALL_TYPES.filter((t) => present.has(t)).map((t) => <span key={t}><span style={{ display: 'inline-block', width: 14, height: 3, background: TYPE_COL[t], verticalAlign: 'middle' }} /> {t}</span>)}
      </p>
    </div>
  );
}

// ------------------------------------------------------------------ path

function PathSteps({ path }: { path: Step[] }) {
  return (
    <ol className="path-steps" aria-label="Chain of relationships" style={{ listStyle: 'none', padding: 0, margin: '10px 0' }}>
      {path.map((s, i) => {
        const src = edgeSource(s.edge);
        const node = (id: string) => { const e = getEntity(id); return e?.route ? <button className="link-btn" onClick={() => navigate(e.route!.slice(1))}>{e.label}</button> : <span>{e?.label ?? id}{e?.status === 'planned' ? ' (planned)' : ''}</span>; };
        return (
          <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            {i === 0 && <div style={{ marginBottom: 4 }}><span style={{ color: MODE_COL[entityMode(getEntity(s.from)!)] }}>●</span> {node(s.from)}</div>}
            <div className="note" style={{ paddingLeft: 14, borderLeft: `2px solid ${TYPE_COL[s.edge.type]}`, margin: '2px 0 4px 4px' }}>
              <strong style={{ color: TYPE_COL[s.edge.type] }}>{stepVerb(s)}</strong>{s.edge.context ? ` — ${s.edge.context}` : ''}
              <br />Source: {src.id ? <SourceLinks ids={[src.id]} /> : <em>{src.text}</em>}
            </div>
            <div><span style={{ color: MODE_COL[entityMode(getEntity(s.to)!)] }}>●</span> {node(s.to)}</div>
          </li>
        );
      })}
    </ol>
  );
}

function PathTab({ types }: { types: TypeFilter }) {
  const { query } = useRoute();
  const from = getEntity(query.get('from') ?? '') ? query.get('from')! : 'element:1';
  const to = getEntity(query.get('to') ?? '') ? query.get('to')! : 'context:cosmic-expansion';
  const path = shortestPath(from, to, types);
  return (
    <div className="center-stage hr-stage">
      <div className="stage-head">
        <h1>{label(from)} → {label(to)}</h1>
        <p className="note">The shortest chain of registered relationships between the two, following edges in either direction. Every step is an edge a view already shows, with its own source; the chain is a route through the records, not a new scientific claim.</p>
      </div>
      {path === null
        ? <p className="note" role="status">No chain of sourced relationships connects them{types ? ' with the selected relationship types' : ''}.</p>
        : path.length === 0 ? <p className="note" role="status">Both ends are the same entity.</p>
          : <><p className="note" role="status">{path.length} step{path.length > 1 ? 's' : ''}.</p><PathSteps path={path} /></>}
    </div>
  );
}

// ------------------------------------------------------------------ pathways (Gate 8.6)

function PathwaysTab() {
  const { query } = useRoute();
  const p = getPathway(query.get('p') ?? '') ?? PATHWAYS[0];
  const { steps, error } = resolvePathway(p);
  const n = p.entities.length;
  const at = Math.min(n - 1, Math.max(0, Number(query.get('s')) || 0));
  const id = p.entities[at];
  const e = getEntity(id)!;
  const into = at > 0 ? steps[at - 1] : null;
  const go = (k: number) => setQuery({ s: k === 0 ? null : k });
  return (
    <div className="center-stage hr-stage">
      <div className="stage-head">
        <h1>{p.title}</h1>
        <p className="note">{p.blurb} Every step follows a relationship already in the records, with its own source; the excerpts are quoted from the encyclopedia. The pathway adds no new claim.</p>
      </div>
      {error ? <p className="note warn" role="status">This pathway is broken: {error}.</p> : (<>
        <ol className="pathway-stops" aria-label="Stops" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '6px 0 10px' }}>
          {p.entities.map((x, i) => <li key={x}><button className={`chip ${i === at ? 'active' : ''}`} aria-current={i === at ? 'step' : undefined} onClick={() => go(i)}>{i + 1}. {label(x)}</button></li>)}
        </ol>
        <section aria-label={`Stop ${at + 1} of ${n}`} className="panel" style={{ padding: 12 }}>
          <div className="note">Stop {at + 1} of {n}</div>
          <h2 style={{ margin: '2px 0 6px', fontWeight: 400 }}><span style={{ color: MODE_COL[entityMode(e)] }}>●</span> {e.label}</h2>
          {into && (() => { const src = edgeSource(into.edge); return (
            <div className="note" style={{ paddingLeft: 14, borderLeft: `2px solid ${TYPE_COL[into.edge.type]}`, margin: '2px 0 8px 4px' }}>
              {label(into.from)} <strong style={{ color: TYPE_COL[into.edge.type] }}>{stepVerb(into)}</strong> {e.label}{into.edge.context ? ` — ${into.edge.context}` : ''}
              <br />Source: {src.id ? <SourceLinks ids={[src.id]} /> : <em>{src.text}</em>}
            </div>); })()}
          <EntityBio entity={id} what={e.label} />
          <div className="chip-row" style={{ marginTop: 8 }}>
            <button className="chip" disabled={at === 0} onClick={() => go(at - 1)}>← Previous</button>
            <button className="chip active" disabled={at === n - 1} onClick={() => go(at + 1)}>Next →</button>
            {e.route && <button className="chip" onClick={() => navigate(e.route!.slice(1))}>Open {e.label} →</button>}
          </div>
        </section>
        <details className="note" style={{ marginTop: 10 }}><summary>All steps with their sources</summary><PathSteps path={steps} /></details>
      </>)}
    </div>
  );
}

// ------------------------------------------------------------------ all links / planned

function LinksTab({ types }: { types: TypeFilter }) {
  const { query } = useRoute();
  const q = (query.get('q') ?? '').toLowerCase();
  const rows = allRelationships().filter((r) => (!types || types.has(r.type)) && (!q || `${label(r.from)} ${label(r.to)} ${r.context ?? ''} ${r.type} ${edgeSource(r).text}`.toLowerCase().includes(q)));
  return (
    <div className="center-stage hr-stage">
      <div className="stage-head">
        <h1>All relationships</h1>
        <label className="slider-row"><span>Filter</span><input className="text-input" type="search" aria-label="Filter relationships" value={query.get('q') ?? ''} onChange={(e) => setQuery({ q: e.target.value || null })} placeholder="e.g. hydrogen, lensing, Planck" /></label>
        <p className="note" role="status">{rows.length} of {allRelationships().length} relationships.</p>
      </div>
      <table className="data-table" aria-label="Relationships" style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead><tr><th style={{ textAlign: 'left' }}>From</th><th style={{ textAlign: 'left' }}>Relationship</th><th style={{ textAlign: 'left' }}>To</th><th style={{ textAlign: 'left' }}>Source</th></tr></thead>
        <tbody>
          {rows.slice(0, 400).map((r) => {
            const s = edgeSource(r);
            return (
              <tr key={`${r.from}|${r.to}|${r.type}`} style={{ borderTop: '1px solid var(--line)' }}>
                <td><button className="link-btn" onClick={() => setQuery({ tab: null, e: r.from })}>{label(r.from)}</button></td>
                <td><span style={{ color: TYPE_COL[r.type] }}>{r.type}</span>{r.context && <div className="note" style={{ fontSize: 10.5 }}>{r.context}</div>}</td>
                <td><button className="link-btn" onClick={() => setQuery({ tab: null, e: r.to })}>{label(r.to)}</button></td>
                <td>{s.id ? <SourceLinks ids={[s.id]} /> : <span className="note">{trunc(s.text, 60)}</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length > 400 && <p className="note">Showing the first 400; narrow the filter to see the rest.</p>}
    </div>
  );
}

function PlannedTab() {
  const planned = allEntities().filter((e) => e.status === 'planned').sort((a, b) => a.label.localeCompare(b.label));
  return (
    <div className="center-stage hr-stage">
      <div className="stage-head">
        <h1>Planned entities</h1>
        <p className="note">Registered because a sourced record already refers to them, but no Voyager view opens them yet. They appear as plain text wherever they are linked.</p>
      </div>
      <table className="data-table" aria-label="Planned entities" style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
        <thead><tr><th style={{ textAlign: 'left' }}>Entity</th><th style={{ textAlign: 'left' }}>Kind</th><th style={{ textAlign: 'left' }}>Planned for</th><th style={{ textAlign: 'right' }}>Links</th></tr></thead>
        <tbody>
          {planned.map((e) => (
            <tr key={e.id} style={{ borderTop: '1px solid var(--line)' }}>
              <td><button className="link-btn" onClick={() => setQuery({ tab: null, e: e.id })}>{e.label}</button></td>
              <td className="note">{e.kind}</td>
              <td className="note">{e.note ?? 'not yet scheduled'}</td>
              <td style={{ textAlign: 'right' }}>{degree(e.id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------------------------------------------ page

export default function RelationsView() {
  const { query } = useRoute();
  const tab: Tab = (TABS.find(([t]) => t === query.get('tab'))?.[0]) ?? 'map';
  const [types, toggle] = useTypes();
  const [, bump] = useState(0);
  const [loadingStars, setLoadingStars] = useState(false);
  const starsLoaded = allEntities().some((e) => e.kind === 'star');
  const wantStars = query.get('stars') === '1';
  useEffect(() => {
    if (!wantStars || starsLoaded) return;
    setLoadingStars(true);
    import('@/modes/cosmic/star-systems/stars').then((m) => m.loadTenParsec()).then(() => { setLoadingStars(false); bump((n) => n + 1); });
  }, [wantStars, starsLoaded]);

  const ents = allEntities(), rels = allRelationships();
  const comps = components(types);
  const presentTypes = new Set(rels.map((r) => r.type));
  const center = getEntity(query.get('e') ?? '') ? query.get('e')! : DEFAULT_ENTITY;
  const ce = getEntity(center)!;

  return (
    <>
      <nav className="view-switch" aria-label="Relationship sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'map' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'path' ? <PathTab types={types} /> : tab === 'pathways' ? <PathwaysTab /> : tab === 'links' ? <LinksTab types={types} /> : tab === 'planned' ? <PlannedTab /> : <MapTab types={types} />}

      <Panel id="relations-controls" className="left-panel" title="Explore">
        {tab === 'path' ? (
          <>
            <EntityPicker label="From" value={query.get('from') ?? 'element:1'} onPick={(id) => setQuery({ from: id })} />
            <EntityPicker label="To" value={query.get('to') ?? 'context:cosmic-expansion'} onPick={(id) => setQuery({ to: id })} />
            <button className="chip" onClick={() => setQuery({ from: query.get('to') ?? 'context:cosmic-expansion', to: query.get('from') ?? 'element:1' })}>⇄ Swap</button>
          </>
        ) : tab === 'map' ? (
          <>
            <EntityPicker label="Centre" value={center} onPick={(id) => setQuery({ e: id })} />
            <div role="radiogroup" aria-label="Depth" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
              <span className="note">Steps</span>
              {[1, 2].map((d) => <button key={d} role="radio" aria-checked={(query.get('depth') === '1' ? 1 : 2) === d} className={`chip ${(query.get('depth') === '1' ? 1 : 2) === d ? 'active' : ''}`} onClick={() => setQuery({ depth: d === 2 ? null : d })}>{d}</button>)}
            </div>
          </>
        ) : null}
        {tab === 'pathways' && (
          <ul aria-label="Pathways" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {PATHWAYS.map((p) => <li key={p.id}><button className={`link-btn ${(getPathway(query.get('p') ?? '') ?? PATHWAYS[0]).id === p.id ? 'active' : ''}`} style={{ textAlign: 'left', padding: '4px 0' }} onClick={() => setQuery({ p: p.id, s: null })}>{p.title}</button> <span className="note">({p.entities.length} stops)</span></li>)}
          </ul>
        )}
        {tab !== 'planned' && tab !== 'pathways' && <TypeChecks types={types} toggle={toggle} present={presentTypes} />}
        <div className="section-title" style={{ marginTop: 10 }}>Registry</div>
        <dl className="kv" aria-label="Registry size">
          <dt>Entities</dt><dd>{ents.length}</dd>
          <dt>Available / planned</dt><dd>{ents.filter((e) => e.status === 'available').length} / {ents.filter((e) => e.status === 'planned').length}</dd>
          <dt>Relationships</dt><dd>{rels.length}</dd>
          <dt>Connected groups</dt><dd>{comps.filter((c) => c.length > 1).length} (largest {comps[0]?.length ?? 0})</dd>
          <dt>Unlinked entities</dt><dd>{comps.filter((c) => c.length === 1).length}</dd>
        </dl>
        <p className="note" style={{ fontSize: 11 }}>
          {starsLoaded ? 'The 10 pc star catalogue is loaded: its stars, their classes and blackbody models are included.' : <>The 562 objects of the 10 pc sample register when their catalogue loads. <button className="link-btn" disabled={loadingStars} onClick={() => setQuery({ stars: 1 })}>{loadingStars ? 'Loading…' : 'Include nearby stars'}</button></>}
        </p>
      </Panel>

      {tab === 'map' && (
        <Panel id="relations-entity" className="right-panel" title={ce.label}>
          <dl className="kv" aria-label="Entity record">
            <dt>Id</dt><dd>{ce.id}</dd>
            <dt>Kind</dt><dd>{ce.kind}</dd>
            <dt>Environment</dt><dd style={{ color: MODE_COL[entityMode(ce)] }}>{MODE_LABEL[entityMode(ce)]}</dd>
            <dt>Relationships</dt><dd>{degree(ce.id)}</dd>
          </dl>
          {ce.note && <p className="note">{ce.note}</p>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
            {ce.route && <button className="chip" onClick={() => navigate(ce.route!.slice(1))}>Open its view →</button>}
            <button className="chip" onClick={() => setQuery({ tab: 'path', from: ce.id, to: ce.id === 'context:cosmic-expansion' ? 'element:1' : 'context:cosmic-expansion' })}>Find a path from here</button>
          </div>
          <RelatedLinks id={ce.id} title="Its relationships" map={false} />
        </Panel>
      )}
    </>
  );
}
