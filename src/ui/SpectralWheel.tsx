/**
 * Spectral navigation wheel: a glass dial at the bottom of the Spectral pages. Opening it shows the four groups
 * (Atlas, Waves, Radio, Light) on an inner ring and the views of the chosen group on an outer ring; turning the mouse
 * wheel, the arrow keys or a click on a group spins the dial. Same items as the top-bar menus (navItems.ts).
 */
import { useEffect, useRef, useState } from 'react';
import { navigate, useRoute } from '@/shared/router';
import { SPECTRAL_GROUPS } from '@/ui/navItems';

const G = SPECTRAL_GROUPS.length;
export function SpectralWheel() {
  const { path } = useRoute();
  const here = `/${path.join('/')}`;
  const currentGroup = Math.max(0, SPECTRAL_GROUPS.findIndex((g) => g.items.some(([, to]) => to === here)));
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState(currentGroup);
  const [turns, setTurns] = useState(0);            // accumulated rotation steps, so the dial keeps spinning the same way
  const dial = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) { setGroup(currentGroup); setTurns(currentGroup); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const spin = (d: number) => { setTurns((t) => t + d); setGroup((g) => (g + d + G) % G); };
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); spin(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); spin(-1); }
    };
    window.addEventListener('keydown', key);
    dial.current?.querySelector<HTMLButtonElement>('.wheel-item')?.focus();
    return () => window.removeEventListener('keydown', key);
  }, [open, group]); // eslint-disable-line react-hooks/exhaustive-deps
  const g = SPECTRAL_GROUPS[group];
  const go = (to: string) => { setOpen(false); navigate(to); };
  const R_IN = 104, R_OUT = 186;
  return (
    <>
      <button className={`wheel-hub ${open ? 'open' : ''}`} aria-haspopup="dialog" aria-expanded={open} aria-label="Spectral views wheel" title="All Spectral views" onClick={() => setOpen((o) => !o)}>
        <span className="wheel-hub-icon" aria-hidden>{SPECTRAL_GROUPS[currentGroup].icon}</span><span className="wheel-hub-label">Views</span>
      </button>
      {open && (
        <div className="wheel-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="wheel" ref={dial} role="dialog" aria-label="Spectral views" onWheel={(e) => spin(e.deltaY > 0 ? 1 : -1)}>
            <div className="wheel-ring wheel-ring-in" style={{ transform: `rotate(${-turns * (360 / G)}deg)` }}>
              {SPECTRAL_GROUPS.map((x, i) => {
                const a = (i * 2 * Math.PI) / G - Math.PI / 2;
                return (
                  <button key={x.key} className={`wheel-group ${i === group ? 'active' : ''}`} aria-pressed={i === group}
                    style={{ left: `calc(50% + ${Math.cos(a) * R_IN}px)`, top: `calc(50% + ${Math.sin(a) * R_IN}px)`, transform: `translate(-50%, -50%) rotate(${turns * (360 / G)}deg)` }}
                    onClick={() => spin(((i - group + G + G / 2) % G) - G / 2 || 0)}>
                    <span aria-hidden>{x.icon}</span>{x.label}
                  </button>
                );
              })}
            </div>
            <div className="wheel-ring wheel-ring-out" key={g.key}>
              {g.items.map(([label, to], i) => {
                const n = g.items.length, a = -Math.PI / 2 + ((i - (n - 1) / 2) * Math.min(2 * Math.PI / n, 0.62));
                return (
                  <button key={to} className={`wheel-item ${to === here ? 'active' : ''}`} style={{ left: `calc(50% + ${Math.cos(a) * R_OUT}px)`, top: `calc(50% + ${Math.sin(a) * R_OUT}px)`, animationDelay: `${i * 30}ms` }} onClick={() => go(to)}>
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="wheel-centre">
              <div className="wheel-centre-icon" aria-hidden>{g.icon}</div>
              <div className="wheel-centre-label">{g.label}</div>
              <div className="wheel-hint">scroll or ← → to turn</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
