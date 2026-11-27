import { Fragment, useEffect, useState } from 'react';
import { navigate } from '@/shared/router';
import { deleteExperiment, download, experimentToCSV, listAllExperiments, type AnyExperiment, type GravitationalExperiment, type WaveExperiment } from '@/shared/notebook';
import { entryCSV, entryMarkdown, unify, type ViewSnapshot } from '@/shared/snapshot';
import { getSource } from '@/shared/sources/sources';
import { ProvenanceBadge } from './components';
import { SourceLinks } from './SourcesView';
import type { ProvenanceClass } from '@/core/provenance/provenance';

/**
 * Unified scientific notebook (Gate 8.5): view snapshots of any view, plus the older sandbox and wave-lab
 * experiments. Every entry exports as JSON (the stored record), CSV and Markdown with citations.
 */
export default function NotebookView() {
  const [items, setItems] = useState<AnyExperiment[] | null>(null);
  const load = () => listAllExperiments().then(setItems);
  useEffect(() => { load(); }, []);
  const exportAll = () => items && download('voyager-notebook.md', items.map((e) => entryMarkdown(unify(e), getSource)).join('\n---\n\n'), 'text/markdown');
  return (
    <div className="ptable-wrap">
      <div className="ptable-toolbar"><h1>SCIENTIFIC NOTEBOOK</h1><span className="note">Stored only in this browser (IndexedDB). Snapshots keep the view’s route, parameters, readings, provenance, sources and Voyager version; experiments keep their initial conditions and solver settings so they re-run reproducibly.</span>
        {items && items.length > 0 && <button className="chip" onClick={exportAll}>Export all (Markdown)</button>}</div>
      {items === null ? <p className="note">Loading…</p> : items.length === 0 ? (
        <p className="note">Nothing saved yet. On any view, open 📓 → “Snapshot this view”. The <button className="link-btn" onClick={() => navigate('/cosmic/sandbox')}>gravitational sandbox</button> and the <button className="link-btn" onClick={() => navigate('/spectral/lab')}>wave laboratory</button> also save full experiments.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {items.map((e) => e.kind === 'wave' ? <WaveCard key={e.id} e={e} onDelete={load} /> : e.kind === 'snapshot' ? <SnapshotCard key={e.id} e={e} onDelete={load} /> : <GravCard key={e.id} e={e} onDelete={load} />)}
        </div>
      )}
    </div>
  );
}

function Exports({ e, csv }: { e: AnyExperiment; csv?: () => string }) {
  const u = unify(e);
  return (
    <>
      <button className="chip" onClick={() => download(`${e.id}.json`, JSON.stringify(e, null, 2), 'application/json')}>JSON</button>
      <button className="chip" onClick={() => download(`${e.id}.csv`, csv ? csv() : entryCSV(u), 'text/csv')}>CSV</button>
      <button className="chip" onClick={() => download(`${e.id}.md`, entryMarkdown(u, getSource), 'text/markdown')}>Markdown</button>
    </>
  );
}

function Shot({ src, name }: { src: string | null; name: string }) {
  return src ? <img src={src} alt={`Screenshot of ${name}`} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', borderBottom: '1px solid var(--line)' }} /> : null;
}

function SnapshotCard({ e, onDelete }: { e: ViewSnapshot; onDelete: () => void }) {
  return (
    <article className="panel" style={{ position: 'relative' }} aria-label={`Snapshot ${e.name}`}>
      <Shot src={e.screenshot} name={e.name} />
      <div className="panel-body">
        <h2 style={{ margin: '0 0 4px', fontWeight: 400, fontSize: 17 }}>{e.name}</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>{e.provenance.map((p) => <ProvenanceBadge key={p} cls={p} />)}<span className="badge" style={{ color: 'var(--accent)' }}>snapshot</span></div>
        <dl className="kv">
          <dt>Saved</dt><dd>{e.createdAt.slice(0, 16).replace('T', ' ')}</dd>
          <dt>View</dt><dd style={{ fontSize: 10.5, wordBreak: 'break-all' }}>{e.route}</dd>
          <dt>Voyager</dt><dd>{e.app.version} ({e.app.commit})</dd>
          <dt>Readings</dt><dd>{e.readings.length}{e.series.length ? ` · ${e.series.length} series` : ''}</dd>
        </dl>
        {e.readings.length > 0 && <details className="note"><summary>Readings</summary><dl className="kv">{e.readings.slice(0, 60).map((r, i) => <Fragment key={i}><dt>{r.label}</dt><dd>{r.value}</dd></Fragment>)}</dl></details>}
        {e.notes && <p className="note" style={{ whiteSpace: 'pre-wrap' }}>{e.notes}</p>}
        {e.sources.length > 0 && <p className="note" style={{ fontSize: 10.5 }}>Sources: <SourceLinks ids={e.sources} /></p>}
        <div className="chip-row">
          <button className="chip active" onClick={() => navigate(e.route.replace(/^#/, ''))}>Open view</button>
          <Exports e={e} />
          <button className="chip" onClick={async () => { await deleteExperiment(e.id); onDelete(); }}>Delete</button>
        </div>
      </div>
    </article>
  );
}

function GravCard({ e, onDelete }: { e: GravitationalExperiment; onDelete: () => void }) {
  return (
    <article className="panel" style={{ position: 'relative' }} aria-label={`Experiment ${e.name}`}>
      <Shot src={e.screenshot} name={e.name} />
      <div className="panel-body">
        <h2 style={{ margin: '0 0 4px', fontWeight: 400, fontSize: 17 }}>{e.name}</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}><ProvenanceBadge cls={e.provenance as ProvenanceClass} /><span className="badge" style={{ color: 'var(--text-dim)' }}>{e.mode}</span></div>
        <dl className="kv">
          <dt>Saved</dt><dd>{e.createdAt.slice(0, 16).replace('T', ' ')}</dd>
          <dt>Solver</dt><dd style={{ fontSize: 10.5 }}>{e.solver.version} · {e.solver.integrator} · dt {(e.solver.dt / 3600).toFixed(2)} h</dd>
          <dt>Simulated</dt><dd>{e.observations.simYears.toFixed(3)} yr · {e.observations.bodies} bodies</dd>
          <dt>ΔE/E</dt><dd>{e.observations.relEnergyError.toExponential(2)}</dd>
        </dl>
        {e.notes && <p className="note" style={{ whiteSpace: 'pre-wrap' }}>{e.notes}</p>}
        {e.events.length > 0 && <details className="note"><summary>Event log ({e.events.length})</summary><ul style={{ paddingLeft: 16 }}>{e.events.map((x, i) => <li key={i}>{x}</li>)}</ul></details>}
        <p className="note" style={{ fontSize: 10.5 }}>Sources: {e.dataSources.join('; ')}</p>
        <div className="chip-row">
          <button className="chip active" onClick={() => navigate(`/cosmic/sandbox?exp=${e.id}`)}>Restore</button>
          <Exports e={e} csv={() => experimentToCSV(e)} />
          <button className="chip" onClick={async () => { await deleteExperiment(e.id); onDelete(); }}>Delete</button>
        </div>
      </div>
    </article>
  );
}

function WaveCard({ e, onDelete }: { e: WaveExperiment; onDelete: () => void }) {
  return (
    <article className="panel" style={{ position: 'relative' }} aria-label={`Experiment ${e.name}`}>
      <Shot src={e.screenshot} name={e.name} />
      <div className="panel-body">
        <h2 style={{ margin: '0 0 4px', fontWeight: 400, fontSize: 17 }}>{e.name}</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}><ProvenanceBadge cls={e.provenance} /><span className="badge" style={{ color: 'var(--warn)' }}>{e.mode}</span></div>
        <dl className="kv">
          <dt>Saved</dt><dd>{e.createdAt.slice(0, 16).replace('T', ' ')}</dd>
          <dt>Model</dt><dd>{e.model}</dd>
          <dt>Solver</dt><dd style={{ fontSize: 10.5 }}>{e.solver.version}{e.solver.courant !== null ? ` · C = ${e.solver.courant.toFixed(2)}` : ''}</dd>
          <dt>Medium</dt><dd>{e.medium.name}{e.medium.speed !== null ? ` · v = ${e.medium.speed.toPrecision(5)} m/s` : ' · no propagation'}</dd>
          <dt>Simulated</dt><dd>{e.simulatedTime.toPrecision(4)} s</dd>
          {Object.entries(e.observations).map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v === null ? 'unknown' : v.toPrecision(5)}</dd></Fragment>)}
        </dl>
        {e.notes && <p className="note" style={{ whiteSpace: 'pre-wrap' }}>{e.notes}</p>}
        <p className="note" style={{ fontSize: 10.5 }}>Sources: {e.dataSources.join('; ')}</p>
        <div className="chip-row">
          <button className="chip active" onClick={() => navigate(`/spectral/lab?${new URLSearchParams(e.params).toString()}`)}>Restore</button>
          <Exports e={e} />
          <button className="chip" onClick={async () => { await deleteExperiment(e.id); onDelete(); }}>Delete</button>
        </div>
      </div>
    </article>
  );
}
