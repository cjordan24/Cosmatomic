/**
 * Machine learning and AI — #/engineering/ai?tab=history|learning|attention|models|agents|energy   (Phase 16)
 *
 *  history    a timeline of documented results, kept apart from predictions and conjectures
 *  learning   a small network trained live by gradient descent and backpropagation (Cauchy 1847; Widrow & Hoff 1960)
 *  attention  scaled dot-product attention on a short sentence (Vaswani et al. 2017) and Kaplan's scaling law
 *  models     four model families: what each developer discloses, and what it does not
 *  agents     how a coding agent works, as an educational step-through (Claude Code docs; MCP specification)
 *  energy     energy per prompt and per 1,000 inferences, labelled company-reported, measured or estimated
 */
import { useEffect, useMemo, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { useVoyager } from '@/shared/store';
import { accuracy, attention, initNet, loss, makeData, parameterCount, predict, trainStep, type Net } from '@/core/computing/neural';
import data from '@datasets/engineering/ai.json';

interface Ev { year: number; kind: 'documented' | 'prediction' | 'conjecture'; title: string; source: string; quote: string; en?: string; note?: string }
interface Fam { family: string; source: string; weights: string; disclosed: string[]; undisclosed: string[]; note?: string }
const D = data as unknown as {
  timeline: Ev[];
  learning: { cauchy: { source: string; where: string; eq: string; converge: string; en: string }; widrow: { source: string; where: string; eq: string; quote: string; stable: string }; d2l: { source: string; gd: string; backprop: string } };
  attention: { source: string; where: string; eq: string; why: string };
  scaling: { source: string; where: string; eq: string; alpha: number; Nc: number; unit: string; caution: string };
  models: Fam[];
  agents: { claudeCode: Record<string, string> & { source: string }; mcp: Record<string, string> & { source: string } };
  energy: { google: { source: string; kind: string; whPerPrompt: number; narrowWh: number; gco2: number; mlWater: number; scope: string; quote: string; tv: string }; jegham: { source: string; kind: string; wh: number; sd: number; scope: string; quote: string }; luccioni: { source: string; kind: string; scope: string; rows: { task: string; kwh: number }[]; note: string }; llama: { source: string; quote: string } };
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const ON = '#ff8a65';
const KIND_COL = { documented: '#5cf2a6', prediction: '#f5c76b', conjecture: '#b18cff' } as const;

function History() {
  return (
    <>
      <Panel id="hist-key" className="left-panel" title="Reading the timeline">
        <ul className="life-reports" aria-label="Kinds of entry">
          <li><span style={{ color: KIND_COL.documented }}>●</span> documented — a published result or disclosed fact</li>
          <li><span style={{ color: KIND_COL.prediction }}>●</span> prediction — what someone expected</li>
          <li><span style={{ color: KIND_COL.conjecture }}>●</span> conjecture — a working assumption</li>
        </ul>
        <p className="note">Artificial general intelligence is not on this timeline: it is a hypothesis, not a documented achievement.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>From gradients to language models <ProvenanceBadge cls="observed" title="Quoted from each primary source" /></h1></div>
        <ol className="life-list" aria-label="AI timeline">
          {D.timeline.map((e, i) => (
            <li key={i} style={{ borderLeft: `3px solid ${KIND_COL[e.kind]}`, paddingLeft: 10, marginBottom: 8 }}>
              <strong>{e.year} · {e.title}</strong> <span className="note" style={{ color: KIND_COL[e.kind] }}>{e.kind}</span>
              <div className="note">“{e.quote}”{e.en ? ` — ${e.en}` : ''} {e.note ?? ''} <SourceLinks ids={[e.source]} /></div>
            </li>
          ))}
        </ol>
      </div>
      <Panel id="hist-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: 'learning' })}>Train a network →</button>
        <button className="chip" onClick={() => navigate('/engineering/architecture')}>The stored-program computer →</button>
        <RelatedLinks id="instrument:ai" limit={3} />
      </Panel>
    </>
  );
}

function Learning() {
  const { query } = useRoute();
  const kind = (['xor', 'circle', 'spiral'] as const).find((k) => k === query.get('d')) ?? 'xor';
  const hidden = Math.round(num(query, 'h', 8, 1, 24)), eta = num(query, 'eta', 0.5, 0.01, 3);
  const reduced = useVoyager((s) => s.settings.reducedMotion);
  const ds = useMemo(() => makeData(kind, 160, 3), [kind]);
  const sizes = useMemo(() => (kind === 'spiral' ? [2, hidden, hidden, 1] : [2, hidden, 1]), [kind, hidden]);
  const [state, setState] = useState<{ net: Net; epoch: number; hist: [number, number][] }>(() => ({ net: initNet(sizes, 2), epoch: 0, hist: [] }));
  const [running, setRunning] = useState(false);
  useEffect(() => { setState({ net: initNet(sizes, 2), epoch: 0, hist: [] }); setRunning(false); }, [sizes, kind]);
  useEffect(() => {
    if (!running) return;
    if (state.epoch >= 3000) { setRunning(false); return; }
    const t = setTimeout(() => setState((s) => { let n = s.net; for (let k = 0; k < 20; k++) n = trainStep(n, ds, eta); const e = s.epoch + 20; return { net: n, epoch: e, hist: [...s.hist, [e, loss(n, ds)] as [number, number]].slice(-300) }; }), 30);
    return () => clearTimeout(t);
  }, [running, state, ds, eta]);
  const G = 40, cells = useMemo(() => { const out: { x: number; y: number; p: number }[] = []; for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { const x = -1 + (2 * (i + 0.5)) / G, y = -1 + (2 * (j + 0.5)) / G; out.push({ x, y, p: predict(state.net, [x, y]) }); } return out; }, [state.net]);
  const S = 320, px = (v: number) => ((v + 1) / 2) * S, L = D.learning;
  return (
    <>
      <Panel id="learn-controls" className="left-panel" title="A tiny network">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{(['xor', 'circle', 'spiral'] as const).map((k) => <button key={k} className={`chip ${k === kind ? 'active' : ''}`} aria-pressed={k === kind} onClick={() => setQuery({ d: k === 'xor' ? null : k })}>{k === 'xor' ? 'Quadrants (XOR)' : k === 'circle' ? 'A disc' : 'Two spirals'}</button>)}</div>
        <label className="slider-row"><span style={{ minWidth: 80 }}>hidden units</span><input type="range" min={1} max={24} step={1} value={hidden} aria-label="Hidden units" onChange={(e) => setQuery({ h: e.target.value })} /><span>{hidden}</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>learning rate η</span><input type="range" min={0.01} max={3} step={0.01} value={eta} aria-label="Learning rate" onChange={(e) => setQuery({ eta: e.target.value })} /><span>{eta}</span></label>
        <div className="chip-row" style={{ margin: '8px 0' }}>
          <button className="chip" onClick={() => (reduced ? setState((s) => { let n = s.net; for (let k = 0; k < 500; k++) n = trainStep(n, ds, eta); return { net: n, epoch: s.epoch + 500, hist: [...s.hist, [s.epoch + 500, loss(n, ds)] as [number, number]] }; }) : setRunning((r) => !r))}>{running ? 'Pause' : 'Train'}</button>
          <button className="chip" onClick={() => setState((s) => { const n = trainStep(s.net, ds, eta); return { net: n, epoch: s.epoch + 1, hist: [...s.hist, [s.epoch + 1, loss(n, ds)] as [number, number]] }; })}>One step</button>
          <button className="chip" onClick={() => { setRunning(false); setState({ net: initNet(sizes, 2), epoch: 0, hist: [] }); }}>Reset</button>
        </div>
        <dl className="kv" aria-label="Training values">
          <KV k="Layers" v={sizes.join(' → ')} /><KV k="Parameters" v={String(parameterCount(sizes))} />
          <KV k="Steps" v={String(state.epoch)} /><KV k="Loss (cross-entropy)" v={loss(state.net, ds)} sig={3} /><KV k="Accuracy" v={`${Math.round(accuracy(state.net, ds) * 100)} %`} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>How a network learns <ProvenanceBadge cls="derived" title="Trained live: gradient descent with backpropagation" /></h1>
          <p className="note">Every step moves each weight against its gradient — Cauchy's method of 1847: {L.cauchy.eq} ({L.cauchy.where}), so the error falls; “{L.cauchy.converge}” ({L.cauchy.en}) <SourceLinks ids={[L.cauchy.source]} /> d2l: “{L.d2l.gd}” Backpropagation finds every gradient at once: “{L.d2l.backprop}” <SourceLinks ids={[L.d2l.source]} /></p></div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label="Decision map and data" style={{ width: S, height: S, borderRadius: 8 }}>
            {cells.map((c, i) => <rect key={i} x={px(c.x) - S / G / 2} y={S - px(c.y) - S / G / 2} width={S / G + 0.5} height={S / G + 0.5} fill={`rgba(${Math.round(255 * c.p)}, ${Math.round(120 + 20 * c.p)}, ${Math.round(255 * (1 - c.p))}, 0.35)`} />)}
            {ds.map((d, i) => <circle key={i} cx={px(d.x[0])} cy={S - px(d.x[1])} r={3.2} fill={d.y ? '#ff8a65' : '#7df9ff'} stroke="#000" strokeWidth={0.5} />)}
          </svg>
          <div style={{ width: 320, flex: '0 0 320px' }}><LinePlot ariaLabel="Loss against training steps" width={320} height={220} xLabel="training step" yLabel="loss" series={[{ points: state.hist.length ? state.hist : [[0, loss(state.net, ds)]], color: ON, label: 'loss' }]} /></div>
        </div>
        <p className="note">Background: the network's output over the plane (orange near 1, cyan near 0). Widrow & Hoff (1960) adjusted their Adaline the same way: {L.widrow.eq} ({L.widrow.where}); “{L.widrow.stable}” — past that limit the descent is unstable, so too large a learning rate makes the loss oscillate or grow. <SourceLinks ids={[L.widrow.source]} /></p>
      </div>
      <Panel id="learn-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: 'attention' })}>Attention →</button>
        <button className="chip" onClick={() => navigate('/biologic/nerves')}>Real neurons →</button>
        <RelatedLinks id="instrument:ai" limit={3} />
      </Panel>
    </>
  );
}

const WORDS = ['the', 'cat', 'sat', 'on', 'the', 'mat'];
/** Tiny hand-set 4-d embeddings (illustrative, not learned). */
const EMB: Record<string, number[]> = { the: [0.1, 0, 0, 0.2], cat: [1, 0.2, 0, 0], sat: [0.1, 1, 0.3, 0], on: [0, 0.1, 1, 0.1], mat: [0.9, 0, 0.2, 0.3] };
function Attention() {
  const { query } = useRoute();
  const qi = Math.round(num(query, 'q', 2, 0, WORDS.length - 1)), sharp = num(query, 's', 3, 0, 8);
  const X = WORDS.map((w) => EMB[w]);
  const Q = X.map((r) => r.map((v) => v * sharp)), res = attention(Q, X, X);
  const sc = D.scaling, Ns = Array.from({ length: 50 }, (_, i) => 10 ** (5 + i * 0.12));
  return (
    <>
      <Panel id="att-controls" className="left-panel" title="Attention on a sentence">
        <div className="chip-row" role="group" aria-label="Query word">{WORDS.map((w, i) => <button key={i} className={`chip ${i === qi ? 'active' : ''}`} aria-pressed={i === qi} onClick={() => setQuery({ q: String(i) })}>{w}</button>)}</div>
        <label className="slider-row"><span style={{ minWidth: 70 }}>sharpness</span><input type="range" min={0} max={8} step={0.1} value={sharp} aria-label="Query scale" onChange={(e) => setQuery({ s: e.target.value })} /><span>{sharp}</span></label>
        <p className="note">The word vectors here are set by hand for illustration; a real model learns them, and learns separate projections for queries, keys and values.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Attention <ProvenanceBadge cls="illustrative" title="Eq. (1) computed exactly on hand-set vectors" /></h1>
          <p className="note">Vaswani et al. (2017), {D.attention.where}: {D.attention.eq}. “{D.attention.why}” <SourceLinks ids={[D.attention.source]} /></p></div>
        <div role="list" aria-label="Attention weights" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          {WORDS.map((w, j) => { const a = res.weights[qi][j]; return <div key={j} role="listitem" style={{ textAlign: 'center' }}><div style={{ height: 160 * a + 4, width: 46, background: ON, opacity: 0.3 + 0.7 * a, borderRadius: 4 }} /><div>{w}</div><div className="note">{a.toFixed(2)}</div></div>; })}
        </div>
        <p className="note">How much “{WORDS[qi]}” attends to each word: softmax of its scaled dot products with every key. The weights sum to 1; the output is the same mix of the value vectors.</p>
        <h3 style={{ margin: '14px 0 4px' }}>Scaling</h3>
        <LinePlot ariaLabel="Loss against parameters" width={520} height={220} xLog xLabel="non-embedding parameters N" yLabel="test loss (nats)" series={[{ points: Ns.map((N) => [N, (sc.Nc / N) ** sc.alpha] as [number, number]), color: ON, label: sc.eq }]} />
        <p className="note">Kaplan et al. (2020), {sc.where}: {sc.eq} with α_N ∼ {sc.alpha} and N_c ∼ {formatSig(sc.Nc, 2)} — {sc.unit}. Ten times the parameters lowers the loss by a factor 10^0.076 ≈ {formatSig(10 ** sc.alpha, 3)}. {sc.caution} <SourceLinks ids={[sc.source]} /></p>
      </div>
      <Panel id="att-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/engineering/information')}>Text as bytes →</button>
        <RelatedLinks id="instrument:ai" limit={3} />
      </Panel>
    </>
  );
}

function Models() {
  return (
    <>
      <Panel id="mod-key" className="left-panel" title="What counts as known">
        <p className="note"><span style={{ color: '#5cf2a6' }}>Disclosed</span>: stated by the developer, quoted or summarised from its own document. <span style={{ color: '#ff7a90' }}>Not disclosed</span>: not found in that developer's public documents — not a guess, not an estimate.</p>
        <p className="note">Independent estimates of undisclosed figures exist; they are shown only on the Energy tab, labelled as estimates.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Four model families <ProvenanceBadge cls="observed" title="Each developer's own documents, read 2026-11-28" /></h1></div>
        <div className="stage-grid">
          {D.models.map((m) => (
            <section key={m.family} aria-label={m.family} className="panel" style={{ position: 'relative', padding: 12 }}>
              <h3 style={{ margin: '0 0 4px' }}>{m.family}</h3>
              <p className="note">Weights: {m.weights}</p>
              <ul className="life-reports" aria-label={`${m.family} disclosed`}>{m.disclosed.map((d) => <li key={d} style={{ color: '#cfe' }}>{d}</li>)}</ul>
              <p className="note" style={{ color: '#ff7a90' }}>Not disclosed: {m.undisclosed.join('; ')}.</p>
              {m.note && <p className="note">{m.note}</p>}
              <SourceLinks ids={[m.source]} />
            </section>
          ))}
        </div>
      </div>
      <Panel id="mod-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: 'energy' })}>Energy per prompt →</button>
        <RelatedLinks id="instrument:ai" limit={3} />
      </Panel>
    </>
  );
}

const AGENT_STEPS = [
  { t: 'Request', who: 'you', body: 'You ask for a change: “make the tests pass”.', ctx: 1 },
  { t: 'Gather context', who: 'model + tools', body: 'The model reads files and runs searches through tools; their output goes into the context window.', ctx: 3 },
  { t: 'Plan', who: 'model', body: 'The model reasons about what to change.', ctx: 4 },
  { t: 'Ask permission', who: 'you', body: 'Editing a file or running a command can require your approval.', ctx: 4 },
  { t: 'Take action', who: 'tools', body: 'A tool edits the file; a checkpoint keeps the old version.', ctx: 5 },
  { t: 'Verify', who: 'tools + model', body: 'A tool runs the tests; the model reads the result and loops back if they fail.', ctx: 6 },
  { t: 'Report', who: 'model', body: 'The model tells you what it did.', ctx: 6 },
];
function Agents() {
  const { query } = useRoute();
  const s = Math.round(num(query, 's', 0, 0, AGENT_STEPS.length - 1)), st = AGENT_STEPS[s], C = D.agents.claudeCode, M = D.agents.mcp;
  return (
    <>
      <Panel id="ag-controls" className="left-panel" title="One task, step by step">
        <ol className="life-list" aria-label="Agent steps">{AGENT_STEPS.map((x, i) => <li key={x.t}><button className={`link-btn ${i === s ? 'active' : ''}`} onClick={() => setQuery({ s: String(i) })}>{i + 1}. {x.t}</button></li>)}</ol>
        <div className="chip-row"><button className="chip" disabled={s === 0} onClick={() => setQuery({ s: String(s - 1) })}>← Back</button><button className="chip active" disabled={s === AGENT_STEPS.length - 1} onClick={() => setQuery({ s: String(s + 1) })}>Next →</button></div>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>How a coding agent works <ProvenanceBadge cls="illustrative" title="An educational representation, not the internals of any commercial agent" /></h1>
          <p className="note">An educational representation built from public documentation — not a reproduction of any product's internals. Anthropic's documentation of Claude Code: “{C.what}” “{C.phases}” “{C.loop}” <SourceLinks ids={[C.source]} /></p></div>
        <section aria-label="Current step" className="panel" style={{ position: 'relative', padding: 14 }}>
          <h3 style={{ margin: 0, color: ON }}>{s + 1}. {st.t}</h3>
          <p className="note">Who acts: {st.who}</p><p>{st.body}</p>
          <div aria-label="Context window" style={{ display: 'flex', gap: 3, marginTop: 6 }}>{Array.from({ length: 8 }, (_, i) => <div key={i} style={{ flex: 1, height: 14, borderRadius: 3, background: i < st.ctx ? ON : 'rgba(255,255,255,0.08)' }} />)}</div>
          <p className="note">Context window filling (illustrative): “{C.context}”</p>
        </section>
        <p className="note">“{C.tools}” “{C.safety}” <SourceLinks ids={[C.source]} /></p>
        <h3 style={{ margin: '12px 0 4px' }}>Connecting tools: the Model Context Protocol</h3>
        <p className="note">“{M.what}” Its roles — “{M.roles}”. Servers offer “{M.tools}”. “{M.consent}”; “{M.human}” <SourceLinks ids={[M.source]} /></p>
      </div>
      <Panel id="ag-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/engineering/network')}>Networks →</button>
        <RelatedLinks id="instrument:ai" limit={3} />
      </Panel>
    </>
  );
}

function Energy() {
  const { query } = useRoute();
  const per = num(query, 'wh', 0.24, 0.01, 30), lq = num(query, 'n', 6, 0, 10), n = 10 ** lq, ci = num(query, 'ci', 400, 0, 1200);
  const E = D.energy, kWh = (per * n) / 1000;
  return (
    <>
      <Panel id="en-controls" className="left-panel" title="Your assumptions">
        <label className="slider-row"><span style={{ minWidth: 90 }}>Wh per prompt</span><input type="range" min={0.01} max={30} step={0.01} value={per} aria-label="Energy per prompt" onChange={(e) => setQuery({ wh: e.target.value })} /><span>{per}</span></label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="chip" onClick={() => setQuery({ wh: String(E.google.whPerPrompt) })}>Google, median Gemini text prompt ({E.google.whPerPrompt})</button>
          <button className="chip" onClick={() => setQuery({ wh: String(E.jegham.wh) })}>Estimate, short GPT-4o prompt ({E.jegham.wh})</button>
        </div>
        <label className="slider-row"><span style={{ minWidth: 90 }}>prompts</span><input type="range" min={0} max={10} step={0.1} value={lq} aria-label="Number of prompts (log)" onChange={(e) => setQuery({ n: e.target.value })} /><span>{formatSig(n, 2)}</span></label>
        <label className="slider-row"><span style={{ minWidth: 90 }}>grid gCO₂/kWh</span><input type="range" min={0} max={1200} step={10} value={ci} aria-label="Grid carbon intensity" onChange={(e) => setQuery({ ci: e.target.value })} /><span>{ci}</span></label>
        <dl className="kv" aria-label="Energy values"><KV k="Energy" v={kWh >= 1e6 ? `${formatSig(kWh / 1e6, 3)} GWh` : kWh >= 1e3 ? `${formatSig(kWh / 1e3, 3)} MWh` : `${formatSig(kWh, 3)} kWh`} /><KV k="CO₂ at your grid intensity" v={(kWh * ci) / 1e6} unit="tonnes" sig={3} /></dl>
        <p className="note">The grid carbon intensity is your choice — no single value applies everywhere. Multiplying a per-prompt figure by a count assumes every prompt is alike.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Energy and AI <ProvenanceBadge cls="observed" title="Figures labelled by who measured or estimated them" /></h1></div>
        <table className="table-mini" aria-label="Energy per prompt">
          <thead><tr><th>Figure</th><th>Kind</th><th>Value</th><th>Scope</th></tr></thead>
          <tbody>
            <tr><td>Google (Elsworth et al. 2025)</td><td>{E.google.kind}</td><td>{E.google.whPerPrompt} Wh ({E.google.narrowWh} Wh narrow method); {E.google.gco2} gCO₂e; {E.google.mlWater} mL water</td><td>{E.google.scope}</td></tr>
            <tr><td>Jegham et al. 2025</td><td>{E.jegham.kind}</td><td>{E.jegham.wh} ± {E.jegham.sd} Wh</td><td>{E.jegham.scope}</td></tr>
          </tbody>
        </table>
        <p className="note">“{E.google.quote}” — “{E.google.tv}” <SourceLinks ids={[E.google.source]} /> “{E.jegham.quote}” <SourceLinks ids={[E.jegham.source]} /></p>
        <LinePlot ariaLabel="Energy per 1,000 inferences by task" width={600} height={240} yLog xLabel="task (in Table 2 order)" yLabel="kWh per 1,000 inferences" series={[{ points: E.luccioni.rows.map((r, i) => [i + 1, r.kwh] as [number, number]), color: ON, label: 'mean' }]} markers={E.luccioni.rows.map((r, i) => ({ x: i + 1, y: r.kwh, color: ON }))} />
        <p className="note">Luccioni et al. (2024), {E.luccioni.kind}, {E.luccioni.scope}: {E.luccioni.rows.map((r, i) => `${i + 1} ${r.task} ${r.kwh}`).join(' · ')}. {E.luccioni.note} <SourceLinks ids={[E.luccioni.source]} /></p>
      </div>
      <Panel id="en-detail" className="right-panel" title="Training">
        <p className="note">Training a large model is a different scale: Meta describes “{E.llama.quote}” while training Llama 3. <SourceLinks ids={[E.llama.source]} /> Total training energy was not found in the public documents of the current Claude, Gemini or GPT models.</p>
        <button className="chip" onClick={() => navigate('/engineering/datacentres')}>U.S. data centres →</button>
        <RelatedLinks id="instrument:ai" limit={3} />
      </Panel>
    </>
  );
}

export const AI_TABS: [string, string][] = [['history', 'History'], ['learning', 'Training'], ['attention', 'Attention'], ['models', 'Models'], ['agents', 'Agents'], ['energy', 'Energy']];
export default function AiView() {
  const { query } = useRoute();
  const tab = AI_TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'history';
  return (
    <>
      <nav className="view-switch" aria-label="AI sections">
        {AI_TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'history' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'learning' ? <Learning /> : tab === 'attention' ? <Attention /> : tab === 'models' ? <Models /> : tab === 'agents' ? <Agents /> : tab === 'energy' ? <Energy /> : <History />}
    </>
  );
}
