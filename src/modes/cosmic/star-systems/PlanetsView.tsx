/**
 * Exoplanets within 10 pc — #/cosmic/stars/planets?sys=<sys>&pl=<seq>
 * Face-on orbit diagrams drawn only from published elements (with ±1σ bands on a), a mass–period
 * diagram with the Solar System for comparison, and every element with its uncertainty. Gate 5.3.
 */
import { useEffect, useMemo, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Loading, Panel, ProvenanceBadge } from '@/ui/components';
import { ScatterPlot } from '@/ui/plots';
import { SourceLinks } from '@/ui/SourcesView';
import planetPhysical from '@datasets/astronomical/planet-physical.json';
import planetElements from '@datasets/astronomical/planet-elements.json';
import { PC_IN_LY, adsUrl, distancePc, isBibcode, loadTenParsec, type NearbyObject } from './stars';
import { bestMass, elementIssues, keplerCheck, loadExoplanets, orbitPath, toEarthRadius, type Exoplanet, type WithErr } from './exoplanets';

const COLORS = ['#5cf2a6', '#7df9ff', '#f5c76b', '#ff8a5c', '#b18cff', '#ff7a90', '#9ec5ff'];
const SOLAR = ['mercury', 'venus', 'earth', 'mars', 'jupiter'] as const;
const EARTH_ID = (planetElements as unknown as { elements: { id: string }[] }).elements.find((x) => /earth|em-?bary/i.test(x.id))?.id ?? 'earth';
const SOLAR_EL = (planetElements as unknown as { elements: { id: string; a: number; e: number }[] }).elements;
const PHYS = planetPhysical as unknown as Record<string, { massKg: number; orbitalPeriodDays: number }>;

const fmtErr = (v: WithErr | null, digits = 4, scale = 1) => {
  if (!v) return null;
  const n = (x: number) => Number((x * scale).toPrecision(digits)).toString();
  const lo = v[1], hi = v[2];
  if (lo === null && hi === null) return `${n(v[0])} (no σ)`;
  if (lo !== null && hi !== null && Math.abs(lo - hi) < 1e-12) return `${n(v[0])} ± ${n(lo)}`;
  return `${n(v[0])} −${lo !== null ? n(lo) : '?'} +${hi !== null ? n(hi) : '?'}`;
};

function OrbitDiagram({ planets, solar, sel }: { planets: Exoplanet[]; solar: boolean; sel: number | null }) {
  const drawn = planets.filter((p) => p.eu?.a);
  const aMax = Math.max(...drawn.map((p) => p.eu!.a![0] * (1 + (p.eu!.e?.[0] ?? 0)) + (p.eu!.a![2] ?? 0)), solar ? 0 : 0.001);
  const extent = Math.max(aMax * 1.1, solar ? 0.42 : 0); // with the overlay, always include Mercury's orbit
  const W = 520, H = 520, s = (W / 2 - 28) / extent;
  const P = (x: number, y: number) => `${(W / 2 + x * s).toFixed(1)},${(H / 2 - y * s).toFixed(1)}`;
  const bar = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20].find((b) => b * s > 60) ?? 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="plot" role="img" aria-label="Orbit diagram" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect x={0} y={0} width={W} height={H} fill="rgba(255,255,255,0.02)" stroke="var(--line)" />
      {solar && SOLAR.map((id) => {
        const el = SOLAR_EL.find((x) => x.id === (id === 'earth' ? EARTH_ID : id));
        if (!el || el.a > extent * 1.05) return null;
        return <g key={id}><polyline points={orbitPath(el.a, el.e, 0).map(([x, y]) => P(x, y)).join(' ')} fill="none" stroke="rgba(200,200,220,0.35)" strokeDasharray="3 4" />
          <text x={W / 2 + el.a * s + 3} y={H / 2 - 3} style={{ fill: 'rgba(200,200,220,0.6)', fontSize: 9 }}>{id[0].toUpperCase() + id.slice(1)}</text></g>;
      })}
      {drawn.map((p, k) => {
        const e = p.eu!, a = e.a!, ecc = e.e?.[0] ?? 0, w = e.omega?.[0] ?? 0;
        const color = COLORS[k % COLORS.length];
        const lo = a[1] !== null ? a[0] - a[1] : null, hi = a[2] !== null ? a[0] + a[2] : null;
        const peri = orbitPath(a[0], ecc, w, 1)[0];
        return (
          <g key={p.seq} opacity={sel === null || sel === p.seq ? 1 : 0.45}>
            {lo !== null && hi !== null && hi - lo > 0 && <>
              <polyline points={orbitPath((hi + lo) / 2, ecc, w).map(([x, y]) => P(x, y)).join(' ')} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={Math.max(1, (hi - lo) * s)} />
            </>}
            <polyline points={orbitPath(a[0], ecc, w).map(([x, y]) => P(x, y)).join(' ')} fill="none" stroke={color} strokeWidth={sel === p.seq ? 2.4 : 1.5} strokeDasharray={e.e === null || (ecc > 0 && e.omega === null) ? '5 4' : undefined}
              onClick={() => setQuery({ pl: p.seq })} style={{ cursor: 'pointer' }}><title>{`${p.name}: a = ${fmtErr(a)} au${e.e ? `, e = ${fmtErr(e.e, 3)}` : ', e unknown'}`}</title></polyline>
            {ecc > 0 && e.omega && <circle cx={P(peri[0], peri[1]).split(',')[0]} cy={P(peri[0], peri[1]).split(',')[1]} r={3} fill={color} />}
            <text x={W / 2 + a[0] * s * 0.71 + 4} y={H / 2 - a[0] * s * 0.71 - 4} style={{ fill: color, fontSize: 10 }}>{p.name.split(' ').pop()}</text>
          </g>
        );
      })}
      <circle cx={W / 2} cy={H / 2} r={4} fill="#fff3c4" />
      <line x1={18} x2={18 + bar * s} y1={H - 18} y2={H - 18} stroke="var(--text)" />
      <text x={18} y={H - 24} style={{ fill: 'var(--text)', fontSize: 10 }}>{bar} au</text>
    </svg>
  );
}

function ElementTable({ p }: { p: Exoplanet }) {
  const e = p.eu;
  if (!e) return <p className="note warn">Not found in exoplanet.eu: no orbital elements are bundled for this planet. The 10 pc catalogue lists it with reference <a href={adsUrl(p.systemRef ?? '')} target="_blank" rel="noreferrer">{p.systemRef}</a>.</p>;
  const m = bestMass(e);
  const issues = elementIssues(e);
  const k = keplerCheck(e);
  return (
    <>
      <div className="section-title">Orbit <ProvenanceBadge cls="observed" title="Published elements as compiled by exoplanet.eu" /></div>
      <dl className="kv" aria-label="Orbital elements">
        <KV k="Period P" v={fmtErr(e.P, 6)} unit="d" />
        <KV k="Semi-major axis a" v={fmtErr(e.a)} unit="au" />
        <KV k="Eccentricity e" v={fmtErr(e.e, 3)} />
        <KV k="Inclination i" v={fmtErr(e.i, 4)} unit="°" title="Unknown for most radial-velocity planets" />
        <KV k="Argument of periastron ω" v={fmtErr(e.omega, 4)} unit="°" />
        <KV k="Periastron time" v={e.tperi && !issues.some((x) => x.field === 'tperi') ? fmtErr(e.tperi, 9) : null} unit="JD" />
        <KV k="RV semi-amplitude K" v={fmtErr(e.K, 3)} unit="m/s" />
      </dl>
      <div className="section-title">Planet <ProvenanceBadge cls="observed" /></div>
      <dl className="kv" aria-label="Planet properties">
        <KV k="Mass (true)" v={fmtErr(e.mass, 3)} unit="M_J" />
        <KV k="Minimum mass m sin i" v={fmtErr(e.msini, 3)} unit="M_J" />
        <KV k={m?.minimum ? 'Minimum mass in Earth masses' : 'Mass in Earth masses'} v={m?.mEarth ?? null} unit="M⊕" sig={3} title="IAU 2015 B3 nominal (GM)_J/(GM)_E" />
        <KV k="Radius" v={e.radius ? `${fmtErr(e.radius, 3)} R_J (${toEarthRadius(e.radius[0]).toFixed(2)} R⊕)` : null} />
        <KV k="Detection" v={e.detection} />
        <KV k="Mass from" v={e.massType} />
        <KV k="Discovered / record updated" v={`${e.discovered ?? '—'} / ${e.updated ?? '—'}`} />
      </dl>
      <div className="section-title">Checks <ProvenanceBadge cls="derived" /></div>
      <dl className="kv" aria-label="Consistency checks">
        <KV k="a vs Kepler’s law (P, M★)" v={k !== null ? `${k >= 0 ? '+' : ''}${(k * 100).toFixed(1)} %` : null} title={e.starMass ? `M★ = ${fmtErr(e.starMass, 3)} M☉` : 'no stellar mass'} />
      </dl>
      {issues.map((x) => <p key={x.field} className="note warn" style={{ margin: '4px 0' }}>{x.message}.</p>)}
      {m?.minimum && <p className="note" style={{ fontSize: 10.5 }}>Radial velocities measure only m sin i, because the orbit's inclination i is unknown; the true mass is larger by 1/sin i.</p>}
      <p className="note" style={{ fontSize: 10.5 }}>Values as compiled by <a href={e.url} target="_blank" rel="noreferrer">exoplanet.eu ({e.name})</a>, where each field’s original paper is listed. <SourceLinks ids={['exoplanet-eu']} />{e.matchedBy && e.matchedBy !== 'planet name' ? ` Matched by ${e.matchedBy}.` : ''}</p>
    </>
  );
}

export default function PlanetsView() {
  const { query } = useRoute();
  const [ten, setTen] = useState<NearbyObject[] | null>(null);
  const [exo, setExo] = useState<Exoplanet[] | null>(null);
  const [solar, setSolar] = useState(true);
  useEffect(() => { loadTenParsec().then(setTen); loadExoplanets().then(setExo); }, []);
  const systems = useMemo(() => {
    if (!ten || !exo) return [];
    const by = new Map<number, Exoplanet[]>();
    for (const p of exo) by.set(p.sys, [...(by.get(p.sys) ?? []), p]);
    return [...by.entries()].map(([sys, planets]) => {
      const host = ten.filter((o) => o.sys === sys && o.type !== 'exoplanet');
      return { sys, name: ten.find((o) => o.sys === sys)!.system, host, planets: planets.sort((a, b) => (a.eu?.a?.[0] ?? 99) - (b.eu?.a?.[0] ?? 99)), d: distancePc(host[0]?.plx ?? null) };
    }).sort((a, b) => (a.d ?? 99) - (b.d ?? 99));
  }, [ten, exo]);
  if (!ten || !exo) return <Loading label="Loading exoplanets" />;
  const sys = systems.find((s) => s.sys === Number(query.get('sys'))) ?? systems[0];
  const selSeq = Number(query.get('pl')) || null;
  const selPlanet = sys.planets.find((p) => p.seq === selSeq) ?? null;
  const mpPoints = exo.filter((p) => p.eu?.P && bestMass(p.eu)).map((p) => {
    const m = bestMass(p.eu!)!;
    return { key: String(p.seq), x: p.eu!.P![0], y: m.mEarth, color: p.sys === sys.sys ? '#f5c76b' : '#5cf2a6', r: p.sys === sys.sys ? 3.6 : 2.6, ring: m.minimum, title: `${p.name}: P = ${p.eu!.P![0]} d, ${m.minimum ? 'm sin i' : 'M'} = ${m.mEarth.toFixed(2)} M⊕` };
  });
  const earthKg = PHYS.earth.massKg;
  const solarPts = SOLAR.concat(['saturn', 'uranus', 'neptune'] as never).map((id: string) => ({ key: `sol-${id}`, x: PHYS[id].orbitalPeriodDays, y: PHYS[id].massKg / earthKg, color: '#c9d1e8', r: 3, title: `${id}: NASA Planetary Fact Sheet` }));
  const withEls = sys.planets.filter((p) => p.eu?.a).length;

  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{sys.name} <span className="note">· {sys.planets.length} planet{sys.planets.length > 1 ? 's' : ''} · {sys.d !== null ? `${sys.d.toFixed(3)} pc (${(sys.d * PC_IN_LY).toFixed(2)} ly)` : ''}</span></h1>
          <p className="note">Face-on view of each orbit in its own plane, star at the focus, drawn from the published a, e and ω. The shaded band spans a ± 1σ. Dashed orbits have no published e or ω, so the shape or orientation shown is a placeholder. Orbits are not to scale with the star or planets, and their orientation on the sky is unknown unless i (and the node) is published.</p></div>
        {withEls > 0 ? <OrbitDiagram planets={sys.planets} solar={solar} sel={selPlanet?.seq ?? null} /> : <p className="note warn">No orbital elements are bundled for this system.</p>}
        <label className="note" style={{ display: 'block', margin: '4px 0 12px' }}><input type="checkbox" checked={solar} onChange={(e) => setSolar(e.target.checked)} aria-label="Overlay Solar System orbits" /> Overlay the orbits of Mercury–Jupiter (JPL elements) for scale</label>
        <h2 style={{ fontWeight: 300, fontSize: 17, margin: '8px 0 4px' }}>All {exo.length} planets within 10 pc: mass against orbital period</h2>
        <ScatterPlot ariaLabel="Mass–period diagram" points={[...solarPts, ...mpPoints]} xLabel="orbital period P (days, log)" yLabel="mass (Earth masses, log)" xLog yLog xDomain={[0.3, 1e5]} yDomain={[0.1, 5000]} width={560} height={340}
          labels={solarPts.map((p) => ({ x: p.x * 1.15, y: p.y, text: p.key.slice(4, 5).toUpperCase(), color: '#c9d1e8' }))} selected={selPlanet ? String(selPlanet.seq) : null}
          onPick={(k) => { if (k.startsWith('sol-')) return; const p = exo.find((x) => x.seq === Number(k))!; setQuery({ sys: p.sys, pl: p.seq }); }} />
        <p className="note" style={{ fontSize: 10.5 }}>Hollow circles are minimum masses (m sin i). Grey: the Solar System’s planets (<SourceLinks ids={['nssdc-factsheet']} />). Planets: <SourceLinks ids={['exoplanet-eu', 'reyle-2021']} />. Unit conversion: IAU 2015 B3 nominal values <SourceLinks ids={['iau-2015-b3']} />.</p>
      </div>
      <Panel id="pl-systems" className="left-panel" title={`Planetary systems within 10 pc · ${systems.length}`}>
        <div className="mol-list" role="listbox" aria-label="Planetary systems">
          {systems.map((s) => <button key={s.sys} role="option" aria-selected={s.sys === sys.sys} className={s.sys === sys.sys ? 'active' : ''} onClick={() => setQuery({ sys: s.sys, pl: null })}><span>{s.name}</span><span className="f">{s.planets.length} · {s.d !== null ? `${(s.d * PC_IN_LY).toFixed(1)} ly` : '—'}</span></button>)}
        </div>
      </Panel>
      <Panel id="pl-info" className="right-panel" title="Planet">
        <div className="mol-list" role="listbox" aria-label="Planets in this system">
          {sys.planets.map((p) => <button key={p.seq} role="option" aria-selected={p.seq === selPlanet?.seq} className={p.seq === selPlanet?.seq ? 'active' : ''} onClick={() => setQuery({ pl: p.seq })}><span>{p.name}</span><span className="f">{p.eu?.P ? `${Number(p.eu.P[0].toPrecision(4))} d` : 'no elements'}</span></button>)}
        </div>
        {selPlanet ? <>
          <h2 style={{ margin: '10px 0 2px', fontWeight: 400 }}>{selPlanet.name}</h2>
          <ElementTable p={selPlanet} />
          <p className="note" style={{ fontSize: 10.5 }}>System reference in the 10 pc catalogue: {isBibcode(selPlanet.systemRef) ? <a href={adsUrl(selPlanet.systemRef)} target="_blank" rel="noreferrer">{selPlanet.systemRef}</a> : selPlanet.systemRef ?? '—'}</p>
        </> : <p className="note" style={{ marginTop: 8 }}>Select a planet for its elements and uncertainties.</p>}
        <button className="chip" style={{ marginTop: 8 }} onClick={() => navigate(`/cosmic/stars?sel=${sys.host[0]?.seq ?? ''}`)}>Host star on the star map →</button>
      </Panel>
    </>
  );
}
