/**
 * High-frequency clock runtime. The render loop advances `live.jd` every frame
 * (deterministic `advance`), and publishes to the Zustand store at ~10 Hz so UI
 * panels don't re-render 60×/s. Physics always reads `live.jd`.
 */
import { advance } from '@/core/simulation/clock';
import { useVoyager } from '@/shared/store';
import { PLANET_VALID } from './ephemeris';

export const RANGE = { ...PLANET_VALID, label: 'JPL Table 1 validity (1800–2050)' };
export const live = { jd: useVoyager.getState().clock.jd, lastPublish: 0 };

useVoyager.subscribe((s, prev) => {
  // external edits (date picker, step buttons, bookmarks) win over the live value
  if (s.clock.jd !== prev.clock.jd && Math.abs(s.clock.jd - live.jd) > 1e-9 && !publishing) live.jd = s.clock.jd;
});
let publishing = false;

export function tick(realDt: number, nowMs: number) {
  const { clock, setClock } = useVoyager.getState();
  if (!clock.playing) return;
  const next = advance({ ...clock, jd: live.jd }, Math.min(realDt, 0.1), RANGE);
  live.jd = next.jd;
  if (next.clamped || nowMs - live.lastPublish > 100) {
    live.lastPublish = nowMs;
    publishing = true;
    setClock({ jd: live.jd, playing: next.playing });
    publishing = false;
  }
}
