/**
 * Compact objects and black holes — #/cosmic/compact?sel=<id>
 * Published masses and radii of white dwarfs (10 pc sample), neutron stars and black holes, the
 * Schwarzschild quantities derived from them (Gate 6.1 module), and checks against independent
 * measurements: Sirius B's gravitational redshift, the EHT shadows of Sgr A* and M87*. Gate 6.2.
 */
import { useEffect, useMemo, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { CONSTANTS } from '@/core/constants/constants';
import { schwarzschildRadius } from '@/core/physics/relativity';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { ScatterPlot, type ScatterPoint } from '@/ui/plots';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { SourceLinks } from '@/ui/SourcesView';
import { loadTenParsec, type NearbyObject } from '@/modes/cosmic/star-systems/stars';
import { CreditedImage } from '@/modes/cosmic/nebulae/NebulaeView';
import { imageForObject } from '@/modes/cosmic/nebulae/nebulae';
import { COMPACT_OBJECTS, KIND_LABEL, derive, radiusKm, shadowDiameterUas, type CompactKind, type CompactObject, type Val } from './compact';

const KIND_COLOR: Record<CompactKind, string> = { 'white-dwarf': '#9ec5ff', 'neutron-star': '#5cf2a6', 'black-hole': '#ff7a90' };
const fmtVal = (v: Val, sig = 4) => {
  const f = (x: number, n: number) => Number(x.toPrecision(n)).toLocaleString('en-US', { maximumSignificantDigits: n });
  // uncertainties to two significant figures; equal ends (within 1 %) are shown as ±
  return Math.abs(v[1] - v[2]) <= 0.01 * Math.max(v[1], v[2]) ? `${f(v[0], sig)} ± ${f(v[1], 2)}` : `${f(v[0], sig)} +${f(v[2], 2)} −${f(v[1], 2)}`;
};
const SUP: Record<string, string> = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
/** Power of ten used to display large values (10⁶ for Sgr A*, 10⁹ for M87*), or 0 below 10⁵. */
const powerOf = (m: number) => (Math.abs(m) >= 1e5 ? Math.floor(Math.log10(Math.abs(m))) : 0);
const times10 = (e: number) => ` × 10${String(e).split('').map((c) => SUP[c]).join('')}`;
/** A value with uncertainty, scaled to a shared power of ten when large. */
const fmtScaled = (v: Val, sig = 4) => { const e = powerOf(v[0]), k = 10 ** e; return e ? `${fmtVal([v[0] / k, v[1] / k, v[2] / k], sig)}${times10(e)}` : fmtVal(v, sig); };
const fmtMass = (m: number) => { const e = powerOf(m); return e ? `${Number((m / 10 ** e).toPrecision(4))}${times10(e)}` : m.toPrecision(4); };

/** Mass–radius diagram: measured radii of white dwarfs and neutron stars, horizons of black holes, and the r_s line. */
function MassRadius({ sel }: { sel: string | null }) {
  const points: ScatterPoint[] = [];
  for (const o of COMPACT_OBJECTS) {
    const R = o.kind === 'black-hole' ? derive(o).rs[0] : radiusKm(o)?.[0];
    if (R === undefined) continue;
    points.push({ key: o.id, x: o.mass[0], y: R, color: KIND_COLOR[o.kind], r: 4.5, ring: o.kind === 'black-hole', title: `${o.name}: ${o.kind === 'black-hole' ? 'horizon r_s' : 'measured radius'} ${R.toPrecision(3)} km` });
  }
  points.push({ key: 'sun', x: 1, y: CONSTANTS.Rsun.value / 1e3, color: '#fff3c4', r: 5, title: 'Sun (IAU nominal R☉)' });
  const line = (k: number) => [[0.3, (k * schwarzschildRadius(0.3 * CONSTANTS.GMsun.value)) / 1e3], [1e10, (k * schwarzschildRadius(1e10 * CONSTANTS.GMsun.value)) / 1e3]] as [number, number][];
  return (
    <ScatterPlot ariaLabel="Mass–radius diagram of compact objects" points={points} xLog yLog xDomain={[0.3, 2e10]} yDomain={[1, 1e11]} width={700} height={440}
      xLabel="mass M (M☉, log scale)" yLabel="radius R (km, log scale)" selected={sel} onPick={(k) => k !== 'sun' && setQuery({ sel: k })}
      lines={[{ points: line(1), color: '#ff7a90', label: 'R = r_s = 2GM/c² (horizon)' }, { points: line(1.5), color: '#7df9ff', dashed: true, label: 'R = 1.5 r_s (photon sphere)' }]}
      labels={[{ x: 1, y: CONSTANTS.Rsun.value / 1e3 * 2.2, text: 'Sun', color: '#fff3c4', anchor: 'middle' }, ...COMPACT_OBJECTS.filter((o) => o.kind === 'black-hole').map((o) => ({ x: o.mass[0] * (o.mass[0] > 1e9 ? 0.6 : 1.4), y: derive(o).rs[0] * 0.55, text: o.name, color: KIND_COLOR[o.kind], anchor: (o.mass[0] > 1e9 ? 'end' : 'start') as 'end' | 'start' })),
        { x: 0.45, y: 9000 * 2.5, text: 'white dwarfs', color: KIND_COLOR['white-dwarf'] }, { x: 0.45, y: 12 * 2.6, text: 'neutron stars', color: KIND_COLOR['neutron-star'] }]} />
  );
}

function Selected({ o, star }: { o: CompactObject; star: NearbyObject | null }) {
  const d = derive(o);
  const R = radiusKm(o);
  return (
    <>
      <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>{o.name}</h2>
      <div className="note">{KIND_LABEL[o.kind]}{star ? ` · ${star.spt ?? ''} · in the 10 pc sample` : ''}</div>
      {imageForObject(o.id) && <div style={{ margin: '6px 0' }}><CreditedImage img={imageForObject(o.id)!} size="large" /></div>}
      <div className="section-title">Published <ProvenanceBadge cls="observed" /></div>
      <dl className="kv stack" aria-label="Published values">
        <KV k={`Mass (${o.massInterval})`} v={`${fmtScaled(o.mass)} M☉`} />
        {o.radius && <KV k={`Radius (${o.radiusInterval})`} v={`${fmtVal(o.radius)} ${o.radiusUnit}${o.radiusUnit === 'R☉' ? ` = ${R![0].toFixed(0)} km` : ''}`} />}
        {o.distance && <KV k="Distance" v={o.distance[0] >= 1e5 ? `${fmtVal([o.distance[0] / 1e6, o.distance[1] / 1e6, o.distance[2] / 1e6])} Mpc` : `${fmtVal(o.distance)} pc`} />}
        {o.measurements.map((m) => <KV key={m.quantity} k={`${m.quantity}${m.interval ? ` (${m.interval})` : ''}`} v={m.value ? `${fmtScaled(m.value)} ${m.unit}` : null} />)}
      </dl>
      <p className="note" style={{ fontSize: 10.5 }}>Mass: {o.massMethod} <SourceLinks ids={[o.massSource]} />{o.radiusMethod && <>. Radius: {o.radiusMethod} <SourceLinks ids={[o.radiusSource!]} /></>}{o.measurements.length > 0 && <>. Other values: <SourceLinks ids={[...new Set(o.measurements.map((m) => m.source))]} /></>}. Manually transcribed.</p>
      <div className="section-title">Derived with the Schwarzschild model <ProvenanceBadge cls="derived" /></div>
      <dl className="kv stack" aria-label="Derived values">
        <KV k="Schwarzschild radius r_s" v={`${fmtScaled(d.rs, 4)} km`} />
        {o.kind === 'black-hole' && <KV k="Photon sphere / ISCO (non-rotating)" v={`${d.photonSphere.toPrecision(3)} km / ${d.isco.toPrecision(3)} km`} />}
        {R && <KV k="Radius in units of r_s" v={R[0] / d.rs[0]} sig={4} />}
        {d.compactness !== null && <KV k="Compactness GM/(Rc²)" v={d.compactness / 2} sig={3} />}
        {d.surfaceRedshiftKms !== null && <KV k="Surface redshift as a velocity cz" v={d.surfaceRedshiftKms} unit="km/s" sig={4} />}
        {d.shadowUas && <KV k="Shadow diameter 2√27 GM/(c²D)" v={`${fmtVal(d.shadowUas, 3)} µas`} />}
      </dl>
      {o.id === 'sirius-b' && d.surfaceRedshiftKms !== null && <p className="note">Check: the mass and radius predict a redshift of {d.surfaceRedshiftKms.toFixed(1)} km/s; Joyce et al. measured {o.measurements[0].value![0]} ± {o.measurements[0].value![1]} km/s in the Hα line of Sirius B <SourceLinks ids={['joyce-2018']} />. Agreement within {Math.abs(d.surfaceRedshiftKms - o.measurements[0].value![0]).toFixed(1)} km/s.</p>}
      {d.shadowUas && <p className="note">Check: the {o.shadowMassMethod} mass predicts a shadow of {d.shadowUas[0].toFixed(1)} µas for a non-rotating hole. The EHT ring is {o.measurements[0].value![0]} ± {o.measurements[0].value![1]} µas. The ring is not exactly the shadow: its size also depends on the emitting plasma, the spin and the resolution, by factors of order unity <SourceLinks ids={[o.massSource === 'eht-2019-m87-1' ? 'eht-2019-m87-1' : 'eht-2022-sgra-1']} />.</p>}
      {R && o.kind === 'neutron-star' && R[0] < d.isco && <p className="note">The ISCO ({d.isco.toFixed(1)} km) lies outside this star’s surface: matter orbiting it cannot circle stably all the way down to the surface (non-rotating approximation).</p>}
      {o.caveats.map((c) => <p key={c} className="note warn" style={{ margin: '4px 0' }}>{c}</p>)}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
        <button className="chip" onClick={() => navigate(`/cosmic/relativity?m=${o.id}`)}>Open in the Relativity view →</button>
        {o.starSeq !== null && <button className="chip" onClick={() => navigate(`/cosmic/stars?sel=${o.starSeq}`)}>Show on the star map →</button>}
      </div>
      <RelatedLinks id={o.starSeq !== null ? `star:${o.starSeq}` : `compact-object:${o.id}`} />
    </>
  );
}

export default function CompactView() {
  const { query } = useRoute();
  const sel = COMPACT_OBJECTS.find((o) => o.id === query.get('sel')) ?? null;
  const [ten, setTen] = useState<NearbyObject[] | null>(null);
  useEffect(() => { loadTenParsec().then(setTen); }, []);
  const wds = useMemo(() => (ten ?? []).filter((o) => o.type === 'white dwarf'), [ten]);
  const star = sel?.starSeq != null && ten ? ten.find((s) => s.seq === sel.starSeq) ?? null : null;
  const groups: CompactKind[] = ['white-dwarf', 'neutron-star', 'black-hole'];
  const sgr = COMPACT_OBJECTS.find((o) => o.id === 'sgr-a-star')!;
  return (
    <>
      <div className="center-stage">
        <div className="stage-head"><h1>Compact objects &amp; black holes</h1>
          <p className="note">White dwarfs, neutron stars and black holes pack a stellar mass into a small radius. Their gravity can be strong enough that Newtonian physics fails. On the diagram, measured radii (filled) sit above the line R = r_s; for black holes the radius shown is the horizon r_s itself (hollow). Click a point or a name.</p></div>
        <MassRadius sel={sel?.id ?? null} />
        <table className="table-mini" aria-label="Compact objects" style={{ width: '100%', marginTop: 8 }}>
          <thead><tr><th>Object</th><th>Type</th><th>Mass (M☉)</th><th>Radius (km)</th><th>R / r_s</th><th>Mass from</th></tr></thead>
          <tbody>
            {COMPACT_OBJECTS.map((o) => { const R = radiusKm(o), d = derive(o); return (
              <tr key={o.id} className={sel?.id === o.id ? 'active' : ''} style={sel?.id === o.id ? { background: 'rgba(177,140,255,0.16)' } : undefined}>
                <td><button className="link-btn" onClick={() => setQuery({ sel: o.id })}>{o.name}</button></td>
                <td style={{ color: KIND_COLOR[o.kind] }}>{KIND_LABEL[o.kind]}</td>
                <td>{fmtMass(o.mass[0])}</td>
                <td className={R ? '' : 'unknown'}>{R ? R[0].toPrecision(4) : o.kind === 'black-hole' ? `horizon ${d.rs[0].toPrecision(3)}` : 'unknown'}</td>
                <td>{R ? (R[0] / d.rs[0]).toPrecision(3) : o.kind === 'black-hole' ? '1' : '—'}</td>
                <td style={{ fontSize: 10.5 }}><SourceLinks ids={[o.massSource]} /></td>
              </tr>); })}
          </tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>Masses and radii are published values (transcribed). Interval types differ: most are 1σ or 68 % credible; GW150914 is 90 %. White-dwarf radii in R☉ are converted with the IAU 2015 nominal solar radius <SourceLinks ids={['iau-2015-b3']} />. r_s and the shadow use the Schwarzschild model <SourceLinks ids={['carroll-1997', 'eht-2019-m87-1']} />.</p>
        <p className="note">The shadow of Sgr A*: stellar orbits give M = {(sgr.mass[0] / 1e6).toFixed(3)} × 10⁶ M☉ at {sgr.distance![0]} pc, which predicts a {shadowDiameterUas(sgr.mass[0], sgr.distance![0]).toFixed(1)} µas shadow for a non-rotating hole. The EHT measured a {sgr.measurements[0].value![0]} µas ring.</p>
      </div>
      <Panel id="compact-list" className="left-panel" title="Compact objects">
        {groups.map((g) => (
          <div key={g}>
            <div className="section-title" style={{ color: KIND_COLOR[g] }}>{KIND_LABEL[g]}s</div>
            <ul className="note" style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-label={`${KIND_LABEL[g]}s`}>
              {COMPACT_OBJECTS.filter((o) => o.kind === g).map((o) => <li key={o.id}><button className={`link-btn ${sel?.id === o.id ? 'active' : ''}`} onClick={() => setQuery({ sel: o.id })}>{o.name}</button> · {fmtMass(o.mass[0])} M☉</li>)}
            </ul>
          </div>
        ))}
        <div className="section-title">White dwarfs within 10 pc</div>
        {!ten ? <p className="note">Loading the 10 pc catalogue…</p> : <>
          <p className="note" style={{ fontSize: 10.5 }}>{wds.length} white dwarfs in the 10 pc sample <SourceLinks ids={['reyle-2021']} />. {COMPACT_OBJECTS.filter((o) => o.starSeq !== null).length} have a published dynamical or lensing mass bundled here; for the others mass is unknown.</p>
          <ul className="note" style={{ listStyle: 'none', padding: 0, margin: 0, columns: 2, fontSize: 10.5 }} aria-label="White dwarfs within 10 pc">
            {wds.map((w) => { const c = COMPACT_OBJECTS.find((o) => o.starSeq === w.seq); return <li key={w.seq}>{c ? <button className="link-btn" onClick={() => setQuery({ sel: c.id })}>{w.name} ●</button> : <button className="link-btn" style={{ opacity: 0.75 }} onClick={() => navigate(`/cosmic/stars?sel=${w.seq}`)}>{w.name}</button>}</li>; })}
          </ul>
          <p className="note" style={{ fontSize: 10.5 }}>● has a measured mass (opens here); others open on the star map.</p>
        </>}
      </Panel>
      <Panel id="compact-info" className="right-panel" title="Selected">
        {sel ? <Selected o={sel} star={star} /> : <p className="note">Select an object on the diagram or in the list.</p>}
      </Panel>
    </>
  );
}
