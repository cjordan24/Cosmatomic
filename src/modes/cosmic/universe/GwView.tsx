/**
 * Gravitational waves — #/cosmic/gw?tab=catalog|chirp|gw170817&ev=&rel=&m1=&m2=&d=&flo=&lag=&D=
 * The cumulative GWOSC catalog (masses, distances, 90 % intervals); a leading-order inspiral model checked
 * against GW150914 as read off the strain data; GW170817 with its gamma-ray burst (speed of gravity) and as a
 * standard siren (H₀ without a distance ladder). Catalog points are published values; curves are labelled
 * models. Gate 7.5.
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import {
  chirpMass, compactnessRatio, cyclesBetween, detectorFrame, distanceEstimateMpc, energyRadiatedTo, fdot, inspiralWaveform, iscoFrequency,
  lightTravelSeconds, luminosityAt, orbitalSpeedOverC, PLANCK_LUMINOSITY, pnParameter, separationAt, speedDifference, strainAmplitude, timeToCoalescence,
} from '@/core/physics/gravitationalWaves';
import { PLANCK18, redshiftAtLuminosityDistance } from '@/core/physics/cosmology';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot, ScatterPlot } from '@/ui/plots';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { SourceLinks } from '@/ui/SourcesView';
import {
  EVENTS, GW, GW150914_2016, GWTC_COSMOLOGY, RELEASE_COLOR, WITH_PARAMS, cumulative, displayName, eventByName, fmtTriple, nameDate, radiatedFromMedians, release, type GwEvent,
} from './gw';
import { ALL_H0, h0Sigma } from './ladder';
import { fmtE } from './universe';

type Tab = 'catalog' | 'chirp' | 'gw170817';
const TABS: [Tab, string][] = [['catalog', 'Catalog'], ['chirp', 'Chirp model'], ['gw170817', 'GW170817']];
const COL = { model: '#7df9ff', alt: '#b18cff', data: '#f5c76b', ok: '#5cf2a6', warn: '#ff7a90' };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const NOTABLE = ['GW150914', 'GW170817', 'GW190521', 'GW190814', 'GW200115_042309', 'GW250114_082203'];
const DEFAULT_EVENT = 'GW150914';
const releaseSources = (e: GwEvent) => [release(e.r).source, 'gwosc'];
const p3 = (x: number) => Number(x.toPrecision(3));
/** Whether each current median of GW150914 lies inside the 2016 (PRL Table I) 90 % interval. */
const withinOriginal = (e: GwEvent) => (['m1', 'm2', 'Mf', 'dL'] as const).every((k) => {
  const now = e[k], then = GW150914_2016[k];
  return !!now && !!then && now[0] >= then[0] - then[1] && now[0] <= then[0] + then[2];
});

// ------------------------------------------------------------------ catalog
function CatalogTab() {
  const { query } = useRoute();
  const hidden = new Set((query.get('rel') ?? '').split(',').filter(Boolean));
  const ev = eventByName(query.get('ev')) ?? eventByName(DEFAULT_EVENT)!;
  const shown = WITH_PARAMS.filter((e) => !hidden.has(e.r));
  const cum = useMemo(cumulative, []);
  const toggle = (key: string) => {
    const next = new Set(hidden);
    if (next.has(key)) next.delete(key); else next.add(key);
    setQuery({ rel: next.size ? [...next].join(',') : null });
  };
  const crosses = ev.m1 && ev.m2 ? [
    { points: [[ev.m1[0] - ev.m1[1], ev.m2[0]], [ev.m1[0] + ev.m1[2], ev.m2[0]]] as [number, number][], color: '#ffffff', width: 1.2 },
    { points: [[ev.m1[0], ev.m2[0] - ev.m2[1]], [ev.m1[0], ev.m2[0] + ev.m2[2]]] as [number, number][], color: '#ffffff', width: 1.2 },
  ] : [];
  const z = ev.z?.[0] ?? null;
  const zG = ev.dL ? redshiftAtLuminosityDistance(ev.dL[0], GWTC_COSMOLOGY) : null;
  const zP = ev.dL ? redshiftAtLuminosityDistance(ev.dL[0], PLANCK18) : null;
  const McDet = ev.Mc && z !== null ? detectorFrame(ev.Mc[0], z) : null;
  const Mdet = ev.M && z !== null ? detectorFrame(ev.M[0], z) : null;
  const date = nameDate(ev.n);
  const erad = radiatedFromMedians(ev);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Gravitational-wave catalog <ProvenanceBadge cls="observed" title="GWOSC event portal: medians with 90 % credible intervals from the LIGO–Virgo–KAGRA catalog papers" /></h1>
          <p className="note">Every confident compact-binary merger in the cumulative Gravitational-Wave Transient Catalog: {EVENTS.length} events, {WITH_PARAMS.length} of them with released source parameters <SourceLinks ids={['gwosc']} />. Each point is one merger at its median source-frame masses; click a point to see its 90 % credible intervals. Masses are in the source frame: the detector measures (1 + z) times larger values <SourceLinks ids={['abbott-2016-gw150914']} />.</p></div>
        <ScatterPlot ariaLabel="Component masses of the gravitational-wave events" width={680} height={400} xLog yLog xDomain={[1, 300]} yDomain={[0.8, 200]} xLabel="primary mass m₁ (M☉, source frame, log)" yLabel="secondary mass m₂ (M☉, log)"
          points={shown.map((e) => ({ key: e.n, x: e.m1![0], y: e.m2![0], color: RELEASE_COLOR[e.r], r: e.n === ev.n ? 3.4 : 2.4, title: `${displayName(e)} (${release(e.r).label}): m₁ = ${fmtTriple(e.m1)}, m₂ = ${fmtTriple(e.m2)} M☉` }))}
          lines={[{ points: [[1, 1], [200, 200]], color: '#9aa4b2', dashed: true, width: 1, label: 'm₁ = m₂' }, ...crosses]}
          selected={ev.m1 ? ev.n : null} onPick={(k) => setQuery({ ev: k })} />
        <p className="note" style={{ fontSize: 10.5 }}>Colours mark the catalog release (left panel). White bars: 90 % credible intervals of the selected event. m₂ ≤ m₁ by definition, so no point lies above the dashed line. Events without released parameters ({EVENTS.length - WITH_PARAMS.length}) are listed but not plotted.</p>
        <LinePlot ariaLabel="Cumulative number of confident detections" width={680} height={200} xDomain={[2015, Math.ceil(cum[cum.length - 1].year + 0.2)]} yDomain={[0, EVENTS.length + 10]} xLabel="date of the signal (UTC, from the event name)" yLabel="cumulative detections"
          series={[{ points: cum.map((c) => [c.year, c.count] as [number, number]), color: COL.model, width: 1.6 }]}
          markers={[{ x: date.year, y: EVENTS.indexOf(ev) + 1, label: ev.cn ?? ev.n, color: '#ffffff' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>Dates are read from the names, which follow “GWYYMMDD_hhmmss, encoding the date and UTC of the signal” <SourceLinks ids={['gwtc-3']} />. Flat stretches are gaps between observing runs.</p>
      </div>
      <Panel id="gw-cat-controls" className="left-panel" title="Releases">
        {GW.releases.map((r) => (
          <label key={r.key} className="toggle-row" title={r.note}><span><span style={{ color: RELEASE_COLOR[r.key] }}>●</span> {r.label} · {r.runs} ({r.count})</span>
            <input type="checkbox" checked={!hidden.has(r.key)} onChange={() => toggle(r.key)} aria-label={`Show ${r.label}`} /></label>
        ))}
        <p className="note" style={{ fontSize: 10.5 }}>{release('GWTC-1-confident').note} <SourceLinks ids={['gwtc-1', 'gwtc-2.1', 'gwtc-3', 'gwtc-5']} /></p>
        <div className="section-title">Event</div>
        <select aria-label="Choose an event" value={ev.n} onChange={(e) => setQuery({ ev: e.target.value })} style={{ width: '100%' }}>
          {EVENTS.map((e) => <option key={e.n} value={e.n}>{displayName(e)}{e.m1 ? '' : ' (no parameters)'}</option>)}
        </select>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {NOTABLE.map((n) => { const e = eventByName(n)!; return <button key={n} className={`chip ${ev.n === e.n ? 'active' : ''}`} onClick={() => setQuery({ ev: e.n === eventByName(DEFAULT_EVENT)!.n ? null : e.n })}>{e.cn ?? e.n.split('_')[0]}</button>; })}
        </div>
      </Panel>
      <Panel id="gw-cat-info" className="right-panel" title={displayName(ev)}>
        <dl className="kv" aria-label="Event parameters">
          <KV k="Release" v={`${release(ev.r).label}, ${release(ev.r).runs}; event version ${ev.v}`} />
          <KV k="Date (UTC, from the name)" v={date.iso} />
          <KV k="GPS time" v={ev.gps.toFixed(1)} />
          <KV k="Primary mass m₁" v={fmtTriple(ev.m1, 'M☉')} />
          <KV k="Secondary mass m₂" v={fmtTriple(ev.m2, 'M☉')} />
          <KV k="Total mass M" v={fmtTriple(ev.M, 'M☉')} />
          <KV k="Chirp mass 𝓜" v={fmtTriple(ev.Mc, 'M☉')} />
          <KV k="Final mass M_f" v={ev.MfMax !== undefined ? `≤ ${ev.MfMax} M☉ (upper bound)` : fmtTriple(ev.Mf, 'M☉')} />
          <KV k="Effective spin χ_eff" v={fmtTriple(ev.chi)} />
          <KV k="Luminosity distance d_L" v={fmtTriple(ev.dL, 'Mpc')} />
          <KV k="Redshift z" v={fmtTriple(ev.z)} />
          <KV k="Network SNR (GWOSC)" v={ev.snr} sig={3} title={GW.fields.snr} />
          <KV k="False-alarm rate" v={ev.far === null ? 'unknown' : `${fmtE(ev.far, 1)} per year`} title={GW.fields.far} />
          <KV k="p_astro" v={ev.pa} sig={3} title={GW.fields.pa} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Medians with 90 % credible intervals, source frame <SourceLinks ids={releaseSources(ev)} />. GWOSC’s SNR is not always the catalog paper’s (GWTC-5.0 Table 3 lists e.g. 76.9 for GW250114_082203 where GWOSC shows 78.6).{ev.n === 'GW170817' ? ' GWTC-1 gives the remnant mass only as an upper bound, and the redshift is that of the host galaxy NGC 4993.' : ''}</p>
        <div className="section-title">Derived here <ProvenanceBadge cls="derived" title="computed from the medians; medians of different parameters are not related exactly" /></div>
        <dl className="kv" aria-label="Derived from the medians">
          <KV k="Detector-frame chirp mass (1 + z)𝓜" v={McDet === null ? 'unknown' : `${McDet.toPrecision(4)} M☉`} />
          <KV k="Chirp mass from median m₁, m₂" v={ev.m1 && ev.m2 ? `${chirpMass(ev.m1[0], ev.m2[0]).toPrecision(4)} M☉` : 'unknown'} />
          <KV k="M − M_f (energy radiated, from medians)" v={erad === null ? 'unknown' : `${p3(erad)} M☉c²`} />
          <KV k="GW frequency at the ISCO (detector frame)" v={Mdet === null ? 'unknown' : `${iscoFrequency(Mdet).toFixed(0)} Hz`} title="test-particle estimate c³/(6^(3/2) π G M), M in the detector frame" />
          <KV k="z(d_L) in the catalog cosmology" v={zG === null ? 'unknown' : zG.toFixed(3)} title="flat ΛCDM, H₀ = 67.9, Ωm = 0.3065" />
          <KV k="z(d_L) with Planck 2018" v={zP === null ? 'unknown' : zP.toFixed(3)} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Every release converts d_L to z with flat ΛCDM, H₀ = {GW.cosmology.H0} km/s/Mpc and Ωm = {GW.cosmology.Om} (Planck 2015) <SourceLinks ids={[GW.cosmology.source]} />; the second redshift uses the Planck 2018 parameters of the Expansion view <SourceLinks ids={['planck-2018-vi', 'hogg-1999']} />.</p>
        {ev.n === 'GW150914' && <>
          <div className="section-title">GW150914: 2016 announcement and today</div>
          <table className="table-mini" aria-label="GW150914 then and now" style={{ width: '100%' }}>
            <thead><tr><th></th><th>PRL 2016</th><th>{release(ev.r).label}</th></tr></thead>
            <tbody>
              <tr><td>m₁ (M☉)</td><td>{fmtTriple(GW150914_2016.m1)}</td><td>{fmtTriple(ev.m1)}</td></tr>
              <tr><td>m₂ (M☉)</td><td>{fmtTriple(GW150914_2016.m2)}</td><td>{fmtTriple(ev.m2)}</td></tr>
              <tr><td>M_f (M☉)</td><td>{fmtTriple(GW150914_2016.Mf)}</td><td>{fmtTriple(ev.Mf)}</td></tr>
              <tr><td>d_L (Mpc)</td><td>{fmtTriple(GW150914_2016.dL)}</td><td>{fmtTriple(ev.dL)}</td></tr>
            </tbody>
          </table>
          <p className="note" style={{ fontSize: 10.5 }}>{withinOriginal(ev) ? `Every ${release(ev.r).label} median lies inside the 2016 90 % interval` : `Some ${release(ev.r).label} medians lie outside the 2016 90 % intervals`} <ProvenanceBadge cls="derived" title="compared here" /> <SourceLinks ids={[GW150914_2016.source, release(ev.r).source]} />.</p>
          <button className="chip" onClick={() => navigate('/cosmic/compact?sel=gw150914-final')}>The remnant black hole in Compact objects →</button>
        </>}
        {ev.m1 && <button className="chip" onClick={() => setQuery({ tab: 'chirp', ev: ev.n })}>Inspiral model of this event →</button>}
        {ev.n === 'GW170817' && <button className="chip" onClick={() => setQuery({ tab: 'gw170817' })}>GW170817 with light →</button>}
        <RelatedLinks id="context:gravitational-waves" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ chirp model
function ChirpTab() {
  const { query } = useRoute();
  const ev = eventByName(query.get('ev')) ?? eventByName(DEFAULT_EVENT)!;
  const base = ev.m1 && ev.m2 && ev.dL ? ev : eventByName(DEFAULT_EVENT)!;
  const m1 = num(query, 'm1', base.m1![0], 1, 200);
  const m2raw = num(query, 'm2', base.m2![0], 1, 200);
  const m2 = Math.min(m1, m2raw);
  const dL = num(query, 'd', base.dL![0], 10, 20000);
  const fLow = num(query, 'flo', 20, 10, 60);
  const custom = query.has('m1') || query.has('m2') || query.has('d');
  const z = redshiftAtLuminosityDistance(dL, GWTC_COSMOLOGY) ?? 0;
  const M = m1 + m2, Mc = chirpMass(m1, m2), McD = detectorFrame(Mc, z), MD = detectorFrame(M, z);
  const fIsco = iscoFrequency(MD);
  const tau = timeToCoalescence(McD, fLow), tauIsco = timeToCoalescence(McD, fIsco);
  const cycles = cyclesBetween(McD, fLow, fIsco);
  // show at most the last 40 cycles before the ISCO so the oscillation stays visible
  const fStart = useMemo(() => {
    if (cycles <= 40) return fLow;
    let a = fLow, b = fIsco;
    for (let i = 0; i < 60; i++) { const m = Math.sqrt(a * b); if (cyclesBetween(McD, m, fIsco) > 40) a = m; else b = m; }
    return b;
  }, [McD, fLow, fIsco, cycles]);
  const wave = useMemo(() => inspiralWaveform(McD, dL, fStart, fIsco, 2400), [McD, dL, fStart, fIsco]);
  const hMaxModel = strainAmplitude(McD, fIsco, dL);
  const fGrid = useMemo(() => Array.from({ length: 160 }, (_, i) => fLow * (fIsco / fLow) ** (i / 159)), [fLow, fIsco]);
  const B = GW.basicPhysics;
  // the basic-physics check: equal masses with 𝓜 = 30 M☉ (detector frame) at f_max = 150 Hz
  const bpM = 2 * 2 ** 0.2 * B.chirpMass.value;
  const bp = {
    equal: 2 ** 0.2 * B.chirpMass.value,
    R: separationAt(bpM, B.fMax.value) / 1000,
    ratio: compactnessRatio(bpM, B.fMax.value),
    E: energyRadiatedTo(bpM / 2, bpM / 2, B.fMax.value),
    d: distanceEstimateMpc(B.fMax.value, B.hMax.value),
    tVisible: timeToCoalescence(B.chirpMass.value, B.band.lo),
  };
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The chirp: a leading-order inspiral <ProvenanceBadge cls="derived" title="Newtonian orbit + quadrupole formula (0PN); merger and ringdown not modelled" /></h1>
          <p className="note">Two masses in a circular orbit lose energy to gravitational waves, so they spiral together and the wave’s frequency and amplitude rise: the “chirp”. To leading order the frequency evolution depends only on the chirp mass, f^(−8/3) ∝ 𝓜^(5/3)(t_c − t) <SourceLinks ids={['abbott-2017-basic-physics']} />. The model stops at the innermost stable circular orbit; the real signal continues through merger and ringdown, which need numerical relativity.</p></div>
        <LinePlot ariaLabel="Leading-order inspiral waveform" width={680} height={260} xDomain={[wave[0]?.t ?? -1, 0]} yDomain={[-hMaxModel * 1.15, hMaxModel * 1.15]} xLabel="time before coalescence t − t_c (s)" yLabel="strain h (face-on)"
          series={[{ points: wave.map((p) => [p.t, p.h] as [number, number]), color: COL.model, width: 1.1 }]}
          vLines={[{ x: -tauIsco, label: 'ISCO', color: COL.warn }]} />
        <p className="note" style={{ fontSize: 10.5 }}>h(t) = h(f) cos Φ, with f(t) from eq. 8, the phase Φ = 2π∫f dt, and the amplitude h = 4(G𝓜)^(5/3)(πf)^(2/3)/(c⁴d_L) for an observer on the orbital axis, from the quadrupole formula (eqs. 4 and A3) <SourceLinks ids={['abbott-2017-basic-physics']} /> <ProvenanceBadge cls="derived" title="derived here from the cited equations" />. {fStart > fLow ? `Only the last 40 cycles are drawn (from ${fStart.toFixed(1)} Hz); the full ${cycles.toFixed(0)} cycles from ${fLow} Hz take ${tau < 100 ? tau.toFixed(2) : tau.toFixed(0)} s.` : `Drawn from ${fLow} Hz.`} Detector-frame masses: (1 + z) × source frame.</p>
        <LinePlot ariaLabel="Frequency against time to coalescence" width={680} height={220} xLog yLog xDomain={[10 ** Math.floor(Math.log10(tauIsco * 0.5)), 10 ** Math.ceil(Math.log10(tau * 1.2))]} yDomain={[10, 10 ** Math.ceil(Math.log10(fIsco * 1.3))]} xLabel="time to coalescence t_c − t (s, log)" yLabel="GW frequency f (Hz, log)" legend="tr"
          series={[{ points: fGrid.map((f) => [timeToCoalescence(McD, f), f] as [number, number]), color: COL.model, width: 1.6, label: `𝓜 = ${McD.toPrecision(3)} M☉ (detector frame)` }]}
          hLines={[{ y: fIsco, label: `ISCO ${fIsco.toFixed(0)} Hz`, color: COL.warn }]} />
        <p className="note" style={{ fontSize: 10.5 }}>A straight line of slope −3/8: f ∝ (t_c − t)^(−3/8) (eq. 8). The LIGO/Virgo authors fitted this law to GW150914’s zero-crossings and found 𝓜 ≈ {B.chirpMassFit.value} M☉ <SourceLinks ids={[B.source]} />.</p>
      </div>
      <Panel id="gw-chirp-controls" className="left-panel" title="Binary">
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          {NOTABLE.map((n) => { const e = eventByName(n)!; return <button key={n} className={`chip ${!custom && base.n === e.n ? 'active' : ''}`} onClick={() => setQuery({ ev: e.n === eventByName(DEFAULT_EVENT)!.n ? null : e.n, m1: null, m2: null, d: null })}>{e.cn ?? e.n.split('_')[0]}</button>; })}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>{custom ? 'Custom binary.' : `Medians of ${displayName(base)} (${release(base.r).label}).`} Source-frame masses.</p>
        <label className="slider-row"><span>m₁ (M☉)</span><input type="range" min={0} max={Math.log10(200)} step={0.001} value={Math.log10(m1)} onChange={(e) => setQuery({ m1: p3(10 ** Number(e.target.value)).toString() })} aria-label="Primary mass" /><span>{m1.toPrecision(3)}</span></label>
        <label className="slider-row"><span>m₂ (M☉)</span><input type="range" min={0} max={Math.log10(200)} step={0.001} value={Math.log10(m2)} onChange={(e) => setQuery({ m2: p3(10 ** Number(e.target.value)).toString() })} aria-label="Secondary mass" /><span>{m2.toPrecision(3)}</span></label>
        <label className="slider-row"><span>d_L (Mpc)</span><input type="range" min={1} max={Math.log10(20000)} step={0.001} value={Math.log10(dL)} onChange={(e) => setQuery({ d: p3(10 ** Number(e.target.value)).toString() })} aria-label="Luminosity distance" /><span>{dL.toPrecision(3)}</span></label>
        <label className="slider-row"><span>f_low (Hz)</span><input type="range" min={10} max={60} step={1} value={fLow} onChange={(e) => setQuery({ flo: e.target.value === '20' ? null : e.target.value })} aria-label="Lowest frequency" /><span>{fLow}</span></label>
        {m2raw > m1 && <p className="note warn" style={{ fontSize: 10.5 }}>m₂ is capped at m₁ (m₁ is the heavier mass by definition).</p>}
        <p className="note" style={{ fontSize: 10.5 }}>z = {z.toFixed(3)} from d_L in the catalog cosmology <SourceLinks ids={[GW.cosmology.source]} />.</p>
      </Panel>
      <Panel id="gw-chirp-info" className="right-panel" title="Inspiral (leading order)">
        <dl className="kv" aria-label="Inspiral quantities">
          <KV k="Chirp mass 𝓜 (source / detector)" v={`${Mc.toPrecision(4)} / ${McD.toPrecision(4)} M☉`} />
          <KV k="Total mass M (detector frame)" v={`${MD.toPrecision(4)} M☉`} />
          <KV k="Mass ratio q = m₁/m₂" v={(m1 / m2).toPrecision(3)} />
          <KV k="GW frequency at the ISCO" v={`${fIsco.toFixed(1)} Hz`} title="test-particle ISCO r = 6GM/c² with Kepler’s law" />
          <KV k={`Time from ${fLow} Hz to coalescence`} v={tau < 100 ? `${tau.toFixed(3)} s` : `${tau.toFixed(0)} s`} />
          <KV k={`GW cycles ${fLow} Hz → ISCO`} v={cycles.toFixed(1)} />
          <KV k="ḟ at 100 Hz" v={`${fmtE(fdot(McD, 100), 2)} Hz/s`} />
          <KV k="Separation at the ISCO frequency" v={`${(separationAt(MD, fIsco) / 1000).toFixed(0)} km`} />
          <KV k="Orbital speed there v/c" v={orbitalSpeedOverC(MD, fIsco).toFixed(3)} />
          <KV k="Strain at the ISCO frequency (face-on)" v={fmtE(hMaxModel, 2)} />
          <KV k="GW luminosity there / Planck luminosity c⁵/G" v={fmtE(luminosityAt(detectorFrame(m1, z), detectorFrame(m2, z), fIsco) / PLANCK_LUMINOSITY, 2)} />
          <KV k="Orbital energy radiated to the ISCO" v={`${energyRadiatedTo(m1, m2, iscoFrequency(M)).toPrecision(3)} M☉c²`} title="eq. 23, source frame; a lower bound (merger and ringdown radiate more)" />
          {!custom && radiatedFromMedians(base) !== null && <KV k="Catalog M − M_f (all phases)" v={`${p3(radiatedFromMedians(base)!)} M☉c²`} />}
        </dl>
        <p className="note warn" style={{ fontSize: 10.5 }}>Validity: at the ISCO the post-Newtonian parameter x = GM/c²r is {pnParameter(MD, fIsco).toFixed(3)} and v/c ≈ {orbitalSpeedOverC(MD, fIsco).toFixed(2)}, so the leading-order formulas are only rough there; spins, eccentricity and higher harmonics are ignored <SourceLinks ids={['abbott-2017-basic-physics']} />.</p>
        <div className="section-title">GW150914 read off the data <ProvenanceBadge cls="observed" title="the paper’s order-of-magnitude values, beside the same formulas computed here" /></div>
        <table className="table-mini" aria-label="GW150914 basic physics" style={{ width: '100%' }}>
          <thead><tr><th>Quantity</th><th>Paper</th><th>Here</th></tr></thead>
          <tbody>
            <tr title={B.equalMass.note}><td>m₁ = m₂ for 𝓜 = {B.chirpMass.value} M☉</td><td>{B.equalMass.value} M☉</td><td>{bp.equal.toFixed(1)} M☉</td></tr>
            <tr title={B.separation.note}><td>separation at {B.fMax.value} Hz</td><td>{B.separation.value} km</td><td>{bp.R.toFixed(0)} km</td></tr>
            <tr title={B.compactness.note}><td>separation / Σ r_s</td><td>{B.compactness.value}</td><td>{bp.ratio.toFixed(2)}</td></tr>
            <tr title={B.energy.note}><td>energy radiated to there</td><td>∼{B.energy.value} M☉c²</td><td>{bp.E.toFixed(2)} M☉c²</td></tr>
            <tr title={B.distance.note}><td>d_L from h_max = 10⁻²¹</td><td>∼{B.distance.value} Mpc</td><td>{bp.d.toFixed(0)} Mpc</td></tr>
            <tr title={B.visibleDuration.note}><td>time from {B.band.lo} Hz to merger</td><td>≈ {B.visibleDuration.value} s visible</td><td>{bp.tVisible.toFixed(3)} s</td></tr>
          </tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>“{B.quotes[1].text}” <SourceLinks ids={[B.source]} /> The paper takes f_max ≈ {B.fMax.value} Hz and 𝓜 ≈ {B.chirpMass.value} M☉ (detector frame). Its full analysis gives the catalog values <SourceLinks ids={['abbott-2016-gw150914']} />.</p>
        <button className="chip" onClick={() => setQuery({ tab: 'catalog', ev: base.n === eventByName(DEFAULT_EVENT)!.n ? null : base.n })}>{base.cn ?? base.n} in the catalog →</button>
        <RelatedLinks id="context:gravitational-waves" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ GW170817
function Gw170817Tab() {
  const { query } = useRoute();
  const G = GW.gw170817.grb, S = GW.gw170817.siren;
  const ev = eventByName('GW170817')!;
  const lag = num(query, 'lag', 0, 0, 10);
  const D = num(query, 'D', G.distanceUsed.value, 20, 50);
  const travelDt = (delay: number) => delay - lag; // GW lead in travel time, if the GRB left `lag` s after the merger
  const dv = speedDifference(travelDt(G.delay.value), D);
  const upper = speedDifference(G.delay.value + G.delay.sigma, G.distanceUsed.value);
  const lower = speedDifference(G.delay.value - G.delay.sigma - G.emissionLagAssumed.value, G.distanceUsed.value);
  const lags = Array.from({ length: 41 }, (_, i) => i * 0.25);
  const ratio = S.hubbleVelocity.value / S.distance.value;
  const h0s = [
    { label: 'GW170817 standard siren', value: S.H0.value, lo: S.H0.minus, hi: S.H0.plus, color: COL.data, src: S.source },
    ...S.compared.map((c) => ({ label: `${c.label} (quoted)`, value: c.value, lo: c.sigma, hi: c.sigma, color: '#9aa4b2', src: S.source })),
    ...ALL_H0.filter((m) => ['planck-2018', 'sh0es-2022'].includes(m.id)).map((m) => ({ label: `${m.label} (Distance ladder view)`, value: m.value, lo: h0Sigma(m), hi: h0Sigma(m), color: COL.alt, src: m.source })),
  ];
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>GW170817: gravitational waves and light <ProvenanceBadge cls="observed" title="published delay, distances, velocities and H₀; the curves are the paper’s relation evaluated here" /></h1>
          <p className="note">A binary neutron-star merger, also seen as the gamma-ray burst GRB 170817A {G.delay.value} s after the merger time. “{G.quotes[0].text}” <SourceLinks ids={[G.source]} /> Two consequences are worked through here: how closely gravity and light travel at the same speed, and the Hubble constant without a distance ladder.</p></div>
        <LinePlot ariaLabel="Speed difference against assumed emission lag" width={680} height={240} xDomain={[0, 10]} yDomain={[-4e-15, 1.5e-15]} xLabel="assumed delay between merger and gamma-ray emission (s)" yLabel="Δv / v_EM"
          series={[{ points: lags.map((l) => [l, speedDifference(G.delay.value - l, D)] as [number, number]), color: COL.model, width: 1.6, label: `D = ${D} Mpc` }]}
          hLines={[{ y: G.bounds.upper, label: `published upper bound ${fmtE(G.bounds.upper, 0)}`, color: COL.ok }, { y: G.bounds.lower, label: `published lower bound ${fmtE(G.bounds.lower, 0)}`, color: COL.ok }, { y: 0, label: 'v_GW = v_EM', color: '#9aa4b2' }]}
          markers={[{ x: lag, y: dv, label: fmtE(dv, 1), color: '#ffffff' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>{G.relation} <SourceLinks ids={[G.source]} /> The bounds come from two extreme assumptions: both signals left together (all of the {G.delay.value} + {G.delay.sigma} s is a speed difference), or the gamma rays left {G.emissionLagAssumed.value} s after the merger. The distance is the low end of the GW distance interval, the conservative choice.</p>
        <LinePlot ariaLabel="Hubble constant measurements" width={680} height={230} xDomain={[0.5, h0s.length + 0.5]} yDomain={[55, 90]} xLabel="measurement (see list)" yLabel="H₀ (km/s/Mpc)"
          series={[]} errorBars={h0s.map((m, i) => ({ x: i + 1, y: m.value, lo: m.lo, hi: m.hi, color: m.color, title: `${m.label}: ${m.value} +${m.hi.toPrecision(3)} / −${m.lo.toPrecision(3)}` }))} />
        <ol className="note" style={{ fontSize: 10.5, margin: '4px 0 0 18px' }} aria-label="Hubble constant list">
          {h0s.map((m) => <li key={m.label}>{m.label}: {m.value} {m.lo === m.hi ? `± ${m.lo.toPrecision(3)}` : `+${m.hi} / −${m.lo}`} <SourceLinks ids={[m.src]} /></li>)}
        </ol>
        <p className="note" style={{ fontSize: 10.5 }}>The siren interval is 68.3 % (maximum a posteriori, minimal width); the others are 1σ. “{S.quotes[0].text}” <SourceLinks ids={[S.source]} /></p>
      </div>
      <Panel id="gw-817-controls" className="left-panel" title="Speed of gravity">
        <label className="slider-row"><span>emission lag (s)</span><input type="range" min={0} max={10} step={0.05} value={lag} onChange={(e) => setQuery({ lag: e.target.value === '0' ? null : e.target.value })} aria-label="Emission lag" /><span>{lag.toFixed(2)}</span></label>
        <label className="slider-row"><span>D (Mpc)</span><input type="range" min={20} max={50} step={0.5} value={D} onChange={(e) => setQuery({ D: Number(e.target.value) === G.distanceUsed.value ? null : e.target.value })} aria-label="Distance" /><span>{D}</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          <button className={`chip ${lag === 0 && D === G.distanceUsed.value ? 'active' : ''}`} onClick={() => setQuery({ lag: null, D: null })}>simultaneous emission</button>
          <button className={`chip ${lag === G.emissionLagAssumed.value ? 'active' : ''}`} onClick={() => setQuery({ lag: String(G.emissionLagAssumed.value), D: null })}>gamma rays 10 s later</button>
          <button className={`chip ${ev.dL && D === ev.dL[0] ? 'active' : ''}`} onClick={() => setQuery({ D: String(ev.dL![0]) })}>median d_L ({ev.dL![0]} Mpc)</button>
        </div>
        <dl className="kv" aria-label="Speed-of-gravity bounds">
          <KV k="Observed delay (GRB after GW)" v={`${G.delay.value} ± ${G.delay.sigma} s`} title={G.delay.interval} />
          <KV k="Light travel time over D" v={`${fmtE(lightTravelSeconds(D), 3)} s (${(lightTravelSeconds(D) / 3.15576e7 / 1e6).toFixed(1)} Myr)`} />
          <KV k="Δv / v_EM at these settings" v={fmtE(dv, 2)} />
          <KV k="Upper bound recomputed" v={fmtE(upper, 2)} title="(1.74 + 0.05) s, simultaneous emission, D = 26 Mpc" />
          <KV k="Lower bound recomputed" v={fmtE(lower, 2)} title="(1.74 − 0.05 − 10) s, D = 26 Mpc" />
          <KV k="Published" v={`${fmtE(G.bounds.lower, 0)} to +${fmtE(G.bounds.upper, 0)}`} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Delay: {G.delay.interval}. {G.distanceUsed.note} <SourceLinks ids={[G.source]} /></p>
      </Panel>
      <Panel id="gw-817-info" className="right-panel" title="Standard siren">
        <dl className="kv" aria-label="Standard-siren values">
          <KV k="GW distance (sky position fixed)" v={`${S.distance.value} +${S.distance.plus} / −${S.distance.minus} Mpc`} title={S.distance.interval} />
          <KV k="Tully–Fisher distance to NGC 4993" v={`${S.tullyFisher.value} ± ${S.tullyFisher.sigma} Mpc`} title={S.tullyFisher.note} />
          <KV k="ESO-508 group velocity (CMB frame)" v={`${S.groupVelocity.value} ± ${S.groupVelocity.sigma} km/s`} />
          <KV k="Bulk-flow correction" v={`${S.bulkFlow.value} ± ${S.bulkFlow.sigma} km/s`} title={S.bulkFlow.note} />
          <KV k="Hubble-flow velocity v_H" v={`${S.hubbleVelocity.value} ± ${S.hubbleVelocity.sigma} km/s`} />
          <KV k="v_H / d (simple ratio, derived)" v={`${ratio.toFixed(1)} km/s/Mpc`} />
          <KV k="H₀ (Bayesian posterior)" v={`${S.H0.value} +${S.H0.plus} / −${S.H0.minus} km/s/Mpc`} title={S.H0.interval} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>H₀ = v_H/d at these small distances (eq. 1). The simple ratio of the two central values differs from the posterior, which marginalises over the inclination (cos ι between {S.cosIota.lo} and {S.cosIota.hi}, {S.cosIota.interval}) and the velocities. “{S.quotes[1].text}” <SourceLinks ids={[S.source]} /></p>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          <button className="chip" onClick={() => navigate('/cosmic/ladder?tab=h0')}>H₀ from the distance ladder →</button>
          <button className="chip" onClick={() => navigate(`/cosmic/universe?m=custom&H0=${S.H0.value}`)}>Expansion with H₀ = {S.H0.value} →</button>
          <button className="chip" onClick={() => setQuery({ tab: 'catalog', ev: 'GW170817' })}>GW170817 in the catalog →</button>
        </div>
        <RelatedLinks id="context:gravitational-waves" />
      </Panel>
    </>
  );
}

export default function GwView() {
  const { query } = useRoute();
  const tab: Tab = (TABS.find(([t]) => t === query.get('tab'))?.[0]) ?? 'catalog';
  return (
    <>
      <nav className="view-switch" aria-label="Gravitational-wave sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'catalog' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'chirp' ? <ChirpTab /> : tab === 'gw170817' ? <Gw170817Tab /> : <CatalogTab />}
    </>
  );
}
