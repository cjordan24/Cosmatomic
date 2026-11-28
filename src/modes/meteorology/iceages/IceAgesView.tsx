/**
 * Ice ages and the orbit — #/meteorology/iceages?t=<years ago>&orb=ins|ecc|obl|prec   (Phase 23, Gate 23.1)
 *
 * 800,000 years in three stacked records on one time axis: Earth's orbit and 65°N July sunshine (Berger & Loutre
 * 1991, astronomical model), atmospheric CO₂ (Bereiter et al. 2015, air in Antarctic ice) and Antarctic temperature
 * (Jouzel et al. 2007, reconstructed from deuterium). A time cursor reads all three; a scatter shows CO₂ and
 * temperature together. NASA explains the cycles; USGS and NOAA give the sea level of the last glacial maximum.
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { interp, onGrid, pearson } from '@/core/meteorology/paleo';
import data from '@datasets/meteorology/iceages.json';
import atm from '@datasets/meteorology/atmosphere.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const CO2 = D.co2.rows as [number, number][], TEMP = D.temp.rows as [number, number][], ORB = D.orbit.rows as number[][];
const ORBS: [string, string, number, string][] = [['ins', '65°N July sunshine', 4, 'W/m²'], ['ecc', 'Eccentricity', 1, ''], ['obl', 'Obliquity (tilt)', 2, '°'], ['prec', 'Climatic precession', 3, '']];
const today = (atm as any).forcing.aggi.co2ppm as number;

export default function IceAgesView() {
  const { query } = useRoute();
  const t = Math.min(800000, Math.max(0, Number(query.get('t') ?? 20000) || 0));
  const orb = ORBS.find(([k]) => k === query.get('orb')) ?? ORBS[0];
  const k = Math.min(800, Math.round(t / 1000));
  const orbSeries = useMemo(() => ORB.map((r) => [-r[0], r[orb[2]]] as [number, number]), [orb]);
  const co2S = useMemo(() => CO2.filter(([a]) => a >= 0).map(([a, v]) => [-a / 1000, v] as [number, number]), []);
  const tS = useMemo(() => TEMP.map(([a, v]) => [-a / 1000, v] as [number, number]), []);
  const grid = useMemo(() => onGrid(CO2, TEMP, 1000, 800000, 1000), []);
  const r = useMemo(() => pearson(grid.xs, grid.ys), [grid]);
  const N = D.nasa, x = -t / 1000;
  return (
    <>
      <Panel id="ia-controls" className="left-panel" title="Travel back">
        <label className="slider-row"><span style={{ minWidth: 40 }}>time</span><input type="range" min={0} max={800000} step={1000} value={t} aria-label="Years ago" onChange={(e) => setQuery({ t: e.target.value })} /><span>{formatSig(t / 1000, 3)} kyr ago</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          {[['Last Glacial Maximum', 21000], ['Last interglacial', 128000], ['Coldest point', 24000], ['Lowest CO₂', 667000]].map(([l, v]) => <button key={l as string} className="chip" onClick={() => setQuery({ t: String(v) })}>{l as string}</button>)}
        </div>
        <dl className="kv" aria-label="Records at this time">
          <KV k="65°N July sunshine" v={ORB[k][4]} unit="W/m²" sig={4} />
          <KV k="Eccentricity" v={ORB[k][1]} sig={3} /><KV k="Obliquity" v={ORB[k][2]} unit="°" sig={4} />
          <KV k="CO₂ (ice-core air)" v={interp(CO2, t)} unit="ppm" sig={3} />
          <KV k="Antarctic temperature vs last 1,000 years" v={`${interp(TEMP, t) >= 0 ? '+' : ''}${formatSig(interp(TEMP, t), 2)} °C`} />
        </dl>
        <div className="section-title">The three cycles (NASA)</div>
        <dl className="kv">{N.periods.map(([a, b]: [string, string]) => <KV key={a} k={a} v={b} />)}</dl>
        <SourceLinks ids={[N.source]} />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Ice ages and Earth's orbit <ProvenanceBadge cls="observed" title="Ice-core measurements and reconstructions on modelled age scales; orbital values from an astronomical solution" /><DepthSwitch /></h1>
          <p className="note">“{N.q[0]}” <SourceLinks ids={[N.source]} /> Left is 800,000 years ago, right is 1950.</p></div>
        <div role="radiogroup" aria-label="Orbital record" className="chip-row" style={{ gap: 4 }}>
          {ORBS.map(([key, l]) => <button key={key} role="radio" aria-checked={orb[0] === key} className={`chip ${orb[0] === key ? 'active' : ''}`} onClick={() => setQuery({ orb: key === 'ins' ? null : key })}>{l}</button>)}
        </div>
        <LinePlot ariaLabel="Orbital record" width={640} height={130} xLabel="" yLabel={orb[3] || orb[1]} series={[{ points: orbSeries, color: '#f5c76b', label: `${orb[1]} (Berger & Loutre 1991, model)` }]} vLines={[{ x, label: '', color: '#f5c76b' }]} markers={[{ x, y: ORB[k][orb[2]], color: '#f5c76b' }]} />
        <LinePlot ariaLabel="CO2 record" width={640} height={130} xLabel="" yLabel="CO₂ (ppm)" series={[{ points: co2S, color: '#82b1ff', label: 'CO₂ in Antarctic ice (Bereiter et al. 2015)' }]} vLines={[{ x, label: '', color: '#f5c76b' }]} markers={[{ x, y: interp(CO2, t), color: '#f5c76b' }]} />
        <LinePlot ariaLabel="Temperature record" width={640} height={150} xLabel="thousand years (negative = before 1950)" yLabel="ΔT (°C)" series={[{ points: tS, color: '#ff7a90', label: 'Antarctic temperature (Jouzel et al. 2007, reconstruction)' }]} vLines={[{ x, label: '', color: '#f5c76b' }]} markers={[{ x, y: interp(TEMP, t), color: '#f5c76b' }]} />
        <AtDepth level="understand">
          <p className="note">Understand — “{N.q[1]}” Obliquity: “{N.q[2]}” Precession: “{N.q[3]}” “{N.mpt}” “{N.accepted}” <SourceLinks ids={[N.source]} /></p>
          <p className="note">NASA: “{N.co2}” <SourceLinks ids={[N.co2Source]} /> Today's value (NOAA, 2025): {today} ppm, above anything in the 800,000-year record. <SourceLinks ids={['noaa-aggi']} /> “{N.models}” <SourceLinks ids={[N.co2Source]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — CO₂ is measured in air trapped in the ice ({D.co2.kind}; {D.co2.ageScale}). Temperature is {D.temp.kind}: “{D.temp.note}” Orbits: “{D.orbit.readme}” <SourceLinks ids={[D.co2.source, D.temp.source, D.orbit.source]} /> Jouzel et al.: “{D.temp.abstract}” Data extremes 173.71 ppm (about 667 kyr ago) and 298.6 ppm (about 335 kyr ago) against NASA's rounded “about 180 … to 280 ppm”. Finding: {D.temp.pagesFinding}</p>
        </AtDepth>
      </div>
      <Panel id="ia-detail" className="right-panel" title="CO₂ and temperature together">
        <svg viewBox="0 0 300 220" role="img" aria-label="CO2 against temperature" style={{ width: '100%' }}>
          {grid.xs.map((c, i) => <circle key={i} cx={30 + ((c - 170) / 135) * 260} cy={200 - ((grid.ys[i] + 11) / 17) * 190} r={1.6} fill="#82b1ff" opacity={0.5} />)}
          <circle cx={30 + ((interp(CO2, t) - 170) / 135) * 260} cy={200 - ((interp(TEMP, t) + 11) / 17) * 190} r={5} fill="#f5c76b" />
          <text x={30} y={215} fontSize={10} fill="var(--text-dim)">170 ppm</text><text x={290} y={215} textAnchor="end" fontSize={10} fill="var(--text-dim)">305 ppm</text>
          <text x={4} y={12} fontSize={10} fill="var(--text-dim)">+6 °C</text><text x={4} y={198} fontSize={10} fill="var(--text-dim)">−11 °C</text>
        </svg>
        <dl className="kv" aria-label="Correlation"><KV k="Correlation r (every 1,000 years)" v={formatSig(r, 3)} title="Pearson, our calculation; correlation alone does not show cause" /></dl>
        <p className="note">Sea level at the last glacial maximum — USGS: “{D.sea.usgs.q}” <SourceLinks ids={[D.sea.usgs.source]} /> NOAA (Olympic Coast page): “{D.sea.noaa.q}” <SourceLinks ids={[D.sea.noaa.source]} /> The Holocene began {D.holocene.q}. <SourceLinks ids={[D.holocene.source, D.holocene.usgs]} /></p>
        <button className="chip" onClick={() => navigate('/meteorology/records')}>The instrumental record →</button>
        <button className="chip" onClick={() => navigate('/meteorology/radiation?tab=forcing')}>CO₂ forcing →</button>
        <RelatedLinks id="instrument:iceages" limit={3} />
      </Panel>
    </>
  );
}
