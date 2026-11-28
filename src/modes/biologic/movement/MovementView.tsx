/**
 * Movement — #/biologic/movement?tab=bones|muscle&k=&b=&p=   (Phase 12, Gate 12.2)
 *
 *  bones   SEER's divisions (206 named bones: 80 axial, 126 appendicular) and four bone types, with the BodyParts3D
 *          skeleton one click away
 *  muscle  three muscle types and muscle heat (SEER); Hill's (1938) force–velocity hyperbola v = b(P₀ − P)/(P + a)
 *          for frog sartorius at 0 °C (a/P₀ ≈ 0·25, b/l ≈ 0·33/s), with power and the load that maximises it
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { hillOptimalLoad, hillPower, hillVelocity } from '@/core/biology/physiology';
import data from '@datasets/biology/physiology.json';

const D = data as unknown as {
  bones: { divisions: { quote: string; axial: number; appendicular: number; total: number }; types: { id: string; quote: string }[]; typesIntro: string };
  muscle: { types: { quote: string }; heat: { quote: string }; hill: { eq1: string; eq2: string; asymptotes: string; aOverP0: number; aOverP0Where: string; bOverL: number; bOverLWhere: string; animal: string } };
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const SEER = ['seer-training'];

function BonesTab() {
  const dv = D.bones.divisions;
  return (
    <>
      <Panel id="bones-panel" className="left-panel" title="Skeleton">
        <blockquote className="quote">“{dv.quote}” <SourceLinks ids={SEER} /></blockquote>
        <button className="chip" onClick={() => navigate('/biologic/body?sel=skeleton&iso=1')}>The skeleton in 3D (BodyParts3D) →</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Bones <ProvenanceBadge cls="observed" title="Counts and definitions quoted from NCI SEER" /></h1></div>
        <svg viewBox="0 0 600 70" role="img" aria-label="Axial and appendicular bones" style={{ width: '100%', maxWidth: 600 }}>
          <rect x={0} y={10} width={(dv.axial / dv.total) * 600} height={34} fill="#e8e2d0" />
          <rect x={(dv.axial / dv.total) * 600} y={10} width={(dv.appendicular / dv.total) * 600} height={34} fill="#9aa6c8" />
          <text x={8} y={32} fontSize={13} fill="#1a1a1a">axial {dv.axial}</text>
          <text x={(dv.axial / dv.total) * 600 + 8} y={32} fontSize={13} fill="#0a0a14">appendicular {dv.appendicular}</text>
          <text x={0} y={62} fontSize={11} fill="var(--text-dim)">{dv.axial} + {dv.appendicular} = {dv.axial + dv.appendicular} named bones</text>
        </svg>
        <p className="note">“{D.bones.typesIntro}” <SourceLinks ids={SEER} /></p>
        <div className="bio-cards" role="list" aria-label="Bone types">
          {D.bones.types.map((t) => <div key={t.id} role="listitem" className="bio-card" style={{ cursor: 'default' }}><span className="bio-card-sym" style={{ fontSize: 15, textTransform: 'capitalize' }}>{t.id}</span><span className="note">“{t.quote}”</span></div>)}
        </div>
      </div>
      <Panel id="bones-detail" className="right-panel" title="Related">
        <RelatedLinks id="structure:organ-skeleton" limit={5} />
      </Panel>
    </>
  );
}

function MuscleTab() {
  const { query } = useRoute();
  const h = D.muscle.hill;
  const k = num(query, 'k', h.aOverP0, 0.05, 1), b = num(query, 'b', h.bOverL, 0.05, 5), p = num(query, 'p', 0.3, 0, 1);
  const ps = Array.from({ length: 101 }, (_, i) => i / 100);
  const pOpt = hillOptimalLoad(k);
  return (
    <>
      <Panel id="muscle-controls" className="left-panel" title="Muscle">
        <blockquote className="quote">“{D.muscle.types.quote}” <SourceLinks ids={SEER} /></blockquote>
        <blockquote className="quote">“{D.muscle.heat.quote}” <SourceLinks ids={SEER} /></blockquote>
        <h4 style={{ margin: '10px 0 4px' }}>Hill's constants ({h.animal})</h4>
        <label className="slider-row"><span style={{ minWidth: 70 }}>a/P₀</span><input type="range" min={0.05} max={1} step={0.01} value={k} aria-label="a over P0" onChange={(e) => setQuery({ k: e.target.value })} /><span>{k}</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>b/l (s⁻¹)</span><input type="range" min={0.05} max={5} step={0.01} value={b} aria-label="b over l" onChange={(e) => setQuery({ b: e.target.value })} /><span>{b}</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>load P/P₀</span><input type="range" min={0} max={1} step={0.01} value={p} aria-label="Relative load" onChange={(e) => setQuery({ p: e.target.value })} /><span>{p}</span></label>
        <button className="chip" onClick={() => setQuery({ k: null, b: null })}>Hill's frog sartorius at 0 °C</button>
        <p className="note">a/P₀ ≈ 0·25: {h.aOverP0Where}. b/l: {h.bOverLWhere}.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Force and speed of muscle <ProvenanceBadge cls="derived" title="Hill (1938) equation (1) with his frog-muscle constants" /></h1>
          <p className="note">Hill (1938), equation (1): <span className="mono">{h.eq1}</span>, or (2) <span className="mono">{h.eq2}</span> — {h.asymptotes}. The heavier the load P, the slower the shortening v; with no load the muscle shortens fastest, and against its maximum force P₀ it cannot shorten at all. <SourceLinks ids={['hill-1938']} /></p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <LinePlot ariaLabel="Hill force-velocity curve" width={420} height={260} xLabel="load P / P₀" yLabel="speed v (muscle lengths / s)"
              series={[{ points: ps.map((x) => [x, hillVelocity(x, k, b)] as [number, number]), color: '#5cf2a6', label: 'v = b(P₀ − P)/(P + a)' }]}
              markers={[{ x: p, y: hillVelocity(p, k, b), color: '#f5c76b' }]} />
          </div>
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <LinePlot ariaLabel="Hill power curve" width={420} height={260} xLabel="load P / P₀" yLabel="power P·v (P₀ · lengths / s)"
              series={[{ points: ps.map((x) => [x, hillPower(x, k, b)] as [number, number]), color: '#ff7a90', label: 'P · v' }]}
              vLines={[{ x: pOpt, label: 'max', color: '#9aa6c8' }]} markers={[{ x: p, y: hillPower(p, k, b), color: '#f5c76b' }]} />
          </div>
        </div>
      </div>
      <Panel id="muscle-readout" className="right-panel" title="At this load">
        <dl className="kv" aria-label="Muscle values">
          <KV k="Shortening speed" v={hillVelocity(p, k, b)} unit="lengths/s" sig={3} />
          <KV k="Power" v={hillPower(p, k, b)} unit="P₀·lengths/s" sig={3} />
          <KV k="Unloaded speed b/a" v={b / k} unit="lengths/s" sig={3} />
          <KV k="Load for greatest power" v={pOpt} unit="× P₀" sig={3} title="√(k² + k) − k, with k = a/P₀" />
        </dl>
        <p className="note">Derived from Hill's equation: frog muscle at 0 °C, not human muscle. {formatSig(pOpt * 100, 2)} % of the maximum force gives the most power.</p>
        <RelatedLinks id="process:muscle-contraction" limit={4} />
      </Panel>
    </>
  );
}

export default function MovementView() {
  const { query } = useRoute();
  const tab = query.get('tab') === 'muscle' ? 'muscle' : 'bones';
  return (
    <>
      <nav className="view-switch" aria-label="Movement sections">
        <button className={tab === 'bones' ? 'active' : ''} onClick={() => setQuery({ tab: null })}>Bones</button>
        <button className={tab === 'muscle' ? 'active' : ''} onClick={() => setQuery({ tab: 'muscle' })}>Muscle</button>
      </nav>
      {tab === 'muscle' ? <MuscleTab /> : <BonesTab />}
    </>
  );
}
