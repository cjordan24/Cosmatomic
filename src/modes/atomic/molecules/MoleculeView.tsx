import { EntityBio } from '@/ui/Encyclopedia';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Viewport } from '@/rendering/Viewport';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { ELEMENTS } from '../atoms/elements';
import { MOLECULES, bondAngle, bondLength, bondStats, hillFormula, molecularMass, prettyFormula, radiusOfGyration, type MoleculeRecord } from './molecules';
import { MoleculeSceneContents, cameraDistanceFor, type MolDisplay } from './MoleculeScene';
import { toMolV2000, toPDB, toSDF, toXYZ, parseByExtension, FormatError } from './formats';
import { fetchPubChemMolecule, searchPubChem, PubChemError, type SearchHit } from './pubchem';
import { useMoleculeLibrary, findMolecule } from './library';
import manifest from '@datasets/manifests/molecules.manifest.json';
import { reactionsForMolecule } from '../reactions/library';
const MoleculeDynamics = lazy(() => import('./MoleculeDynamics'));

const DISPLAYS: { id: MolDisplay; label: string }[] = [
  { id: 'ball-stick', label: 'Ball & stick' }, { id: 'space-fill', label: 'Space filling' }, { id: 'stick', label: 'Stick' }, { id: 'wireframe', label: 'Wireframe' },
];
const GROUPS: { id: string; label: string; match: (m: MoleculeRecord) => boolean }[] = [
  { id: 'all', label: 'all', match: () => true },
  { id: 'fundamental', label: 'fundamental', match: (m) => m.category === 'fundamental' },
  { id: 'organic', label: 'organic', match: (m) => m.category === 'organic' },
  { id: 'life', label: 'biomolecules', match: (m) => ['biological', 'amino acid', 'nucleic acid', 'carbohydrate', 'lipid', 'metabolite', 'neurochemical', 'hormone', 'vitamin'].includes(m.category) },
  { id: 'pharma', label: 'pharmacology', match: (m) => m.category === 'pharmacology' },
  { id: 'astro', label: 'astrophysical', match: (m) => m.category === 'astrophysical' || m.category === 'materials' },
  { id: 'ism', label: 'detected in ISM', match: (m) => m.detectedInISM },
  { id: 'mine', label: 'my library', match: (m) => ['pubchem search', 'imported', 'built'].includes(m.category) },
];

function download(name: string, text: string, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const safeName = (m: MoleculeRecord) => m.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

function PubChemSearch({ onOpen }: { onOpen: (m: MoleculeRecord) => void }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const run = async () => {
    setBusy(true); setMsg(null); setHits(null);
    try { const h = await searchPubChem(q); setHits(h); if (!h.length) setMsg(`No PubChem compound matches “${q}”.`); }
    catch (e) { setMsg((e as Error).message); }
    finally { setBusy(false); }
  };
  const open = async (cid: number) => {
    setBusy(true); setMsg(null);
    try { onOpen(await fetchPubChemMolecule(cid)); setHits(null); setQ(''); }
    catch (e) { setMsg(e instanceof PubChemError ? e.message : `Could not load CID ${cid}: ${(e as Error).message}`); }
    finally { setBusy(false); }
  };
  return (
    <div style={{ marginBottom: 10 }}>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) run(); }} style={{ display: 'flex', gap: 6 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search PubChem: name or formula" aria-label="Search PubChem" style={{ flex: 1, height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }} />
        <button className="icon-btn" type="submit" disabled={busy || !q.trim()}>{busy ? '…' : 'Search'}</button>
      </form>
      {msg && <p className="note warn" role="status" style={{ margin: '6px 0 0' }}>{msg}</p>}
      {hits && hits.length > 0 && (
        <div className="mol-list" role="listbox" aria-label="PubChem results" style={{ marginTop: 6, borderTop: '1px solid var(--line)', paddingTop: 4 }}>
          {hits.map((h) => (
            <button key={h.cid} role="option" aria-selected={false} onClick={() => open(h.cid)} disabled={busy}>
              <span>{h.title}</span><span className="f">{prettyFormula(h.formula)} · CID {h.cid}</span>
            </button>
          ))}
        </div>
      )}
      <p className="note" style={{ margin: '4px 0 0', fontSize: 10.5 }}>Live from PubChem (≤ 4 req/s, cached 30 days on this device). Opened compounds are saved to “my library”.</p>
    </div>
  );
}

function CompareView({ a, b, all }: { a: MoleculeRecord; b: MoleculeRecord; all: MoleculeRecord[] }) {
  const display = 'ball-stick' as MolDisplay;
  const rows: [string, (m: MoleculeRecord) => string | number | null][] = [
    ['Formula', (m) => m.formula], ['Molecular weight (g/mol)', (m) => m.molecularWeight.toFixed(3)], ['Atoms / bonds', (m) => `${m.atoms.length} / ${m.bonds.length}`],
    ['Heavy atoms', (m) => m.atoms.filter((x) => x.Z > 1).length], ['Radius of gyration (Å)', (m) => radiusOfGyration(m).toFixed(3)],
    ['XLogP3', (m) => m.computed?.xlogp ?? null], ['TPSA (Å²)', (m) => m.computed?.tpsaA2 ?? null], ['H-bond donors / acceptors', (m) => (m.computed && (m.computed.hBondDonors !== null || m.computed.hBondAcceptors !== null) ? `${m.computed.hBondDonors ?? '—'} / ${m.computed.hBondAcceptors ?? '—'}` : null)],
    ['Rotatable bonds', (m) => m.computed?.rotatableBonds ?? null], ['Geometry', (m) => (m.geometry.experimental ? 'experimental' : m.geometry.provenance === 'hypothetical' ? 'user-supplied' : 'computed conformer')],
  ];
  const sa = bondStats(a), sb = bondStats(b);
  const keys = [...new Set([...sa, ...sb].map((s) => s.pair))].sort();
  const pick = (side: 'a' | 'b') => (
    <select value={(side === 'a' ? a : b).id} onChange={(e) => setQuery({ [side]: e.target.value })} aria-label={`Molecule ${side.toUpperCase()}`} style={{ maxWidth: 260 }}>
      {all.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
    </select>
  );
  return (
    <>
      <div style={{ position: 'absolute', inset: '0 0 42% 0', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {[a, b].map((m, i) => (
          <div key={`${i}-${m.id}`} style={{ position: 'relative', borderRight: i === 0 ? '1px solid var(--line)' : undefined }}>
            <Viewport camera={{ position: [0, 0, cameraDistanceFor(m)], fov: 40 }}>
              <MoleculeSceneContents mol={m} display={display} selected={[]} onPick={() => {}} showLabels={false} />
            </Viewport>
            <div className="panel" style={{ top: 10, left: 10, padding: '6px 10px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <strong style={{ color: 'var(--accent)' }}>{i === 0 ? 'A' : 'B'}</strong>{pick(i === 0 ? 'a' : 'b')}<span className="mono">{prettyFormula(m.formula)}</span>
            </div>
          </div>
        ))}
      </div>
      <Panel id="mol-compare" title="Comparison" style={{ left: 12, right: 12, bottom: 12, height: 'calc(42% - 24px)', display: 'flex', flexDirection: 'column' }}
        actions={<button onClick={() => navigate(`/atomic/molecules/${a.id}`)} aria-label="Close comparison">✕</button>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.3fr)', gap: 20 }}>
          <table className="table-mini">
            <thead><tr><th>Property</th><th>A · {a.name}</th><th>B · {b.name}</th></tr></thead>
            <tbody>{rows.map(([k, f]) => <tr key={k}><td>{k}</td><td>{f(a) ?? '—'}</td><td>{f(b) ?? '—'}</td></tr>)}</tbody>
          </table>
          <table className="table-mini">
            <thead><tr><th>Bond</th><th>A: n · mean ± sd (Å)</th><th>B: n · mean ± sd (Å)</th></tr></thead>
            <tbody>{keys.map((k) => {
              const x = sa.find((s) => s.pair === k), y = sb.find((s) => s.pair === k);
              const f = (s?: typeof x) => (s ? `${s.n} · ${s.mean.toFixed(3)} ± ${s.sd.toFixed(3)}` : '—');
              return <tr key={k}><td>{k}</td><td>{f(x)}</td><td>{f(y)}</td></tr>;
            })}</tbody>
          </table>
        </div>
        <p className="note" style={{ marginTop: 8 }}>Bond statistics computed from the displayed coordinates. Descriptors (XLogP3, TPSA, H-bond counts) are PubChem computed values; “—” = not available for that record.</p>
      </Panel>
    </>
  );
}

export default function MoleculeView({ id }: { id: string | null }) {
  const { query } = useRoute();
  const lib = useMoleculeLibrary();
  useEffect(() => { lib.load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const all = useMemo(() => [...MOLECULES, ...lib.user].sort((x, y) => x.name.localeCompare(y.name)), [lib.user]);
  const display = (query.get('display') as MolDisplay) ?? 'ball-stick';
  const [group, setGroup] = useState('all');
  const [filter, setFilter] = useState('');
  const [sel, setSel] = useState<number[]>([]);
  const [labels, setLabels] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (id === 'compare') {
    const a = findMolecule(query.get('a'), lib.user) ?? MOLECULES.find((m) => m.name === 'Ethanol')!;
    const b = findMolecule(query.get('b'), lib.user) ?? MOLECULES.find((m) => m.name === 'Dimethyl ether')!;
    return <CompareView a={a} b={b} all={all} />;
  }

  const mol = findMolecule(id, lib.user) ?? (id && !lib.loaded ? undefined : MOLECULES.find((m) => m.name === 'Water')!);
  if (!mol) return <div className="loading">LOADING…</div>;
  const dynamics = query.get('md') === '1';

  const g = GROUPS.find((x) => x.id === group)!;
  const list = all.filter((m) => g.match(m) && (!filter || `${m.name} ${m.formula} ${m.iupacName ?? ''}`.toLowerCase().includes(filter.toLowerCase())));
  const pick = (i: number) => setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i].slice(-3)));
  const measurement = sel.length === 2 ? `Distance #${sel[0] + 1}–#${sel[1] + 1}: ${bondLength(mol, sel[0], sel[1]).toFixed(3)} Å`
    : sel.length === 3 ? `Angle #${sel[0] + 1}–#${sel[1] + 1}–#${sel[2] + 1}: ${bondAngle(mol, sel[0], sel[1], sel[2]).toFixed(2)}°` : null;
  const composition = (() => { const c = new Map<number, number>(); mol.atoms.forEach((a) => c.set(a.Z, (c.get(a.Z) ?? 0) + 1)); return [...c.entries()].sort((x, y) => x[0] - y[0]); })();
  const formulaOk = hillFormula(mol.atoms) === mol.formula;
  const isUser = lib.user.some((m) => m.id === mol.id);
  const molReactions = reactionsForMolecule(mol.id);

  const openRecord = async (m: MoleculeRecord) => { await lib.add(m); setSel([]); navigate(`/atomic/molecules/${m.id}`); };
  const onFile = async (f: File) => {
    setImportMsg(null);
    if (f.size > 5 * 1024 * 1024) { setImportMsg('File larger than 5 MB — not imported.'); return; }
    try { const m = parseByExtension(f.name, await f.text()); await openRecord(m); setImportMsg(`Imported ${m.atoms.length} atoms. ${m.geometry.source}`); }
    catch (e) { setImportMsg(e instanceof FormatError ? e.message : `Import failed: ${(e as Error).message}`); }
  };
  const exportAs = (kind: 'xyz' | 'mol' | 'sdf' | 'pdb' | 'json') => {
    try {
      const text = kind === 'xyz' ? toXYZ(mol) : kind === 'mol' ? toMolV2000(mol) : kind === 'sdf' ? toSDF(mol) : kind === 'pdb' ? toPDB(mol) : JSON.stringify(mol, null, 2);
      download(`${safeName(mol)}.${kind}`, text, kind === 'json' ? 'application/json' : 'chemical/x-mdl-molfile');
    } catch (e) { setImportMsg((e as Error).message); }
  };

  return (
    <>
      {dynamics ? <Suspense fallback={null}><MoleculeDynamics mol={mol} /></Suspense> : (
        <Viewport key={mol.id} camera={{ position: [0, 0, cameraDistanceFor(mol)], fov: 40 }} onPointerMissed={() => setSel([])}>
          <MoleculeSceneContents mol={mol} display={display} selected={sel} onPick={pick} showLabels={labels} />
        </Viewport>
      )}

      <nav className="view-switch" aria-label="Molecular display mode">
        {DISPLAYS.map((d) => <button key={d.id} className={!dynamics && display === d.id ? 'active' : ''} onClick={() => setQuery({ display: d.id, md: null })}>{d.label}</button>)}
        <button className={dynamics ? 'active' : ''} onClick={() => setQuery({ md: dynamics ? null : '1' })} title="Classical molecular dynamics (VGFF-1)">Dynamics</button>
        <button className={labels ? 'active' : ''} onClick={() => setLabels((l) => !l)} aria-pressed={labels}>Labels</button>
        <button onClick={() => navigate(`/atomic/molecules/compare?a=${mol.id}&b=${mol.id === 'pubchem-702' ? 'pubchem-8254' : 'pubchem-702'}`)}>Compare…</button>
      </nav>

      <Panel id="mol-library" className="left-panel" title={`Molecule library · ${all.length} records`}>
        <PubChemSearch onOpen={openRecord} />
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter library by name or formula" aria-label="Filter molecules" style={{ width: '100%', height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', marginBottom: 8 }} />
        <div className="chip-row" style={{ marginBottom: 8 }}>
          {GROUPS.map((x) => <button key={x.id} className={`chip ${group === x.id ? 'active' : ''}`} onClick={() => setGroup(x.id)}>{x.label}</button>)}
        </div>
        <div className="mol-list" role="listbox" aria-label="Molecules">
          {list.map((m) => (
            <button key={m.id} role="option" aria-selected={m.id === mol.id} className={m.id === mol.id ? 'active' : ''} onClick={() => { setSel([]); navigate(`/atomic/molecules/${m.id}`); }}>
              <span>{m.name}</span><span className="f">{prettyFormula(m.formula)}</span>
            </button>
          ))}
          {!list.length && <p className="note">No molecules match.</p>}
        </div>
        <div className="section-title">Import structure</div>
        <input ref={fileRef} type="file" accept=".xyz,.mol,.sdf,.sd,.pdb,.ent" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
        <button className="icon-btn" onClick={() => fileRef.current?.click()}>Open .xyz / .mol / .sdf / .pdb…</button>
        {importMsg && <p className="note" role="status">{importMsg}</p>}
        <p className="note" style={{ marginTop: 10 }}>Curated set: {manifest.records} PubChem records + experimental H₂, NO and C₆₀ ({manifest.retrievedAt.slice(0, 10)}). Salts, metals and minerals are extended lattices and arrive with the materials models (Phase 4).</p>
      </Panel>

      {!dynamics && <Panel id="mol-info" className="right-panel" title="Molecule">
        <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>{mol.name}</h2>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--accent)' }}>{prettyFormula(mol.formula)}</div>
        {mol.iupacName && <div className="note">IUPAC: {mol.iupacName}</div>}
        <div style={{ display: 'flex', gap: 6, margin: '8px 0', flexWrap: 'wrap' }}>
          <ProvenanceBadge cls={mol.geometry.provenance} title={mol.geometry.source} />
          <span className="badge" style={{ color: mol.geometry.experimental ? '#5cf2a6' : mol.geometry.provenance === 'hypothetical' ? '#ff7a90' : '#f5c76b' }}>{mol.geometry.experimental ? 'experimental geometry' : mol.geometry.provenance === 'hypothetical' ? 'user-supplied, unverified' : 'computed conformer'}</span>
          {mol.detectedInISM && <span className="badge" style={{ color: '#b18cff' }} title="McGuire (2022) census of interstellar molecules">detected in interstellar medium</span>}
          <span className="badge" style={{ color: 'var(--text-dim)' }}>{mol.category}</span>
        </div>
        {mol.context && <p className="note">{mol.context}</p>}
        <EntityBio entity={`molecule:${mol.id}`} what={mol.name} />

        <div className="section-title">Measure</div>
        <p className="note">{measurement ?? 'Click 2 atoms for a distance or 3 atoms for an angle (vertex = second atom). Click empty space to clear.'}</p>

        <div className="section-title">Identity</div>
        <dl className="kv">
          <KV k="Molecular weight" v={mol.molecularWeight} unit="g/mol" sig={6} />
          <KV k="Σ atomic weights (check)" v={molecularMass(mol.atoms)} unit="u" sig={6} />
          <KV k="Formula check" v={formulaOk ? 'Hill formula matches atoms ✓' : 'MISMATCH'} />
          <KV k="Atoms / bonds" v={`${mol.atoms.length} / ${mol.bonds.length}`} />
          <KV k="Net charge" v={mol.netCharge} />
          <KV k="PubChem CID" v={mol.pubchemCid !== null ? String(mol.pubchemCid) : null} />
          <dt>SMILES</dt><dd style={{ wordBreak: 'break-all', fontSize: 10.5 }} className={mol.smiles ? '' : 'unknown'}>{mol.smiles ?? 'unknown'}</dd>
          <dt>InChIKey</dt><dd style={{ wordBreak: 'break-all', fontSize: 10.5 }} className={mol.inchiKey ? '' : 'unknown'}>{mol.inchiKey ?? 'unknown'}</dd>
        </dl>

        {mol.computed && (
          <>
            <div className="section-title">Computed descriptors <ProvenanceBadge cls="derived" title={mol.computed.source} /></div>
            <dl className="kv">
              <KV k="Monoisotopic mass" v={mol.computed.exactMassU} unit="u" sig={9} />
              <KV k="XLogP3 (lipophilicity)" v={mol.computed.xlogp} sig={3} />
              <KV k="Topological polar surface area" v={mol.computed.tpsaA2} unit="Å²" sig={4} />
              <KV k="H-bond donors / acceptors" v={mol.computed.hBondDonors === null && mol.computed.hBondAcceptors === null ? null : `${mol.computed.hBondDonors ?? '—'} / ${mol.computed.hBondAcceptors ?? '—'}`} />
              <KV k="Rotatable bonds" v={mol.computed.rotatableBonds} />
            </dl>
          </>
        )}

        <div className="section-title">Atoms → Atomic mode</div>
        <div className="chip-row">
          {composition.map(([Z, n]) => <button key={Z} className="chip" onClick={() => navigate(`/atomic/element/${Z}`)}>{ELEMENTS[Z - 1].symbol} × {n}</button>)}
        </div>

        {molReactions.length > 0 && (
          <>
            <div className="section-title">Reactions · curated library</div>
            <div className="chip-row">
              {molReactions.slice(0, 12).map((r) => <button key={r.id} className="chip" onClick={() => navigate(`/atomic/reactions/${r.id}`)}>{r.name}</button>)}
              {molReactions.length > 12 && <span className="note">+{molReactions.length - 12} more</span>}
            </div>
          </>
        )}

        <div className="section-title">Geometry & provenance</div>
        <p className="note">{mol.geometry.source}{mol.geometry.experimental || mol.geometry.provenance === 'hypothetical' ? '' : ' — force-field bond lengths can deviate by a few hundredths of an ångström from experiment.'} Bond orders are Kekulé.</p>
        {mol.sourceUrl && <p className="note"><a href={mol.sourceUrl} target="_blank" rel="noreferrer">Source record →</a></p>}

        <div className="section-title">Export</div>
        <div className="chip-row">
          {(['xyz', 'mol', 'sdf', 'pdb', 'json'] as const).map((k) => <button key={k} className="chip" onClick={() => exportAs(k)}>{k.toUpperCase()}</button>)}
          <button className="chip" onClick={() => { const c = document.querySelector<HTMLCanvasElement>('.viewport canvas'); if (c) { const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `${safeName(mol)}.png`; a.click(); } }}>PNG</button>
          {isUser && <button className="chip" onClick={async () => { await lib.remove(mol.id); navigate('/atomic/molecules'); }}>Remove from my library</button>}
        </div>
      </Panel>}
    </>
  );
}
