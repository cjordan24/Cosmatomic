/**
 * Integrated circuits — #/engineering/chips?p=kilby|noyce&s=<step>   (Phase 15, Gate 15.3)
 *
 * The two 1959 patents that put a whole circuit into one piece of semiconductor, read on the USPTO page images:
 * Kilby (US 3,138,743) and Noyce (US 2,981,877), with their original drawing sheets (public domain) and a
 * step-through of Noyce's planar process in his own words, drawn as a schematic section after his Fig. 2.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import data from '@datasets/engineering/chips.json';

interface Pat { source: string; number: string; title: string; filed: string; granted: string; assignee: string; image: string; imageCaption: string; quotes: string[] }
const D = data as unknown as { kilby: Pat; noyce: Pat & { steps: { title: string; quote: string }[]; scale: { quote: string } } };
const SI = '#55607a', N = '#4a6fa5', P = '#a5624a', OX = '#7df9ff', MET = '#f5c76b';

/** Schematic cross-section after Noyce's Fig. 2 at step s (0–3): not to scale. */
function Section({ s }: { s: number }) {
  const W = 560;
  return (
    <svg viewBox={`0 0 ${W} 200`} role="img" aria-label={`Planar process, step ${s + 1}`} style={{ width: '100%', maxWidth: W }}>
      <rect x={20} y={70} width={520} height={110} fill={SI} />
      <path d="M 170 70 Q 280 170 390 70 Z" fill={N} /><path d="M 220 70 Q 280 130 340 70 Z" fill={P} /><path d="M 255 70 Q 280 98 305 70 Z" fill={N} />
      <text x={30} y={170} fontSize={12} fill="#dde">silicon body</text><text x={185} y={100} fontSize={12} fill="#fff">N</text><text x={232} y={86} fontSize={11} fill="#fff">P</text><text x={276} y={84} fontSize={10} fill="#fff">N</text>
      {s >= 0 && <rect x={20} y={58} width={520} height={12} fill={OX} opacity={0.75} />}
      {s >= 2 && <><rect x={268} y={58} width={24} height={12} fill="#03050c" /><rect x={226} y={58} width={14} height={12} fill="#03050c" /></>}
      {s >= 3 && <><rect x={268} y={46} width={24} height={24} fill={MET} /><path d="M 280 46 L 480 46 L 480 58 L 292 58 Z" fill={MET} /><rect x={226} y={46} width={14} height={24} fill={MET} /><path d="M 233 46 L 60 46 L 60 58 L 226 58 Z" fill={MET} /></>}
      <text x={430} y={40} fontSize={11} fill={s >= 3 ? MET : 'transparent'}>metal leads on the oxide</text>
      <text x={420} y={86} fontSize={11} fill={OX}>↑ oxide layer</text>
      {s >= 2 && <text x={210} y={30} fontSize={11} fill="var(--text-dim)">windows opened through the oxide</text>}
      <text x={20} y={196} fontSize={10} fill="var(--text-faint)">Schematic after Noyce's Fig. 2 (emitter N, base P, collector N); thicknesses exaggerated, not to scale.</text>
    </svg>
  );
}

export default function ChipsView() {
  const { query } = useRoute();
  const which = query.get('p') === 'kilby' ? 'kilby' : 'noyce';
  const pat: Pat = which === 'kilby' ? D.kilby : D.noyce;
  const s = Math.min(3, Math.max(0, Number(query.get('s')) || 0));
  const step = D.noyce.steps[s];
  return (
    <>
      <Panel id="chips-list" className="left-panel" title="Two patents, 1959">
        {([['kilby', D.kilby], ['noyce', D.noyce]] as const).map(([k, p]) => (
          <button key={k} className={`chip ${k === which ? 'active' : ''}`} aria-pressed={k === which} onClick={() => setQuery({ p: k === 'noyce' ? null : k })} style={{ display: 'block', marginBottom: 6 }}>{k === 'kilby' ? 'Kilby' : 'Noyce'} — {p.title}</button>
        ))}
        <dl className="kv" aria-label="Patent values">
          <KV k="Patent" v={`US ${pat.number}`} /><KV k="Filed" v={pat.filed} /><KV k="Granted" v={pat.granted} /><KV k="Assignee" v={pat.assignee} />
        </dl>
        <p className="note">Both read on the U.S. Patent Office page images. <SourceLinks ids={[pat.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>A whole circuit in one crystal <ProvenanceBadge cls="observed" title="Patent text and drawings (public domain)" /></h1>
          {pat.quotes.map((q, i) => <p key={i} className="note">“{q}”</p>)}
          <p className="note"><SourceLinks ids={[pat.source]} /></p></div>
        {which === 'noyce' && (
          <section aria-label="Planar process" style={{ marginBottom: 12 }}>
            <div className="chip-row" role="group" aria-label="Process steps">{D.noyce.steps.map((x, i) => <button key={x.title} className={`chip ${i === s ? 'active' : ''}`} aria-pressed={i === s} onClick={() => setQuery({ s: String(i) })}>{i + 1}. {x.title}</button>)}</div>
            <Section s={s} />
            <blockquote className="quote">“{step.quote}” <SourceLinks ids={[D.noyce.source]} /></blockquote>
          </section>
        )}
        <figure style={{ margin: 0 }}>
          <img src={pat.image} alt={`US patent ${pat.number}, ${pat.imageCaption}`} style={{ maxWidth: '100%', maxHeight: 520, background: '#fff', borderRadius: 6 }} />
          <figcaption className="note">US {pat.number}, {pat.imageCaption}. United States Patent Office (public domain).</figcaption>
        </figure>
      </div>
      <Panel id="chips-detail" className="right-panel" title="How small">
        <p className="note">Noyce: “{D.noyce.scale.quote}” For comparison, a mitochondrion is “Typically 1–2 micrometers but can be up to 7 micrometers long”. <SourceLinks ids={['nigms-inside-the-cell']} /></p>
        <button className="chip" onClick={() => navigate('/biologic?sel=mitochondrion')}>Microns on the scale of life →</button>
        <button className="chip" onClick={() => navigate('/engineering/semiconductors')}>The p-n junction →</button>
        <button className="chip" onClick={() => navigate('/atomic/element/14')}>Silicon →</button>
        <p className="note">Moore's 1965 observation on how the number of components per chip grows is not shown: the only copy found is on a site whose terms forbid automated access.</p>
        <RelatedLinks id="instrument:chips" limit={3} />
      </Panel>
    </>
  );
}
