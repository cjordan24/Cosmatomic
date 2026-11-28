/**
 * Cells — #/biologic/cells?tab=compare|scaling&part=<id>&de=<µm>&dp=<µm>&d=<µm>   (Phase 11, Gate 11.4)
 *
 *  compare   a eukaryotic (animal) and a prokaryotic cell side by side at one scale; diameters adjustable only within
 *            the ranges Inside the Cell gives (de 10–30 µm, dp 1–10 µm); nucleus (5 µm) and mitochondria (1–2 µm) to
 *            scale; positions, shapes and the number of organelles drawn are schematic. Click a part for its
 *            NIGMS and NHGRI definitions; the booklet's eukaryote/prokaryote table and volume shares.
 *  scaling   surface, volume and surface-to-volume ratio of a sphere of diameter d (geometry, derived).
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { sphereArea, sphereVolume, surfaceToVolume, volumeRatio } from '@/core/biology/cellGeometry';
import data from '@datasets/biology/cells.json';

interface Def { term: string; text: string; url?: string }
const D = data as unknown as { nigms: Def[]; nhgri: Def[]; comparison: { caption: string; rows: [string, string][]; where: string }; fractions: { id: string; label: string; share: { value: number; kind: string }; quote: string; where: string }[]; membrane: { quote: string; where: string } };
const ITC = 'nigms-inside-the-cell';

interface Part { id: string; label: string; nigms?: string; nhgri?: string; size?: string; atlas?: string; share?: string }
export const PARTS: Part[] = [
  { id: 'eukaryote', label: 'Eukaryotic cell', nigms: 'Eukaryotic cell', nhgri: 'Cell', size: 'most animal cells 10–30 µm, most plant cells 10–100 µm across (p. 7)', atlas: 'animal-cell' },
  { id: 'prokaryote', label: 'Prokaryotic cell', nigms: 'Prokaryotic cell', size: 'most are 1–10 µm across (p. 7)', atlas: 'prokaryote' },
  { id: 'membrane', label: 'Cell membrane', nigms: 'Membrane', nhgri: 'Cell Membrane (Plasma Membrane)' },
  { id: 'cytoplasm', label: 'Cytoplasm and cytosol', nigms: 'Cytoplasm', nhgri: 'Cytoplasm', share: 'cytosol' },
  { id: 'nucleus', label: 'Nucleus', nigms: 'Nucleus', nhgri: 'Nucleus', size: '5 µm diameter (p. 11)', atlas: 'nucleus', share: 'nucleus' },
  { id: 'mitochondrion', label: 'Mitochondrion', nigms: 'Mitochondrion', nhgri: 'Mitochondria', size: 'typically 1–2 µm long, up to 7 µm (p. 11)', atlas: 'mitochondrion', share: 'mito-heart' },
  { id: 'er', label: 'Endoplasmic reticulum', nigms: 'Endoplasmic reticulum (ER)', share: 'er' },
  { id: 'golgi', label: 'Golgi', nigms: 'Golgi' },
  { id: 'lysosome', label: 'Lysosome', nigms: 'Lysosome', size: '50–3,000 nm diameter (p. 11)', atlas: 'lysosome' },
  { id: 'ribosome', label: 'Ribosome', nigms: 'Ribosome', nhgri: 'Ribosome', size: '20–30 nm diameter (p. 11): below one pixel at this scale', atlas: 'ribosome' },
];
const part = (id: string | null) => PARTS.find((p) => p.id === id) ?? null;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };

/** Schematic cells at one scale (px per µm), side by side. */
function CellPair({ de, dp, sel }: { de: number; dp: number; sel: string | null }) {
  const W = 620, H = 400, gap = 30, margin = 20, LABEL_W = 190;
  const k = Math.min((W - 2 * margin - gap - LABEL_W) / de, (H - 90) / de); // px per µm; room on the right for the prokaryote and its label
  const ce = { x: margin + (de * k) / 2, y: 30 + (de * k) / 2 };
  const cp = { x: margin + de * k + gap + Math.max(dp * k, 20) / 2, y: ce.y };
  const hit = (id: string) => ({ role: 'button', tabIndex: 0, 'aria-label': part(id)!.label, style: { cursor: 'pointer' }, onClick: (e: React.MouseEvent) => { e.stopPropagation(); setQuery({ part: id }); } });
  const on = (id: string) => sel === id;
  const stroke = (id: string, base: string) => (on(id) ? 'var(--text)' : base);
  // mitochondria and lysosomes at schematic positions (deterministic ring), sizes to scale
  const ring = (n: number, r: number, phase: number) => Array.from({ length: n }, (_, i) => { const a = phase + (i * 2 * Math.PI) / n; return { x: ce.x + r * Math.cos(a), y: ce.y + r * Math.sin(a), a }; });
  const nucleusR = (5 * k) / 2;
  const mito = ring(9, (de * k) / 2 * 0.62, 0.3), lyso = ring(5, (de * k) / 2 * 0.78, 1.0);
  const barUm = de >= 20 ? 10 : 5;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="A eukaryotic and a prokaryotic cell at one scale" style={{ width: '100%', maxWidth: W }}>
      <g {...hit('eukaryote')}>
        <circle cx={ce.x} cy={ce.y} r={(de * k) / 2} fill="rgba(92,242,166,0.06)" stroke="none" />
      </g>
      <g {...hit('cytoplasm')}><circle cx={ce.x} cy={ce.y} r={(de * k) / 2 - 4} fill="rgba(92,242,166,0.05)" stroke={on('cytoplasm') ? 'var(--text)' : 'none'} strokeDasharray="3 3" /></g>
      <g {...hit('membrane')}><circle cx={ce.x} cy={ce.y} r={(de * k) / 2} fill="none" stroke={stroke('membrane', '#5cf2a6')} strokeWidth={on('membrane') ? 4 : 2.5} /></g>
      <g {...hit('er')}>
        {[1.25, 1.55, 1.85].map((f, i) => <path key={i} d={`M ${ce.x + nucleusR * f * Math.cos(2.4)} ${ce.y + nucleusR * f * Math.sin(2.4)} A ${nucleusR * f} ${nucleusR * f} 0 0 1 ${ce.x + nucleusR * f * Math.cos(4.3)} ${ce.y + nucleusR * f * Math.sin(4.3)}`} fill="none" stroke={stroke('er', '#7df9ff')} strokeWidth={2} opacity={0.8} />)}
      </g>
      <g {...hit('golgi')}>
        {[0, 1, 2].map((i) => <path key={i} d={`M ${ce.x + nucleusR * 1.5 - 14} ${ce.y + nucleusR * 1.1 + i * 5} q 14 -8 28 0`} fill="none" stroke={stroke('golgi', '#ffb347')} strokeWidth={2} />)}
      </g>
      <g {...hit('nucleus')}><circle cx={ce.x} cy={ce.y} r={nucleusR} fill="rgba(177,140,255,0.28)" stroke={stroke('nucleus', '#c9b4ff')} strokeWidth={on('nucleus') ? 3 : 1.5} /></g>
      <g {...hit('mitochondrion')}>
        {mito.map((m, i) => <ellipse key={i} cx={m.x} cy={m.y} rx={(1.5 * k) / 2} ry={(0.5 * k) / 2} transform={`rotate(${(m.a * 180) / Math.PI + 90} ${m.x} ${m.y})`} fill="rgba(255,122,144,0.5)" stroke={stroke('mitochondrion', '#ff7a90')} />)}
      </g>
      <g {...hit('lysosome')}>{lyso.map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={(0.5 * k) / 2} fill="#f5c76b" stroke={on('lysosome') ? 'var(--text)' : 'none'} />)}</g>
      <text x={ce.x} y={ce.y + (de * k) / 2 + 18} textAnchor="middle" fontSize={12} fill="var(--text-dim)">Eukaryotic (animal) cell, {de} µm</text>
      {/* prokaryote */}
      <g {...hit('prokaryote')}>
        <circle cx={cp.x} cy={cp.y} r={(dp * k) / 2} fill="rgba(125,249,255,0.12)" stroke={stroke('prokaryote', '#7df9ff')} strokeWidth={2} />
      </g>
      <text x={cp.x - Math.max(10, (dp * k) / 2)} y={cp.y + Math.max(12, (dp * k) / 2) + 18} fontSize={12} fill="var(--text-dim)">Prokaryotic cell, {formatSig(dp, 3)} µm</text>
      <text x={cp.x - Math.max(10, (dp * k) / 2)} y={cp.y + Math.max(12, (dp * k) / 2) + 33} fontSize={10.5} fill="var(--text-faint)">no nucleus, no membrane-bound organelles</text>
      {/* scale bar */}
      <line x1={W - margin - barUm * k} x2={W - margin} y1={H - 34} y2={H - 34} stroke="var(--text)" strokeWidth={2} />
      <text x={W - margin - (barUm * k) / 2} y={H - 40} textAnchor="middle" fontSize={11} fill="var(--text)">{barUm} µm</text>
      <text x={margin} y={H - 8} fontSize={10} fill="var(--text-faint)">Sizes of cells, nucleus, mitochondria and lysosomes to scale; positions, shapes and numbers schematic</text>
    </svg>
  );
}

function PartPanel({ p }: { p: Part }) {
  const ng = D.nigms.find((d) => d.term === p.nigms), nh = D.nhgri.find((d) => d.term === p.nhgri);
  const share = D.fractions.find((f) => f.id === p.share);
  return (
    <>
      <h3 style={{ margin: '4px 0' }}>{p.label}</h3>
      {p.size && <p style={{ margin: '0 0 6px' }}><strong>Size:</strong> {p.size} <SourceLinks ids={[ITC]} /></p>}
      {ng && <blockquote className="quote" data-source="nigms">“{ng.text}” <span className="note" style={{ fontStyle: 'normal' }}>— NIGMS glossary, <em>{ng.term}</em> <SourceLinks ids={['nigms-glossary']} /></span></blockquote>}
      {nh && <blockquote className="quote" data-source="nhgri">“{nh.text}” <span className="note" style={{ fontStyle: 'normal' }}>— NHGRI, <em>{nh.term}</em> <SourceLinks ids={['nhgri-glossary']} /></span></blockquote>}
      {share && <blockquote className="quote">“{share.quote}” <span className="note" style={{ fontStyle: 'normal' }}>— <em>Inside the Cell</em>, {share.where} <SourceLinks ids={[ITC]} /></span></blockquote>}
      {p.id === 'membrane' && <blockquote className="quote">“{D.membrane.quote}” <span className="note" style={{ fontStyle: 'normal' }}>— <em>Inside the Cell</em>, {D.membrane.where} <SourceLinks ids={[ITC]} /></span></blockquote>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {p.atlas && <button className="chip" onClick={() => navigate(`/biologic?sel=${p.atlas}`)}>On the scale of life →</button>}
        {p.id === 'ribosome' && <button className="chip" onClick={() => navigate('/biologic/molecules?tab=code')}>What ribosomes read: the genetic code →</button>}
      </div>
    </>
  );
}

function CompareTab() {
  const { query } = useRoute();
  const de = num(query, 'de', 30, 10, 30), dp = num(query, 'dp', Math.round(Math.sqrt(10) * 100) / 100, 1, 10);
  const p = part(query.get('part'));
  const vr = volumeRatio(de, dp);
  return (
    <>
      <Panel id="cells-controls" className="left-panel" title="Cells">
        <label className="slider-row"><span style={{ minWidth: 92 }}>animal cell</span><input type="range" min={10} max={30} step={1} value={de} aria-label="Eukaryotic cell diameter" onChange={(e) => setQuery({ de: e.target.value })} /><span>{de} µm</span></label>
        <label className="slider-row"><span style={{ minWidth: 92 }}>prokaryote</span><input type="range" min={1} max={10} step={0.01} value={dp} aria-label="Prokaryotic cell diameter" onChange={(e) => setQuery({ dp: e.target.value })} /><span>{formatSig(dp, 3)} µm</span></label>
        <p className="note">Each slider is limited to the range <em>Inside the Cell</em> gives (p. 7). Defaults: the booklet's 30 µm example cell (p. 11) and 3.16 µm, the geometric mean of 1–10 µm.</p>
        <dl className="kv" aria-label="Cell comparison">
          <KV k="Volume ratio (spheres)" v={vr} sig={3} unit="×" title="(d_e/d_p)³ for spheres" />
          <KV k="Animal-cell volume" v={sphereVolume(de)} unit="µm³ (fL)" sig={3} />
          <KV k="Prokaryote volume" v={sphereVolume(dp)} unit="µm³ (fL)" sig={3} />
        </dl>
        <ol className="life-list" aria-label="Cell parts" style={{ marginTop: 8 }}>
          {PARTS.map((x) => <li key={x.id}><button className={`link-btn ${x.id === p?.id ? 'active' : ''}`} onClick={() => setQuery({ part: x.id })}>{x.label}</button></li>)}
        </ol>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Cells <ProvenanceBadge cls="illustrative" title="Schematic drawing; the cell, nucleus, mitochondrion and lysosome sizes are to scale from NIGMS Inside the Cell" /></h1>
          <p className="note">“{D.comparison.caption}” <SourceLinks ids={[ITC]} /> Click a part of either cell.</p>
        </div>
        <CellPair de={de} dp={dp} sel={p?.id ?? null} />
        <table className="table-mini cell-compare" aria-label="Eukaryotic and prokaryotic cells">
          <thead><tr><th>Eukaryotic cells</th><th>Prokaryotic cells</th></tr></thead>
          <tbody>{D.comparison.rows.map(([a, b], i) => <tr key={i}><td>{a}</td><td>{b}</td></tr>)}</tbody>
        </table>
        <p className="note">Quoted from <em>Inside the Cell</em>, {D.comparison.where}. <SourceLinks ids={[ITC]} /></p>
      </div>
      <Panel id="cells-detail" className="right-panel" title={p ? p.label : 'Inside a cell'}>
        {p ? <PartPanel p={p} /> : (
          <>
            <p className="note">Pick a part of the drawing. How much of a cell's volume its parts take, as the booklet puts it:</p>
            <table className="table-mini" aria-label="Volume shares"><thead><tr><th>part</th><th>share of the cell's volume</th></tr></thead>
              <tbody>{D.fractions.map((f) => <tr key={f.id}><td>{f.label}</td><td>{f.share.kind} {Math.round(f.share.value * 100)} % <span className="note">({f.where})</span></td></tr>)}</tbody></table>
            <p className="note">These are separate statements about typical cells, not one cell's budget, so they need not add to 100 %. <SourceLinks ids={[ITC]} /></p>
          </>
        )}
        <RelatedLinks id="instrument:cells" limit={4} />
      </Panel>
    </>
  );
}

const MARKS: { label: string; d: number; note: string }[] = [
  { label: 'prokaryotes 1–10 µm', d: Math.sqrt(10), note: 'geometric mean of the range' },
  { label: 'animal cell 30 µm', d: 30, note: 'Inside the Cell p. 11' },
  { label: 'human egg 150 µm', d: 150, note: 'Inside the Cell p. 20' },
];
function ScalingTab() {
  const { query } = useRoute();
  const d = num(query, 'd', 10, 0.5, 200);
  const ds = Array.from({ length: 200 }, (_, i) => 10 ** (Math.log10(0.5) + (i / 199) * (Math.log10(200) - Math.log10(0.5))));
  return (
    <>
      <Panel id="scaling-controls" className="left-panel" title="Sphere">
        <label className="slider-row"><span style={{ minWidth: 70 }}>diameter</span><input type="range" min={Math.log10(0.5)} max={Math.log10(200)} step={0.01} value={Math.log10(d)} aria-label="Diameter (log scale)" onChange={(e) => setQuery({ d: (10 ** Number(e.target.value)).toPrecision(3) })} /><span>{formatSig(d, 3)} µm</span></label>
        <dl className="kv" aria-label="Sphere values">
          <KV k="Surface area πd²" v={sphereArea(d)} unit="µm²" sig={4} />
          <KV k="Volume πd³/6" v={sphereVolume(d)} unit="µm³ = fL" sig={4} />
          <KV k="Surface / volume 6/d" v={surfaceToVolume(d)} unit="µm⁻¹" sig={4} />
        </dl>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{MARKS.map((m) => <button key={m.label} className="chip" onClick={() => setQuery({ d: m.d.toPrecision(3) })}>{m.label}</button>)}</div>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Size and surface <ProvenanceBadge cls="derived" title="Geometry of a sphere" /></h1>
          <p className="note">Treat a cell as a sphere of diameter d. Its surface grows as d², its volume as d³, so every time the diameter doubles the surface per unit of volume halves: A/V = 6/d. Membranes “enclose cells and organelles and control passage of materials into and out of them” <SourceLinks ids={['nigms-glossary']} />, so a larger cell has less membrane for each unit of volume it holds. Real cells are not spheres (a red blood cell is a disc), and the marks are quoted sizes placed on the sphere curve.</p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <LinePlot ariaLabel="Surface to volume ratio" width={420} height={260} xLog yLog xLabel="diameter d (µm)" yLabel="A/V (µm⁻¹)"
              series={[{ points: ds.map((x) => [x, surfaceToVolume(x)] as [number, number]), color: '#5cf2a6', label: 'A/V = 6/d' }]}
              vLines={[...MARKS.map((m) => ({ x: m.d, label: m.label.split(' ')[0], color: '#9aa6c8' })), { x: d, label: '', color: '#f5c76b' }]} />
          </div>
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <LinePlot ariaLabel="Surface and volume" width={420} height={260} xLog yLog xLabel="diameter d (µm)" yLabel="µm² · µm³" legend="tl"
              series={[{ points: ds.map((x) => [x, sphereArea(x)] as [number, number]), color: '#7df9ff', label: 'area πd²' }, { points: ds.map((x) => [x, sphereVolume(x)] as [number, number]), color: '#ff7a90', label: 'volume πd³/6' }]}
              vLines={[{ x: d, label: '', color: '#f5c76b' }]} />
          </div>
        </div>
        <p className="note">Quoted sizes: prokaryotes 1–10 µm and animal cells 30 µm (<em>Inside the Cell</em> pp. 7, 11), human egg 150 µm (p. 20). <SourceLinks ids={[ITC]} /></p>
      </div>
      <Panel id="scaling-detail" className="right-panel" title="Scale factors against a one-micrometre sphere">
        <dl className="kv" aria-label="Scaling ratios">
          <KV k="Diameter" v={d} unit="×" sig={3} />
          <KV k="Surface" v={d * d} unit="×" sig={3} />
          <KV k="Volume" v={d ** 3} unit="×" sig={3} />
          <KV k="Surface per volume" v={1 / d} unit="×" sig={3} />
        </dl>
        <RelatedLinks id="instrument:cells" limit={4} />
      </Panel>
    </>
  );
}

export default function CellsView() {
  const { query } = useRoute();
  const tab = query.get('tab') === 'scaling' ? 'scaling' : 'compare';
  return (
    <>
      <nav className="view-switch" aria-label="Cell sections">
        <button className={tab === 'compare' ? 'active' : ''} onClick={() => setQuery({ tab: null })}>Eukaryote and prokaryote</button>
        <button className={tab === 'scaling' ? 'active' : ''} onClick={() => setQuery({ tab: 'scaling' })}>Size and surface</button>
      </nav>
      {tab === 'scaling' ? <ScalingTab /> : <CompareTab />}
    </>
  );
}
