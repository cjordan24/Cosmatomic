/**
 * Reaction library view — #/atomic/reactions[/<id>]
 * Curated reactions with atom/charge conservation, plus a balancer for user-entered equations
 * that reports explicit states (curated / balanced-unverified / unsupported / …) and never invents products.
 */
import { useMemo, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { Panel, ProvenanceBadge } from '@/ui/components';
import { getEntity, relationshipsFrom } from '@/shared/scientific-relationships/registry';
import { conservation, type Equation } from './equation';
import { prettySpecies } from './formula';
import { REACTIONS, analyseInput, getReaction, toEquation, type Analysis, type CuratedReaction } from './library';
import { SourceLinks } from '@/ui/SourcesView';
import manifest from '@datasets/manifests/reactions.manifest.json';

const CONTEXTS = ['all', 'combustion', 'industrial', 'acid-base', 'precipitation', 'redox', 'atmospheric', 'interstellar', 'biological', 'geochemical'];

export function EquationText({ eq, big = false }: { eq: Equation; big?: boolean }) {
  const side = (ts: Equation['reactants']) => ts.map((t, i) => (
    <span key={i}>{i > 0 && <span className="eq-op"> + </span>}{t.coef !== 1 && <span className="eq-coef">{t.coef} </span>}<span className={t.species.kind === 'chemical' ? 'eq-sp' : 'eq-special'}>{prettySpecies(t.species.raw)}</span></span>
  ));
  return <div className={`equation ${big ? 'big' : ''}`} aria-label="Chemical equation">{side(eq.reactants)}<span className="eq-arrow"> {eq.reversible ? '⇌' : '→'} </span>{side(eq.products)}</div>;
}

function BalanceTable({ eq }: { eq: Equation }) {
  const c = conservation(eq);
  return (
    <table className="table-mini" aria-label="Atom balance">
      <thead><tr><th>Element</th><th>Reactants</th><th>Products</th><th /></tr></thead>
      <tbody>
        {c.elements.map((e) => <tr key={e.el}><td>{e.el}</td><td>{e.left}</td><td>{e.right}</td><td style={{ color: e.left === e.right ? 'var(--accent-3)' : 'var(--danger)' }}>{e.left === e.right ? '✓' : '✗'}</td></tr>)}
        <tr><td>net charge</td><td>{c.chargeLeft}</td><td>{c.chargeRight}</td><td style={{ color: c.chargeBalanced ? 'var(--accent-3)' : 'var(--danger)' }}>{c.chargeBalanced ? '✓' : '✗'}</td></tr>
      </tbody>
    </table>
  );
}

const STATUS: Record<Analysis['status'], { label: string; color: string }> = {
  curated: { label: 'curated reaction', color: '#5cf2a6' },
  'balanced-unverified': { label: 'balanced · not verified', color: '#f5c76b' },
  unsupported: { label: 'unsupported', color: '#ff7a90' },
  unbalanceable: { label: 'cannot be balanced', color: '#ff7a90' },
  ambiguous: { label: 'ambiguous', color: '#ff7a90' },
  infeasible: { label: 'infeasible', color: '#ff7a90' },
  'parse-error': { label: 'input error', color: '#ff7a90' },
};

function Balancer() {
  const { query } = useRoute();
  const [text, setText] = useState(query.get('eq') ?? '');
  const a = useMemo(() => (query.get('eq') ? analyseInput(query.get('eq')!) : null), [query]);
  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); setQuery({ eq: text.trim() || null }); }} style={{ display: 'flex', gap: 6 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. C3H8 + O2 -> CO2 + H2O" aria-label="Chemical equation input" className="text-input" />
        <button className="icon-btn" type="submit">Check</button>
      </form>
      <p className="note" style={{ margin: '4px 0 0', fontSize: 10.5 }}>Charges: <code>Fe^3+</code>, <code>SO4^2-</code>, <code>e^-</code>; phases: <code>(g)</code> <code>(aq)</code>; species separated by “ + ”.</p>
      {a && (
        <div role="status" aria-label="Equation analysis" style={{ marginTop: 10 }}>
          <span className="badge" style={{ color: STATUS[a.status].color }}><span className="dot" />{STATUS[a.status].label}</span>
          <p className="note" style={{ marginTop: 6 }}>{a.message}</p>
          {a.candidates && a.candidates.length > 0 && (
            <div className="mol-list">{a.candidates.map((r) => <button key={r.id} onClick={() => navigate(`/atomic/reactions/${r.id}`)}><span>{r.name}</span></button>)}</div>
          )}
          {a.asEntered && a.input && (
            <>
              <div className="section-title">As entered — {a.asEntered.atomsBalanced && a.asEntered.chargeBalanced ? 'conserved ✓' : 'not conserved'}</div>
              <EquationText eq={a.input} />
            </>
          )}
          {a.balanced && (
            <>
              <div className="section-title">Smallest integer coefficients <ProvenanceBadge cls={a.status === 'curated' ? 'observed' : 'derived'} title={a.status === 'curated' ? 'Documented reaction (see citation)' : 'Derived from conservation of atoms and charge only'} /></div>
              <EquationText eq={a.balanced} />
              <div style={{ marginTop: 8 }}><BalanceTable eq={a.balanced} /></div>
            </>
          )}
          {a.match && <button className="icon-btn" style={{ marginTop: 8 }} onClick={() => navigate(`/atomic/reactions/${a.match!.id}`)}>Open “{a.match.name}” →</button>}
        </div>
      )}
    </div>
  );
}

function SpeciesCards({ r }: { r: CuratedReaction }) {
  const card = (s: CuratedReaction['reactants'][number], i: number) => (
    <div key={i} className="species-card">
      <div className="coef">{s.c}</div>
      <div className="sp">{prettySpecies(s.s)}</div>
      <div className="note" style={{ margin: 0 }}>{s.name ?? ''}</div>
      {s.mol ? <button className="link-btn" onClick={() => navigate(`/atomic/molecules/${s.mol}`)}>3D structure →</button>
        : <span className="note" style={{ fontSize: 10.5, margin: 0 }}>{s.s === 'hν' ? 'photon' : s.s === 'M' ? 'third body' : s.s.includes('^') ? 'ion (no molecule record)' : /\((s|aq)\)$/.test(s.s) ? 'no single-molecule record' : 'not in library'}</span>}
    </div>
  );
  return (
    <div className="species-row">
      {r.reactants.map(card)}
      <div className="eq-arrow big-arrow">{r.reversible ? '⇌' : '→'}</div>
      {r.products.map(card)}
    </div>
  );
}

export default function ReactionsView({ id }: { id: string | null }) {
  const [ctx, setCtx] = useState('all');
  const [filter, setFilter] = useState('');
  const r = (id && getReaction(id)) || null;
  const list = REACTIONS.filter((x) => (ctx === 'all' || x.contexts.includes(ctx)) && (!filter || `${x.name} ${x.reactants.map((s) => s.s).join(' ')} ${x.products.map((s) => s.s).join(' ')}`.toLowerCase().includes(filter.toLowerCase())));
  const eq = r ? toEquation(r) : null;
  const rels = r ? relationshipsFrom(`reaction:${r.id}`) : [];

  return (
    <>
      <Panel id="rx-library" className="left-panel" title={`Reaction library · ${REACTIONS.length} curated`}>
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by name or species" aria-label="Filter reactions" className="text-input" style={{ marginBottom: 8 }} />
        <div className="chip-row" style={{ marginBottom: 8 }}>
          {CONTEXTS.map((c) => <button key={c} className={`chip ${ctx === c ? 'active' : ''}`} onClick={() => setCtx(c)}>{c}</button>)}
        </div>
        <div className="mol-list" role="listbox" aria-label="Reactions">
          {list.map((x) => <button key={x.id} role="option" aria-selected={x.id === r?.id} className={x.id === r?.id ? 'active' : ''} onClick={() => navigate(`/atomic/reactions/${x.id}`)}><span>{x.name}</span></button>)}
          {!list.length && <p className="note">No reactions match.</p>}
        </div>
        <p className="note" style={{ marginTop: 10 }}>Hand-curated stoichiometry with citations (dataset v{manifest.version}, sha256 {manifest.sha256.slice(0, 10)}…). Every equation is machine-checked for atom and charge conservation.</p>
      </Panel>

      <div className="center-stage">
        {r && eq ? (
          <>
            <div className="stage-head">
              <h1>{r.name}</h1>
              <div className="chip-row">
                <ProvenanceBadge cls="observed" title={`Documented chemistry — ${r.citation}`} />
                <span className="badge" style={{ color: r.elementary ? '#7df9ff' : '#f5c76b' }}>{r.elementary ? 'elementary step' : r.net ? 'net equation' : 'equilibrium'}</span>
                {r.contexts.map((c) => <span key={c} className="badge" style={{ color: 'var(--text-dim)' }}>{c}</span>)}
              </div>
            </div>
            <EquationText eq={eq} big />
            <SpeciesCards r={r} />
            <div className="stage-grid">
              <div>
                <div className="section-title">Conservation check</div>
                <BalanceTable eq={eq} />
              </div>
            </div>
          </>
        ) : (
          <div className="stage-head">
            <h1>Chemical reactions</h1>
            <p className="note">Choose a curated reaction, or check your own equation on the right. Voyager balances and verifies conservation; it never predicts products.</p>
          </div>
        )}
      </div>

      <Panel id="rx-detail" className="right-panel" title="Reaction">
        <div className="section-title" style={{ marginTop: 0 }}>Check an equation</div>
        <Balancer />
        {r && (
          <>
            <div className="section-title">About this reaction</div>
            <p className="note">{r.description}</p>
            {r.conditions && <p className="note"><strong>Conditions:</strong> {r.conditions}</p>}
            {r.caveats?.map((c) => <p key={c} className="note warn">⚠ {c}</p>)}
            {rels.length > 0 && (
              <>
                <div className="section-title">Connections</div>
                <ul className="note" style={{ paddingLeft: 16, margin: 0 }}>
                  {rels.map((x) => { const e = getEntity(x.to); return (
                    <li key={x.to}>{x.type.replace('-', ' ')} → {e?.route ? <button className="link-btn" onClick={() => navigate(e.route!.slice(1))}>{e.label}</button> : <span>{e?.label ?? x.to}</span>}{e?.status === 'planned' && <em style={{ color: 'var(--text-faint)' }}> · planned{e.note ? ` (${e.note})` : ''}</em>}</li>
                  ); })}
                </ul>
              </>
            )}
            <div className="section-title">Source</div>
            <p className="note">{r.citation}</p>
            <SourceLinks ids={r.sources} />
          </>
        )}
      </Panel>
    </>
  );
}
