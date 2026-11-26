import { useEffect, useMemo, useState } from 'react';
import { Viewport } from '@/rendering/Viewport';
import { navigate } from '@/shared/router';
import { KV, Panel } from '@/ui/components';
import { ELEMENTS } from '../atoms/elements';
import { hillFormula, molecularMass, prettyFormula, MOLECULES, type MoleculeRecord } from '../molecules/molecules';
import { toMolV2000, toXYZ } from '../molecules/formats';
import { lookupByInChIKey } from '../molecules/pubchem';
import { useMoleculeLibrary } from '../molecules/library';
import { addHydrogens, centroidOf, rotateAboutBond, translateAtoms, validateValence, type Structure } from './builder';
import { identify, loadRDKit, type Identity } from './rdkit';
import { LabScene } from './LabScene';
import { useLab, type Tool } from './store';

const TOOLS: { id: Tool; label: string; hint: string }[] = [
  { id: 'grow', label: 'Add / grow', hint: 'Click empty space to place an atom; click an atom to bond a new atom to it.' },
  { id: 'bond', label: 'Bond', hint: 'Click two atoms to bond them; click a bond (or the same pair) to cycle single → double → triple.' },
  { id: 'charge', label: 'Charge', hint: 'Click an atom to cycle its formal charge 0 → +1 → −1.' },
  { id: 'replace', label: 'Replace', hint: 'Click an atom to change it to the selected element.' },
  { id: 'delete', label: 'Delete', hint: 'Click an atom or bond to delete it.' },
  { id: 'move', label: 'Move atom', hint: 'Drag an atom in the screen plane.' },
  { id: 'move-fragment', label: 'Move fragment', hint: 'Drag any atom to move its whole connected fragment.' },
  { id: 'rotate', label: 'Rotate bond', hint: 'Click a non-ring single bond, then use the slider to rotate one side about it.' },
  { id: 'duplicate', label: 'Duplicate', hint: 'Click an atom to copy its whole fragment 3.5 Å to the side.' },
];
const PALETTE = [1, 6, 7, 8, 9, 15, 16, 17, 35, 53, 5, 14];

function useIdentity(s: Structure) {
  const [rd, setRd] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [id, setId] = useState<Identity | null>(null);
  const [known, setKnown] = useState<{ cid: number; title: string } | null | 'unknown' | 'checking'>('unknown');
  useEffect(() => { setRd('loading'); loadRDKit().then(() => setRd('ready'), () => setRd('failed')); }, []);
  useEffect(() => {
    if (rd !== 'ready') return;
    const t = setTimeout(() => loadRDKit().then((m) => setId(identify(m, s))), 150);
    return () => clearTimeout(t);
  }, [s, rd]);
  useEffect(() => {
    if (!id?.inchiKey) { setKnown('unknown'); return; }
    let alive = true;
    setKnown('checking');
    const t = setTimeout(() => lookupByInChIKey(id.inchiKey!).then((r) => alive && setKnown(r), () => alive && setKnown('unknown')), 500);
    return () => { alive = false; clearTimeout(t); };
  }, [id?.inchiKey]);
  return { rd, id, known };
}

export default function LaboratoryView() {
  const lab = useLab();
  const { s, tool, Z, sandbox, notice, selectedBond } = lab;
  const library = useMoleculeLibrary();
  const [angle, setAngle] = useState(0);
  const [base, setBase] = useState<Structure | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const issues = useMemo(() => validateValence(s), [s]);
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const { rd, id, known } = useIdentity(s);
  const formula = s.atoms.length ? hillFormula(s.atoms) : '—';
  const hypothetical = errors.length > 0 || (id !== null && !id.valid);

  useEffect(() => { setAngle(0); setBase(selectedBond !== null ? s : null); }, [selectedBond]); // eslint-disable-line react-hooks/exhaustive-deps

  const asRecord = (): MoleculeRecord => {
    const kn = typeof known === 'object' && known ? known : null;
    return {
      id: `built-${Date.now().toString(36)}`, name: kn ? `${kn.title} (built)` : `Built ${formula}`, iupacName: null, category: 'built', detectedInISM: false,
      context: kn ? `Identified as PubChem CID ${kn.cid} by InChIKey.` : null,
      formula: hillFormula(s.atoms), molecularWeight: molecularMass(s.atoms), netCharge: s.atoms.reduce((t, a) => t + a.charge, 0),
      smiles: id?.smiles ?? null, inchi: id?.inchi ?? null, inchiKey: id?.inchiKey ?? null, pubchemCid: kn?.cid ?? null,
      atoms: s.atoms, bonds: s.bonds,
      geometry: { source: `Built in the Voyager laboratory — starting-guess geometry (covalent radii, VSEPR-like directions), not optimised${hypothetical ? '; FAILS validation (hypothetical)' : ''}.`, units: 'angstrom', provenance: 'hypothetical', experimental: false },
      sourceUrl: kn ? `https://pubchem.ncbi.nlm.nih.gov/compound/${kn.cid}` : '',
    };
  };
  const download = (name: string, text: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text])); a.download = name; a.click(); };

  return (
    <>
      <Viewport camera={{ position: [0, 2, 12], fov: 45 }}>
        <LabScene />
      </Viewport>

      <Panel id="lab-tools" className="left-panel" title="Laboratory · builder">
        <div className="section-title" style={{ marginTop: 0 }}>Tool</div>
        <div className="chip-row" role="toolbar" aria-label="Builder tools">
          {TOOLS.map((t) => <button key={t.id} className={`chip ${tool === t.id ? 'active' : ''}`} title={t.hint} onClick={() => lab.set({ tool: t.id, pendingAtom: null, selectedBond: null, notice: null })}>{t.label}</button>)}
        </div>
        <p className="note">{TOOLS.find((t) => t.id === tool)!.hint}</p>

        {tool === 'rotate' && selectedBond !== null && base && (
          <div className="slider-row">
            <span>Dihedral Δ</span>
            <input type="range" min={-180} max={180} step={5} value={angle} aria-label="Rotation angle"
              onChange={(e) => { const a = Number(e.target.value); setAngle(a); try { lab.preview(rotateAboutBond(base, selectedBond, (a * Math.PI) / 180)); } catch (err) { lab.set({ notice: (err as Error).message }); } }}
              onPointerUp={() => base && lab.commit(base)} onKeyUp={() => base && lab.commit(base)} />
            <span className="mono">{angle}°</span>
          </div>
        )}

        <div className="section-title">Element</div>
        <div className="chip-row" role="group" aria-label="Element palette">
          {PALETTE.map((z) => <button key={z} className={`chip ${Z === z ? 'active' : ''}`} onClick={() => lab.set({ Z: z })}>{ELEMENTS[z - 1].symbol}</button>)}
          <select value={Z} onChange={(e) => lab.set({ Z: Number(e.target.value) })} aria-label="Any element" style={{ height: 28 }}>
            {ELEMENTS.map((e) => <option key={e.Z} value={e.Z}>{e.Z} {e.symbol} — {e.name}</option>)}
          </select>
        </div>

        <div className="section-title">Actions</div>
        <div className="chip-row">
          <button className="chip" onClick={() => lab.apply(addHydrogens(s), 'add hydrogens')}>Add hydrogens</button>
          <button className="chip" onClick={() => lab.apply(translateAtoms(s, s.atoms.map((_, i) => i), centroidOf(s).map((x) => -x) as [number, number, number]), 'centre')} disabled={!s.atoms.length}>Centre</button>
          <button className="chip" onClick={lab.undo} disabled={!lab.past.length} aria-label="Undo">↶ Undo</button>
          <button className="chip" onClick={lab.redo} disabled={!lab.future.length} aria-label="Redo">↷ Redo</button>
          <button className="chip" onClick={lab.clear} disabled={!s.atoms.length}>Clear</button>
        </div>
        <label className="note" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Start from
          <select defaultValue="" onChange={(e) => { const m = [...MOLECULES, ...library.user].find((x) => x.id === e.target.value); if (m) lab.load({ atoms: m.atoms.map((a) => ({ ...a })), bonds: m.bonds.map((b) => ({ ...b })) }); e.target.value = ''; }} aria-label="Load a library molecule into the builder" style={{ flex: 1 }}>
            <option value="">a library molecule…</option>
            {[...MOLECULES, ...library.user].sort((a, b) => a.name.localeCompare(b.name)).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>

        <div className="section-title">Mode</div>
        <label className="toggle-row" style={{ borderBottom: 0 }}>
          <span>Experimental sandbox <span className="note">(allow impossible valences; result is labelled Hypothetical)</span></span>
          <input type="checkbox" checked={sandbox} onChange={(e) => lab.set({ sandbox: e.target.checked })} />
        </label>
        {notice && <p className="note warn" role="alert">{notice}</p>}
      </Panel>

      <Panel id="lab-info" className="right-panel" title="Structure · validation">
        <div style={{ fontFamily: 'var(--mono)', fontSize: 20, color: 'var(--accent)' }}>{s.atoms.length ? prettyFormula(formula) : 'empty'}</div>
        <div style={{ display: 'flex', gap: 6, margin: '8px 0', flexWrap: 'wrap' }}>
          <span className="badge" style={{ color: '#ff7a90' }} title="Provenance class: Hypothetical (user-created structure)"><span className="dot" />user-built</span>
          {s.atoms.length > 0 && (hypothetical
            ? <span className="badge" style={{ color: '#ff7a90' }}>fails validation — hypothetical</span>
            : warnings.length ? <span className="badge" style={{ color: '#f5c76b' }}>valid bonding, open valences</span>
            : <span className="badge" style={{ color: '#5cf2a6' }}>passes both validators</span>)}
          <span className="badge" style={{ color: '#f5c76b' }}>unoptimised geometry</span>
        </div>
        <dl className="kv">
          <KV k="Atoms / bonds" v={`${s.atoms.length} / ${s.bonds.length}`} />
          <KV k="Molecular mass" v={s.atoms.length ? molecularMass(s.atoms) : null} unit="u" sig={6} />
          <KV k="Net charge" v={s.atoms.reduce((t, a) => t + a.charge, 0)} />
        </dl>

        <div className="section-title">Valence rules (in-house)</div>
        {issues.length === 0 ? <p className="note">{s.atoms.length ? '✓ Every atom satisfies a standard valence.' : 'Place an atom to begin.'}</p> : (
          <ul className="note" style={{ paddingLeft: 16, margin: 0 }}>
            {issues.slice(0, 12).map((i, k) => <li key={k} style={{ color: i.severity === 'error' ? '#ff7a90' : '#f5c76b' }}>{i.message}</li>)}
            {issues.length > 12 && <li>… {issues.length - 12} more</li>}
          </ul>
        )}

        <div className="section-title">RDKit sanitisation (independent)</div>
        {rd === 'loading' && <p className="note">Loading RDKit-JS (≈7 MB, first time only)…</p>}
        {rd === 'failed' && <p className="note warn">RDKit-JS could not be loaded; only the in-house validator is active.</p>}
        {rd === 'ready' && id && (
          <>
            <p className="note" style={{ color: id.valid ? undefined : '#ff7a90' }}>{id.valid ? `✓ Sanitised by RDKit ${id.rdkitVersion}` : id.error}</p>
            {id.valid && (
              <dl className="kv">
                <dt>SMILES</dt><dd style={{ wordBreak: 'break-all', fontSize: 10.5 }}>{id.smiles}</dd>
                <dt>InChIKey</dt><dd style={{ wordBreak: 'break-all', fontSize: 10.5 }}>{id.inchiKey ?? 'n/a'}</dd>
              </dl>
            )}
          </>
        )}

        <div className="section-title">Identity (PubChem, by InChIKey)</div>
        <p className="note">
          {known === 'checking' ? 'Looking up…'
            : known === 'unknown' ? (id?.inchiKey ? 'Lookup unavailable.' : 'Needs a valid structure.')
            : known === null ? 'No PubChem compound has this exact InChIKey — a new or unusual structure (check stereo and hydrogens).'
            : <>Matches <button className="link-btn" onClick={() => navigate(`/atomic/molecules/pubchem-${known.cid}`)}>{known.title}</button> (CID {known.cid}).</>}
        </p>

        <div className="section-title">Save & export</div>
        <div className="chip-row">
          <button className="chip" disabled={!s.atoms.length} onClick={async () => { const r = asRecord(); await library.add(r); setSaved(r.id); }}>Save to my library</button>
          {saved && <button className="chip" onClick={() => navigate(`/atomic/molecules/${saved}`)}>Open saved →</button>}
          <button className="chip" disabled={!s.atoms.length} onClick={() => download('built.mol', toMolV2000(asRecord()))}>MOL</button>
          <button className="chip" disabled={!s.atoms.length} onClick={() => download('built.xyz', toXYZ(asRecord()))}>XYZ</button>
        </div>
        <p className="note" style={{ marginTop: 10 }}>Geometry is a starting guess (covalent-radius bond lengths, VSEPR-like directions). Force-field optimisation arrives in the next gate. Two validators are shown because they can disagree: RDKit also checks aromaticity and charge perception.</p>
      </Panel>
    </>
  );
}
