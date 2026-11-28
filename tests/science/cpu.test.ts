/**
 * Gate 15.4 — the stored-program teaching machine.
 */
import { describe, expect, it } from 'vitest';
import { OP_CLASS, PROGRAMS, boot, num, order, run, step } from '@/core/computing/cpu';

describe('stored-program machine', () => {
  it('adds 7 + 35 = 42 and stores it back into memory', () => {
    const m = run(boot(PROGRAMS.add.mem));
    expect(m.out).toEqual([42]); expect(m.mem[7]).toEqual(num(42)); expect(m.halted).toBe(true); expect(m.steps).toBe(5);
  });
  it('counts down 5, 4, 3, 2, 1, 0 with a conditional jump', () => {
    expect(run(boot(PROGRAMS.countdown.mem)).out).toEqual([5, 4, 3, 2, 1, 0]);
  });
  it('multiplies 6 × 7 = 42 by repeated addition', () => {
    expect(run(boot(PROGRAMS.multiply.mem)).out).toEqual([42]);
  });
  it('orders and numbers share one memory; executing a number stops the machine', () => {
    const m = run(boot([order('JUMP', 1), num(3)]));
    expect(m.halted).toBe(true); expect(m.last).toContain('is a number, not an order');
  });
  it('a program can overwrite its own data: STORE changes memory that later orders read', () => {
    const m0 = boot([order('LOAD', 4), order('ADD', 4), order('STORE', 4), order('HALT'), num(5)]);
    expect(run(m0).mem[4]).toEqual(num(10));
    expect(step(m0).acc).toBe(5);
  });
  it('every order belongs to one of von Neumann’s four classes', () => {
    expect(new Set(Object.values(OP_CLASS))).toEqual(new Set(['a', 'b', 'c', 'd']));
  });
});
