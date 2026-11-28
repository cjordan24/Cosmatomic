/**
 * Future Earth and climate modelling — #/meteorology/future?tab=kinds|levels|sea|earth|known   (Gate 24.2)
 *
 *  kinds   observation, forecast, prediction, projection, scenario, statistical vs physics models, ESMs, ensembles;
 *          NCA5's five scenarios and how projections are built
 *  levels  pick a global warming level: only the statements NCA5 ties to that level, with their likelihood words;
 *          the 2 °C timing window and the current-policy range for 2100
 *  sea     NOAA's five sea-level scenarios (Sweet et al. 2022) for the globe or the contiguous US, and NCA5's chance
 *          of exceeding each one at each warming level
 *  earth   ocean pH (a 2010 study), ice sheets, permafrost carbon, water and ecosystems
 *  known   well-constrained vs under investigation: climate sensitivity ranges and possible tipping elements
 *
 * Rule: every projected number carries its scenario or warming level, its range, its baseline and the word
 * “projection” — never shown as what will happen.
 */
import { setQuery, navigate, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { f2c, hydrogenRatio, m2ft, usWarmingF } from '@/core/meteorology/future';
import data from '@datasets/meteorology/future.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const ON = '#82b1ff', WARM = '#ff7a90', GOLD = '#f5c76b', COOL = '#5cf2a6';
const SC_COL = ['#5cf2a6', '#82b1ff', '#f5c76b', '#ff9f6b', '#ff7a90'];
const Related = ({ children }: { children?: React.ReactNode }) => <Panel id="fu-detail" className="right-panel" title="Related">{children}<RelatedLinks id="instrument:future" limit={3} /></Panel>;
const Conditional = () => <p className="note" role="note" aria-label="Projection notice" style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 8 }}>Projections, not predictions: each value below is conditional on the scenario or warming level shown with it. “{D.framing.conditional}” <SourceLinks ids={[D.framing.s]} /></p>;

function Kinds() {
  const { query } = useRoute();
  const K = D.kinds, k = K.find((x: any) => x.id === query.get('kind')) ?? K[4];
  const M = D.models;
  return (
    <>
      <Panel id="fu-k" className="left-panel" title="What kind of statement?">
        <div role="listbox" aria-label="Kinds of statement" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {K.map((x: any) => <button key={x.id} role="option" aria-selected={x.id === k.id} className={`chip ${x.id === k.id ? 'active' : ''}`} style={{ textAlign: 'left' }} onClick={() => setQuery({ kind: x.id })}>{x.name}</button>)}
        </div>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Forecasts, projections and scenarios <ProvenanceBadge cls="illustrative" title="Definitions from the NCA5 glossary, NOAA GFDL and NASA" /><DepthSwitch /></h1></div>
        <div aria-label="Definition" style={{ maxWidth: 640 }}>
          <div className="section-title">{k.name}</div>
          <p className="note">“{k.q}” <SourceLinks ids={[k.s]} /></p>
          {k.note ? <p className="note">{k.note}</p> : null}
          {k.alt ? <p className="note">Also: “{k.alt.q}” <SourceLinks ids={[k.alt.s]} /></p> : null}
          {k.id === 'weather' ? <p className="note">The two agencies give different time scales for weather: minutes to days (NCA5) and minutes to weeks (NASA).</p> : null}
        </div>
        <div className="section-title">The scenarios NCA5 uses</div>
        <table className="table-mini" aria-label="Scenarios" style={{ fontSize: 12, maxWidth: 640 }}>
          <thead><tr><th>Name</th><th>CMIP5</th><th>CMIP6</th><th>Described as</th></tr></thead>
          <tbody>{D.framing.scenarios.map((s: any) => <tr key={s.id}><td>{s.name}</td><td>{s.cmip5 ?? '—'}</td><td>{s.cmip6}</td><td>“{s.q}”</td></tr>)}</tbody>
        </table>
        <p className="note">“{D.framing.notPredictions}” <SourceLinks ids={[D.framing.s]} /></p>
        <AtDepth level="understand">
          <div className="section-title">How a projection is built</div>
          <p className="note">“{M.chain.q}” <SourceLinks ids={[M.chain.s]} /></p>
          <p className="note">GFDL: “{M.gcm}” “{M.param}” “{M.ensemble}” <SourceLinks ids={[M.gfdlS]} /></p>
          <p className="note">Naming: “{D.framing.naming.q}” <SourceLinks ids={[D.framing.naming.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">“{M.hindcast}” “{M.scale}” <SourceLinks ids={[M.gfdlS]} /> “{M.resolution.q}” Emergent constraints: “{M.emergent.q}” <SourceLinks ids={[M.resolution.s]} /> For NCA5: “{M.nca5.q}”; “{M.nca5.hot}” <SourceLinks ids={[M.nca5.s]} /></p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/records')}>The observed record →</button><button className="chip" onClick={() => navigate('/meteorology/storms')}>Weather: the storm lab →</button></Related>
    </>
  );
}

const LEVELS = [1.5, 2, 2.5, 3, 4];
function Levels() {
  const { query } = useRoute();
  const W = D.warming, g = LEVELS.includes(Number(query.get('gwl'))) ? Number(query.get('gwl')) : 2;
  const items = W.byLevel.filter((b: any) => b.gwl === g);
  const us = usWarmingF(g, W.us2);
  const col = D.sea.exceedCols.findIndex((c: string) => parseFloat(c) === g);
  const yr = [2020, 2110];
  const x = (y: number) => 40 + ((y - yr[0]) / (yr[1] - yr[0])) * 540;
  return (
    <>
      <Panel id="fu-l" className="left-panel" title="Choose a warming level">
        <div role="radiogroup" aria-label="Global warming level" className="chip-row" style={{ gap: 4 }}>
          {LEVELS.map((l) => <button key={l} role="radio" aria-checked={g === l} className={`chip ${g === l ? 'active' : ''}`} onClick={() => setQuery({ gwl: l === 2 ? null : String(l) })}>{l} °C</button>)}
        </div>
        <p className="note">Above the 1850–1900 average. “{W.now}” <SourceLinks ids={[W.s]} /></p>
        <dl className="kv" aria-label="US warming">
          <KV k={`US average at ${g} °C`} v={us ? `+${formatSig(us.lo, 2)} to +${formatSig(us.hi, 2)} °F (${formatSig(f2c(us.lo), 2)}–${formatSig(f2c(us.hi), 2)} °C)${us.derived ? ' — our extrapolation' : ''}` : 'not stated for this level'} />
        </dl>
        {us?.derived ? <p className="note">Derived from NCA5’s 2 °C range plus “around 2.5°F” per additional 1 °C — not a printed value.</p> : null}
        <p className="note">“{D.framing.oneYear}” <SourceLinks ids={[D.framing.s]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>At {g} °C of global warming <ProvenanceBadge cls="simulated" title="CMIP6 projections by warming level (NCA5); likelihood words as printed" /><DepthSwitch /></h1>
          <Conditional /></div>
        <ul aria-label="Projections at this level" style={{ fontSize: 13, paddingLeft: 18, maxWidth: 640 }}>
          {items.length ? items.map((b: any) => <li key={b.topic + b.v}><b>{b.topic}</b>: {b.v} — “{b.q}” <SourceLinks ids={[b.s ?? W.s]} /></li>) : <li>NCA5 ties no specific statement to {g} °C; see the neighbouring levels.</li>}
          {col >= 0 ? <li><b>Sea level, chance of exceeding each scenario in 2100</b>: {D.sea.scenarios.map((s: any) => `${s.name} ${D.sea.exceed[s.id][col]}`).join(' · ')} <SourceLinks ids={[D.sea.s2]} /></li> : null}
        </ul>
        <div className="section-title">When — and whether — 2 °C is reached</div>
        <svg viewBox="0 0 620 110" role="img" aria-label="Timing of 2 °C" style={{ width: '100%', maxWidth: 620 }}>
          <line x1={40} x2={580} y1={80} y2={80} stroke="var(--text-dim)" />
          {[2020, 2040, 2060, 2080, 2100].map((y) => <g key={y}><line x1={x(y)} x2={x(y)} y1={76} y2={84} stroke="var(--text-dim)" /><text x={x(y)} y={98} fontSize={10} textAnchor="middle" fill="var(--text-dim)">{y}</text></g>)}
          <rect x={x(W.cross2.from)} y={22} width={x(W.cross2.to) - x(W.cross2.from)} height={18} fill={WARM} opacity={0.6} rx={3} />
          <line x1={x(W.cross2.mean)} x2={x(W.cross2.mean)} y1={18} y2={44} stroke="var(--text)" strokeWidth={2} />
          <text x={x(W.cross2.to) + 6} y={30} fontSize={11} fill="var(--text)">2 °C crossed {W.cross2.from}–{W.cross2.to} (mean {W.cross2.mean})</text>
          <text x={x(W.cross2.to) + 6} y={44} fontSize={11} fill="var(--text-dim)">very high scenario ({W.cross2.scenario})</text>
          <text x={x(2020)} y={62} fontSize={11} fill="var(--text)">Low scenario (SSP1-2.6): very likely not crossed at all · current policies: about 2.6 °C (2–3.7) by 2100</text>
        </svg>
        <p className="note">“{W.timing}” <SourceLinks ids={[W.s]} /></p>
        <AtDepth level="understand">
          <p className="note">“{W.km}” <SourceLinks ids={[W.s]} /></p>
          <p className="note">Precipitation: “{W.precip}” “{W.snow}” Heat: “{W.heat}” “{W.nights}” Rain: “{W.rain}” <SourceLinks ids={[W.s]} /></p>
          <p className="note">“{D.framing.gwl}” “{D.framing.notThresholds}” <SourceLinks ids={[D.framing.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">“{W.timingFig}” “{W.policies}” “{W.notCeiling}” “{W.onePointFive}” “{W.netzero}” “{W.detect}” “{W.lockedIn}” “{W.biggest}” <SourceLinks ids={[W.s]} /> Gap: no global temperature for 2030 or 2050 by scenario was found in an allowed source, so none is shown.</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/records')}>Warming so far →</button><button className="chip" onClick={() => navigate('/meteorology/human')}>What drives it →</button></Related>
    </>
  );
}

function Sea() {
  const { query } = useRoute();
  const S = D.sea, region = query.get('region') === 'conus' ? 'conus' : 'gmsl';
  const ft = query.get('unit') === 'ft';
  const conv = (m: number) => (ft ? m2ft(m) : m);
  const series = S.scenarios.map((s: any, i: number) => ({ points: [[2000, 0], ...S.years.map((y: number, j: number) => [y, conv(s[region][j])])] as [number, number][], color: SC_COL[i], label: s.name }));
  return (
    <>
      <Panel id="fu-s" className="left-panel" title="Sea-level scenarios">
        <div role="radiogroup" aria-label="Region" className="chip-row" style={{ gap: 4 }}>
          {[['gmsl', 'Global mean'], ['conus', 'Contiguous US']].map(([k, l]) => <button key={k} role="radio" aria-checked={region === k} className={`chip ${region === k ? 'active' : ''}`} onClick={() => setQuery({ region: k === 'gmsl' ? null : k })}>{l}</button>)}
        </div>
        <div role="radiogroup" aria-label="Unit" className="chip-row" style={{ gap: 4, marginTop: 4 }}>
          {[['m', 'metres'], ['ft', 'feet (our conversion)']].map(([k, l]) => <button key={k} role="radio" aria-checked={(ft ? 'ft' : 'm') === k} className={`chip ${(ft ? 'ft' : 'm') === k ? 'active' : ''}`} onClick={() => setQuery({ unit: k === 'm' ? null : k })}>{l}</button>)}
        </div>
        <table className="table-mini" aria-label="Sea level scenarios" style={{ fontSize: 12 }}>
          <thead><tr><th>Scenario</th>{S.years.map((y: number) => <th key={y}>{y}</th>)}</tr></thead>
          <tbody>{S.scenarios.map((s: any) => <tr key={s.id}><td>{s.name}</td>{s[region].map((v: number, j: number) => <td key={j}>{ft ? formatSig(m2ft(v), 2) : v}</td>)}</tr>)}</tbody>
        </table>
        <p className="note">“{S.caption}” {ft ? 'Feet converted here from the printed metres.' : ''} <SourceLinks ids={[S.s]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Sea level: five scenarios <ProvenanceBadge cls="simulated" title="Scenarios built from IPCC AR6 projections; to 2050 from observed rates and acceleration (Sweet et al. 2022)" /><DepthSwitch /></h1>
          <Conditional /></div>
        <LinePlot ariaLabel="Sea level scenarios" width={620} height={260} xLabel="year" yLabel={`${region === 'gmsl' ? 'global mean' : 'contiguous US'} rise since 2000 (${ft ? 'ft' : 'm'})`} series={series} markers={series.flatMap((s: any) => s.points.slice(1).map(([px, py]: [number, number]) => ({ x: px, y: py, color: s.color })))} />
        <p className="note">Points are the tabulated years; straight lines between them are only a guide. “{S.def}” “{S.noProb}” <SourceLinks ids={[S.s2]} /></p>
        <div className="section-title">Chance of exceeding each scenario in 2100 (NCA5)</div>
        <table className="table-mini" aria-label="Exceedance probabilities" style={{ fontSize: 12 }}>
          <thead><tr><th>Scenario</th>{S.exceedCols.map((c: string) => <th key={c}>{c.length > 8 ? 'Very high emissions + low-confidence ice loss' : c}</th>)}</tr></thead>
          <tbody>{S.scenarios.map((s: any) => <tr key={s.id}><td>{s.name} ({s.gmsl[1]} m)</td>{S.exceed[s.id].map((p: string, j: number) => <td key={j}>{p}</td>)}</tr>)}</tbody>
        </table>
        <p className="note">“{S.exceedCaption}” <SourceLinks ids={[S.s2, S.s]} /></p>
        <AtDepth level="understand">
          <p className="note">“{S.next30}” “{S.regional}” “{S.extrap.q}” <SourceLinks ids={[S.s]} /></p>
          <p className="note">“{S.cannotRuleOut.q}” “{S.committed.q}” <SourceLinks ids={[S.cannotRuleOut.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">“{S.confidence}” “{S.warmingLink}” “{S.noVariability}” “{S.nearTerm}” <SourceLinks ids={[S.s, S.s2]} /> Findings: {S.usVsConus} {S.noDoi}</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/oceans?tab=ice')}>Ice today →</button><button className="chip" onClick={() => navigate('/meteorology/iceages')}>Sea level in the ice ages →</button></Related>
    </>
  );
}

function Earth() {
  const E = D.earth, P = E.ph;
  const rows = [{ label: 'Before industrialization', v: P.past }, { label: 'Today (2010 page)', v: P.now }, { label: '2100, 2 °C path', v: P.two }, { label: '2100, high emissions', v: P.high }];
  return (
    <>
      <Panel id="fu-e" className="left-panel" title="Ocean pH (a 2010 study)">
        <dl className="kv" aria-label="pH values">
          {rows.map((r) => <KV key={r.label} k={r.label} v={r.v} />)}
          <KV k="H⁺ vs pre-industrial, 2 °C path" v={`${formatSig(hydrogenRatio(P.past, P.two), 3)} ×`} title="10^(8.16 − 8.01); the page says “about 1.5 times”" />
          <KV k="H⁺ vs pre-industrial, high emissions" v={`${formatSig(hydrogenRatio(P.past, P.high), 3)} ×`} title="10^(8.16 − 7.67)" />
        </dl>
        <p className="note">{P.dated} <SourceLinks ids={[P.s, P.paperS]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Ocean, ice and life <ProvenanceBadge cls="simulated" title="Model projections under stated scenarios (NCA5; Bernie et al. 2010); ice-sheet volumes from NSIDC" /><DepthSwitch /></h1>
          <Conditional /></div>
        <p className="note">“{P.q1}” “{P.q2}” “{P.q3}” <SourceLinks ids={[P.s]} /></p>
        <div className="section-title">Ice sheets: what is stored</div>
        <dl className="kv" aria-label="Ice sheet values" style={{ maxWidth: 520 }}><KV k="Greenland, if all melted" v={`about ${E.ice.sle.greenland} m of sea level`} /><KV k="Antarctica, if all melted" v={`about ${E.ice.sle.antarctic} m`} /></dl>
        <p className="note">NSIDC: “{E.ice.sle.q}” <SourceLinks ids={[E.ice.sle.s]} /> “{E.ice.sheets.q}” <SourceLinks ids={[E.ice.sheets.s]} /></p>
        <div className="section-title">Permafrost and the carbon cycle</div>
        <p className="note">“{E.permafrost.q}” “{E.permafrost.release}” <SourceLinks ids={[E.permafrost.s]} /> “{E.permafrost.loss}” <SourceLinks ids={[E.permafrost.s3]} /></p>
        <div className="section-title">Water and living things</div>
        <p className="note">“{E.water.snow}” <SourceLinks ids={[E.water.s]} /> “{E.biomes.km1}” <SourceLinks ids={[E.biomes.s]} /></p>
        <AtDepth level="understand">
          <p className="note">“{E.water.km}” “{E.water.km2}” <SourceLinks ids={[E.water.s]} /> “{E.biomes.shifts}” “{E.biomes.km2}” <SourceLinks ids={[E.biomes.s]} /></p>
          <p className="note">“{E.carbon.sinks}” <SourceLinks ids={[E.carbon.s]} /> “{E.carbon.split}” <SourceLinks ids={[E.carbon.s3]} /> “{P.shells.q}” “{P.stillAcidify.q}” <SourceLinks ids={[P.shells.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">“{E.permafrost.methane}” <SourceLinks ids={[E.permafrost.s]} /> “{E.carbon.uncertain}” <SourceLinks ids={[E.carbon.s3]} /> “{E.ice.sheets.q2}” <SourceLinks ids={[E.ice.sheets.s]} /> “{E.ice.glaciers.q}” “{E.water.groundwater}” <SourceLinks ids={[E.water.s]} /> “{E.biomes.limits}” <SourceLinks ids={[E.biomes.s]} /></p>
          <p className="note">Findings: the pH page’s “about 1.5 times” and “roughly five times” are its own wording; our hydrogen-ion ratios are 1.41× and 3.1× against pre-industrial. {E.ice.sle.feet} No global glacier projection and no year for a first ice-free Arctic summer were found in an allowed source.</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/oceans?tab=change')}>Ocean pH measured →</button><button className="chip" onClick={() => navigate('/meteorology/oceans?tab=biomes')}>Biomes →</button></Related>
    </>
  );
}

function Known() {
  const T = D.tipping, E = D.ecs;
  const bars = [{ label: 'Likely (NCA5 Ch. 3, KM 3.2)', r: E.likely, c: COOL }, { label: 'Likely (NCA5 Ch. 2 traceable account)', r: E.ch2Likely, c: ON }, { label: 'Very likely (Ch. 2 traceable account)', r: E.ch2VeryLikely, c: GOLD }];
  const x = (v: number) => 230 + ((v - 1) / 5) * 360;
  return (
    <>
      <Panel id="fu-t" className="left-panel" title="Possible tipping elements (NCA5)">
        <ul aria-label="Tipping elements" style={{ fontSize: 12, paddingLeft: 18 }}>{T.elements.map((e: string) => <li key={e}>{e}</li>)}</ul>
        <p className="note">{T.figNote} <SourceLinks ids={[T.s]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>What is known, and what isn’t <ProvenanceBadge cls="derived" title="Assessed ranges combining several lines of evidence (NCA5)" /><DepthSwitch /></h1>
          <p className="note">“{T.unknown}” <SourceLinks ids={[T.s]} /></p></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 680 }}>
          <div aria-label="Well established"><div className="section-title">Well established</div>{T.solid.map((x2: any) => <p key={x2.q} className="note">“{x2.q}” <SourceLinks ids={[x2.s]} /></p>)}</div>
          <div aria-label="Under investigation"><div className="section-title">Still under investigation</div>{T.open.map((x2: any) => <p key={x2.q} className="note">“{x2.q}” <SourceLinks ids={[x2.s]} /></p>)}</div>
        </div>
        <div className="section-title">Climate sensitivity: warming for doubled CO₂ (°C)</div>
        <svg viewBox="0 0 620 120" role="img" aria-label="Climate sensitivity ranges" style={{ width: '100%', maxWidth: 620 }}>
          {[1, 2, 3, 4, 5, 6].map((v) => <g key={v}><line x1={x(v)} x2={x(v)} y1={4} y2={96} stroke="var(--text-dim)" strokeOpacity={0.3} /><text x={x(v)} y={112} fontSize={10} textAnchor="middle" fill="var(--text-dim)">{v} °C</text></g>)}
          <line x1={x(E.floor)} x2={x(E.floor)} y1={4} y2={96} stroke={WARM} strokeDasharray="4 3" />
          <text x={x(E.floor) + 4} y={14} fontSize={10} fill={WARM}>virtually certain above 1.5</text>
          {bars.map((b, i) => <g key={b.label}><text x={224} y={i * 26 + 34} fontSize={11} textAnchor="end" fill="var(--text)">{b.label}</text><rect x={x(b.r[0])} y={i * 26 + 23} width={x(b.r[1]) - x(b.r[0])} height={14} fill={b.c} opacity={0.75} rx={3} /><text x={x(b.r[1]) + 5} y={i * 26 + 34} fontSize={10} fill="var(--text-dim)">{b.r[0].toFixed(1)}–{b.r[1].toFixed(1)}</text></g>)}
        </svg>
        <p className="note">“{E.range}” <SourceLinks ids={[E.s]} /> {E.disagreement} <SourceLinks ids={[E.s2]} /></p>
        <AtDepth level="understand">
          <p className="note">“{E.def}” “{E.clouds}” Three lines of evidence: 1) “{E.evidence}” <SourceLinks ids={[E.s]} /></p>
          <p className="note">“{T.def}” <SourceLinks ids={[T.s]} /> Glossary: “{T.glossary.q}” <SourceLinks ids={[T.glossary.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">“{T.amoc.q}” <SourceLinks ids={[T.amoc.s]} /> “{T.eco.q}” <SourceLinks ids={[T.eco.s]} /> “{E.ch2}” “{E.tails}” “{T.catastrophic}” <SourceLinks ids={[E.s2]} /> “{E.hotModels}” <SourceLinks ids={[E.s]} /></p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/deeptime')}>Past warm climates →</button><button className="chip" onClick={() => navigate('/meteorology/oceans')}>The conveyor belt →</button></Related>
    </>
  );
}

const TABS: [string, string][] = [['kinds', 'Projections?'], ['levels', 'Warming levels'], ['sea', 'Sea level'], ['earth', 'Ocean & ice'], ['known', 'Known & unknown']];
export default function FutureView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'levels';
  return (
    <>
      <nav className="view-switch" aria-label="Future climate sections">{TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'levels' ? null : t })}>{l}</button>)}</nav>
      {tab === 'kinds' ? <Kinds /> : tab === 'sea' ? <Sea /> : tab === 'earth' ? <Earth /> : tab === 'known' ? <Known /> : <Levels />}
    </>
  );
}
