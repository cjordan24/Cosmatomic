/**
 * Weather and climate records — #/meteorology/records?base=1901|1991&year=<yyyy>   (Phase 21, Gate 21.4)
 *
 * NOAAGlobalTemp's annual global land-and-ocean temperature departures, 1850–2025 (observation-based analysis), with a
 * 10-year running mean, decade means and the warmest years (all derived from the series), a switch of reference
 * period (the file's 1901–2000 or the product's 1991–2020, by re-subtracting the mean — our step), and links to the
 * observed extreme events in the storm laboratory.
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import data from '@datasets/meteorology/records.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const Y = D.years as number[], A0 = D.anomaly as number[];
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;

export default function RecordsView() {
  const { query } = useRoute();
  const base = query.get('base') === '1991' ? 1991 : 1901;
  const offset = base === 1991 ? mean(A0.filter((_, i) => Y[i] >= 1991 && Y[i] <= 2020)) : 0;
  const A = A0.map((x) => x - offset);
  const year = Math.min(2025, Math.max(1850, Number(query.get('year') ?? 2024) || 2024)), yi = Y.indexOf(year);
  const run = useMemo(() => Y.map((y, i) => (i >= 9 ? [y, mean(A.slice(i - 9, i + 1))] as [number, number] : null)).filter(Boolean) as [number, number][], [A]);
  const ranked = useMemo(() => Y.map((y, i) => ({ y, a: A[i] })).sort((p, q) => q.a - p.a), [A]);
  const decades = useMemo(() => { const out: [number, number][] = []; for (let d = 1850; d <= 2020; d += 10) { const v = A.filter((_, i) => Y[i] >= d && Y[i] < d + 10); if (v.length === 10) out.push([d, mean(v)]); } return out; }, [A]);
  const rank = ranked.findIndex((r) => r.y === year) + 1;
  return (
    <>
      <Panel id="rc-controls" className="left-panel" title="A year in the record">
        <label className="slider-row"><span style={{ minWidth: 40 }}>year</span><input type="range" min={1850} max={2025} step={1} value={year} aria-label="Year" onChange={(e) => setQuery({ year: e.target.value })} /><span>{year}</span></label>
        <div role="radiogroup" aria-label="Reference period" className="chip-row" style={{ gap: 4, margin: '6px 0' }}>
          {[['1901', '1901–2000 (file)'], ['1991', '1991–2020']].map(([k, l]) => <button key={k} role="radio" aria-checked={String(base) === k} className={`chip ${String(base) === k ? 'active' : ''}`} onClick={() => setQuery({ base: k === '1901' ? null : k })}>{l}</button>)}
        </div>
        <dl className="kv" aria-label="Year values">
          <KV k={`Departure from the ${base === 1991 ? '1991–2020' : '1901–2000'} average`} v={`${A[yi] >= 0 ? '+' : ''}${formatSig(A[yi], 3)} °C`} />
          <KV k="Rank, warmest first" v={`${rank} of ${Y.length}`} />
          <KV k="10-year mean ending this year" v={yi >= 9 ? `${formatSig(mean(A.slice(yi - 9, yi + 1)), 3)} °C` : '—'} />
        </dl>
        <div className="section-title">Warmest ten years</div>
        <ol className="life-reports" aria-label="Warmest years" style={{ paddingLeft: 20, fontSize: 12 }}>{ranked.slice(0, 10).map((r) => <li key={r.y}>{r.y}: {r.a >= 0 ? '+' : ''}{formatSig(r.a, 3)} °C</li>)}</ol>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The global temperature record <ProvenanceBadge cls="observed" title="Observation-based analysis (NOAAGlobalTemp v6.1.0); running means, ranks and decade means derived" /><DepthSwitch /></h1>
          <p className="note">“{D.title}”, {D.years[0]}–{D.years[D.years.length - 1]}, NOAA. <SourceLinks ids={[D.source]} /> Each point is one year's departure from the average of a reference period; the line is a 10-year running mean (our calculation).</p></div>
        <LinePlot ariaLabel="Global temperature departures" width={620} height={300} xLabel="year" yLabel={`°C from ${base === 1991 ? '1991–2020' : '1901–2000'} mean`} series={[{ points: Y.map((y, i) => [y, A[i]] as [number, number]), color: '#9aa6c8', label: 'annual' }, { points: run, color: '#ff7a90', label: '10-year mean' }]} markers={[{ x: year, y: A[yi], color: '#f5c76b' }]} />
        <table className="table-mini" aria-label="Decade means" style={{ maxWidth: 620 }}>
          <thead><tr>{decades.slice(-9).map(([d]) => <th key={d}>{d}s</th>)}</tr></thead>
          <tbody><tr>{decades.slice(-9).map(([d, v]) => <td key={d}>{v >= 0 ? '+' : ''}{formatSig(v, 2)}</td>)}</tr></tbody>
        </table>
        <AtDepth level="understand">
          <p className="note">Understand — NOAAGlobalTemp is an observation-based analysis; its method is described by Yin et al. (2024) <SourceLinks ids={[D.paper]} />. Changing the reference period moves every value by the same amount (here {formatSig(offset, 3)} °C) but not the shape of the curve.</p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — finding: {D.baseFinding} Product page: “{D.productNote}” NASA's GISTEMP table could not be read (its robots.txt disallows the data folder), so the two analyses are not compared here.</p>
        </AtDepth>
      </div>
      <Panel id="rc-detail" className="right-panel" title="Observed extremes">
        <p className="note">Individual events, from the official reports:</p>
        <button className="chip" onClick={() => navigate('/meteorology/storms?storm=hurricane')}>Hurricanes Katrina (2005) and Andrew (1992) →</button>
        <button className="chip" onClick={() => navigate('/meteorology/storms?storm=tornado')}>Bridge Creek–Moore tornado (1999) →</button>
        <button className="chip" onClick={() => navigate('/meteorology/storms?storm=midlatitude')}>The 1993 Superstorm →</button>
        <button className="chip" onClick={() => navigate('/meteorology/storms?storm=heat')}>The 1995 Chicago heat wave →</button>
        <button className="chip" onClick={() => navigate('/meteorology/radiation?tab=forcing')}>Greenhouse forcing →</button>
        <RelatedLinks id="instrument:records" limit={3} />
      </Panel>
    </>
  );
}
