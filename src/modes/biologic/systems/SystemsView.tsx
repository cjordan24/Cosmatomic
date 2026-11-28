/**
 * Organ systems — #/biologic/systems?tab=urinary|digestive|endocrine|blood|skin|reproductive   (Phase 12, Gates 12.5–12.6)
 *
 * Quoted facts (NIDDK, NCI SEER) with derived values worked out beside them: NIDDK's “about 150 quarts” a day and
 * “about a half cup … every minute” converted with NIST SP 811 factors and compared; the urine fraction; skin weight
 * in kilograms; the oocyte decline. Every derived number is labelled derived.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import data from '@datasets/biology/systems.json';

interface Q { quote: string; source: string; url: string }
const D = data as unknown as {
  units: { quartL: number; cupL: number; poundKg: number };
  urinary: { nephrons: Q; filteredPerDay: Q & { quarts: number }; urinePerDay: Q & { low: number; high: number }; perMinute: Q & { cups: number }; size: Q; gfr: { lines: { id: string; quote: string }[] } };
  digestive: { length: Q; solid: Q; breakdown: { items: { from: string; to: string; link: string }[]; tail: string } };
  endocrine: { glands: Q; pituitary: Q; thyroid: Q; pancreas: Q[] };
  bloodImmune: { formed: Q; lymphReturn: Q; nodes: Q; spleen: Q; thymus: Q };
  skin: { organ: Q & { pounds: number }; epidermis: Q; dermis: Q; turnover: Q; sweat: Q };
  reproductive: { functions: Q & { list: string[] }; testis: Q; spermatogenesis: Q; ovary: Q; oocytesBirth: Q & { count: number }; oocytesPuberty: Q & { count: number } };
};
/** Litres per day → millilitres per minute. */
export const lpdToMlpm = (l: number) => (l * 1000) / 1440;
export const KIDNEY = {
  filteredMlPerMin: lpdToMlpm(D.urinary.filteredPerDay.quarts * D.units.quartL),
  halfCupMlPerMin: D.urinary.perMinute.cups * D.units.cupL * 1000,
  urineFraction: [D.urinary.urinePerDay.low / D.urinary.filteredPerDay.quarts, D.urinary.urinePerDay.high / D.urinary.filteredPerDay.quarts],
};
const TABS: [string, string][] = [['urinary', 'Kidneys'], ['digestive', 'Digestion'], ['endocrine', 'Hormones'], ['blood', 'Blood & lymph'], ['skin', 'Skin'], ['reproductive', 'Reproduction']];

function Quote({ q }: { q: Q }) {
  return <blockquote className="quote">“{q.quote}” <SourceLinks ids={[q.source]} /></blockquote>;
}
const NIST = ['nist-sp811'];

function Urinary() {
  const u = D.urinary;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Kidneys <ProvenanceBadge cls="observed" title="Quoted from NIDDK and NCI SEER" /></h1></div>
        <Quote q={u.nephrons} /><Quote q={u.filteredPerDay} /><Quote q={u.urinePerDay} /><Quote q={u.perMinute} /><Quote q={u.size} />
        <h3 style={{ margin: '10px 0 4px' }}>GFR, as NIDDK explains the test</h3>
        <ul className="life-reports" aria-label="GFR categories">{u.gfr.lines.map((l) => <li key={l.id} style={{ marginBottom: 4 }}>“{l.quote}”</li>)}</ul>
        <p className="note"><SourceLinks ids={['niddk']} /> Educational, not medical advice.</p>
      </div>
      <Panel id="kid-detail" className="right-panel" title="Worked out (derived)">
        <dl className="kv" aria-label="Kidney arithmetic">
          <KV k="150 quarts a day" v={KIDNEY.filteredMlPerMin} unit="mL/min" sig={3} title="150 × 0.9463529 L ÷ 1440 min" />
          <KV k="Half a cup a minute" v={KIDNEY.halfCupMlPerMin} unit="mL/min" sig={3} title="0.5 × 0.2365882 L" />
          <KV k="Share that becomes urine" v={`${(KIDNEY.urineFraction[0] * 100).toFixed(1)}–${(KIDNEY.urineFraction[1] * 100).toFixed(1)} %`} />
        </dl>
        <p className="note">NIDDK's two round figures — 150 quarts a day and half a cup a minute — give about 99 and 118 mL a minute: the same order, not the same number. Both are shown. Conversions: NIST SP 811. <SourceLinks ids={NIST} /></p>
        <button className="chip" onClick={() => navigate('/biologic/body?sel=right-kidney&iso=1')}>The kidney in 3D →</button>
        <button className="chip" onClick={() => navigate('/biologic/transport?tab=osmosis')}>Osmosis →</button>
        <RelatedLinks id="structure:organ-right-kidney" limit={3} />
      </Panel>
    </>
  );
}

function Digestive() {
  const d = D.digestive;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Digestion <ProvenanceBadge cls="observed" title="Quoted from NIDDK and NCI SEER" /></h1></div>
        <Quote q={d.length} /><Quote q={d.solid} />
        <div className="bio-cards" role="list" aria-label="What digestion breaks food into">
          {d.breakdown.items.map((i) => <button key={i.from} role="listitem" className="bio-card" onClick={() => navigate(i.link)}><span className="bio-card-sym" style={{ fontSize: 15 }}>{i.from}</span><span className="note">break into {i.to} →</span></button>)}
        </div>
        <p className="note">“Proteins break into amino acids / Fats break into fatty acids and glycerol / Carbohydrates break into simple sugars.” “{d.breakdown.tail}” <SourceLinks ids={['niddk']} /></p>
      </div>
      <Panel id="dig-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/biologic/body?sel=small-intestine&iso=1')}>The small intestine in 3D →</button>
        <RelatedLinks id="structure:organ-stomach" limit={4} />
      </Panel>
    </>
  );
}

function Endocrine() {
  const e = D.endocrine;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Hormones <ProvenanceBadge cls="observed" title="Quoted from NCI SEER" /></h1></div>
        <Quote q={e.glands} /><Quote q={e.pituitary} /><Quote q={e.thyroid} />{e.pancreas.map((q, i) => <Quote key={i} q={q} />)}
      </div>
      <Panel id="endo-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/biologic/molecules?tab=carbs&sel=pubchem-5793')}>Glucose, which insulin and glucagon regulate →</button>
        <p className="note">No hormone half-lives are given: none was found in an allowed open source.</p>
      </Panel>
    </>
  );
}

function Blood() {
  const b = D.bloodImmune;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Blood and lymph <ProvenanceBadge cls="observed" title="Quoted from NCI SEER" /></h1></div>
        <Quote q={b.formed} /><Quote q={b.lymphReturn} /><Quote q={b.nodes} /><Quote q={b.spleen} /><Quote q={b.thymus} />
      </div>
      <Panel id="blood-detail2" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/biologic/circulation?tab=blood')}>Where the blood is →</button>
        <button className="chip" onClick={() => navigate('/biologic?sel=red-blood-cell')}>Red blood cells on the scale of life →</button>
        <p className="note">No blood-cell counts per microlitre are given: none was found in an allowed open source.</p>
      </Panel>
    </>
  );
}

function Skin() {
  const s = D.skin;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Skin <ProvenanceBadge cls="observed" title="Quoted from NCI SEER" /></h1></div>
        <Quote q={s.organ} /><Quote q={s.epidermis} /><Quote q={s.dermis} /><Quote q={s.turnover} /><Quote q={s.sweat} />
      </div>
      <Panel id="skin-detail" className="right-panel" title="Worked out (derived)">
        <dl className="kv" aria-label="Skin arithmetic"><KV k="About six pounds" v={s.organ.pounds * D.units.poundKg} unit="kg" sig={3} title="6 × 0.4535924 kg (NIST SP 811)" /></dl>
        <p className="note"><SourceLinks ids={NIST} /></p>
      </Panel>
    </>
  );
}

function Reproductive() {
  const r = D.reproductive;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Reproduction <ProvenanceBadge cls="observed" title="Quoted from NCI SEER" /></h1></div>
        <blockquote className="quote">“{r.functions.quote}”: {r.functions.list.join(' · ')} <SourceLinks ids={['seer-training']} /></blockquote>
        <Quote q={r.testis} /><Quote q={r.spermatogenesis} /><Quote q={r.ovary} /><Quote q={r.oocytesBirth} /><Quote q={r.oocytesPuberty} />
      </div>
      <Panel id="repro-detail" className="right-panel" title="Worked out (derived)">
        <dl className="kv" aria-label="Oocyte arithmetic"><KV k="Decline from birth to puberty" v={`${Math.round((1 - r.oocytesPuberty.count / r.oocytesBirth.count) * 100)} %`} title="1 − 400 000 / 700 000" /></dl>
        <button className="chip" onClick={() => navigate('/biologic?sel=human-egg')}>The human egg on the scale of life →</button>
      </Panel>
    </>
  );
}

export default function SystemsView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'urinary';
  return (
    <>
      <nav className="view-switch" aria-label="Organ system sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'urinary' ? null : t })}>{l}</button>)}
      </nav>
      <Panel id="systems-list" className="left-panel" title="Organ systems">
        <ol className="life-list" aria-label="Systems">{TABS.map(([t, l]) => <li key={t}><button className={`link-btn ${t === tab ? 'active' : ''}`} onClick={() => setQuery({ tab: t === 'urinary' ? null : t })}>{l}</button></li>)}</ol>
        <p className="note">Facts quoted from NIDDK and the NCI SEER Training Modules; worked-out numbers are labelled derived.</p>
        <button className="chip" onClick={() => navigate('/biologic/body')}>The body in 3D →</button>
      </Panel>
      {tab === 'digestive' ? <Digestive /> : tab === 'endocrine' ? <Endocrine /> : tab === 'blood' ? <Blood /> : tab === 'skin' ? <Skin /> : tab === 'reproductive' ? <Reproductive /> : <Urinary />}
    </>
  );
}
