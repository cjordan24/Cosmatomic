/**
 * Data centres — #/engineering/datacentres?it=<MW>&pue=<ratio>   (Phase 15, Gate 15.7)
 *
 * U.S. data-centre electricity from Lawrence Berkeley National Laboratory's 2025 Update (CC BY 4.0): the 2024
 * estimate and the Reference Case and Compounded Uncertainty range to 2030, with LBNL's definition of PUE and a
 * calculator for one facility (IT load × PUE → facility power and annual energy).
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { formatSig } from '@/core/units/units';
import { annualTWh, averageGW, facilityPowerMW, infrastructureShare } from '@/core/computing/datacentre';
import data from '@datasets/engineering/datacentres.json';

interface Y { twh: number; where: string; quote: string; share?: number; low?: number; high?: number; lowShare?: number; highShare?: number }
const D = data as unknown as { source: string; scope: string; y2024: Y; y2028: Y; y2030: Y; pue: { where: string; definition: string; national: string; from: number; to: number; ai: { y2024: number; y2030: number; quote: string } } };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const ON = '#ff8a65', SRC = ['lbnl-2025-datacentre'];

export default function DataCentresView() {
  const { query } = useRoute();
  const it = num(query, 'it', 10, 0.1, 1000), pue = num(query, 'pue', 1.45, 1.0, 3.0);
  const fac = facilityPowerMW(it, pue), year = annualTWh(fac);
  // chart: 2024 estimate, 2028 and 2030 Reference Case, 2030 range
  const W = 560, H = 260, x = (yr: number) => 60 + ((yr - 2023) / 8) * (W - 90), y = (twh: number) => H - 30 - (twh / 900) * (H - 60);
  const pts = [{ yr: 2024, v: D.y2024.twh, l: 'estimate' }, { yr: 2028, v: D.y2028.twh, l: 'Reference Case' }, { yr: 2030, v: D.y2030.twh, l: 'Reference Case' }];
  return (
    <>
      <Panel id="dc-controls" className="left-panel" title="One data centre">
        <label className="slider-row"><span style={{ minWidth: 70 }}>IT load</span><input type="range" min={-1} max={3} step={0.01} value={Math.log10(it)} aria-label="IT load (log)" onChange={(e) => setQuery({ it: (10 ** Number(e.target.value)).toPrecision(3) })} /><span>{formatSig(it, 3)} MW</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>PUE</span><input type="range" min={1} max={3} step={0.005} value={pue} aria-label="Power usage effectiveness" onChange={(e) => setQuery({ pue: e.target.value })} /><span>{pue.toFixed(3)}</span></label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="chip" onClick={() => setQuery({ pue: String(D.pue.from) })}>U.S. average 2018 ({D.pue.from})</button>
          <button className="chip" onClick={() => setQuery({ pue: String(D.pue.to) })}>U.S. average 2024 ({D.pue.to})</button>
          <button className="chip" onClick={() => setQuery({ pue: String(D.pue.ai.y2024) })}>AI facilities 2024 ({D.pue.ai.y2024})</button>
        </div>
        <dl className="kv" aria-label="Facility values">
          <KV k="Facility power" v={fac} unit="MW" sig={3} title="IT load × PUE" />
          <KV k="Infrastructure share" v={`${formatSig(infrastructureShare(pue) * 100, 3)} %`} title="1 − 1/PUE" />
          <KV k="Energy per year (running constantly)" v={year * 1000} unit="GWh" sig={3} />
          <KV k="Share of U.S. data centres in 2024" v={`${formatSig((year / D.y2024.twh) * 100, 3)} %`} />
        </dl>
        <p className="note">A constant load is assumed; real facilities vary through the day and year.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Data centres and electricity <ProvenanceBadge cls="observed" title="LBNL estimates and scenario forecasts (CC BY 4.0)" /></h1>
          <p className="note">LBNL (2026): “{D.y2024.quote}” ({D.y2024.where}) “{D.y2028.quote}” “{D.y2030.quote}.” ({D.y2030.where}) <SourceLinks ids={SRC} /></p></div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="U.S. data-centre electricity, 2024 and forecasts" style={{ width: '100%', maxWidth: W }}>
          {[0, 200, 400, 600, 800].map((t) => <g key={t}><line x1={60} x2={W - 30} y1={y(t)} y2={y(t)} stroke="var(--line)" /><text x={52} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--text-dim)">{t}</text></g>)}
          <text x={14} y={H / 2} fontSize={11} fill="var(--text-dim)" transform={`rotate(-90 14 ${H / 2})`} textAnchor="middle">TWh per year</text>
          {[2024, 2026, 2028, 2030].map((yr) => <text key={yr} x={x(yr)} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--text-dim)">{yr}</text>)}
          <line x1={x(2030)} x2={x(2030)} y1={y(D.y2030.low!)} y2={y(D.y2030.high!)} stroke={ON} strokeWidth={6} opacity={0.35} />
          <text x={x(2030) - 10} y={y(D.y2030.high!) - 4} textAnchor="end" fontSize={11} fill={ON}>range {D.y2030.low}–{D.y2030.high}</text>
          <polyline points={pts.map((p) => `${x(p.yr)},${y(p.v)}`).join(' ')} fill="none" stroke={ON} strokeDasharray="5 4" />
          {pts.map((p) => <g key={p.yr}><circle cx={x(p.yr)} cy={y(p.v)} r={p.yr === 2024 ? 6 : 5} fill={p.yr === 2024 ? ON : 'none'} stroke={ON} strokeWidth={2} /><text x={x(p.yr) + 8} y={y(p.v) + 4} fontSize={12} fill="var(--text)">{p.v} TWh</text></g>)}
        </svg>
        <p className="note">Filled: the 2024 estimate. Open: LBNL's Reference Case forecasts; the bar is its 2030 Compounded Uncertainty range ({D.y2030.lowShare}–{D.y2030.highShare} % of U.S. use). The dashed line only joins the points. “{D.scope}” 192 TWh over a year is an average draw of {formatSig(averageGW(D.y2024.twh), 3)} GW (derived).</p>
      </div>
      <Panel id="dc-detail" className="right-panel" title="Power usage effectiveness">
        <p className="note">LBNL: {D.pue.definition} ({D.pue.where}) “{D.pue.national}” “{D.pue.ai.quote}” <SourceLinks ids={SRC} /></p>
        <p className="note">The two statements agree: 1 − 1/1.55 = 35.5 % and 1 − 1/1.45 = 31.0 %.</p>
        <button className="chip" onClick={() => navigate('/engineering/architecture')}>What the IT load computes →</button>
        <button className="chip" onClick={() => navigate('/spectral/thermal')}>Heat and radiation →</button>
        <RelatedLinks id="instrument:datacentres" limit={3} />
      </Panel>
    </>
  );
}
