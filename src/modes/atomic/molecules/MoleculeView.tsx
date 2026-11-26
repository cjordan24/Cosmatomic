import { useMemo, useState } from 'react';
import { Viewport } from '@/rendering/Viewport';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { ELEMENTS } from '../atoms/elements';
import { MOLECULES, bondAngle, bondLength, getMolecule, hillFormula, molecularMass, prettyFormula, type MoleculeRecord } from './molecules';
import { MoleculeSceneContents, cameraDistanceFor, type MolDisplay } from './MoleculeScene';
import manifest from '@datasets/manifests/molecules.manifest.json';

const DISPLAYS: { id: MolDisplay; label: string }[] = [
  { id: 'ball-stick', label: 'Ball & stick' }, { id: 'space-fill', label: 'Space filling' }, { id: 'stick', label: 'Stick' }, { id: 'wireframe', label: 'Wireframe' },
];
const CATEGORIES = ['all', 'fundamental', 'organic', 'biological', 'astrophysical', 'ism'] as const;

function download(name: string, text: string, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const toXYZ = (m: MoleculeRecord) => `${m.atoms.length}\n${m.name} (${m.formula}) — ${m.geometry.source}\n${m.atoms.map((a) => `${ELEMENTS[a.Z - 1].symbol.padEnd(3)}${a.x.toFixed(5).padStart(12)}${a.y.toFixed(5).padStart(12)}${a.z.toFixed(5).padStart(12)}`).join('\n')}\n`;

export default function MoleculeView({ id }: { id: string | null }) {
  const { query } = useRoute();
  const mol = (id && getMolecule(id)) || MOLECULES.find((m) => m.name === 'Water')!;
  const display = (query.get('display') as MolDisplay) ?? 'ball-stick';
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('all');
  const [filter, setFilter] = useState('');
  const [sel, setSel] = useState<number[]>([]);
  const [labels, setLabels] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const list = useMemo(() => MOLECULES.filter((m) => (cat === 'all' ? true : cat === 'ism' ? m.detectedInISM : m.category === cat) && (!filter || `${m.name} ${m.formula}`.toLowerCase().includes(filter.toLowerCase()))), [cat, filter]);
  const pick = (i: number) => setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i].slice(-3)));
  const measurement = sel.length === 2 ? `Distance #${sel[0] + 1}–#${sel[1] + 1}: ${bondLength(mol, sel[0], sel[1]).toFixed(3)} Å`
    : sel.length === 3 ? `Angle #${sel[0] + 1}–#${sel[1] + 1}–#${sel[2] + 1}: ${bondAngle(mol, sel[0], sel[1], sel[2]).toFixed(2)}°` : null;
  const composition = useMemo(() => {
    const m = new Map<number, number>();
    mol.atoms.forEach((a) => m.set(a.Z, (m.get(a.Z) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [mol]);
  const formulaOk = hillFormula(mol.atoms) === mol.formula;
  const massCalc = molecularMass(mol.atoms);

  return (
    <>
      <Viewport key={mol.id} camera={{ position: [0, 0, cameraDistanceFor(mol)], fov: 40 }} onPointerMissed={() => setSel([])}>
        <MoleculeSceneContents mol={mol} display={display} selected={sel} onPick={pick} showLabels={labels} />
      </Viewport>

      <nav className="view-switch" aria-label="Molecular display mode">
        {DISPLAYS.map((d) => <button key={d.id} className={display === d.id ? 'active' : ''} onClick={() => setQuery({ display: d.id })}>{d.label}</button>)}
        <button className={labels ? 'active' : ''} onClick={() => setLabels((l) => !l)} aria-pressed={labels}>Labels</button>
      </nav>

      <Panel id="mol-library" className={`left-panel ${listOpen ? '' : ''}`} title={`Molecule library · ${MOLECULES.length} records`}>
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by name or formula" aria-label="Filter molecules" style={{ width: '100%', height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', marginBottom: 8 }} />
        <div className="chip-row" style={{ marginBottom: 8 }}>
          {CATEGORIES.map((c) => <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c === 'ism' ? 'detected in ISM' : c}</button>)}
        </div>
        <div className="mol-list" role="listbox" aria-label="Molecules">
          {list.map((m) => (
            <button key={m.id} role="option" aria-selected={m.id === mol.id} className={m.id === mol.id ? 'active' : ''} onClick={() => { setSel([]); setListOpen(false); navigate(`/atomic/molecules/${m.id}`); }}>
              <span>{m.name}</span><span className="f">{prettyFormula(m.formula)}</span>
            </button>
          ))}
        </div>
        <p className="note" style={{ marginTop: 10 }}>Phase 1 curated set from PubChem ({manifest.retrievedAt.slice(0, 10)}). The 100-molecule library, builder and on-demand PubChem search arrive in Phase 2.</p>
      </Panel>

      <Panel id="mol-info" className="right-panel" title="Molecule">
        <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>{mol.name}</h2>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--accent)' }}>{prettyFormula(mol.formula)}</div>
        {mol.iupacName && <div className="note">IUPAC: {mol.iupacName}</div>}
        <div style={{ display: 'flex', gap: 6, margin: '8px 0', flexWrap: 'wrap' }}>
          <ProvenanceBadge cls={mol.geometry.provenance} title={mol.geometry.source} />
          <span className="badge" style={{ color: mol.geometry.experimental ? '#5cf2a6' : '#f5c76b' }}>{mol.geometry.experimental ? 'experimental geometry' : 'computed conformer'}</span>
          {mol.detectedInISM && <span className="badge" style={{ color: '#b18cff' }}>detected in interstellar medium</span>}
        </div>
        {mol.context && <p className="note">{mol.context}</p>}

        <div className="section-title">Measure</div>
        <p className="note">{measurement ?? 'Click 2 atoms for a distance or 3 atoms for an angle (vertex = second atom). Click empty space to clear.'}</p>

        <div className="section-title">Identity</div>
        <dl className="kv">
          <KV k="Molecular weight" v={mol.molecularWeight} unit="g/mol" sig={6} />
          <KV k="Σ atomic weights (check)" v={massCalc} unit="u" sig={6} />
          <KV k="Formula check" v={formulaOk ? 'Hill formula matches atoms ✓' : 'MISMATCH'} />
          <KV k="Atoms / bonds" v={`${mol.atoms.length} / ${mol.bonds.length}`} />
          <KV k="Net charge" v={mol.netCharge} />
          <KV k="PubChem CID" v={mol.pubchemCid} />
          <dt>SMILES</dt><dd style={{ wordBreak: 'break-all', fontSize: 10.5 }} className={mol.smiles ? '' : 'unknown'}>{mol.smiles ?? 'unknown'}</dd>
          <dt>InChIKey</dt><dd style={{ wordBreak: 'break-all', fontSize: 10.5 }} className={mol.inchiKey ? '' : 'unknown'}>{mol.inchiKey ?? 'unknown'}</dd>
        </dl>

        <div className="section-title">Atoms → Atomic mode</div>
        <div className="chip-row">
          {composition.map(([Z, n]) => <button key={Z} className="chip" onClick={() => navigate(`/atomic/element/${Z}`)}>{ELEMENTS[Z - 1].symbol} × {n}</button>)}
        </div>

        <div className="section-title">Geometry & provenance</div>
        <p className="note">{mol.geometry.source}. {mol.geometry.experimental ? '' : 'Computed conformers approximate the gas-phase minimum; force-field bond lengths can deviate by a few hundredths of an ångström from experiment.'} Bond orders are Kekulé (aromatic rings shown as alternating single/double).</p>
        <p className="note"><a href={mol.sourceUrl} target="_blank" rel="noreferrer">Source record →</a></p>

        <div className="section-title">Export</div>
        <div className="chip-row">
          <button className="chip" onClick={() => download(`${mol.id}.xyz`, toXYZ(mol), 'chemical/x-xyz')}>XYZ</button>
          <button className="chip" onClick={() => download(`${mol.id}.json`, JSON.stringify(mol, null, 2), 'application/json')}>JSON</button>
          <button className="chip" onClick={() => { const c = document.querySelector<HTMLCanvasElement>('.viewport canvas'); if (c) { const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `${mol.id}.png`; a.click(); } }}>PNG</button>
        </div>
      </Panel>
    </>
  );
}
