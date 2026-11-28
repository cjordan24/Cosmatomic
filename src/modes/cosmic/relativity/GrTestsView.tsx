/**
 * Tests of general relativity — #/cosmic/grtests?tab=perihelion|light|gpb   (Phase 14, Gate 14.5)
 *
 *  perihelion  Einstein's eq. (75) for every planet, with JPL's elements (Mercury: 42.98″ per century; “43″”)
 *  light       eq. (74): the bending of starlight against the distance of closest approach (1.75″ at the limb;
 *              printed “1,7″”; Jupiter “etwa 0,02″”)
 *  gpb         Gravity Probe B's measured gyroscope drifts against the predictions; Kerr ISCO limits
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { CONSTANTS } from '@/core/constants/constants';
import { lightDeflectionArcsec, perihelionArcsecPerCentury, SUN_GM } from '@/core/physics/grTests';
import adv from '@datasets/astronomical/advanced.json';
import elements from '@datasets/astronomical/planet-elements.json';

const G = (adv as unknown as { gr: {
  einstein: { eq74: string; bending: string; bendingEn: string; eq75: string; eq75Words: string; mercury: string; mercuryEn: string };
  gpb: { quote: string; geodetic: number[]; frame: number[]; mission: string };
  kerr: { quote: string; schwarzschild: number };
} }).gr;
const PL = (elements as unknown as { elements: { id: string; a: number; e: number; LDot: number }[] }).elements;
const name = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
const E1916 = ['einstein-1916'];
const RSUN = CONSTANTS.Rsun.value;

function Perihelion() {
  const rows = PL.map((p) => ({ id: p.id, v: perihelionArcsecPerCentury(p.a, p.e, p.LDot) }));
  return (
    <>
      <Panel id="peri-list" className="left-panel" title="Perihelion advance (GR part)">
        <dl className="kv" aria-label="Perihelion advances">{rows.map((r) => <KV key={r.id} k={name(r.id)} v={r.v} unit="″/century" sig={3} />)}</dl>
        <p className="note">Elements a, e and the mean motion: JPL's approximate Keplerian elements. <SourceLinks ids={['jpl-approx-planets']} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Mercury's orbit turns <ProvenanceBadge cls="derived" title="Einstein's eq. (75) with JPL orbital elements" /></h1>
          <p className="note">Einstein (1916), p. 822: {G.einstein.eq75} „{G.einstein.eq75Words}“ — per orbit; a the semi-major axis, c the speed of light, e the eccentricity, T the period in seconds. „{G.einstein.mercury}“ — {G.einstein.mercuryEn} <SourceLinks ids={E1916} /></p></div>
        <LinePlot ariaLabel="Perihelion advance by planet" width={560} height={260} yLog xLabel="planet (1 Mercury … 8 Neptune)" yLabel="advance (″ per century)" series={[{ points: rows.map((r, i) => [i + 1, r.v] as [number, number]), color: '#b18cff', label: 'eq. (75)' }]} markers={rows.map((r, i) => ({ x: i + 1, y: r.v, color: i === 0 ? '#f5c76b' : '#b18cff' }))} />
        <p className="note">With today's elements eq. (75) gives {rows[0].v.toFixed(2)}″ per century for Mercury — Einstein's 43″. Only the relativistic part is computed. Einstein describes the 43″ as what the astronomers found: „einen durch Störungen der übrigen Planeten nicht erklärbaren Rest der Perihelbewegung“ — a remainder of the perihelion motion not explained by the other planets' perturbations, which are not modelled here.</p>
      </div>
      <Panel id="peri-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/cosmic/mercury')}>Mercury →</button>
        <button className="chip" onClick={() => navigate('/cosmic/relativity')}>Orbits near black holes →</button>
        <RelatedLinks id="instrument:grtests" limit={3} />
      </Panel>
    </>
  );
}

function Light() {
  const { query } = useRoute();
  const b = Math.min(20, Math.max(1, Number(query.get('b')) || 1));
  const d = lightDeflectionArcsec(SUN_GM, b * RSUN);
  const jup = lightDeflectionArcsec(CONSTANTS.GMjup.value, CONSTANTS.ReJup.value);
  return (
    <>
      <Panel id="light-controls" className="left-panel" title="A ray passing the Sun">
        <label className="slider-row"><span style={{ minWidth: 90 }}>closest pass</span><input type="range" min={1} max={20} step={0.1} value={b} aria-label="Closest approach in solar radii" onChange={(e) => setQuery({ b: e.target.value })} /><span>{b} R☉</span></label>
        <dl className="kv" aria-label="Bending values">
          <KV k="Bending" v={d} unit="″" sig={4} title="4GM/(c²Δ)" />
          <KV k="At the solar limb" v={lightDeflectionArcsec(SUN_GM, RSUN)} unit="″" sig={4} />
          <KV k="Grazing Jupiter" v={jup} unit="″" sig={2} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Starlight bends <ProvenanceBadge cls="derived" title="Einstein's eq. (74) with IAU nominal solar and jovian values" /></h1>
          <p className="note">Einstein (1916), eq. (74): {G.einstein.eq74}, with α = 2GM/c² in today's notation. „{G.einstein.bending}“ — {G.einstein.bendingEn} <SourceLinks ids={E1916} /></p></div>
        <LinePlot ariaLabel="Bending against closest approach" width={560} height={260} xLabel="closest approach (solar radii)" yLabel="bending (″)" series={[{ points: Array.from({ length: 96 }, (_, i) => { const x = 1 + i * 0.2; return [x, lightDeflectionArcsec(SUN_GM, x * RSUN)] as [number, number]; }), color: '#f5c76b', label: 'B = 4GM/c²Δ' }]} markers={[{ x: b, y: d, color: '#5cf2a6' }]} />
        <p className="note">Finding: with the IAU nominal solar radius the formula gives {lightDeflectionArcsec(SUN_GM, RSUN).toFixed(3)}″ at the limb; Einstein printed it to one decimal, 1.7″. For Jupiter it gives {jup.toFixed(3)}″ (“etwa 0,02″”).</p>
      </div>
      <Panel id="light-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/cosmic/lensing')}>Gravitational lensing →</button>
        <RelatedLinks id="instrument:grtests" limit={3} />
      </Panel>
    </>
  );
}

function Gpb() {
  const rows = [['Geodetic', G.gpb.geodetic], ['Frame dragging', G.gpb.frame]] as const;
  return (
    <>
      <Panel id="gpb-list" className="left-panel" title="Gravity Probe B">
        <dl className="kv" aria-label="Gravity Probe B results">
          {rows.map(([l, v]) => <KV key={l} k={`${l}: measured`} v={`${v[0]} ± ${v[1]}`} unit="mas/yr" />)}
          {rows.map(([l, v]) => <KV key={`${l}p`} k={`${l}: predicted`} v={String(v[2])} unit="mas/yr" />)}
          {rows.map(([l, v]) => <KV key={`${l}s`} k={`${l}: difference`} v={`${formatSig(Math.abs(v[0] - v[2]) / v[1], 2)} σ`} title="|measured − predicted| / uncertainty (derived)" />)}
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Spinning space <ProvenanceBadge cls="observed" title="Gravity Probe B results (Stanford/NASA, 2011)" /></h1>
          <p className="note">“{G.gpb.mission}” “{G.gpb.quote}” <SourceLinks ids={['gpb-stanford-2011']} /></p></div>
        <svg viewBox="0 0 560 160" role="img" aria-label="Measured against predicted gyroscope drifts" style={{ width: '100%', maxWidth: 560 }}>
          {rows.map(([l, v], i) => {
            const lo = v[2] * 1.4, hi = 0, x = (m: number) => 40 + ((m - lo) / (hi - lo)) * 480, y = 40 + i * 70;
            return <g key={l}><text x={40} y={y - 14} fontSize={12} fill="var(--text)">{l} (mas/yr)</text><line x1={40} x2={520} y1={y} y2={y} stroke="var(--line)" />
              <line x1={x(v[0] - v[1])} x2={x(v[0] + v[1])} y1={y} y2={y} stroke="#5cf2a6" strokeWidth={4} /><circle cx={x(v[0])} cy={y} r={5} fill="#5cf2a6" />
              <line x1={x(v[2])} x2={x(v[2])} y1={y - 12} y2={y + 12} stroke="#f5c76b" strokeWidth={2} /><text x={x(v[2]) + 4} y={y + 22} fontSize={11} fill="#f5c76b">predicted {v[2]}</text></g>;
          })}
        </svg>
        <p className="note">Green: measured with its uncertainty; gold: the prediction. Each axis runs from 0 to 1.4 × the prediction.</p>
      </div>
      <Panel id="gpb-detail" className="right-panel" title="Spinning black holes">
        <p className="note">The innermost stable orbit around a black hole depends on its spin: “{G.kerr.quote}”, and {G.kerr.schwarzschild}M without spin (M = GM/c²). <SourceLinks ids={['cen-song-2025']} /> The full formula (Bardeen, Press & Teukolsky 1972) is not shown: no allowed open copy of the paper could be read.</p>
        <button className="chip" onClick={() => navigate('/cosmic/compact')}>Black holes →</button>
        <RelatedLinks id="instrument:grtests" limit={3} />
      </Panel>
    </>
  );
}

const TABS: [string, string][] = [['perihelion', 'Mercury'], ['light', 'Bending light'], ['gpb', 'Gravity Probe B']];
export default function GrTestsView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'perihelion';
  return (
    <>
      <nav className="view-switch" aria-label="Relativity test sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'perihelion' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'light' ? <Light /> : tab === 'gpb' ? <Gpb /> : <Perihelion />}
    </>
  );
}
