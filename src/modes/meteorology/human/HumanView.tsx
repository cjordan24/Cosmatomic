/**
 * Human activities and environmental change — #/meteorology/human?tab=carbon|sectors|electricity|heat|ozone   (Gate 24.1)
 *
 *  carbon       Global Carbon Budget 2025: where the CO₂ goes (sources = sinks + imbalance), land use in parts
 *  sectors      EDGAR 2026 sector totals (shares derived), methane rise and sources, aviation's forcing terms
 *  electricity  NREL life-cycle medians by phase, a grid-mix calculator (illustrative), cement chemistry (Andrew 2019)
 *  heat         waste heat vs greenhouse forcing, urban heat islands, water withdrawn vs consumed, mine drainage
 *  ozone        ozone recovery dates (WMO 2026 vs 2022), carbon removal today, solar radiation modification
 *
 * Mechanisms, not verdicts: every effect is tagged with the kind of impact it is (greenhouse, local pollution, waste
 * heat, ecosystem, resource), so different kinds are never added together.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { budgetImbalance, cementProcessCO2, dF2dC, heatFlux, mixIntensity, molarMass, shares } from '@/core/meteorology/human';
import data from '@datasets/meteorology/human.json';
import elements from '@datasets/atomic/elements.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const ON = '#82b1ff', WARM = '#ff7a90', COOL = '#5cf2a6', GOLD = '#f5c76b';
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const aw = (sym: string) => (elements as any[]).find((e) => e.symbol === sym).atomicWeight as number;
const Related = ({ children }: { children?: React.ReactNode }) => <Panel id="hu-detail" className="right-panel" title="Related">{children}<RelatedLinks id="instrument:human" limit={3} /></Panel>;

const KIND_COLOR: Record<string, string> = { greenhouse: WARM, pollution: '#c792ea', heat: GOLD, ecosystem: COOL, resource: ON };
function Kinds({ on }: { on: string[] }) {
  return (
    <div className="chip-row" aria-label="Kinds of impact" style={{ gap: 4, flexWrap: 'wrap' }}>
      {Object.entries(D.kinds as Record<string, string>).map(([k, l]) => (
        <span key={k} className="chip" title={l} aria-current={on.includes(k) ? 'true' : undefined}
          style={{ opacity: on.includes(k) ? 1 : 0.35, borderColor: on.includes(k) ? KIND_COLOR[k] : undefined, cursor: 'default' }}>{l.split(' — ')[0]}</span>
      ))}
    </div>
  );
}

/** Horizontal bars; negative values grow left of zero. */
function Bars({ rows, unit, ariaLabel, width = 600 }: { rows: { label: string; v: number; color?: string; r?: [number, number] }[]; unit: string; ariaLabel: string; width?: number }) {
  const lo = Math.min(0, ...rows.map((r) => r.r?.[0] ?? r.v)), hi = Math.max(0, ...rows.map((r) => r.r?.[1] ?? r.v));
  const L = 220, W = width - L - 70, x = (v: number) => L + ((v - lo) / (hi - lo || 1)) * W, h = 22;
  return (
    <svg viewBox={`0 0 ${width} ${rows.length * h + 10}`} role="img" aria-label={ariaLabel} style={{ width: '100%', maxWidth: width }}>
      <line x1={x(0)} x2={x(0)} y1={0} y2={rows.length * h + 4} stroke="var(--text-dim)" strokeWidth={1} />
      {rows.map((r, i) => (
        <g key={r.label}>
          <text x={L - 6} y={i * h + 15} fontSize={11} textAnchor="end" fill="var(--text)">{r.label}</text>
          <rect x={Math.min(x(0), x(r.v))} y={i * h + 4} width={Math.abs(x(r.v) - x(0))} height={h - 8} fill={r.color ?? (r.v < 0 ? COOL : ON)} rx={2} />
          {r.r ? <line x1={x(r.r[0])} x2={x(r.r[1])} y1={i * h + 11} y2={i * h + 11} stroke="var(--text)" strokeWidth={1.5} /> : null}
          <text x={Math.max(x(0), x(r.v), r.r ? x(r.r[1]) : 0) + 5} y={i * h + 15} fontSize={11} fill="var(--text-dim)">{r.v} {unit}</text>
        </g>
      ))}
    </svg>
  );
}

function Carbon() {
  const { query } = useRoute();
  const yr = query.get('year') === '2024' ? '2024' : 'decade';
  const B = D.budget, d = B.decade, y = B.y2024;
  const b = yr === 'decade' ? { fossil: d.fossil.v, luc: d.luc.v, atm: d.atm.v, ocean: d.ocean.v, land: d.land.v } : y;
  const imb = budgetImbalance(b);   // floating sums of the printed values; |x| < 1e-9 shown as 0
  const src = [{ label: 'Fossil fuels & cement', v: b.fossil, color: WARM }, { label: 'Land-use change', v: b.luc, color: GOLD }];
  const snk = [{ label: 'Stays in the air', v: b.atm, color: '#c792ea' }, { label: 'Ocean sink', v: b.ocean, color: ON }, { label: 'Land sink', v: b.land, color: COOL }];
  const tot = b.fossil + b.luc, sh = shares(snk.map((s) => s.v));
  return (
    <>
      <Panel id="hu-c" className="left-panel" title="Where the carbon goes">
        <div role="radiogroup" aria-label="Budget period" className="chip-row" style={{ gap: 4 }}>
          {[['decade', '2015–2024 average'], ['2024', 'Year 2024']].map(([k, l]) => <button key={k} role="radio" aria-checked={yr === k} className={`chip ${yr === k ? 'active' : ''}`} onClick={() => setQuery({ year: k === 'decade' ? null : k })}>{l}</button>)}
        </div>
        <dl className="kv" aria-label="Budget values">
          <KV k="Emitted" v={`${formatSig(tot, 3)} GtC/yr`} />
          {snk.map((s, i) => <KV key={s.label} k={s.label} v={`${s.v} GtC/yr · ${Math.round(sh[i] * 100)} %`} title="share of all sinks (our division)" />)}
          <KV k="Imbalance (our sum)" v={`${Math.abs(imb) < 1e-9 ? '+0' : `${imb > 0 ? '+' : '−'}${formatSig(Math.abs(imb), 2)}`} GtC/yr`} title="sources − sinks from the printed values" />
        </dl>
        {yr === '2024' ? <p className="note">Printed imbalance for 2024: −1.7 GtC/yr (our sum of the rounded parts gives −1.6). “{y.q[1]}” <SourceLinks ids={[B.s]} /></p> : <p className="note">“{d.atm.q}” <SourceLinks ids={[B.s]} /></p>}
        <Kinds on={['greenhouse']} />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The carbon budget <ProvenanceBadge cls="observed" title="Synthesis: fossil emissions from energy statistics, land use from bookkeeping models, growth from stations, sinks from models and ocean data (GCB 2025)" /><DepthSwitch /></h1>
          <p className="note">“{B.conc}” <SourceLinks ids={[B.s]} /></p></div>
        <div className="section-title">Sources, GtC per year</div>
        <Bars ariaLabel="Carbon sources" unit="GtC/yr" rows={src} />
        <div className="section-title">Sinks, GtC per year</div>
        <Bars ariaLabel="Carbon sinks" unit="GtC/yr" rows={snk} />
        <p className="note">{B.defs[0]} <SourceLinks ids={[B.s]} /></p>
        <div className="section-title">Land use in parts (2015–2024, range of three models)</div>
        <Bars ariaLabel="Land-use fluxes" unit="GtC/yr" rows={D.land.parts.map((p: any) => ({ label: p.name, v: p.v, r: p.r }))} />
        <p className="note">“{D.land.q}” <SourceLinks ids={[D.land.s]} /></p>
        <AtDepth level="understand">
          <p className="note">“{B.shares[0]}” “{B.shares[1]}” Feedback: “{B.feedback[0]}” “{B.feedback[1]}” <SourceLinks ids={[B.s]} /></p>
          <p className="note">History: “{B.history[0]}” “{B.history[2]}” <SourceLinks ids={[B.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">“{B.defs[1]}” <SourceLinks ids={[B.s]} /> Findings: {B.disagreement} Caution: “{D.land.caution}” — so land-use numbers from different systems are not added here. {B.preprint}</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/radiation?tab=forcing')}>CO₂ and radiative forcing →</button><button className="chip" onClick={() => navigate('/meteorology/oceans?tab=change')}>Ocean acidification →</button></Related>
    </>
  );
}

function Sectors() {
  const { query } = useRoute();
  const S = D.sectors, M = D.methane, A = D.aviation;
  const sel = S.rows.find((r: any) => r.id === query.get('sector')) ?? S.rows[0];
  const sh = shares(S.rows.map((r: any) => r.mt));
  return (
    <>
      <Panel id="hu-s" className="left-panel" title="Sectors (EDGAR 2026)">
        <div role="listbox" aria-label="Sectors" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {S.rows.map((r: any, i: number) => <button key={r.id} role="option" aria-selected={r.id === sel.id} className={`chip ${r.id === sel.id ? 'active' : ''}`} style={{ textAlign: 'left' }} onClick={() => setQuery({ sector: r.id })}>{r.name} — {formatSig(sh[i] * 100, 3)} %</button>)}
        </div>
        <dl className="kv" aria-label="Sector values"><KV k={`${sel.name}, ${S.year}`} v={`${sel.mt} Mt CO₂eq`} /><KV k="Share (derived)" v={`${formatSig(sh[S.rows.indexOf(sel)] * 100, 3)} %`} /></dl>
        {sel.def ? <p className="note">EDGAR: “{sel.def}”</p> : null}
        <p className="note">Shares are our division of the report’s sector totals; the report prints only the power share. <SourceLinks ids={[S.s]} /></p>
        <Kinds on={['greenhouse', 'pollution']} />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>What emits, and how <ProvenanceBadge cls="observed" title="Emission inventory: activity data × emission factors (EDGAR), GWP-100 AR5" /><DepthSwitch /></h1>
          <p className="note">“{S.total}” “{S.gases}” <SourceLinks ids={[S.s]} /></p></div>
        <Bars ariaLabel="Emissions by sector" unit="Mt" rows={S.rows.map((r: any) => ({ label: r.name.replace(/ \(.*\)/, ''), v: r.mt, color: r.id === sel.id ? GOLD : ON }))} />
        <div className="section-title">Methane: the annual rise (NOAA, ppb per year)</div>
        <LinePlot ariaLabel="Methane annual increase" width={600} height={200} xLabel="year" yLabel="ppb / yr" xDomain={[1982, 2027]} yDomain={[-6, 20]} series={[]} markers={M.increase.map((r: any) => ({ x: r[0], y: r[1], color: WARM }))} errorBars={M.increase.filter((r: any) => r[2] !== null).map((r: any) => ({ x: r[0], y: r[1], lo: r[2], hi: r[2], color: WARM, title: `${r[0]}: ${r[1]} ± ${r[2]} ppb` }))} hLines={[{ y: 0, label: '0', color: '#888' }]} />
        <p className="note">Selected years from NOAA’s table, shown as points (± where recorded); the years between are not plotted.</p>
        <p className="note">“{M.latest}” “{M.meaning}” <SourceLinks ids={[M.trendS]} /></p>
        <Bars ariaLabel="Human methane sources" unit="Tg/yr" rows={M.anthro.map((a: any) => ({ label: a.name, v: a.td, r: a.tdR, color: WARM }))} />
        <p className="note">Top-down estimates, 2010–2019, with their ranges. “{M.livestock[0]}” <SourceLinks ids={[M.budgetS]} /></p>
        <AtDepth level="understand">
          <p className="note">Aviation — “{A.erf}” <SourceLinks ids={[A.s, A.paperS]} /> Contrails: “{A.plain}” <SourceLinks ids={[A.s]} /></p>
          <Bars ariaLabel="Aviation forcing terms" unit="mW/m²" rows={[...A.terms.map((t: any) => ({ label: t.name, v: t.v, color: WARM })), { label: 'Net (all terms)', v: A.net, r: A.netR, color: GOLD }]} />
          <p className="note">{A.note} “{A.share}” <SourceLinks ids={[A.paperS]} /></p>
          <p className="note">Methane mechanism — “{M.livestock[1]}” <SourceLinks ids={[M.budgetS]} /> Power — “{S.power}” <SourceLinks ids={[S.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">“{M.topdown}” “{M.bottomup}” “{M.sinks}” <SourceLinks ids={[M.budgetS]} /> “{M.caveat}” <SourceLinks ids={[M.trendS]} /></p>
          <p className="note">“{A.contrails}” “{A.uncertainty}” <SourceLinks ids={[A.paperS]} /> {S.licenceNote}</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/radiation?tab=bands')}>Why these gases absorb →</button><button className="chip" onClick={() => navigate('/engineering/datacentres')}>Data centres →</button></Related>
    </>
  );
}

const MIX_IDS = ['coal', 'gas', 'nuclear', 'hydro', 'wind', 'pv'];
function Electricity() {
  const { query } = useRoute();
  const L = D.lca, C = D.cement;
  const g = (id: string) => L.rows.find((r: any) => r.id === id);
  const w = MIX_IDS.map((id) => num(query, `w_${id}`, id === 'gas' || id === 'coal' ? 30 : 10, 0, 100));
  const mix = mixIntensity(MIX_IDS.map((id, i) => ({ weight: w[i], gPerKWh: g(id).total })));
  const ratio = num(query, 'clinker', C.ratio.v, 0.5, 1), fCaO = num(query, 'cao', C.caoClinker.v, 0.55, 0.7);
  const mrCO2 = molarMass([[aw('C'), 1], [aw('O'), 2]]), mrCaO = molarMass([[aw('Ca'), 1], [aw('O'), 1]]);
  const perCement = cementProcessCO2({ mrCO2, mrCaO, fCaO, clinkerRatio: ratio, mCement: 1 });
  const phaseIds = ['coal', 'gas', 'pv', 'wind', 'nuclear', 'hydro'];
  return (
    <>
      <Panel id="hu-e" className="left-panel" title="Build a grid mix">
        {MIX_IDS.map((id, i) => <label key={id} className="slider-row"><span style={{ minWidth: 80 }}>{g(id).name.replace(/ \(.*\)/, '')}</span><input type="range" min={0} max={100} step={5} value={w[i]} aria-label={`Share of ${g(id).name}`} onChange={(e) => setQuery({ [`w_${id}`]: e.target.value })} /><span>{w[i]}</span></label>)}
        <dl className="kv" aria-label="Mix intensity"><KV k="Life-cycle intensity of this mix" v={`${Math.round(mix)} g CO₂e/kWh`} title="weighted mean of NREL medians — illustrative" /></dl>
        <p className="note">Illustrative: a weighted mean of published medians (relative weights). The fact sheet itself warns “{L.median}” <SourceLinks ids={[L.s]} /></p>
        <Kinds on={['greenhouse', 'resource']} />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Electricity and materials, cradle to grave <ProvenanceBadge cls="derived" title="Medians of harmonised published life-cycle assessments (NREL 2021); not measurements" /><DepthSwitch /></h1>
          <p className="note">“{L.cradle}” “{L.coal20}” <SourceLinks ids={[L.s]} /></p></div>
        <Bars ariaLabel="Life-cycle emissions by technology" unit="g/kWh" rows={L.rows.filter((r: any) => r.gen).map((r: any) => ({ label: r.name, v: r.total, color: r.total > 300 ? WARM : COOL }))} />
        <p className="note">{L.units} — medians. {L.ranges} <SourceLinks ids={[L.s]} /></p>
        <table className="table-mini" aria-label="Life-cycle phases" style={{ fontSize: 12 }}>
          <thead><tr><th>Technology</th><th>Upstream</th><th>Combustion</th><th>Other operation</th><th>Downstream</th><th>Total</th></tr></thead>
          <tbody>{phaseIds.map((id) => { const r = g(id); const c = (v: any) => (v === null ? '—' : `${r.approx && v !== null ? '~' : ''}${v}`); return <tr key={id}><td>{r.name}</td><td>{c(r.up)}</td><td>{c(r.comb)}</td><td>{c(r.op)}</td><td>{c(r.down)}</td><td><b>{r.total}</b></td></tr>; })}</tbody>
        </table>
        <p className="note">“{L.phases}” <SourceLinks ids={[L.s]} /></p>
        <div className="section-title">Cement: CO₂ from the rock itself</div>
        <label className="slider-row"><span style={{ minWidth: 110 }}>clinker ratio</span><input type="range" min={0.5} max={1} step={0.01} value={ratio} aria-label="Clinker ratio" onChange={(e) => setQuery({ clinker: e.target.value })} /><span>{ratio}</span></label>
        <label className="slider-row"><span style={{ minWidth: 110 }}>CaO in clinker</span><input type="range" min={0.55} max={0.7} step={0.001} value={fCaO} aria-label="CaO fraction" onChange={(e) => setQuery({ cao: e.target.value })} /><span>{fCaO}</span></label>
        <dl className="kv" aria-label="Cement values">
          <KV k="Mr(CO₂) / Mr(CaO)" v={formatSig(mrCO2 / mrCaO, 4)} title="from standard atomic weights" />
          <KV k="Process CO₂ per tonne of cement" v={`${formatSig(perCement, 3)} t`} title="Andrew (2019) eq. 1 with your inputs" />
          <KV k="Per tonne of clinker (IPCC default)" v={`${C.ipccEF.v} t`} />
        </dl>
        <p className="note">E = (Mr<sub>CO₂</sub>/Mr<sub>CaO</sub>) · f<sub>CaO</sub> · f<sub>clinker</sub> · M<sub>cement</sub>, “{C.eq}” Defaults: CaO 0.646 of clinker (1996 IPCC guidelines, via CDIAC) and the global clinker ratio of 0.71 in 2018. <SourceLinks ids={[C.s, 'iupac-ciaaw']} /></p>
        <AtDepth level="understand">
          <p className="note">“{C.chem}” “{C.total}” <SourceLinks ids={[C.s]} /> Partly reversed: concrete re-absorbs CO₂ (carbonation) — “{C.carbonation.q}” <SourceLinks ids={[C.carbonation.s]} /></p>
          <p className="note">Fuel for the kiln: “{C.energy}” <SourceLinks ids={[C.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">“{C.ratio.q}” “{C.caoClinker.q}” “{C.ipccEF.q}” <SourceLinks ids={[C.s]} /> Findings: 0.646 × 0.785 = 0.507 t CO₂ per t clinker, against the IPCC default 0.52 — the default implies a little more CaO. {C.older} Storage: “{L.storage}” {L.renamed}</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/engineering/machines?tab=grid')}>The electricity grid →</button><button className="chip" onClick={() => navigate('/atomic/reactions')}>Chemical reactions →</button></Related>
    </>
  );
}

function Heat() {
  const { query } = useRoute();
  const ej = num(query, 'ej', D.heat.energyEJ, 100, 3000);
  const H = D.heat, U = D.uhi, W = D.water, Mn = D.mining;
  const gl = heatFlux(ej, H.earthArea), land = heatFlux(ej, H.earthArea * H.landFrac);
  return (
    <>
      <Panel id="hu-h" className="left-panel" title="Waste heat vs the greenhouse effect">
        <label className="slider-row"><span style={{ minWidth: 80 }}>energy use</span><input type="range" min={100} max={3000} step={5} value={ej} aria-label="Human energy use" onChange={(e) => setQuery({ ej: e.target.value })} /><span>{ej} EJ/yr</span></label>
        <dl className="kv" aria-label="Heat values">
          <KV k="Heat released" v={`${formatSig((ej * 1e18) / (365.25 * 86400) / 1e12, 3)} TW`} />
          <KV k="Spread over the globe" v={`${formatSig(gl, 2)} W/m²`} />
          <KV k="Spread over land only" v={`${formatSig(land, 2)} W/m²`} />
          <KV k="Greenhouse forcing ÷ waste heat" v={`${formatSig(H.ghgForcing / gl, 2)} ×`} title="2.7 W/m² (as quoted) ÷ global waste heat" />
        </dl>
        <p className="note">At 595 EJ (2021) the editorial gets 18.9 TW, 0.04 W/m² globally and 0.13 over land; our slider redoes its arithmetic. {H.label} <SourceLinks ids={[H.s]} /></p>
        <Kinds on={['heat', 'resource', 'ecosystem', 'pollution']} />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Heat, water and land <ProvenanceBadge cls="observed" title="EPA review of studies; USGS water-use compilation (2015); editorial energy balance" /><DepthSwitch /></h1>
          <p className="note">“{H.q}” <SourceLinks ids={[H.s]} /></p></div>
        <Bars ariaLabel="Heat compared" unit="W/m²" rows={[{ label: 'Waste heat, global mean', v: Number(formatSig(gl, 2)), color: GOLD }, { label: 'Waste heat, over land', v: Number(formatSig(land, 2)), color: GOLD }, { label: 'Greenhouse forcing (as quoted)', v: H.ghgForcing, color: WARM }]} />
        <div className="section-title">Cities: the heat island (EPA)</div>
        <dl className="kv" aria-label="Heat island"><KV k="By day" v={`${U.day[0]}–${U.day[1]} °F (${formatSig(dF2dC(U.day[0]), 2)}–${formatSig(dF2dC(U.day[1]), 2)} °C, our conversion)`} /><KV k="At night" v={`${U.night[0]}–${U.night[1]} °F (${formatSig(dF2dC(U.night[0]), 2)}–${formatSig(dF2dC(U.night[1]), 2)} °C)`} /></dl>
        <p className="note">“{U.q}” <SourceLinks ids={[U.s]} /></p>
        <ul aria-label="Heat island causes" style={{ fontSize: 12, paddingLeft: 18 }}>{U.causes.map(([k, q]: [string, string]) => <li key={k}><b>{k}</b>: “{q}”</li>)}</ul>
        <div className="section-title">Water withdrawn and consumed, United States 2015 (Bgal/d)</div>
        <Bars ariaLabel="Water use" unit="Bgal/d" rows={W.uses.flatMap((u: any) => [{ label: `${u.name} — withdrawn`, v: u.w, color: ON }, ...(u.c !== null ? [{ label: `${u.name} — consumed`, v: u.c, color: WARM }] : [])])} />
        <p className="note">“{W.thermo}” <SourceLinks ids={[W.s]} /> {W.note}</p>
        <AtDepth level="understand">
          <p className="note">“{H.local}” “{H.models}” <SourceLinks ids={[H.s]} /> Feedback through air conditioning: “{U.ac}” Local pollution: “{U.ozone}” <SourceLinks ids={[U.s]} /></p>
          <p className="note">Mining — “{Mn.mech}” <SourceLinks ids={[Mn.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">“{W.total}” “{W.irrigation}” <SourceLinks ids={[W.s]} /> “{Mn.event}” <SourceLinks ids={[Mn.s]} /> Roofs: “{U.roof}” <SourceLinks ids={[U.s]} /> Flanner (2009), cited in the editorial, was not readable by an allowed route and is not quoted.</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/climates')}>Station climates →</button><button className="chip" onClick={() => navigate('/meteorology/radiation')}>The energy budget →</button></Related>
    </>
  );
}

function Ozone() {
  const O = D.ozone, R = D.removal, S = D.srm, G = D.budget;
  const ratio = (G.y2024.fossil * 1000) / R.cdrMtC;
  return (
    <>
      <Panel id="hu-o" className="left-panel" title="Ozone recovery">
        <table className="table-mini" aria-label="Ozone return dates" style={{ fontSize: 12 }}>
          <thead><tr><th>Region</th><th>2026 assessment</th><th>2022 assessment</th></tr></thead>
          <tbody>{O.rows.map((r: any) => <tr key={r.region}><td>{r.region}</td><td>{r.y2026}</td><td>{r.y2022}</td></tr>)}</tbody>
        </table>
        <p className="note">Projected return to 1980 total column ozone, middle-of-the-road scenario. <SourceLinks ids={[O.s, O.prevS]} /></p>
        <p className="note" style={{ fontSize: 11 }}>Source: {O.credit}</p>
        <Kinds on={['ecosystem', 'greenhouse']} />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Repairs and interventions <ProvenanceBadge cls="simulated" title="Ozone return dates and SAI effects are model projections (WMO 2026); carbon removal from registries (GCB 2025)" /><DepthSwitch /></h1>
          <p className="note">“{O.recovering}” “{O.dates}” <SourceLinks ids={[O.s]} /></p></div>
        <div className="section-title">Carbon removal today</div>
        <dl className="kv" aria-label="Removal values">
          <KV k="All CO₂ removal to rock, 2024" v={`${R.cdrMtC} MtC/yr`} />
          <KV k="of which direct air capture with storage" v={`${R.daccsMtC} MtC/yr`} />
          <KV k="Fossil emissions ÷ removal (our ratio)" v={`${formatSig(ratio, 2)}`} title="10.3 GtC (2024) ÷ 0.011 MtC" />
        </dl>
        <p className="note">“{R.scale}” <SourceLinks ids={[R.scaleS]} /></p>
        <p className="note">How it works — “{R.what}” “{R.energy}” <SourceLinks ids={[R.dacS]} /> {R.gap}</p>
        <div className="section-title">Solar radiation modification: what is and isn’t known</div>
        <p className="note">“{S.mech}” <SourceLinks ids={[S.s]} /></p>
        <ul aria-label="SRM limits" style={{ fontSize: 12, paddingLeft: 18 }}>{S.limits.map((q: string) => <li key={q}>“{q}”</li>)}</ul>
        <p className="note">Ozone side-effect (models): “{S.ozone[0]}” <SourceLinks ids={[S.ozS]} /></p>
        <AtDepth level="understand">
          <p className="note">“{R.how[0]}” “{R.how[1]}” <SourceLinks ids={[R.dacS]} /> Trade-off: “{R.tradeoff}” Goal (a target, not an achievement): “{R.goal}” <SourceLinks ids={[R.shotS, R.dacS]} /></p>
          <p className="note">“{S.volcano}” “{S.ozone[1]}” <SourceLinks ids={[S.ozS]} /> Greenhouse link: “{O.cooling}” <SourceLinks ids={[O.s]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Arctic: “{O.arctic}” “{O.def}” Previously: “{O.prev}” <SourceLinks ids={[O.s, O.prevS]} /> {O.citeNote}</p>
          <p className="note">Model assumptions: “{S.assumptions}” “{S.strategy}” “{S.lowconf}” <SourceLinks ids={[S.ozS]} /> Research plan: “{S.termination}” “{S.scope}” “{S.disclaimer}” (archived site) <SourceLinks ids={[S.s]} /> “{R.shortfall}” <SourceLinks ids={[R.scaleS]} /> “{O.emerging}” <SourceLinks ids={[O.s]} /></p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/radiation?tab=ozone')}>How ozone absorbs UV →</button><button className="chip" onClick={() => navigate('/meteorology/radiation?tab=aerosols')}>Aerosols and volcanoes →</button></Related>
    </>
  );
}

const TABS: [string, string][] = [['carbon', 'Carbon'], ['sectors', 'Sectors'], ['electricity', 'Electricity'], ['heat', 'Heat & water'], ['ozone', 'Interventions']];
export default function HumanView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'carbon';
  return (
    <>
      <nav className="view-switch" aria-label="Human activities sections">{TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'carbon' ? null : t })}>{l}</button>)}</nav>
      {tab === 'sectors' ? <Sectors /> : tab === 'electricity' ? <Electricity /> : tab === 'heat' ? <Heat /> : tab === 'ozone' ? <Ozone /> : <Carbon />}
    </>
  );
}
