import { useEffect, useState } from 'react';
import { navigate } from '@/shared/router';
import { deleteExperiment, download, experimentToCSV, listExperiments, type Experiment } from '@/shared/notebook';
import { ProvenanceBadge } from './components';

/** Scientific notebook: saved experiments with reproducible restore and data export. */
export default function NotebookView() {
  const [items, setItems] = useState<Experiment[] | null>(null);
  const load = () => listExperiments().then(setItems);
  useEffect(() => { load(); }, []);
  return (
    <div className="ptable-wrap">
      <div className="ptable-toolbar"><h1>SCIENTIFIC NOTEBOOK</h1><span className="note">Experiments are stored only in this browser (IndexedDB). Each keeps its initial conditions and solver settings so it can be re-run reproducibly.</span></div>
      {items === null ? <p className="note">Loading…</p> : items.length === 0 ? (
        <p className="note">No experiments yet. Open the <button className="link-btn" onClick={() => navigate('/cosmic/sandbox')}>gravitational sandbox</button>, run something, and press “Save experiment”.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {items.map((e) => (
            <article key={e.id} className="panel" style={{ position: 'relative' }} aria-label={`Experiment ${e.name}`}>
              {e.screenshot && <img src={e.screenshot} alt={`Screenshot of ${e.name}`} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', borderBottom: '1px solid var(--line)' }} />}
              <div className="panel-body">
                <h2 style={{ margin: '0 0 4px', fontWeight: 400, fontSize: 17 }}>{e.name}</h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}><ProvenanceBadge cls={e.provenance} /><span className="badge" style={{ color: 'var(--text-dim)' }}>{e.mode}</span></div>
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
                  <button className="chip" onClick={() => download(`${e.id}.json`, JSON.stringify(e, null, 2), 'application/json')}>JSON</button>
                  <button className="chip" onClick={() => download(`${e.id}.csv`, experimentToCSV(e), 'text/csv')}>CSV</button>
                  <button className="chip" onClick={async () => { await deleteExperiment(e.id); load(); }}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
