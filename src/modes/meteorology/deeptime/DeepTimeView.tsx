/**
 * Earth's climate through geological time — #/meteorology/deeptime?event=<id>&scale=usgs|ics   (Phase 23, Gate 23.2)
 *
 * A logarithmic timeline from 4.6 billion years ago to the present with the USGS (2018) eons, eras and periods and the
 * ICS (2024/12) ages beside them; twenty events from the formation of Earth to the industrial era, each with its
 * evidence (consensus / proxy / model) and what is — and is not — reliably known; and how proxies record climate.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import data from '@datasets/meteorology/deeptime.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const EV = D.events as any[], SC = D.scale.usgs, P = D.proxies;
const W = 640, X0 = 20, X1 = 620;
/** x position for an age in Ma on a log scale from 4600 Ma to 100 years ago. */
const xOf = (ma: number) => { const lo = Math.log10(0.0001), hi = Math.log10(4600); const v = Math.log10(Math.max(ma, 0.0001)); return X1 - ((v - lo) / (hi - lo)) * (X1 - X0); };
const ageText = (ma: number) => (ma >= 1000 ? `${(ma / 1000).toFixed(2)} Ga` : ma >= 1 ? `${ma} Ma` : ma >= 0.001 ? `${(ma * 1000).toFixed(1)} ka` : `${Math.round(ma * 1e6)} years`);
const BAND: Record<string, string> = { Hadean: '#5a3a3a', Archean: '#6b4a5a', Proterozoic: '#4a5a7a', Phanerozoic: '#3b5a4a', Paleozoic: '#3b6a5a', Mesozoic: '#4a7a5a', Cenozoic: '#6a8a5a' };

export default function DeepTimeView() {
  const { query } = useRoute();
  const ev = EV.find((e) => e.id === query.get('event')) ?? EV.find((e) => e.id === 'petm');
  const fields: [string, string | undefined][] = [['Global temperature', ev.temp], ['CO₂', ev.co2], ['Oxygen', ev.o2], ['Ice', ev.ice], ['Sea level', ev.sea], ['Life lost', ev.loss]];
  return (
    <>
      <Panel id="dt-list" className="left-panel" title="Events">
        <ol aria-label="Events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {EV.map((e) => <li key={e.id}><button className={`chip ${e.id === ev.id ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', marginBottom: 3 }} onClick={() => setQuery({ event: e.id })}>{e.name} <span style={{ opacity: 0.7, fontSize: 10.5 }}>{ageText(e.ma)}</span></button></li>)}
        </ol>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Earth's climate through time <ProvenanceBadge cls="observed" title="Consensus dates, proxy reconstructions and models — each event labelled" /><DepthSwitch /></h1>
          <p className="note">The time axis is logarithmic: each step left is ten times further back. Click an event.</p></div>
        <svg viewBox={`0 0 ${W} 170`} role="img" aria-label="Geological timeline" style={{ width: '100%', maxWidth: W }}>
          {SC.eons.map(([n, a, b]: [string, number, number]) => <g key={n}><rect x={xOf(a)} y={20} width={Math.max(1, xOf(b || 0.0001) - xOf(a))} height={22} fill={BAND[n]} /><text x={(xOf(a) + xOf(b || 0.0001)) / 2} y={35} textAnchor="middle" fontSize={10} fill="var(--text)">{n}</text></g>)}
          {SC.eras.map(([n, a, b]: [string, number, number]) => <g key={n}><rect x={xOf(a)} y={44} width={Math.max(1, xOf(b || 0.0001) - xOf(a))} height={18} fill={BAND[n]} /><text x={(xOf(a) + xOf(b || 0.0001)) / 2} y={57} textAnchor="middle" fontSize={9.5} fill="var(--text)">{n}</text></g>)}
          {SC.periods.map(([n, a, b]: [string, number, number], i: number) => <rect key={n} x={xOf(a)} y={64} width={Math.max(1, xOf(b || 0.0001) - xOf(a))} height={10} fill={i % 2 ? '#82b1ff' : '#5c8dff'} opacity={0.55}><title>{n}: {a}–{b} Ma</title></rect>)}
          {EV.map((e) => <g key={e.id} style={{ cursor: 'pointer' }} onClick={() => setQuery({ event: e.id })}><line x1={xOf(e.ma)} x2={xOf(e.ma)} y1={78} y2={e.id === ev.id ? 120 : 100} stroke={e.id === ev.id ? '#f5c76b' : 'var(--text-dim)'} strokeWidth={e.id === ev.id ? 2.5 : 1} /><circle cx={xOf(e.ma)} cy={e.id === ev.id ? 120 : 100} r={e.id === ev.id ? 5 : 3} fill={e.id === ev.id ? '#f5c76b' : 'var(--text-dim)'} /></g>)}
          {[4000, 1000, 100, 10, 1, 0.1, 0.01, 0.001].map((m) => <text key={m} x={xOf(m)} y={160} textAnchor="middle" fontSize={9.5} fill="var(--text-dim)">{ageText(m)}</text>)}
          <text x={X0} y={12} fontSize={10} fill="var(--text-dim)">4.6 billion years ago</text><text x={X1} y={12} textAnchor="end" fontSize={10} fill="var(--text-dim)">today</text>
        </svg>
        <h2 style={{ fontWeight: 300, fontSize: 18, margin: '4px 0' }} aria-label="Event title">{ev.name} — {ev.dateText}</h2>
        <p className="note"><span style={{ color: '#f5c76b' }}>[{ev.kind}]</span></p>
        {ev.q.map(([s, q]: [string, string], i: number) => <p key={i} className="note">{ev.tags?.[s] ? <span style={{ color: '#9aa6c8' }}>[{ev.tags[s]}] </span> : null}“{q}” <SourceLinks ids={[s]} /></p>)}
        <dl className="kv" aria-label="What is known" style={{ maxWidth: 620 }}>{fields.filter(([, v]) => v).map(([k, v]) => <KV key={k} k={k} v={v!} />)}</dl>
        {ev.finding ? <AtDepth level="understand"><p className="note">Finding: {ev.finding}</p></AtDepth> : null}
        {ev.link ? <button className="chip" onClick={() => navigate(ev.link)}>Explore the data →</button> : null}
        <AtDepth level="research">
          <p className="note">Research — boundaries from USGS Fact Sheet 2018–3054. “{SC.note}” <SourceLinks ids={[SC.source]} /> The ICS chart (2024/12) revises several: {D.scale.ics.diffs.map(([n, a, b]: [string, number, number]) => `${n} ${a} → ${b} Ma`).join('; ')}. “{D.scale.ics.caveat}” <SourceLinks ids={[D.scale.ics.source]} /></p>
        </AtDepth>
      </div>
      <Panel id="dt-proxies" className="right-panel" title="How do we know?">
        <p className="note">NOAA: “{P.def}” <SourceLinks ids={[P.source]} /></p>
        <dl className="kv" aria-label="Proxies">{P.items.map(([k, q]: [string, string]) => <div key={k} style={{ marginBottom: 6 }}><dt style={{ color: 'var(--accent)', fontSize: 12 }}>{k}</dt><dd className="note" style={{ margin: 0 }}>“{q}”</dd></div>)}</dl>
        <AtDepth level="understand"><p className="note">Isotopes: “{P.isotope.q}” <SourceLinks ids={[P.isotope.source]} /> “{P.tradeoff.q}” <SourceLinks ids={[P.tradeoff.source]} /></p></AtDepth>
        <button className="chip" onClick={() => navigate('/meteorology/iceages')}>Ice-core records →</button>
        <button className="chip" onClick={() => navigate('/biologic')}>Life's history →</button>
        <RelatedLinks id="instrument:deeptime" limit={3} />
      </Panel>
    </>
  );
}
