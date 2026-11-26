import { useMemo, useRef, useState } from 'react';
import { ELEMENTS } from '@/modes/atomic/atoms/elements';
import { MOLECULES, prettyFormula } from '@/modes/atomic/molecules/molecules';
import { BODIES } from '@/modes/cosmic/solar-system/bodies';
import { navigate, useRoute } from '@/shared/router';
import { useVoyager } from '@/shared/store';
import { SCALE_LEVELS, type ScaleLevel } from '@/core/scale/scale';
import { PHYSICS_MODULES } from '@/core/physics/modules';
import { Logo, SearchGlyph } from './components';

interface Hit { kind: 'element' | 'molecule' | 'body'; label: string; sub: string; to: string; score: number }

function useSearchIndex() {
  return useMemo(() => [
    ...ELEMENTS.map((e) => ({ kind: 'element' as const, label: `${e.name}`, sub: `${e.symbol} · Z = ${e.Z}`, to: `/atomic/element/${e.Z}`, keys: [e.name, e.symbol, String(e.Z)] })),
    ...MOLECULES.map((m) => ({ kind: 'molecule' as const, label: m.name, sub: prettyFormula(m.formula), to: `/atomic/molecules/${m.id}`, keys: [m.name, m.formula, m.iupacName ?? ''] })),
    ...BODIES.map((b) => ({ kind: 'body' as const, label: b.name, sub: b.classification, to: `/cosmic/${b.id}`, keys: [b.name, b.id] })),
  ], []);
}

function Search() {
  const index = useSearchIndex();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hits: Hit[] = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return index
      .map((item) => {
        let score = 0;
        for (const k of item.keys) {
          const kk = k.toLowerCase();
          if (kk === s) score = Math.max(score, 100);
          else if (kk.startsWith(s)) score = Math.max(score, 60 - kk.length / 10);
          else if (kk.includes(s)) score = Math.max(score, 30 - kk.length / 10);
        }
        return { ...item, score };
      })
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [q, index]);
  const go = (h: Hit) => { navigate(h.to); setQ(''); setOpen(false); inputRef.current?.blur(); };
  return (
    <div className="search" role="combobox" aria-expanded={open && hits.length > 0} aria-haspopup="listbox">
      <SearchGlyph />
      <input
        ref={inputRef}
        value={q}
        placeholder="Search elements, molecules, worlds…"
        aria-label="Universal search"
        onChange={(e) => { setQ(e.target.value); setOpen(true); setSel(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(hits.length - 1, s + 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
          if (e.key === 'Enter' && hits[sel]) go(hits[sel]);
          if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
        }}
      />
      {open && hits.length > 0 && (
        <div className="search-results" role="listbox">
          {hits.map((h, i) => (
            <button key={`${h.kind}-${h.to}`} role="option" aria-selected={i === sel} onMouseDown={(e) => { e.preventDefault(); go(h); }}>
              <span>{h.label}</span><span style={{ color: 'var(--text-faint)', fontSize: 11 }}>{h.sub}</span>
              <span className="kind">{h.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function currentScaleId(path: string[], query: URLSearchParams): string | null {
  if (path[0] === 'atomic') {
    if (path[1] === 'molecules' || path[1] === 'lab') return 'molecule';
    if (path[1] === 'element') return query.get('view') === 'nucleus' ? 'nucleus' : 'atom';
    return 'atom';
  }
  if (path[0] === 'cosmic') return path[1] && path[1] !== 'sun' ? 'planet' : 'solar-system';
  return null;
}

export function ScaleNavigator({ onClose }: { onClose: () => void }) {
  const { path, query } = useRoute();
  const cur = currentScaleId(path, query);
  const levels = [...SCALE_LEVELS].reverse();
  const tag = (l: ScaleLevel) => (l.support === 'interactive' ? { t: 'interactive', c: 'var(--accent-3)' } : l.support === 'educational' ? { t: 'educational', c: 'var(--warn)' } : { t: 'planned', c: 'var(--text-faint)' });
  return (
    <section className="panel scale-nav" aria-label="Scale navigator">
      <header className="panel-head"><span className="title">Scale · log₁₀ metres</span><button onClick={onClose} aria-label="Close scale navigator">✕</button></header>
      <ol>
        {levels.map((l) => {
          const t = tag(l);
          return (
            <li key={l.id} className={cur === l.id ? 'current' : ''}>
              <button disabled={!l.route} onClick={() => l.route && navigate(l.route)} title={`${l.example}${l.route ? '' : ' — planned for a later phase'}`}>
                <span className="exp">10^{l.log10m > 0 ? '+' : ''}{Math.round(l.log10m)}</span>
                <span>{l.label}</span>
                <span className="tag" style={{ color: t.c }}>{t.t}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="note" style={{ padding: '0 12px 12px', margin: 0 }}>Each scale uses its own coordinate system and solver. Scales marked <em>planned</em> have no simulator yet (Phases 5–8).</p>
    </section>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const settings = useVoyager((s) => s.settings);
  const set = useVoyager((s) => s.setSetting);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>
        <div className="toggle-row"><span>Reduced motion</span><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => set('reducedMotion', e.target.checked)} /></div>
        <div className="toggle-row"><span>High contrast</span><input type="checkbox" checked={settings.highContrast} onChange={(e) => set('highContrast', e.target.checked)} /></div>
        <h2 style={{ marginTop: 22 }}>Voyager Physics Engine — module status</h2>
        {PHYSICS_MODULES.map((m) => (
          <div key={m.id} className="module-row">
            <strong>{m.name}</strong>
            <span style={{ color: m.status === 'planned' ? 'var(--text-faint)' : m.status === 'partial' ? 'var(--warn)' : 'var(--accent-3)' }}>{m.status} {m.version !== '—' && `v${m.version}`}</span>
            <span className="note">{m.solvers.length ? m.solvers.join(' · ') : `Planned for Phase ${m.phase}`}{m.validity.length > 0 && <><br /><em>Limits: {m.validity.join('; ')}</em></>}</span>
          </div>
        ))}
        <p className="note" style={{ marginTop: 14 }}>Keyboard: <kbd>/</kbd> focuses search · arrow keys move through the periodic table · <kbd>Space</kbd> plays/pauses time in Cosmic mode.</p>
        <button className="icon-btn" style={{ marginTop: 10 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export function TopBar() {
  const { path } = useRoute();
  const mode = path[0];
  const [scaleOpen, setScaleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={() => navigate('/')} aria-label="Voyager Ventures home"><Logo /><span className="wordmark">VOYAGER VENTURES</span></button>
        <nav className="mode-switch" aria-label="Mode">
          <button className={mode === 'atomic' ? 'active' : ''} onClick={() => navigate('/atomic')}>ATOMIC</button>
          <button className={`cosmic ${mode === 'cosmic' ? 'active' : ''}`} onClick={() => navigate('/cosmic')}>COSMIC</button>
        </nav>
        {mode === 'atomic' && (
          <nav className="chip-row hide-mobile" aria-label="Atomic sections">
            <button className={`chip ${path[1] !== 'molecules' && path[1] !== 'lab' ? 'active' : ''}`} onClick={() => navigate('/atomic')}>Elements</button>
            <button className={`chip ${path[1] === 'molecules' ? 'active' : ''}`} onClick={() => navigate('/atomic/molecules')}>Molecules</button>
            <button className={`chip ${path[1] === 'lab' ? 'active' : ''}`} onClick={() => navigate('/atomic/lab')}>Laboratory</button>
          </nav>
        )}
        <div className="spacer" />
        <Search />
        <button className={`icon-btn ${scaleOpen ? 'active' : ''}`} onClick={() => setScaleOpen((o) => !o)} aria-pressed={scaleOpen} title="Universal scale navigator">⟷ <span className="hide-mobile">Scale</span></button>
        <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Settings & engine status" aria-label="Settings">⚙</button>
      </header>
      {scaleOpen && <ScaleNavigator onClose={() => setScaleOpen(false)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
