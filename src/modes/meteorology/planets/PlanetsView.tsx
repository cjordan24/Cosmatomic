/**
 * Weather on other worlds — #/meteorology/planets?tab=library|compare|energy&world=<id>&cmp=<id,id,id>   (Phase 22)
 *
 *  library  eleven worlds (NSSDCA atmosphere sections; NASA, ESA mission findings tagged observation / inference /
 *           model / summary) plus quote cards for Io, Europa, Enceladus and the exoplanet WASP-39 b
 *  compare  side by side: reference level (surface vs the 1-bar level of the giants, explained), pressure,
 *           temperature, composition, molecular weight, gravity, scale height (printed and recomputed), day, tilt,
 *           sunlight, winds, clouds; pressure-with-height curves
 *  energy   black-body against observed temperature (greenhouse warming on rocky worlds), internal heat of the giants,
 *           atmospheric escape (MAVEN)
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { emittedOverAbsorbed, greenhouseK, pressureAt, scaleHeightKm } from '@/core/meteorology/planets';
import data from '@datasets/meteorology/planets.json';
import phys from '@datasets/astronomical/planet-physical.json';
import rad from '@datasets/astronomical/planet-radiation.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any, PH = phys as any, RB = (rad as any).bodies as any[];
const W = D.worlds as any[];
const COL: Record<string, string> = { rocky: '#f5c76b', giant: '#82b1ff', dwarf: '#b18cff', moon: '#5cf2a6' };
const TAG: Record<string, string> = { OBS: 'observation', INF: 'inference', MOD: 'model', EDU: 'summary' };
const tagText = (k: string) => k.split('+').map((p) => TAG[p.replace(/ \(.*\)/, '')] ?? p).join(' + ') + (k.includes('tentative') ? ' (tentative)' : '');
const radOf = (id: string) => RB.find((b) => b.id === id);
const fmtP = (bar: number) => (bar >= 0.1 ? `${formatSig(bar, 3)} bar` : bar >= 1e-4 ? `${formatSig(bar * 1000, 3)} mbar` : bar >= 1e-7 ? `${formatSig(bar * 1e6, 3)} µbar` : `${formatSig(bar, 2)} bar`);
const Related = ({ children }: { children?: React.ReactNode }) => <Panel id="pl-detail" className="right-panel" title="Related">{children}<RelatedLinks id="instrument:planet-weather" limit={3} /></Panel>;

function WorldPicker({ sel, multi }: { sel: string[]; multi?: boolean }) {
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label="Worlds" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'flex-end' }}>
      {W.map((w) => {
        const d = PH[w.id]?.diameterKm ?? (w.id === 'titan' ? 5150 : 2707), r = 6 + 4 * Math.log10(d / 1000 + 1) * 3, on = sel.includes(w.id);
        return <button key={w.id} role={multi ? 'checkbox' : 'radio'} aria-checked={on} aria-label={w.name} className="chip" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 6px', borderColor: on ? COL[w.kind] : undefined }}
          onClick={() => multi ? setQuery({ cmp: (on ? sel.filter((x) => x !== w.id) : [...sel, w.id].slice(-3)).join(',') || null }) : setQuery({ world: w.id })}>
          <span style={{ width: r * 2, height: r * 2, borderRadius: '50%', background: COL[w.kind], opacity: on ? 1 : 0.45, display: 'inline-block' }} />
          <span style={{ fontSize: 10.5 }}>{w.name}</span>
        </button>;
      })}
    </div>
  );
}

function Library() {
  const { query } = useRoute();
  const w = W.find((x) => x.id === query.get('world')) ?? W[1];
  const g = PH[w.id]?.gravityMs2, r = radOf(w.id);
  const Hc = w.mmw && g ? scaleHeightKm(w.tK, w.mmw, g) : null;
  const grs = w.grs as [number, number, string][] | undefined;
  return (
    <>
      <Panel id="pl-pick" className="left-panel" title="Worlds">
        <WorldPicker sel={[w.id]} />
        <p className="note">Disc size grows with diameter (log scale). Colour: <span style={{ color: COL.rocky }}>rocky planet</span>, <span style={{ color: COL.giant }}>giant planet</span>, <span style={{ color: COL.dwarf }}>dwarf planet</span>, <span style={{ color: COL.moon }}>moon</span>.</p>
        <div className="section-title">More worlds</div>
        {Object.entries(D.more).map(([id, m]: [string, any]) => <div key={id} style={{ marginBottom: 6 }}><b style={{ fontSize: 12 }}>{m.name}</b>{m.phen.map((p: any, i: number) => <p key={i} className="note" style={{ margin: '2px 0' }}>[{tagText(p.k)}] “{p.q}” <SourceLinks ids={[p.s]} /></p>)}</div>)}
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{w.name} <ProvenanceBadge cls="observed" title="NSSDCA fact-sheet values and mission findings; each finding tagged" /><DepthSwitch /></h1>
          <p className="note">{w.ref === '1 bar' ? <>No solid surface: values are given at the level where pressure is 1 bar. NSSDCA: “{D.factsheet.definitionsP}”</> : 'Values at the surface.'} <SourceLinks ids={[w.pSource ?? D.factsheet.source]} /></p></div>
        <dl className="kv" aria-label="Atmosphere values" style={{ maxWidth: 620 }}>
          <KV k={w.ref === '1 bar' ? 'Pressure' : 'Surface pressure'} v={w.pText} />
          <KV k={w.ref === '1 bar' ? 'Temperature' : 'Average temperature'} v={w.tText} />
          {w.H ? <KV k="Scale height (printed)" v={w.Htext ?? `${w.H} km`} /> : null}
          {Hc ? <KV k="Scale height R*T/(M g) (our check)" v={`${formatSig(Hc, 3)} km`} /> : null}
          {w.mmw ? <KV k="Mean molecular weight" v={w.mmwText ?? w.mmw} /> : null}
          {w.winds ? <KV k="Winds" v={w.winds} /> : null}
          {w.aerosols ? <KV k="Clouds and aerosols" v={w.aerosols} /> : null}
        </dl>
        {w.major.some((m: any) => m[1] != null) ? (
          <svg viewBox="0 0 600 34" role="img" aria-label="Composition" style={{ width: '100%', maxWidth: 600 }}>
            {(() => { let x = 0; return w.major.map(([gname, f]: [string, number], i: number) => { const wd = (f / 100) * 600, el = <g key={gname}><rect x={x} y={4} width={wd} height={22} fill={['#82b1ff', '#5cf2a6', '#f5c76b', '#ff7a90', '#b18cff'][i]} opacity={0.8} />{wd > 40 ? <text x={x + 6} y={20} fontSize={11} fill="#04101a">{gname} {f} %</text> : null}</g>; x += wd; return el; }); })()}
          </svg>) : null}
        <p className="note">Minor: {w.minorText}. {w.note ?? ''}</p>
        <ul aria-label="Findings" style={{ paddingLeft: 18 }}>
          {w.phen.map((p: any, i: number) => <li key={i} className="note" style={{ marginBottom: 4 }}><span style={{ color: COL[w.kind] }}>[{tagText(p.k)}]</span> “{p.q}” <SourceLinks ids={[p.s]} /></li>)}
        </ul>
        {grs ? <LinePlot ariaLabel="Great Red Spot width" width={520} height={200} xLabel="year" yLabel="long axis (miles)" series={[{ points: grs.map(([y, m]) => [y, m] as [number, number]), color: '#ff7a90', label: 'Great Red Spot' }]} /> : null}
        {grs ? <p className="note">Widths as printed by NASA (Hubble 2014; Juno 2017); the 1880 point stands for “the late 1800s”. <SourceLinks ids={w.grsSources} /></p> : null}
        <AtDepth level="understand">{w.finding ? <p className="note">Finding: {w.finding}</p> : null}</AtDepth>
        <AtDepth level="research"><p className="note">Fact sheet last updated {w.updated || '— (NASA mission pages)'}; {r ? <>Bond albedo {r.bondAlbedo}, sunlight {r.solarIrradianceWm2} W/m², black-body temperature {r.blackBodyTemperatureK} K. </> : null}<SourceLinks ids={[D.factsheet.source]} /></p></AtDepth>
      </div>
      <Related>{['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(w.id) ? <button className="chip" onClick={() => navigate(`/cosmic/${w.id}`)}>{w.name} in 3D →</button> : null}<button className="chip" onClick={() => setQuery({ tab: 'compare', cmp: `earth,${w.id}` })}>Compare with Earth →</button></Related>
    </>
  );
}

const ROWS: [string, (w: any) => string][] = [
  ['Reference level', (w) => w.ref],
  ['Pressure there', (w) => fmtP(w.pBar)],
  ['Temperature there', (w) => `${formatSig(w.tK, 3)} K`],
  ['Main gases', (w) => w.major.map(([g, f]: [string, number]) => (f != null ? `${g} ${f} %` : g)).join(', ')],
  ['Mean molecular weight', (w) => (w.mmw ? String(w.mmwText ?? w.mmw) : '—')],
  ['Gravity', (w) => (PH[w.id] ? `${PH[w.id].gravityMs2} m/s²` : '—')],
  ['Scale height (printed)', (w) => (w.H ? `${w.Htext ?? w.H + ' km'}` : '—')],
  ['Length of day', (w) => (PH[w.id] ? `${formatSig(PH[w.id].dayLengthH, 4)} h` : '—')],
  ['Axial tilt', (w) => (PH[w.id] ? `${PH[w.id].obliquityDeg}°` : '—')],
  ['Sunlight', (w) => (radOf(w.id) ? `${radOf(w.id).solarIrradianceWm2} W/m²` : '—')],
  ['Winds', (w) => w.winds ?? '—'],
  ['Clouds and aerosols', (w) => w.aerosols ?? '—'],
  ['Escape velocity', (w) => (PH[w.id] ? `${PH[w.id].escapeVelocityKms} km/s` : '—')],
];
function Compare() {
  const { query } = useRoute();
  const sel = (query.get('cmp') ?? 'venus,earth,mars').split(',').filter((id) => W.some((w) => w.id === id)).slice(0, 3);
  const ws = sel.map((id) => W.find((w) => w.id === id)!);
  const curves = useMemo(() => ws.filter((w) => w.H).map((w, i) => ({ points: Array.from({ length: 61 }, (_, k) => { const z = k * 2; return [pressureAt(w.pBar, z, w.H), z] as [number, number]; }), color: ['#f5c76b', '#82b1ff', '#ff7a90'][i], label: `${w.name} (from ${w.ref})` })), [sel.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const mixed = ws.some((w) => w.ref === '1 bar') && ws.some((w) => w.ref !== '1 bar');
  return (
    <>
      <Panel id="pl-cmp" className="left-panel" title="Pick up to three">
        <WorldPicker sel={sel} multi />
        <p className="note">Sources: NSSDCA planetary fact sheets (atmosphere sections and the comparison table); Titan and Triton from NASA pages. <SourceLinks ids={['nssdc-factsheet', 'nasa-voyager-factsheet']} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Compare atmospheres <ProvenanceBadge cls="observed" title="Fact-sheet values; curves derived" /><DepthSwitch /></h1>
          {mixed ? <p className="note" role="note" style={{ color: '#f5c76b' }}>Careful: giant planets have no solid surface, so their numbers are at the 1-bar level deep in the atmosphere, not at a surface you could stand on. NSSDCA: “{D.factsheet.definitionsT}”.</p> : null}</div>
        <table className="table-mini" aria-label="Comparison" style={{ maxWidth: 680 }}>
          <thead><tr><th></th>{ws.map((w) => <th key={w.id} style={{ color: COL[w.kind] }}>{w.name}</th>)}</tr></thead>
          <tbody>{ROWS.map(([k, f]) => <tr key={k}><td>{k}</td>{ws.map((w) => <td key={w.id}>{f(w)}</td>)}</tr>)}</tbody>
        </table>
        {curves.length ? <LinePlot ariaLabel="Pressure against height" width={560} height={260} xLog xLabel="pressure (bar, log)" yLabel="height above reference (km)" series={curves} /> : null}
        <AtDepth level="understand"><p className="note">Understand — the scale height H = R*T/(M g) sets how fast pressure falls with height: it is large for warm, light gas under weak gravity and small for cold, heavy gas under strong gravity. The curves assume one temperature all the way up (an isothermal approximation, our step), in which pressure falls by a factor e per scale height.</p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => setQuery({ tab: 'energy' })}>Energy balance →</button><button className="chip" onClick={() => navigate('/meteorology')}>Earth's atmosphere in detail →</button></Related>
    </>
  );
}

function Energy() {
  const rocky = W.filter((w) => ['venus', 'earth', 'mars'].includes(w.id));
  const giants = W.filter((w) => w.kind === 'giant');
  const I = D.internal, E = D.escape;
  return (
    <>
      <Panel id="pl-energy" className="left-panel" title="Greenhouse warming">
        <dl className="kv" aria-label="Greenhouse values">
          {rocky.map((w) => { const tb = radOf(w.id).blackBodyTemperatureK; return <KV key={w.id} k={`${w.name}: ${w.tK} K − ${tb} K`} v={`+${formatSig(greenhouseK(w.tK, tb), 3)} K`} />; })}
        </dl>
        <p className="note">Average surface temperature (planet sheets) minus black-body temperature (the temperature that would radiate away the sunlight absorbed) — our subtraction. <SourceLinks ids={['nssdc-factsheet']} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Energy, heat and escape <ProvenanceBadge cls="derived" title="Fact-sheet temperatures; differences and ratios derived" /><DepthSwitch /></h1>
          <p className="note">Venus averages 737 K, Mercury 440 K, though Venus is nearly twice as far from the Sun (fact-sheet values). NASA: “{W[1].phen[0].q}” <SourceLinks ids={[W[1].phen[0].s]} /></p></div>
        <svg viewBox="0 0 600 220" role="img" aria-label="Black-body and observed temperatures" style={{ width: '100%', maxWidth: 600 }}>
          {W.filter((w) => radOf(w.id)).map((w, i) => { const tb = radOf(w.id).blackBodyTemperatureK, x = 40 + i * 62, y = (t: number) => 200 - (t / 760) * 180; return <g key={w.id}><rect x={x} y={y(tb)} width={20} height={200 - y(tb)} fill="#9aa6c8" opacity={0.6} /><rect x={x + 22} y={y(w.tK)} width={20} height={200 - y(w.tK)} fill={COL[w.kind]} opacity={0.85} /><text x={x + 21} y={214} textAnchor="middle" fontSize={10} fill="var(--text)">{w.name}</text></g>; })}
          <text x={590} y={14} textAnchor="end" fontSize={10} fill="var(--text-dim)">grey: black-body · colour: observed (surface, or 1 bar for giants)</text>
        </svg>
        <table className="table-mini" aria-label="Internal heat" style={{ maxWidth: 560 }}>
          <thead><tr><th>giant</th><th>internal ÷ absorbed (Wang et al.)</th><th>emitted ÷ absorbed (derived)</th></tr></thead>
          <tbody>{giants.map((w) => <tr key={w.id}><td>{w.name}</td><td>{formatSig(w.internal * 100, 3)} %</td><td>{formatSig(emittedOverAbsorbed(w.internal), 3)}</td></tr>)}</tbody>
        </table>
        <p className="note">“{I.q}” <SourceLinks ids={[I.source]} /> Irwin et al. (abstract): “{I.q2}” <SourceLinks ids={[I.s2]} /></p>
        <AtDepth level="understand"><p className="note">Escape — NASA: “{E.q}” “{E.q2}” <SourceLinks ids={[E.source]} /> MAVEN at Mars: “{W[3].phen[4].q}” <SourceLinks ids={[W[3].phen[4].s]} /></p></AtDepth>
        <AtDepth level="research"><p className="note">Research — for the giants the coloured bar is the temperature at 1 bar, not a surface temperature, so the difference from black-body is not a surface greenhouse warming like the rocky planets'; the giants also give off internal heat (table). Uranus: {W.find((x) => x.id === 'uranus').finding}</p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/radiation')}>Earth's energy budget →</button><button className="chip" onClick={() => navigate('/spectral/thermal')}>Planck and Stefan–Boltzmann →</button></Related>
    </>
  );
}

const TABS: [string, string][] = [['library', 'Worlds'], ['compare', 'Compare'], ['energy', 'Energy & escape']];
export default function PlanetsView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'library';
  return (
    <>
      <nav className="view-switch" aria-label="Planets sections">{TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'library' ? null : t })}>{l}</button>)}</nav>
      {tab === 'compare' ? <Compare /> : tab === 'energy' ? <Energy /> : <Library />}
    </>
  );
}
