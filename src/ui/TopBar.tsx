import { useEffect, useMemo, useRef, useState } from 'react';
import type { NearbyObject } from '@/modes/cosmic/star-systems/stars';
import { ELEMENTS } from '@/modes/atomic/atoms/elements';
import { MOLECULES, prettyFormula } from '@/modes/atomic/molecules/molecules';
import { BODIES } from '@/modes/cosmic/solar-system/bodies';
import { REACTIONS } from '@/modes/atomic/reactions/library';
import { MATERIALS } from '@/modes/atomic/materials/materials';
import { navigate, useRoute } from '@/shared/router';
import { useVoyager } from '@/shared/store';
import { SCALE_LEVELS, type ScaleLevel } from '@/core/scale/scale';
import { PHYSICS_MODULES } from '@/core/physics/modules';
import { Logo, SearchGlyph } from './components';

interface Hit { kind: 'element' | 'molecule' | 'body' | 'reaction' | 'material' | 'star' | 'exoplanet'; label: string; sub: string; to: string; score: number }

/** Cosmic sub-routes that are not solar-system bodies (#/cosmic/<id> otherwise focuses a body). */
const COSMIC_SECTIONS = ['stars', 'sandbox', 'relativity', 'compact', 'lensing', 'galaxies'];

/** A chip that opens a small menu of related sections; it is highlighted when one of them is open. */
function ChipMenu({ label, items }: { label: string; items: { label: string; to: string; active: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  const current = items.find((i) => i.active);
  return (
    <div className="chip-menu" ref={ref}>
      <button className={`chip ${current ? 'active' : ''}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{current ? `${label}: ${current.label}` : label} ▾</button>
      {open && (
        <div className="chip-menu-list" role="menu" aria-label={label}>
          {items.map((i) => <button key={i.to} role="menuitem" className={i.active ? 'active' : ''} onClick={() => { setOpen(false); navigate(i.to); }}>{i.label}</button>)}
        </div>
      )}
    </div>
  );
}

function useSearchIndex(stars: NearbyObject[] | null) {
  return useMemo(() => [
    // nearby stars and exoplanets: the 10 pc catalogue is loaded lazily on the first search (Gate 5.5)
    ...(stars ?? []).map((o) => ({
      kind: o.type === 'exoplanet' ? 'exoplanet' as const : 'star' as const,
      label: o.common && o.common !== o.name ? `${o.common} (${o.name})` : o.name,
      sub: `${o.type}${o.spt ? ` · ${o.spt}` : ''} · ${o.plx ? (1000 / o.plx).toFixed(2) : '?'} pc`,
      to: o.type === 'exoplanet' ? `/cosmic/stars/planets?sys=${o.sys}&pl=${o.seq}` : `/cosmic/stars?sel=${o.seq}`,
      keys: [o.name, o.common ?? '', o.system, o.gj ?? '', o.hd ?? '', o.hip ?? ''],
    })),
    ...ELEMENTS.map((e) => ({ kind: 'element' as const, label: `${e.name}`, sub: `${e.symbol} · Z = ${e.Z}`, to: `/atomic/element/${e.Z}`, keys: [e.name, e.symbol, String(e.Z)] })),
    ...MOLECULES.map((m) => ({ kind: 'molecule' as const, label: m.name, sub: prettyFormula(m.formula), to: `/atomic/molecules/${m.id}`, keys: [m.name, m.formula, m.iupacName ?? ''] })),
    ...BODIES.map((b) => ({ kind: 'body' as const, label: b.name, sub: b.classification, to: `/cosmic/${b.id}`, keys: [b.name, b.id] })),
    ...MATERIALS.map((m) => ({ kind: 'material' as const, label: m.name, sub: m.category, to: `/atomic/materials/${m.id}`, keys: [m.name, m.formula, m.id] })),
    ...REACTIONS.map((r) => ({ kind: 'reaction' as const, label: r.name, sub: r.contexts.join(', '), to: `/atomic/reactions/${r.id}`, keys: [r.name, r.id.replace(/-/g, ' ')] })),
  ], [stars]);
}

function Search() {
  const [q, setQ] = useState('');
  const [stars, setStars] = useState<NearbyObject[] | null>(null);
  useEffect(() => { if (q.trim().length >= 2 && !stars) import('@/modes/cosmic/star-systems/stars').then((m) => m.loadTenParsec()).then(setStars); }, [q, stars]);
  const index = useSearchIndex(stars);
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
        placeholder="Search elements, molecules, worlds, stars…"
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
    if (path[1] === 'molecules' || path[1] === 'lab' || path[1] === 'reactions') return 'molecule';
    if (path[1] === 'materials' || path[1] === 'phases') return 'material';
    if (path[1] === 'element') return query.get('view') === 'nucleus' ? 'nucleus' : 'atom';
    return 'atom';
  }
  if (path[0] === 'cosmic') return path[1] === 'stars' ? 'stellar' : path[1] === 'galaxies' ? 'galaxy' : ['relativity', 'compact', 'lensing'].includes(path[1]) ? null : path[1] && path[1] !== 'sun' && path[1] !== 'sandbox' ? 'planet' : 'solar-system';
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
          <button className={`spectral ${mode === 'spectral' ? 'active' : ''}`} onClick={() => navigate('/spectral')}>SPECTRAL</button>
        </nav>
        {mode === 'atomic' && (
          <nav className="chip-row hide-mobile" aria-label="Atomic sections">
            <button className={`chip ${!['molecules', 'lab', 'reactions', 'materials', 'phases'].includes(path[1]) ? 'active' : ''}`} onClick={() => navigate('/atomic')}>Elements</button>
            <button className={`chip ${path[1] === 'molecules' ? 'active' : ''}`} onClick={() => navigate('/atomic/molecules')}>Molecules</button>
            <button className={`chip ${path[1] === 'reactions' ? 'active' : ''}`} onClick={() => navigate('/atomic/reactions')}>Reactions</button>
            <button className={`chip ${path[1] === 'materials' ? 'active' : ''}`} onClick={() => navigate('/atomic/materials')}>Materials</button>
            <button className={`chip ${path[1] === 'phases' ? 'active' : ''}`} onClick={() => navigate('/atomic/phases')}>Phases</button>
            <button className={`chip ${path[1] === 'lab' ? 'active' : ''}`} onClick={() => navigate('/atomic/lab')}>Laboratory</button>
          </nav>
        )}
        {mode === 'cosmic' && (
          <nav className="chip-row hide-mobile" aria-label="Cosmic sections">
            <button className={`chip ${!COSMIC_SECTIONS.includes(path[1]) ? 'active' : ''}`} onClick={() => navigate('/cosmic')}>Solar system</button>
            <ChipMenu label="Stars" items={[
              { label: 'Nearby stars', to: '/cosmic/stars', active: path[1] === 'stars' && !path[2] },
              { label: 'HR diagram', to: '/cosmic/stars/hr', active: path[1] === 'stars' && path[2] === 'hr' },
              { label: 'Exoplanets', to: '/cosmic/stars/planets', active: path[1] === 'stars' && path[2] === 'planets' },
            ]} />
            <ChipMenu label="Gravity" items={[
              { label: 'Relativity', to: '/cosmic/relativity', active: path[1] === 'relativity' },
              { label: 'Black holes', to: '/cosmic/compact', active: path[1] === 'compact' },
              { label: 'Lensing', to: '/cosmic/lensing', active: path[1] === 'lensing' },
            ]} />
            <button className={`chip ${path[1] === 'galaxies' ? 'active' : ''}`} onClick={() => navigate('/cosmic/galaxies')}>Galaxies</button>
            <button className={`chip ${path[1] === 'sandbox' ? 'active' : ''}`} onClick={() => navigate('/cosmic/sandbox')}>Sandbox</button>
          </nav>
        )}
        {mode === 'spectral' && (
          <nav className="chip-row hide-mobile" aria-label="Spectral sections">
            <button className={`chip ${path[1] !== 'lab' && path[1] !== 'fields' ? 'active' : ''}`} onClick={() => navigate('/spectral')}>Atlas</button>
            <button className={`chip ${path[1] === 'lab' ? 'active' : ''}`} onClick={() => navigate('/spectral/lab')}>Wave lab</button>
            <button className={`chip ${path[1] === 'fields' ? 'active' : ''}`} onClick={() => navigate('/spectral/fields')}>Fields</button>
          </nav>
        )}
        <div className="spacer" />
        <Search />
        <button className="icon-btn" onClick={() => navigate('/sources')} title="Source index: every citation, link and author note">📚 <span className="hide-mobile">Sources</span></button>
        <button className="icon-btn" onClick={() => navigate('/notebook')} title="Scientific notebook (saved experiments)">📓 <span className="hide-mobile">Notebook</span></button>
        <button className={`icon-btn ${scaleOpen ? 'active' : ''}`} onClick={() => setScaleOpen((o) => !o)} aria-pressed={scaleOpen} title="Universal scale navigator">⟷ <span className="hide-mobile">Scale</span></button>
        <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Settings & engine status" aria-label="Settings">⚙</button>
      </header>
      {scaleOpen && <ScaleNavigator onClose={() => setScaleOpen(false)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
