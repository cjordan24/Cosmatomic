/**
 * Circulation and breathing — #/biologic/circulation?tab=heart|flow|blood|lungs   (Phase 12, Gate 12.3)
 *
 *  heart  the path of blood (NHLBI), cardiac cycle and output (SEER); rate slider → cycle length and the stroke
 *         volume that SEER's 5 L/min implies (derived); NHLBI adult blood-pressure categories applied as printed
 *  flow   Poiseuille (1840): Q = k″PD⁴/L — flow against diameter, his seven tubes and his printed mean
 *  blood  blood volume and plasma (SEER); where the blood is (SEER)
 *  lungs  alveoli (NHLBI) and breathing rate (SEER)
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { classifyBloodPressure, cycleSeconds, poiseuilleRatio, strokeVolumeMl } from '@/core/biology/physiology';
import data from '@datasets/biology/physiology.json';

interface Q { quote: string; source?: string; url?: string }
const D = data as unknown as {
  heart: { pathQuotes: Q[]; output: Q & { litresPerMinute: number }; sinoatrial: Q; cycle: Q & { seconds: number }; phases: Q; restingRate: Q & { low: number; high: number }; valves: Q[]; path: string[] };
  bloodPressure: { updated: string; categories: { id: string; label: string; text: string }[] };
  blood: { volume: Q; plasma: Q & { fraction: number }; distribution: { id: string; label: string; share: number; quote: string }[]; velocity: Q; resistance: Q };
  lungs: { alveoli: Q & { count: number }; breathing: Q & { low: number; high: number } };
  poiseuille: { law: string; lawQuote: string; conclusion: string; tubes: [string, number][]; printedMean: number; tC: number; water: { k: number; quote: string }; units: string };
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const SEER = ['seer-training'], NHLBI = ['nhlbi'];
const BP_COLOR: Record<string, string> = { normal: '#5cf2a6', elevated: '#f5c76b', stage1: '#ffb347', stage2: '#ff7a90', crisis: '#ff3b5c' };

function HeartTab() {
  const { query } = useRoute();
  const hr = num(query, 'hr', 75, 40, 180), sys = num(query, 'sys', 118, 70, 220), dia = num(query, 'dia', 76, 40, 140);
  const bp = classifyBloodPressure(sys, dia), cat = D.bloodPressure.categories.find((c) => c.id === bp)!;
  const h = D.heart;
  return (
    <>
      <Panel id="heart-controls" className="left-panel" title="Heart">
        <label className="slider-row"><span style={{ minWidth: 80 }}>heart rate</span><input type="range" min={40} max={180} step={1} value={hr} aria-label="Heart rate" onChange={(e) => setQuery({ hr: e.target.value })} /><span>{hr} /min</span></label>
        <dl className="kv" aria-label="Heart values">
          <KV k="Cycle length 60/rate" v={cycleSeconds(hr)} unit="s" sig={3} />
          <KV k="Stroke volume for 5 L/min" v={strokeVolumeMl(h.output.litresPerMinute, hr)} unit="mL" sig={3} title="Derived: SEER's about 5 litres per minute divided by the rate" />
        </dl>
        <p className="note">At 75 beats a minute the cycle is 0.8 s, as SEER says. The stroke volume is derived from SEER's output, not quoted.</p>
        <h4 style={{ margin: '12px 0 4px' }}>Blood pressure (mm Hg)</h4>
        <label className="slider-row"><span style={{ minWidth: 80 }}>systolic</span><input type="range" min={70} max={220} step={1} value={sys} aria-label="Systolic pressure" onChange={(e) => setQuery({ sys: e.target.value })} /><span>{sys}</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>diastolic</span><input type="range" min={40} max={140} step={1} value={dia} aria-label="Diastolic pressure" onChange={(e) => setQuery({ dia: e.target.value })} /><span>{dia}</span></label>
        <p aria-label="Blood pressure category" style={{ margin: '4px 0', color: BP_COLOR[bp], fontWeight: 600 }}>{cat.label}</p>
        <p className="note">Educational illustration of NHLBI's categories, not medical advice.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The heart <ProvenanceBadge cls="observed" title="Quoted from NHLBI and NCI SEER" /></h1>
          <p className="note">“{h.output.quote}” “{h.cycle.quote}” “{h.phases.quote}” <SourceLinks ids={SEER} /> “{h.restingRate.quote}” <SourceLinks ids={NHLBI} /></p></div>
        <svg viewBox="0 0 640 120" role="img" aria-label="The path of blood through the heart" style={{ width: '100%', maxWidth: 640 }}>
          {h.path.map((step, i) => {
            const x = 10 + i * 70, oxy = i >= 5;
            return <g key={step}><rect x={x} y={30} width={62} height={44} rx={8} fill={oxy ? 'rgba(255,90,110,0.35)' : 'rgba(90,140,255,0.35)'} stroke={oxy ? '#ff5a6e' : '#5b8cff'} />
              <text x={x + 31} y={step.includes(' ') ? 50 : 56} textAnchor="middle" fontSize={9.5} fill="var(--text)">{step.split(' ').map((w, k) => <tspan key={k} x={x + 31} dy={k ? 12 : 0}>{w}</tspan>)}</text>
              {i < h.path.length - 1 && <text x={x + 66} y={56} fontSize={12} fill="var(--text-dim)">›</text>}</g>;
          })}
          <text x={10} y={20} fontSize={11} fill="#5b8cff">oxygen-poor blood</text><text x={360} y={20} fontSize={11} fill="#ff5a6e">oxygen-rich blood</text>
          <text x={10} y={100} fontSize={10.5} fill="var(--text-faint)">Path of blood through the heart and lungs as NHLBI describes it; schematic.</text>
        </svg>
        {[...h.pathQuotes, ...h.valves].map((v, i) => <blockquote key={i} className="quote">“{v.quote}” <SourceLinks ids={NHLBI} /></blockquote>)}
        <table className="table-mini" aria-label="Blood pressure categories" style={{ marginTop: 8 }}>
          <thead><tr><th>Category</th><th>Systolic and diastolic pressure (mm Hg)</th></tr></thead>
          <tbody>{D.bloodPressure.categories.map((c) => <tr key={c.id} className={c.id === bp ? 'active' : ''}><td style={{ color: BP_COLOR[c.id] }}>{c.label}</td><td style={{ textAlign: 'left' }}>{c.text}</td></tr>)}</tbody>
        </table>
        <p className="note">NHLBI, High Blood Pressure — Diagnosis (updated {D.bloodPressure.updated}). <SourceLinks ids={NHLBI} /></p>
      </div>
      <Panel id="heart-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/biologic/body?sel=heart&iso=1')}>The heart in 3D →</button>
        <RelatedLinks id="structure:organ-heart" limit={5} />
      </Panel>
    </>
  );
}

function FlowTab() {
  const { query } = useRoute();
  const r = num(query, 'd', 2, 0.25, 4);
  const p = D.poiseuille, mean = p.tubes.reduce((a, [, k]) => a + k, 0) / p.tubes.length;
  const rs = Array.from({ length: 100 }, (_, i) => 0.25 + (i / 99) * 3.75);
  return (
    <>
      <Panel id="flow-controls" className="left-panel" title="Narrow tubes">
        <label className="slider-row"><span style={{ minWidth: 100 }}>diameter ratio</span><input type="range" min={0.25} max={4} step={0.05} value={r} aria-label="Diameter ratio" onChange={(e) => setQuery({ d: e.target.value })} /><span>× {r}</span></label>
        <dl className="kv" aria-label="Flow ratio"><KV k="Flow ratio (D ratio)⁴" v={poiseuilleRatio(r, 1)} unit="×" sig={4} /></dl>
        <blockquote className="quote">“{D.blood.resistance.quote}” <SourceLinks ids={SEER} /></blockquote>
        <blockquote className="quote">“{D.blood.velocity.quote}” <SourceLinks ids={SEER} /></blockquote>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Flow in narrow tubes <ProvenanceBadge cls="observed" title="Poiseuille (1840), Comptes rendus 11, p. 1046 (page image)" /></h1>
          <blockquote className="quote" lang="fr">“{p.lawQuote}” — and “{p.conclusion}” <span className="note" style={{ fontStyle: 'normal' }}>Poiseuille (1840), {'p. 1046'} <SourceLinks ids={['poiseuille-1840']} /></span></blockquote>
          <p className="note">The flow grows as the fourth power of the diameter: double the diameter and, at the same pressure and length, sixteen times as much liquid passes. {p.units}.</p></div>
        <div style={{ flex: '1 1 340px', maxWidth: 440 }}>
          <LinePlot ariaLabel="Flow against diameter" width={440} height={240} xLog yLog xLabel="diameter ratio" yLabel="flow ratio"
            series={[{ points: rs.map((x) => [x, poiseuilleRatio(x, 1)] as [number, number]), color: '#5cf2a6', label: 'Q ∝ D⁴' }]} markers={[{ x: r, y: poiseuilleRatio(r, 1), color: '#f5c76b' }]} />
        </div>
      </div>
      <Panel id="flow-detail" className="right-panel" title={`k″ at ${p.tC} °C (mercury head)`}>
        <table className="table-mini" aria-label="Poiseuille coefficients"><thead><tr><th>tube</th><th>k″</th></tr></thead>
          <tbody>{p.tubes.map(([t, k]) => <tr key={t}><td>{t}</td><td>{k.toFixed(2)}</td></tr>)}</tbody></table>
        <dl className="kv"><KV k="Printed mean" v={p.printedMean} sig={7} /><KV k="Mean of the seven values" v={mean} sig={7} /></dl>
        <p className="note">The printed mean (2495,224) is not the mean of the seven printed values ({formatSig(mean, 7)}); both are shown. With distilled water as the pressure head he gives k″ = {p.water.k}; the ratio of the two coefficients is {formatSig(p.printedMean / p.water.k, 4)}.</p>
        <RelatedLinks id="structure:organ-heart" limit={3} />
      </Panel>
    </>
  );
}

function BloodTab() {
  const b = D.blood;
  return (
    <>
      <Panel id="blood-panel" className="left-panel" title="Blood">
        <blockquote className="quote">“{b.volume.quote}” <SourceLinks ids={SEER} /></blockquote>
        <blockquote className="quote">“{b.plasma.quote}” <SourceLinks ids={SEER} /></blockquote>
        <button className="chip" onClick={() => navigate('/biologic?sel=red-blood-cell')}>Red blood cells on the scale of life →</button>
        <button className="chip" onClick={() => navigate('/biologic/proteins?id=4HHB')}>Haemoglobin →</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Where the blood is <ProvenanceBadge cls="observed" title="Shares quoted from NCI SEER" /></h1></div>
        <svg viewBox="0 0 600 220" role="img" aria-label="Share of blood volume by vessel" style={{ width: '100%', maxWidth: 600 }}>
          {b.distribution.map((d, i) => (
            <g key={d.id}>
              <text x={0} y={30 + i * 44} fontSize={12} fill="var(--text)">{d.label}</text>
              <rect x={150} y={18 + i * 44} width={d.share * 600} height={18} rx={4} fill={d.id === 'veins' ? '#5b8cff' : d.id === 'arteries' ? '#ff5a6e' : '#c99a6b'} />
              <text x={156 + d.share * 600} y={32 + i * 44} fontSize={12} fill="var(--text-dim)">{Math.round(d.share * 100)} %</text>
            </g>
          ))}
        </svg>
        {b.distribution.map((d) => <p key={d.id} className="note" style={{ margin: '2px 0' }}>“{d.quote}”</p>)}
        <p className="note">These shares (about 95 % together) are SEER's statements; the remainder is not assigned on that page. <SourceLinks ids={SEER} /></p>
      </div>
      <Panel id="blood-detail" className="right-panel" title="Related"><RelatedLinks id="structure:organ-heart" limit={4} /></Panel>
    </>
  );
}

function LungsTab() {
  const l = D.lungs;
  return (
    <>
      <Panel id="lungs-panel" className="left-panel" title="Lungs">
        <blockquote className="quote">“{l.alveoli.quote}” <SourceLinks ids={NHLBI} /></blockquote>
        <blockquote className="quote">“{l.breathing.quote}” <SourceLinks ids={SEER} /></blockquote>
        <button className="chip" onClick={() => navigate('/biologic/body?sel=right-lung&iso=1')}>The airways in 3D →</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Breathing <ProvenanceBadge cls="derived" title="Counts derived from SEER's breathing rate" /></h1>
          <p className="note">At 12 to 15 breaths a minute an adult breathes {(l.breathing.low * 1440).toLocaleString('en-GB')} to {(l.breathing.high * 1440).toLocaleString('en-GB')} times a day (× 1440 minutes; derived).</p></div>
        <dl className="kv" aria-label="Breathing values">
          <KV k="Breaths per day (12–15 /min)" v={`${(l.breathing.low * 1440).toLocaleString('en-GB')} – ${(l.breathing.high * 1440).toLocaleString('en-GB')}`} />
          <KV k="Alveoli" v={l.alveoli.count.toExponential(1)} />
        </dl>
      </div>
      <Panel id="lungs-detail" className="right-panel" title="Related"><RelatedLinks id="structure:organ-right-lung" limit={4} /></Panel>
    </>
  );
}

export default function CirculationView() {
  const { query } = useRoute();
  const tab = (['flow', 'blood', 'lungs'] as const).find((t) => t === query.get('tab')) ?? 'heart';
  return (
    <>
      <nav className="view-switch" aria-label="Circulation sections">
        {([['heart', 'Heart'], ['flow', 'Flow in tubes'], ['blood', 'Blood'], ['lungs', 'Lungs']] as const).map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'heart' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'flow' ? <FlowTab /> : tab === 'blood' ? <BloodTab /> : tab === 'lungs' ? <LungsTab /> : <HeartTab />}
    </>
  );
}
