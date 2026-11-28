/**
 * A stored-program teaching machine (Phase 15, Gate 15.4), organised as von Neumann's 1945 EDVAC report describes:
 * a central arithmetic part (CA, here one accumulator), central control (CC, here a program counter that fetches
 * orders), one memory M holding both orders and numbers — “The orders which are received by C come from M, i.e.
 * from the same place where the numerical material is stored” (p. 85) — and input/output. Each memory word carries
 * a mark saying whether it is a number or an order. The orders follow his four classes (p. 85):
 *   (a) arithmetic in CA: ADD, SUB       (b) transfers of a number: LOAD, STORE
 *   (c) moving CC's connection with M:  JUMP, and JZ (jump when the accumulator is zero — our addition)
 *   (d) input/output: OUT, and HALT to stop.
 * This is an educational machine in the spirit of the report, not the EDVAC's actual order code.
 */
export type Op = 'LOAD' | 'STORE' | 'ADD' | 'SUB' | 'JUMP' | 'JZ' | 'OUT' | 'HALT';
export type Word = { kind: 'order'; op: Op; addr: number } | { kind: 'number'; value: number };
export const OP_CLASS: Record<Op, 'a' | 'b' | 'c' | 'd'> = { ADD: 'a', SUB: 'a', LOAD: 'b', STORE: 'b', JUMP: 'c', JZ: 'c', OUT: 'd', HALT: 'd' };
export interface Machine { mem: Word[]; pc: number; acc: number; out: number[]; halted: boolean; steps: number; last: string }

export const order = (op: Op, addr = 0): Word => ({ kind: 'order', op, addr });
export const num = (value: number): Word => ({ kind: 'number', value });
export const boot = (mem: Word[]): Machine => ({ mem: mem.map((w) => ({ ...w })), pc: 0, acc: 0, out: [], halted: false, steps: 0, last: 'ready' });

/** One fetch–decode–execute cycle; returns a new machine. */
export function step(m: Machine): Machine {
  if (m.halted) return m;
  const mem = m.mem.map((w) => ({ ...w }));
  const w = mem[m.pc];
  if (!w || w.kind !== 'order') return { ...m, halted: true, last: `stopped: word ${m.pc} is a number, not an order` };
  const val = (a: number) => { const x = mem[a]; return x && x.kind === 'number' ? x.value : 0; };
  let { pc, acc } = m; const out = [...m.out]; let halted = false, last = '';
  pc += 1;
  switch (w.op) {
    case 'LOAD': acc = val(w.addr); last = `LOAD ${w.addr}: accumulator ← ${acc}`; break;
    case 'STORE': mem[w.addr] = num(acc); last = `STORE ${w.addr}: memory[${w.addr}] ← ${acc}`; break;
    case 'ADD': acc += val(w.addr); last = `ADD ${w.addr}: accumulator ← ${acc}`; break;
    case 'SUB': acc -= val(w.addr); last = `SUB ${w.addr}: accumulator ← ${acc}`; break;
    case 'JUMP': pc = w.addr; last = `JUMP ${w.addr}`; break;
    case 'JZ': if (acc === 0) { pc = w.addr; last = `JZ ${w.addr}: zero, jump`; } else last = `JZ ${w.addr}: not zero, go on`; break;
    case 'OUT': out.push(acc); last = `OUT: ${acc}`; break;
    case 'HALT': halted = true; pc -= 1; last = 'HALT'; break;
  }
  return { mem, pc, acc, out, halted, steps: m.steps + 1, last };
}
export function run(m: Machine, limit = 1000): Machine { let x = m; while (!x.halted && x.steps < limit) x = step(x); return x; }

/** Example programs. */
export const PROGRAMS: Record<string, { title: string; mem: Word[] }> = {
  add: { title: 'Add two numbers (7 + 35)', mem: [order('LOAD', 5), order('ADD', 6), order('STORE', 7), order('OUT'), order('HALT'), num(7), num(35), num(0)] },
  countdown: { title: 'Count down from 5', mem: [order('LOAD', 8), order('OUT'), order('JZ', 6), order('SUB', 9), order('STORE', 8), order('JUMP', 0), order('HALT'), num(0), num(5), num(1)] },
  multiply: { title: 'Multiply 6 × 7 by repeated addition', mem: [
    order('LOAD', 13), order('JZ', 9), order('SUB', 15), order('STORE', 13), order('LOAD', 14), order('ADD', 12), order('STORE', 14), order('JUMP', 0), num(0),
    order('LOAD', 14), order('OUT'), order('HALT'), num(6), num(7), num(0), num(1)] },
};
