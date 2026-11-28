/**
 * Bits and logic — #/engineering?tab=bits|gates|adder   (Phase 15, Gate 15.1)
 *
 *  bits   one integer in binary, hexadecimal and two's complement; flip bits directly; the binary prefixes
 *  gates  each gate's truth table with live inputs; NAND alone rebuilding NOT, AND, OR and XOR; Boole's x² = x
 *  adder  a 4-bit ripple-carry adder evaluated gate by gate: every carry and sum bit shown
 * All logic is computed (src/core/computing/logic.ts); quotations come from datasets/engineering/logic.json.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { GATES, NAND_ONLY, fromTwosComplement, gateArity, rippleAdd, toBinary, toHex, truthTable, twosComplement, type Bit, type GateName } from '@/core/computing/logic';
import data from '@datasets/engineering/logic.json';

interface Q { quote: string; source: string; where?: string }
const D = data as unknown as { boole: Q & { identity: string }; shannon: { switching: Q & { convention: string }; bit: Q }; prefixes: { source: string; quote: string; rows: { name: string; symbol: string; factor: string; value: number }[] } };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const int = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isInteger(v) ? clamp(v, a, b) : d; };
const GATE_NAMES: GateName[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
const ON = '#ff8a65', OFF = 'rgba(255,138,101,0.18)';

function BitsTab() {
  const { query } = useRoute();
  const v = int(query, 'v', 42, 0, 255);
  const bits = toBinary(v, 8);
  return (
    <>
      <Panel id="bits-controls" className="left-panel" title="One byte">
        <label className="slider-row"><span style={{ minWidth: 60 }}>value</span><input type="range" min={0} max={255} step={1} value={v} aria-label="Byte value" onChange={(e) => setQuery({ v: e.target.value })} /><span>{v}</span></label>
        <dl className="kv" aria-label="Byte values">
          <KV k="Decimal" v={String(v)} /><KV k="Binary" v={bits} /><KV k="Hexadecimal" v={`0x${toHex(v, 8)}`} />
          <KV k="As a signed byte (two's complement)" v={String(fromTwosComplement(bits))} />
        </dl>
        <p className="note">Click a bit to flip it. Each place is worth twice the one to its right; a signed byte gives its leftmost bit the weight −128, so 11111111 is −1 ({twosComplement(-1, 8)}).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Bits <ProvenanceBadge cls="derived" title="Binary place values, computed" /></h1>
          <p className="note">Shannon (1948) named the unit: “{D.shannon.bit.quote}” ({D.shannon.bit.where}) <SourceLinks ids={[D.shannon.bit.source]} /></p></div>
        <div role="group" aria-label="Bits" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {bits.split('').map((b, i) => {
            const w = 2 ** (7 - i);
            return <button key={i} className="bit-cell" aria-pressed={b === '1'} aria-label={`Bit worth ${w}`} onClick={() => setQuery({ v: String(v ^ w) })}
              style={{ width: 62, height: 78, borderRadius: 10, border: `1px solid ${ON}`, background: b === '1' ? ON : 'transparent', color: b === '1' ? '#1a0802' : ON, fontSize: 28, cursor: 'pointer' }}>
              {b}<div style={{ fontSize: 11, opacity: 0.8 }}>{w}</div></button>;
          })}
        </div>
        <h3 style={{ margin: '18px 0 6px' }}>Binary multiples</h3>
        <table className="table-mini" aria-label="Binary prefixes">
          <thead><tr><th>Name</th><th>Symbol</th><th>Factor</th><th>Value</th></tr></thead>
          <tbody>{D.prefixes.rows.map((r) => <tr key={r.symbol}><td>{r.name}</td><td>{r.symbol}</td><td>{r.factor}</td><td>{r.value.toLocaleString('en-US')}</td></tr>)}</tbody>
        </table>
        <p className="note">“{D.prefixes.quote}” <SourceLinks ids={[D.prefixes.source]} /></p>
      </div>
      <Panel id="bits-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: 'gates' })}>Logic gates →</button>
        <RelatedLinks id="instrument:logic" limit={4} />
      </Panel>
    </>
  );
}

function GatesTab() {
  const { query } = useRoute();
  const g = (GATE_NAMES.find((x) => x === query.get('g')) ?? 'AND') as GateName;
  const a = int(query, 'a', 1, 0, 1) as Bit, b = int(query, 'b', 0, 0, 1) as Bit;
  const out = GATES[g](a, b), table = truthTable(g), n = gateArity(g);
  return (
    <>
      <Panel id="gates-controls" className="left-panel" title="A logic gate">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{GATE_NAMES.map((x) => <button key={x} className={`chip ${x === g ? 'active' : ''}`} aria-pressed={x === g} onClick={() => setQuery({ g: x })}>{x}</button>)}</div>
        <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
          <button className="chip" aria-pressed={a === 1} onClick={() => setQuery({ a: String(1 - a) })}>A = {a}</button>
          {n === 2 && <button className="chip" aria-pressed={b === 1} onClick={() => setQuery({ b: String(1 - b) })}>B = {b}</button>}
        </div>
        <dl className="kv" aria-label="Gate output"><KV k={`${g}(${n === 2 ? `${a}, ${b}` : a})`} v={String(out)} /></dl>
        <table className="table-mini" aria-label="Truth table">
          <thead><tr>{n === 2 ? <><th>A</th><th>B</th></> : <th>A</th>}<th>{g}</th></tr></thead>
          <tbody>{table.map((r, i) => { const hit = n === 2 ? r[0] === a && r[1] === b : r[0] === a; return <tr key={i} style={{ background: hit ? 'rgba(255,138,101,0.15)' : undefined }}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>; })}</tbody>
        </table>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Logic gates <ProvenanceBadge cls="derived" title="Truth tables computed" /></h1>
          <p className="note">Boole (1854) treated logic as algebra; his law “{D.boole.identity}” — {D.boole.quote} ({D.boole.where}) <SourceLinks ids={[D.boole.source]} /></p>
          <p className="note">Shannon (1938) showed that switching circuits obey the same algebra: “{D.shannon.switching.quote}” ({D.shannon.switching.where}) {D.shannon.switching.convention} <SourceLinks ids={[D.shannon.switching.source]} /> The gates here use today's convention, 1 = on.</p></div>
        <svg viewBox="0 0 520 180" role="img" aria-label={`${g} gate with its inputs and output`} style={{ width: '100%', maxWidth: 520 }}>
          <line x1={40} x2={190} y1={n === 2 ? 60 : 90} y2={n === 2 ? 60 : 90} stroke={a ? ON : OFF} strokeWidth={4} />
          {n === 2 && <line x1={40} x2={190} y1={120} y2={120} stroke={b ? ON : OFF} strokeWidth={4} />}
          <rect x={190} y={35} width={140} height={110} rx={20} fill="none" stroke={ON} strokeWidth={2} />
          <text x={260} y={98} textAnchor="middle" fontSize={22} fill={ON}>{g}</text>
          <line x1={330} x2={480} y1={90} y2={90} stroke={out ? ON : OFF} strokeWidth={4} />
          <text x={24} y={(n === 2 ? 64 : 94)} fontSize={14} fill="var(--text)">{a}</text>
          {n === 2 && <text x={24} y={124} fontSize={14} fill="var(--text)">{b}</text>}
          <text x={488} y={95} fontSize={14} fill="var(--text)">{out}</text>
        </svg>
        <h3 style={{ margin: '12px 0 6px' }}>NAND can build every other gate</h3>
        <table className="table-mini" aria-label="NAND-only constructions">
          <thead><tr><th>A</th><th>B</th><th>NOT A</th><th>A AND B</th><th>A OR B</th><th>A XOR B</th></tr></thead>
          <tbody>{([[0, 0], [0, 1], [1, 0], [1, 1]] as [Bit, Bit][]).map(([x, y]) => <tr key={`${x}${y}`}><td>{x}</td><td>{y}</td><td>{NAND_ONLY.NOT(x, y)}</td><td>{NAND_ONLY.AND(x, y)}</td><td>{NAND_ONLY.OR(x, y)}</td><td>{NAND_ONLY.XOR(x, y)}</td></tr>)}</tbody>
        </table>
        <p className="note">Each column is wired from NAND gates only (one, two, three and four of them) and matches the gate's own truth table — checked for all inputs in the tests.</p>
      </div>
      <Panel id="gates-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: 'adder' })}>Adding with gates →</button>
        <RelatedLinks id="instrument:logic" limit={4} />
      </Panel>
    </>
  );
}

function AdderTab() {
  const { query } = useRoute();
  const x = int(query, 'x', 9, 0, 15), y = int(query, 'y', 12, 0, 15);
  const r = rippleAdd(x, y, 4);
  const W = 600, cx = (i: number) => W - 90 - i * 130;
  return (
    <>
      <Panel id="adder-controls" className="left-panel" title="Add two 4-bit numbers">
        <label className="slider-row"><span style={{ minWidth: 40 }}>A</span><input type="range" min={0} max={15} step={1} value={x} aria-label="First number" onChange={(e) => setQuery({ x: e.target.value })} /><span>{x} = {toBinary(x, 4)}</span></label>
        <label className="slider-row"><span style={{ minWidth: 40 }}>B</span><input type="range" min={0} max={15} step={1} value={y} aria-label="Second number" onChange={(e) => setQuery({ y: e.target.value })} /><span>{y} = {toBinary(y, 4)}</span></label>
        <dl className="kv" aria-label="Adder result"><KV k="Sum bits" v={toBinary(r.sum, 4)} /><KV k="Carry out" v={String(r.carry)} /><KV k="Total" v={`${r.total} = ${r.carry}${toBinary(r.sum, 4)}`} /></dl>
        <p className="note">{r.carry ? 'The answer needs a fifth bit: the carry out of the last stage.' : 'The answer fits in four bits.'}</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Adding with gates <ProvenanceBadge cls="derived" title="A ripple-carry adder evaluated gate by gate" /></h1>
          <p className="note">A full adder (FA) adds two bits and an incoming carry with two XOR gates, two AND gates and an OR gate; four in a row add 4-bit numbers, each passing its carry to the next.</p></div>
        <svg viewBox={`0 0 ${W} 260`} role="img" aria-label="Ripple-carry adder" style={{ width: '100%', maxWidth: W }}>
          {r.stages.map((s, i) => (
            <g key={i}>
              <rect x={cx(i) - 40} y={90} width={80} height={70} rx={10} fill="none" stroke={ON} />
              <text x={cx(i)} y={130} textAnchor="middle" fontSize={14} fill={ON}>FA {i}</text>
              <circle cx={cx(i) - 18} cy={50} r={11} fill={s.a ? ON : OFF} /><text x={cx(i) - 18} y={30} textAnchor="middle" fontSize={11} fill="var(--text-dim)">A{i}={s.a}</text>
              <circle cx={cx(i) + 18} cy={50} r={11} fill={s.b ? ON : OFF} /><text x={cx(i) + 18} y={30} textAnchor="middle" fontSize={11} fill="var(--text-dim)">B{i}={s.b}</text>
              <line x1={cx(i) - 18} x2={cx(i) - 18} y1={61} y2={90} stroke={s.a ? ON : OFF} strokeWidth={2} />
              <line x1={cx(i) + 18} x2={cx(i) + 18} y1={61} y2={90} stroke={s.b ? ON : OFF} strokeWidth={2} />
              <line x1={cx(i)} x2={cx(i)} y1={160} y2={192} stroke={s.sum ? ON : OFF} strokeWidth={2} />
              <circle cx={cx(i)} cy={204} r={12} fill={s.sum ? ON : OFF} /><text x={cx(i)} y={236} textAnchor="middle" fontSize={11} fill="var(--text-dim)">S{i}={s.sum}</text>
              <line x1={cx(i) - 40} x2={cx(i) - 90} y1={125} y2={125} stroke={s.cout ? ON : OFF} strokeWidth={2} />
              <text x={cx(i) - 65} y={118} textAnchor="middle" fontSize={10} fill="var(--text-dim)">c={s.cout}</text>
            </g>
          ))}
        </svg>
      </div>
      <Panel id="adder-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/')}>The same adder on the landing page →</button>
        <RelatedLinks id="instrument:logic" limit={4} />
      </Panel>
    </>
  );
}

export default function LogicView() {
  const { query } = useRoute();
  const tab = (['gates', 'adder'] as const).find((t) => t === query.get('tab')) ?? 'bits';
  return (
    <>
      <nav className="view-switch" aria-label="Logic sections">
        {([['bits', 'Bits'], ['gates', 'Logic gates'], ['adder', 'Adding']] as const).map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'bits' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'gates' ? <GatesTab /> : tab === 'adder' ? <AdderTab /> : <BitsTab />}
    </>
  );
}
