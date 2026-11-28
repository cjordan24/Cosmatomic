/**
 * The stored-program computer — #/engineering/architecture?prog=add|countdown|multiply   (Phase 15, Gate 15.4)
 *
 * A teaching machine laid out as von Neumann's 1945 EDVAC report divides a computer — CA, CC, M, I, O — with orders
 * and numbers in one memory, each word marked as one or the other. Step one fetch–decode–execute cycle at a time,
 * or run; the part that acts on each step lights up. Not the EDVAC's actual order code.
 */
import { useEffect, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { useVoyager } from '@/shared/store';
import { OP_CLASS, PROGRAMS, boot, run, step, type Machine } from '@/core/computing/cpu';
import data from '@datasets/engineering/architecture.json';

interface W { where: string; quote: string }
const D = data as unknown as { source: string; parts: (W & { id: string })[]; stored: W & { mark: string }; classes: W; outputFromM: W; nerves: W };
const ON = '#ff8a65';
const CLASS_LABEL = { a: '(a) arithmetic in CA', b: '(b) transfer of a number', c: '(c) next order from elsewhere in M', d: '(d) input / output' } as const;

/** Which of CA, CC, M, O the last order used. */
function active(m: Machine): Set<string> {
  const op = m.last.split(/[ :]/)[0];
  const s = new Set<string>(['CC']);
  if (op === 'ADD' || op === 'SUB') { s.add('CA'); s.add('M'); }
  if (op === 'LOAD' || op === 'STORE') { s.add('M'); s.add('CA'); }
  if (op === 'OUT') { s.add('O'); s.add('CA'); }
  return s;
}

export default function ArchitectureView() {
  const { query } = useRoute();
  const prog = (Object.keys(PROGRAMS).find((k) => k === query.get('prog')) ?? 'multiply');
  const reduced = useVoyager((s) => s.settings.reducedMotion);
  const [m, setM] = useState<Machine>(() => boot(PROGRAMS[prog].mem));
  const [running, setRunning] = useState(false);
  useEffect(() => { setM(boot(PROGRAMS[prog].mem)); setRunning(false); }, [prog]);
  useEffect(() => {
    if (!running) return;
    if (m.halted) { setRunning(false); return; }
    const t = setTimeout(() => setM((x) => step(x)), 350);
    return () => clearTimeout(t);
  }, [running, m]);
  const act = active(m);
  const box = (id: string, x: number, y: number, w: number, h: number, label: string) => (
    <g key={id}><rect x={x} y={y} width={w} height={h} rx={10} fill={act.has(id) && m.steps > 0 ? 'rgba(255,138,101,0.25)' : 'none'} stroke={ON} strokeWidth={act.has(id) && m.steps > 0 ? 2.5 : 1} /><text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize={14} fill={ON}>{label}</text></g>
  );
  return (
    <>
      <Panel id="arch-controls" className="left-panel" title="Run a program">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{Object.entries(PROGRAMS).map(([k, p]) => <button key={k} className={`chip ${k === prog ? 'active' : ''}`} aria-pressed={k === prog} onClick={() => setQuery({ prog: k === 'multiply' ? null : k })}>{p.title}</button>)}</div>
        <div className="chip-row" style={{ margin: '10px 0' }}>
          <button className="chip" disabled={m.halted} onClick={() => setM(step(m))}>Step</button>
          <button className="chip" disabled={m.halted} onClick={() => (reduced ? setM(run(m)) : setRunning((r) => !r))}>{running ? 'Pause' : 'Run'}</button>
          <button className="chip" onClick={() => { setRunning(false); setM(boot(PROGRAMS[prog].mem)); }}>Reset</button>
        </div>
        <dl className="kv" aria-label="Machine state">
          <KV k="Next order at (CC)" v={String(m.pc)} /><KV k="Accumulator (CA)" v={String(m.acc)} />
          <KV k="Output" v={m.out.length ? m.out.join(', ') : '—'} /><KV k="Cycles" v={String(m.steps)} />
          <KV k="Last" v={m.last} />
        </dl>
        <p className="note">Our OUT sends the accumulator straight out; von Neumann thought it “again best to make all transfers from M (by O) into R, and never directly from C” ({D.outputFromM.where}).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The stored-program computer <ProvenanceBadge cls="illustrative" title="A teaching machine organised as the EDVAC report describes; not the EDVAC's own code" /></h1>
          <p className="note">von Neumann (1945): “{D.stored.quote}” — so “{D.stored.mark}” ({D.stored.where}) <SourceLinks ids={[D.source]} /></p></div>
        <svg viewBox="0 0 600 150" role="img" aria-label="The five parts" style={{ width: '100%', maxWidth: 600 }}>
          {box('I', 10, 50, 70, 50, 'I')}{box('CC', 120, 10, 150, 55, 'CC control')}{box('CA', 120, 85, 150, 55, 'CA arithmetic')}{box('M', 310, 10, 170, 130, 'M memory')}{box('O', 520, 50, 70, 50, 'O')}
          <line x1={80} x2={120} y1={75} y2={75} stroke={ON} opacity={0.4} /><line x1={270} x2={310} y1={37} y2={37} stroke={ON} opacity={0.4} /><line x1={270} x2={310} y1={112} y2={112} stroke={ON} opacity={0.4} /><line x1={480} x2={520} y1={75} y2={75} stroke={ON} opacity={0.4} />
        </svg>
        <div role="grid" aria-label="Memory" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, maxWidth: 600 }}>
          {m.mem.map((w, i) => (
            <div key={i} role="gridcell" aria-label={`Word ${i}`} style={{ border: `1px solid ${i === m.pc && !m.halted ? '#f5c76b' : 'var(--line)'}`, borderRadius: 8, padding: '4px 6px', background: i === m.pc && !m.halted ? 'rgba(245,199,107,0.12)' : 'transparent', fontSize: 12 }}>
              <div className="note" style={{ fontSize: 10 }}>{i} · {w.kind === 'order' ? 'order' : 'number'}</div>
              <div style={{ color: w.kind === 'order' ? ON : 'var(--text)' }}>{w.kind === 'order' ? `${w.op}${['OUT', 'HALT'].includes(w.op) ? '' : ` ${w.addr}`}` : w.value}</div>
            </div>
          ))}
        </div>
        <p className="note">Gold: the word CC fetches next. Each order is one of the report's four classes: {Object.entries(CLASS_LABEL).map(([k, l]) => `${l} — ${Object.entries(OP_CLASS).filter(([, c]) => c === k).map(([o]) => o).join(', ')}`).join('; ')}. “{D.classes.quote}” ({D.classes.where}) JZ, a jump taken only when the accumulator is zero, is our addition.</p>
      </div>
      <Panel id="arch-detail" className="right-panel" title="The five parts">
        {D.parts.map((p) => <p key={p.id} className="note"><strong style={{ color: ON }}>{p.id}</strong> — “{p.quote}” ({p.where})</p>)}
        <p className="note">“{D.nerves.quote}” ({D.nerves.where}) <SourceLinks ids={[D.source]} /> <button className="link-btn" onClick={() => navigate('/biologic/nerves')}>Neurons →</button></p>
        <button className="chip" onClick={() => navigate('/engineering')}>The adder inside CA →</button>
        <RelatedLinks id="instrument:architecture" limit={3} />
      </Panel>
    </>
  );
}
