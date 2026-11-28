/**
 * Protein and DNA structures — #/biologic/proteins?id=<PDB ID>&style=trace|atoms&color=ss|chain   (Phase 11, Gate 11.3)
 *
 * Seven crystal structures from the Protein Data Bank (CC0), drawn from their own coordinates: a backbone tube
 * through the C-alpha atoms (phosphorus for DNA) coloured by the file's helix/strand records or by chain, or every
 * atom as a sphere in element colours; hetero groups (haem, zinc, the GFP chromophore) are always drawn as atoms.
 * The panel gives the entry's metadata and primary citation, its deposited sequences (SEQRES) and derived geometry.
 */
import { Suspense, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Loading, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { Viewport } from '@/rendering/Viewport';
import { OrbitControls } from '@react-three/drei';
import { centroid, principalExtents, radiusOfGyration } from '@/core/biology/structure';
import { coords, heteroGroups, loadStructure, residues, sequences, ssFractions, type PdbStructure, type Residue } from '@/core/biology/pdb';
import pdbIndex from '@datasets/biology/pdb-index.json';

interface IndexEntry { id: string; title: string; molecules: { name: string; chains: string[] }[]; organisms: string[]; synthetic: boolean; resolutionA: number | null; atomCount: number }
const ENTRIES = (pdbIndex as unknown as { entries: IndexEntry[] }).entries;
/** Source-index id of each entry's primary citation. */
export const PDB_CITATION: Record<string, string> = { '1BNA': 'drew-1981', '1MBN': 'watson-1969', '1A6M': 'vojtechovsky-1999', '4HHB': 'fermi-1984', '4INS': 'baker-1988', '1EMA': 'ormo-1996', '1LYZ': 'diamond-1974' };
const SHORT: Record<string, string> = { '1BNA': 'B-DNA dodecamer', '1MBN': 'Myoglobin (1973)', '1A6M': 'Oxy-myoglobin (1 Å)', '4HHB': 'Haemoglobin', '4INS': 'Insulin', '1EMA': 'Green fluorescent protein', '1LYZ': 'Lysozyme' };
const SS_COLOR = { H: '#ff7ab6', E: '#f5c76b', C: '#9aa6c8' };
const CHAIN_COLORS = ['#5cf2a6', '#7df9ff', '#c9b4ff', '#ffb347', '#ff7a90', '#b6f7d6'];
const EL_COLOR: Record<string, string> = { C: '#8fd9a8', N: '#5b8cff', O: '#ff5a5a', S: '#f5d76b', P: '#ffa64d', Fe: '#e07a3f', Zn: '#a0a0ff', Se: '#ffb000' };
const SCALE = 0.1; // scene units per ångström (1 unit = 1 nm)

function Tube({ points, colors }: { points: THREE.Vector3[]; colors: string[] }) {
  const geo = useMemo(() => {
    if (points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(points);
    const seg = points.length * 6, radial = 8;
    const g = new THREE.TubeGeometry(curve, seg, 0.08, radial, false);
    const col = new Float32Array(g.attributes.position.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i <= seg; i++) {
      c.set(colors[Math.min(points.length - 1, Math.round((i / seg) * (points.length - 1)))]);
      for (let j = 0; j <= radial; j++) col.set([c.r, c.g, c.b], (i * (radial + 1) + j) * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [points, colors]);
  useEffect(() => () => geo?.dispose(), [geo]);
  return geo ? <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={0.5} /></mesh> : null;
}

function Atoms({ s, keep, radius }: { s: PdbStructure; keep: (i: number) => boolean; radius: number }) {
  const [cx, cy, cz] = useMemo(() => centroid(s.cols.xyz), [s]);
  const mesh = useMemo(() => {
    const idx = s.cols.name.map((_, i) => i).filter(keep);
    if (!idx.length) return null;
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(radius, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.45 }), idx.length);
    const o = new THREE.Object3D(), c = new THREE.Color();
    idx.forEach((i, k) => {
      o.position.set((s.cols.xyz[3 * i] - cx) * SCALE, (s.cols.xyz[3 * i + 1] - cy) * SCALE, (s.cols.xyz[3 * i + 2] - cz) * SCALE);
      o.updateMatrix(); m.setMatrixAt(k, o.matrix);
      m.setColorAt(k, c.set(EL_COLOR[s.cols.el[i]] ?? '#dddddd'));
    });
    return m;
  }, [s, keep, radius, cx, cy, cz]);
  useEffect(() => () => { mesh?.geometry.dispose(); (mesh?.material as THREE.Material | undefined)?.dispose(); }, [mesh]);
  return mesh ? <primitive object={mesh} /> : null;
}

function StructureScene({ s, rs, style, color }: { s: PdbStructure; rs: Residue[]; style: string; color: string }) {
  const [cx, cy, cz] = useMemo(() => centroid(s.cols.xyz), [s]);
  const chains = useMemo(() => [...new Set(rs.map((r) => r.chain))], [rs]);
  const tubes = useMemo(() => chains.map((ch, k) => {
    const cr = rs.filter((r) => r.chain === ch);
    return {
      ch,
      points: cr.map((r) => new THREE.Vector3((s.cols.xyz[3 * r.trace] - cx) * SCALE, (s.cols.xyz[3 * r.trace + 1] - cy) * SCALE, (s.cols.xyz[3 * r.trace + 2] - cz) * SCALE)),
      colors: cr.map((r) => (color === 'chain' ? CHAIN_COLORS[k % CHAIN_COLORS.length] : SS_COLOR[r.ss])),
    };
  }), [chains, rs, s, color, cx, cy, cz]);
  const ligand = useMemo(() => (i: number) => s.cols.het[i] === 1 && s.cols.res[i] !== 'MSE', [s]);
  const all = useMemo(() => () => true, []);
  return (
    <>
      <ambientLight intensity={0.6} /><directionalLight position={[5, 8, 6]} intensity={1.6} />
      {style === 'atoms' ? <Atoms s={s} keep={all} radius={0.075} /> : <>{tubes.map((t) => <Tube key={t.ch} points={t.points} colors={t.colors} />)}<Atoms s={s} keep={ligand} radius={0.09} /></>}
      <OrbitControls makeDefault enablePan={false} />
    </>
  );
}

export default function ProteinsView() {
  const { query } = useRoute();
  const id = ENTRIES.some((e) => e.id === query.get('id')) ? query.get('id')! : '4HHB';
  const style = query.get('style') === 'atoms' ? 'atoms' : 'trace';
  const color = query.get('color') === 'chain' ? 'chain' : 'ss';
  const [s, setS] = useState<PdbStructure | null>(null);
  useEffect(() => { let live = true; setS(null); loadStructure(id).then((x) => live && setS(x)); return () => { live = false; }; }, [id]);
  const rs = useMemo(() => (s ? residues(s) : []), [s]);
  const geo = useMemo(() => {
    if (!s) return null;
    const xyz = coords(s);
    return { ext: principalExtents(xyz).extents, rg: radiusOfGyration(xyz) };
  }, [s]);
  const seqs = useMemo(() => (s ? sequences(s) : {}), [s]);
  const frac = ssFractions(rs);
  const het = s ? heteroGroups(s) : [];
  const dna = id === '1BNA';
  return (
    <>
      <Panel id="pdb-list" className="left-panel" title="Structures">
        <ol className="life-list" aria-label="PDB entries">
          {ENTRIES.map((e) => (
            <li key={e.id}>
              <button className={`link-btn ${e.id === id ? 'active' : ''}`} onClick={() => setQuery({ id: e.id })}>{SHORT[e.id]}</button>
              <span className="note"> {e.id} · {e.resolutionA} Å · {e.organisms[0] ? e.organisms[0].toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : 'synthetic'}</span>
            </li>
          ))}
        </ol>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }} role="group" aria-label="Display">
          <button className={`chip ${style === 'trace' ? 'active' : ''}`} onClick={() => setQuery({ style: null })}>Backbone</button>
          <button className={`chip ${style === 'atoms' ? 'active' : ''}`} onClick={() => setQuery({ style: 'atoms' })}>All atoms</button>
          {style === 'trace' && <>
            <button className={`chip ${color === 'ss' ? 'active' : ''}`} onClick={() => setQuery({ color: null })}>Colour: helix/strand</button>
            <button className={`chip ${color === 'chain' ? 'active' : ''}`} onClick={() => setQuery({ color: 'chain' })}>Colour: chain</button>
          </>}
        </div>
        <p className="note" style={{ marginTop: 8 }}>
          {style === 'trace' ? <><span style={{ color: SS_COLOR.H }}>■</span> helix <span style={{ color: SS_COLOR.E }}>■</span> strand <span style={{ color: SS_COLOR.C }}>■</span> other, as assigned in the PDB file. Spheres: hetero groups (ions, haem, chromophore).</> : <>Every non-water atom: C green, N blue, O red, S yellow, P orange, Fe rust, Zn violet, Se amber. Hydrogens are not in these X-ray files.</>}
        </p>
      </Panel>
      <div className="center-stage" style={{ padding: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }} aria-label={`3D structure of ${id}`} data-loaded={s ? id : ''}>
          {s ? (
            <Viewport key={id} camera={{ position: [0, 0, Math.max(4, (geo?.ext[0] ?? 40) * SCALE * 1.6)], fov: 45 }}>
              <Suspense fallback={null}><StructureScene s={s} rs={rs} style={style} color={color} /></Suspense>
            </Viewport>
          ) : <Loading label="Loading structure" />}
        </div>
        <div className="stage-head" style={{ position: 'absolute', left: 16, top: 56, right: 16, pointerEvents: 'none' }}>
          <h1>{SHORT[id]} <ProvenanceBadge cls="observed" title="X-ray crystal structure deposited in the Protein Data Bank" /></h1>
          <p className="note" style={{ maxWidth: 560 }}>{s?.title.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())} — PDB {id}. Drag to rotate, scroll to zoom.</p>
        </div>
      </div>
      <Panel id="pdb-detail" className="right-panel" title={`PDB ${id}`}>
        {s ? (
          <>
            <dl className="kv" aria-label="Entry">
              <KV k="Molecule" v={s.molecules.map((m) => m.name.toLowerCase()).join('; ')} />
              <KV k="Organism" v={s.organisms.map((o) => o[0] + o.slice(1).toLowerCase()).join(', ') || (s.synthetic ? 'synthetic' : 'unknown')} />
              <KV k="Method" v={s.method.toLowerCase()} />
              <KV k="Resolution" v={s.resolutionA} unit="Å" />
              <KV k="Deposited" v={s.deposited} />
              <KV k="Keywords (file)" v={s.keywords.join(', ').toLowerCase()} />
            </dl>
            <p className="note">Primary citation: {s.citation.title.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())} <SourceLinks ids={[PDB_CITATION[id], 'wwpdb']} /></p>
            <h4 style={{ margin: '10px 0 4px' }}>Chains and sequences <ProvenanceBadge cls="observed" title="SEQRES records: the deposited sequence, including residues not modelled" /></h4>
            <div aria-label="Sequences">
              {Object.entries(seqs).map(([ch, sq]) => (
                <div key={ch} style={{ marginBottom: 6 }}>
                  <span className="note">chain {ch} · {sq.length} {dna ? 'nucleotides' : 'residues'}</span>
                  <p className="mono" style={{ margin: 0, fontSize: 11, wordBreak: 'break-all', letterSpacing: '0.04em' }}>{sq}</p>
                </div>
              ))}
            </div>
            <p className="note">{dna ? 'Bases' : 'One-letter amino-acid symbols (IUPAC-IUB)'}; X = a non-standard residue (e.g. selenomethionine in 1EMA). <button className="link-btn" onClick={() => navigate(dna ? '/biologic/molecules?tab=nucleic' : '/biologic/molecules')}>{dna ? 'The bases' : 'The 20 amino acids'} →</button></p>
            <h4 style={{ margin: '10px 0 4px' }}>Geometry <ProvenanceBadge cls="derived" title="Computed here from the deposited coordinates" /></h4>
            <dl className="kv" aria-label="Geometry">
              <KV k="Atoms (non-water)" v={s.atomCount} />
              <KV k="Size along principal axes" v={geo ? geo.ext.map((e) => (e / 10).toFixed(1)).join(' × ') : null} unit="nm" />
              <KV k="Radius of gyration" v={geo ? geo.rg / 10 : null} unit="nm" sig={3} />
              {!dna && <KV k="Residues in helix · strand" v={`${Math.round(frac.H * 100)} % · ${Math.round(frac.E * 100)} %`} title="Of the modelled residues, by the file's HELIX and SHEET records" />}
            </dl>
            {id === '4HHB' && <p className="note">NIGMS describes haemoglobin as “roughly 5.5 nanometers wide” <SourceLinks ids={['nigms-biobeat-nanoparticles-2023']} />; the two shorter principal extents of this structure agree. <button className="link-btn" onClick={() => navigate('/biologic?sel=haemoglobin')}>On the scale of life →</button></p>}
            {het.length > 0 && (
              <>
                <h4 style={{ margin: '10px 0 4px' }}>Hetero groups</h4>
                <ul className="life-reports" aria-label="Hetero groups" style={{ margin: 0 }}>
                  {het.map((h) => <li key={h.code} style={{ marginBottom: 2 }}><span className="mono">{h.code}</span> × {h.copies} <span className="note">{h.name ?? ''}</span></li>)}
                </ul>
              </>
            )}
            <RelatedLinks id={`structure:pdb-${id.toLowerCase()}`} />
          </>
        ) : <Loading label="Loading" />}
      </Panel>
    </>
  );
}
