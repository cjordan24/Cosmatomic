import { LIGHT_ITEMS, RADIO_ITEMS, WAVE_ITEMS } from '@/ui/navItems';
import { UnitConverter } from '@/ui/instruments';
import { SnapshotDialog } from '@/ui/Snapshot';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import type { NearbyObject } from '@/modes/cosmic/star-systems/stars';
import { ELEMENTS } from '@/modes/atomic/atoms/elements';
import { MOLECULES, prettyFormula } from '@/modes/atomic/molecules/molecules';
import { BODIES } from '@/modes/cosmic/solar-system/bodies';
import { REACTIONS } from '@/modes/atomic/reactions/library';
import { MATERIALS } from '@/modes/atomic/materials/materials';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { useVoyager } from '@/shared/store';
import { SCALE_LEVELS, type ScaleLevel } from '@/core/scale/scale';
import { PHYSICS_MODULES } from '@/core/physics/modules';
import { Logo, SearchGlyph } from './components';
const EncyclopediaDrawer = lazy(() => import('./Encyclopedia'));

/** Opens the encyclopedia corner menu (?enc=index); the drawer itself is lazy-loaded. Gate E.1. */
function EncyclopediaButton() {
  const { query } = useRoute();
  const open = query.has('enc');
  return (
    <button className={`icon-btn ${open ? 'active' : ''}`} aria-label="Encyclopedia" aria-pressed={open} title="Encyclopedia: cited explanations of radiation, elements, molecules and celestial objects"
      onClick={() => setQuery({ enc: open ? null : 'index' })}>📖 <span className="hide-mobile">Encyclopedia</span></button>
  );
}

interface Hit { kind: 'element' | 'molecule' | 'body' | 'reaction' | 'material' | 'star' | 'exoplanet'; label: string; sub: string; to: string; score: number }

/** Cosmic sub-routes that are not solar-system bodies (#/cosmic/<id> otherwise focuses a body). */
/** Spectral sub-routes other than the atlas; Phase 9 views sit in chip menus so the bar does not grow. */
const SPECTRAL_SECTIONS = ['lab', 'fields', 'compare', 'antennas', 'rf', 'room', 'modulation', 'acoustics', 'audio', 'roomacoustics', 'optics', 'waveoptics', 'polarisation', 'spectroscopy', 'thermal', 'telescopes', 'atmosphere'];
/** Biologic sub-routes other than the scale-of-life atlas (Phase 11+). */
export const BIOLOGIC_SECTIONS: string[] = ['molecules', 'proteins', 'cells', 'membranes', 'transport', 'plants', 'body', 'movement', 'circulation', 'nerves', 'systems', 'zoom', 'senses', 'imaging'];
const ENGINEERING_SECTIONS: string[] = ['semiconductors', 'chips', 'architecture', 'information', 'network', 'datacentres', 'ai', 'machines', 'space', 'systems'];
const COSMIC_SECTIONS = ['map', 'stars', 'sandbox', 'relativity', 'compact', 'lensing', 'galaxies', 'nebulae', 'universe', 'ladder', 'cmb', 'darkmatter', 'gw', 'plasma', 'grtests', 'models'];

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
      <button className={`chip ${current ? 'active' : ''}`} aria-haspopup="menu" aria-expanded={open} title={current ? `${label}: ${current.label}` : undefined} onClick={() => setOpen((o) => !o)}>{label} ▾</button>
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
  if (path[0] === 'cosmic') return path[1] === 'stars' ? 'stellar' : path[1] === 'galaxies' ? 'galaxy' : path[1] === 'universe' ? 'observable' : ['relativity', 'compact', 'lensing', 'nebulae', 'ladder', 'cmb', 'darkmatter', 'gw'].includes(path[1]) ? null : path[1] && path[1] !== 'sun' && path[1] !== 'sandbox' ? 'planet' : 'solar-system';
  return null;
}

/** 📓: open the notebook, or snapshot the current view into it (Gate 8.5). A menu, so the top bar does not grow. */
function NotebookMenu({ onSnapshot }: { onSnapshot: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div className="chip-menu" ref={ref}>
      <button className={`icon-btn ${open ? 'active' : ''}`} aria-label="Notebook" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} title="Scientific notebook: open it, or snapshot this view">📓 <span className="hide-mobile">Notebook</span></button>
      {open && (
        <div className="chip-menu-list" role="menu" aria-label="Notebook" style={{ right: 0, left: 'auto' }}>
          <button role="menuitem" onClick={() => { setOpen(false); navigate('/notebook'); }}>Open notebook</button>
          <button role="menuitem" onClick={() => { setOpen(false); onSnapshot(); }}>📸 Snapshot this view</button>
        </div>
      )}
    </div>
  );
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
      <div style={{ padding: '0 12px 8px' }}><button className="chip" onClick={() => { onClose(); navigate('/scale'); }}>Open the scale explorer →</button></div>
      <details className="converter-details" style={{ padding: '0 12px 8px' }}>
        <summary style={{ cursor: 'pointer', fontSize: 12 }}>⇄ Unit converter</summary>
        <UnitConverter />
      </details>
      <p className="note" style={{ padding: '0 12px 12px', margin: 0 }}>Each scale uses its own coordinate system and solver. Scales marked <em>planned</em> have no view yet.</p>
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
  const { path, query } = useRoute();
  const mode = path[0];
  const [scaleOpen, setScaleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [snapOpen, setSnapOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <>
      <header className={`topbar ${mode === 'cosmic' || mode === 'atomic' || mode === 'spectral' || mode === 'biologic' || mode === 'engineering' || mode === 'meteorology' ? 'many-chips' : ''}`}>
        <button className="brand" onClick={() => navigate('/')} aria-label="Voyager Ventures home"><Logo /><span className="wordmark">VOYAGER VENTURES</span></button>
        <nav className="mode-switch" aria-label="Mode">
          <button className={mode === 'atomic' ? 'active' : ''} onClick={() => navigate('/atomic')}>ATOMIC</button>
          <button className={`cosmic ${mode === 'cosmic' ? 'active' : ''}`} onClick={() => navigate('/cosmic')}>COSMIC</button>
          <button className={`spectral ${mode === 'spectral' ? 'active' : ''}`} onClick={() => navigate('/spectral')}>SPECTRAL</button>
          <button className={`biologic ${mode === 'biologic' ? 'active' : ''}`} onClick={() => navigate('/biologic')}>BIOLOGIC</button>
          <button className={`engineering ${mode === 'engineering' ? 'active' : ''}`} onClick={() => navigate('/engineering')}>ENGINEERING</button>
          <button className={`meteorology ${mode === 'meteorology' ? 'active' : ''}`} onClick={() => navigate('/meteorology')}>METEOROLOGY</button>
        </nav>
        {/* Phones: four mode names do not fit in 390 px, so the switch becomes one menu (Gate 11.x fix) */}
        <div className="mobile-only mode-menu">
          <ChipMenu label={({ atomic: 'ATOMIC', cosmic: 'COSMIC', spectral: 'SPECTRAL', biologic: 'BIOLOGIC', engineering: 'ENGINEERING', meteorology: 'METEOROLOGY' } as Record<string, string>)[mode] ?? 'MODE'} items={[
            { label: 'Atomic', to: '/atomic', active: mode === 'atomic' }, { label: 'Cosmic', to: '/cosmic', active: mode === 'cosmic' },
            { label: 'Spectral', to: '/spectral', active: mode === 'spectral' }, { label: 'Biologic', to: '/biologic', active: mode === 'biologic' }, { label: 'Engineering', to: '/engineering', active: mode === 'engineering' }, { label: 'Meteorology', to: '/meteorology', active: mode === 'meteorology' },
          ]} />
        </div>
        {mode === 'atomic' && (
          <nav className="chip-row hide-mobile" aria-label="Atomic sections">
            <button className={`chip ${!['molecules', 'lab', 'reactions', 'materials', 'phases', 'particles', 'quantum', 'nuclei'].includes(path[1]) ? 'active' : ''}`} onClick={() => navigate('/atomic')}>Elements</button>
            <ChipMenu label="Chemistry" items={[
              { label: 'Molecules', to: '/atomic/molecules', active: path[1] === 'molecules' },
              { label: 'Reactions', to: '/atomic/reactions', active: path[1] === 'reactions' },
            ]} />
            <ChipMenu label="Matter" items={[
              { label: 'Materials', to: '/atomic/materials', active: path[1] === 'materials' },
              { label: 'Phases', to: '/atomic/phases', active: path[1] === 'phases' },
            ]} />
            <button className={`chip ${path[1] === 'lab' ? 'active' : ''}`} onClick={() => navigate('/atomic/lab')}>Laboratory</button>
            <ChipMenu label="Subatomic" items={[
              { label: 'Particles', to: '/atomic/particles', active: path[1] === 'particles' },
              { label: 'Quantum lab', to: '/atomic/quantum', active: path[1] === 'quantum' },
              { label: 'Nuclei', to: '/atomic/nuclei', active: path[1] === 'nuclei' },
            ]} />
          </nav>
        )}
        {mode === 'cosmic' && (
          <nav className="chip-row hide-mobile" aria-label="Cosmic sections">
            <button className={`chip ${!COSMIC_SECTIONS.includes(path[1]) ? 'active' : ''}`} onClick={() => navigate('/cosmic')}>Solar system</button>
            <button className={`chip ${path[1] === 'map' ? 'active' : ''}`} onClick={() => navigate('/cosmic/map')}>Map</button>
            <ChipMenu label="Stars" items={[
              { label: 'Nearby stars', to: '/cosmic/stars', active: path[1] === 'stars' && !path[2] },
              { label: 'HR diagram', to: '/cosmic/stars/hr', active: path[1] === 'stars' && path[2] === 'hr' },
              { label: 'Exoplanets', to: '/cosmic/stars/planets', active: path[1] === 'stars' && path[2] === 'planets' },
              { label: 'Plasma & solar wind', to: '/cosmic/plasma', active: path[1] === 'plasma' },
            ]} />
            <ChipMenu label="Gravity" items={[
              { label: 'Relativity', to: '/cosmic/relativity', active: path[1] === 'relativity' },
              { label: 'Tests of relativity', to: '/cosmic/grtests', active: path[1] === 'grtests' },
              { label: 'Black holes', to: '/cosmic/compact', active: path[1] === 'compact' },
              { label: 'Lensing', to: '/cosmic/lensing', active: path[1] === 'lensing' },
              { label: 'N-body sandbox', to: '/cosmic/sandbox', active: path[1] === 'sandbox' },
            ]} />
            <ChipMenu label="Galaxies" items={[
              { label: 'Galaxies', to: '/cosmic/galaxies', active: path[1] === 'galaxies' },
              { label: 'Nebulae', to: '/cosmic/nebulae', active: path[1] === 'nebulae' },
            ]} />
            <ChipMenu label="Universe" items={[
              { label: 'Expansion', to: '/cosmic/universe', active: path[1] === 'universe' },
              { label: 'Distance ladder', to: '/cosmic/ladder', active: path[1] === 'ladder' },
              { label: 'Cosmic microwave background', to: '/cosmic/cmb', active: path[1] === 'cmb' },
              { label: 'Dark-matter evidence', to: '/cosmic/darkmatter', active: path[1] === 'darkmatter' },
              { label: 'Dark matter or modified gravity?', to: '/cosmic/models', active: path[1] === 'models' },
              { label: 'Gravitational waves', to: '/cosmic/gw', active: path[1] === 'gw' },
            ]} />
          </nav>
        )}
        {mode === 'spectral' && (
          <nav className="chip-row hide-mobile" aria-label="Spectral sections">
            <button className={`chip ${!SPECTRAL_SECTIONS.includes(path[1]) ? 'active' : ''}`} onClick={() => navigate('/spectral')}>Atlas</button>
            <ChipMenu label="Waves" items={WAVE_ITEMS.map(([label, to]) => ({ label, to, active: `/${path.join('/')}` === to }))} />
            <ChipMenu label="Radio" items={RADIO_ITEMS.map(([label, to]) => ({ label, to, active: `/${path.join('/')}` === to }))} />
            <ChipMenu label="Light" items={LIGHT_ITEMS.map(([label, to]) => ({ label, to, active: `/${path.join('/')}` === to }))} />
            <button className={`chip ${path[1] === 'fields' ? 'active' : ''}`} onClick={() => navigate('/spectral/fields')}>Fields</button>
          </nav>
        )}
        {mode === 'meteorology' && (
          <nav className="chip-row hide-mobile" aria-label="Meteorology sections">
            <ChipMenu label="Atmosphere" items={[
              { label: 'Structure of the atmosphere', to: '/meteorology', active: !['air', 'radiation', 'motion', 'storms', 'atlas', 'climates', 'records', 'planets', 'iceages', 'deeptime', 'oceans', 'human'].includes(path[1] ?? '') },
              { label: 'Moist air & stability', to: '/meteorology/air', active: path[1] === 'air' },
              { label: 'Sunlight, heat & greenhouse', to: '/meteorology/radiation', active: path[1] === 'radiation' },
              { label: 'Wind, clouds & water', to: '/meteorology/motion', active: path[1] === 'motion' },
            ]} />
            <ChipMenu label="Weather" items={[
              { label: 'Earth weather atlas', to: '/meteorology/atlas', active: path[1] === 'atlas' },
              { label: 'Storm laboratory', to: '/meteorology/storms', active: path[1] === 'storms' },
              { label: 'Regional climates', to: '/meteorology/climates', active: path[1] === 'climates' },
              { label: 'Temperature record', to: '/meteorology/records', active: path[1] === 'records' },
            ]} />
            <ChipMenu label="Climate" items={[
              { label: 'Climate through geological time', to: '/meteorology/deeptime', active: path[1] === 'deeptime' },
              { label: 'Ice ages and the orbit', to: '/meteorology/iceages', active: path[1] === 'iceages' },
              { label: 'Oceans, ice and biomes', to: '/meteorology/oceans', active: path[1] === 'oceans' },
              { label: 'Human activities', to: '/meteorology/human', active: path[1] === 'human' },
            ]} />
            <button className={`chip ${path[1] === 'planets' ? 'active' : ''}`} onClick={() => navigate('/meteorology/planets')}>Other worlds</button>
          </nav>
        )}
        {mode === 'engineering' && (
          <nav className="chip-row hide-mobile" aria-label="Engineering sections">
            <ChipMenu label="Information" items={[
              { label: 'Bits & logic', to: '/engineering', active: !ENGINEERING_SECTIONS.includes(path[1]) },
              { label: 'Information & encoding', to: '/engineering/information', active: path[1] === 'information' },
              { label: 'Networks', to: '/engineering/network', active: path[1] === 'network' },
            ]} />
            <ChipMenu label="AI" items={[
              ['history', 'History'], ['learning', 'Train a network'], ['attention', 'Attention & scaling'], ['models', 'Model families'], ['agents', 'Coding agents'], ['energy', 'Energy'],
            ].map(([t, l]) => ({ label: l, to: t === 'history' ? '/engineering/ai' : `/engineering/ai?tab=${t}`, active: path[1] === 'ai' && (query.get('tab') ?? 'history') === t }))} />
            <ChipMenu label="Hardware" items={[
              { label: 'Semiconductors', to: '/engineering/semiconductors', active: path[1] === 'semiconductors' },
              { label: 'Chips', to: '/engineering/chips', active: path[1] === 'chips' },
              { label: 'Stored-program computer', to: '/engineering/architecture', active: path[1] === 'architecture' },
              { label: 'Data centres', to: '/engineering/datacentres', active: path[1] === 'datacentres' },
              { label: 'Machines & electricity', to: '/engineering/machines', active: path[1] === 'machines' },
              { label: 'Spacecraft & space systems', to: '/engineering/space', active: path[1] === 'space' },
              { label: 'Build a system', to: '/engineering/systems', active: path[1] === 'systems' },
            ]} />
          </nav>
        )}
        {mode === 'biologic' && (
          <nav className="chip-row hide-mobile" aria-label="Biologic sections">
            <button className={`chip ${!BIOLOGIC_SECTIONS.includes(path[1]) ? 'active' : ''}`} onClick={() => navigate('/biologic')}>Scale of life</button>
            <ChipMenu label="Molecules" items={[
              { label: 'Biomolecules', to: '/biologic/molecules', active: path[1] === 'molecules' },
              { label: 'Structures', to: '/biologic/proteins', active: path[1] === 'proteins' },
            ]} />
            <ChipMenu label="Cell biology" items={[
              { label: 'Cells', to: '/biologic/cells', active: path[1] === 'cells' },
              { label: 'Membranes', to: '/biologic/membranes', active: path[1] === 'membranes' },
              { label: 'Transport', to: '/biologic/transport', active: path[1] === 'transport' },
              { label: 'Plants & microbes', to: '/biologic/plants', active: path[1] === 'plants' },
            ]} />
            <ChipMenu label="Waves & life" items={[
              { label: 'Senses & signals', to: '/biologic/senses', active: path[1] === 'senses' },
              { label: 'Imaging the body', to: '/biologic/imaging', active: path[1] === 'imaging' },
            ]} />
            <ChipMenu label="Body" items={[
              { label: 'Human body', to: '/biologic/body', active: path[1] === 'body' },
              { label: 'Movement', to: '/biologic/movement', active: path[1] === 'movement' },
              { label: 'Circulation & breathing', to: '/biologic/circulation', active: path[1] === 'circulation' },
              { label: 'Nerves', to: '/biologic/nerves', active: path[1] === 'nerves' },
              { label: 'Organ systems', to: '/biologic/systems', active: path[1] === 'systems' },
              { label: 'From body to molecule', to: '/biologic/zoom', active: path[1] === 'zoom' },
            ]} />
          </nav>
        )}
        <div className="spacer" />
        <Search />
        <div className="topbar-actions">
          <EncyclopediaButton />
          <button className={`icon-btn ${mode === 'relations' ? 'active' : ''}`} aria-label="Relationships" onClick={() => navigate('/relations')} title="Relationship explorer: how every record links to the others, with sources">🔗</button>
          <button className="icon-btn" aria-label="Sources" onClick={() => navigate('/sources')} title="Source index: every citation, link and author note">📚 <span className="hide-mobile">Sources</span></button>
          <NotebookMenu onSnapshot={() => setSnapOpen(true)} />
          <button className={`icon-btn ${scaleOpen ? 'active' : ''}`} onClick={() => setScaleOpen((o) => !o)} aria-pressed={scaleOpen} aria-label="Scale" title="Universal scale navigator">⟷ <span className="hide-mobile">Scale</span></button>
          <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Settings & engine status" aria-label="Settings">⚙</button>
        </div>
        {/* Phones: the five buttons above fold into one menu so the bar fits in 390 px */}
        <div className="chip-menu mobile-only topbar-more">
          <button className={`icon-btn ${moreOpen ? 'active' : ''}`} aria-haspopup="menu" aria-expanded={moreOpen} aria-label="More" onClick={() => setMoreOpen((o) => !o)}>☰</button>
          {moreOpen && (
            <div className="chip-menu-list" role="menu" aria-label="More" style={{ right: 0, left: 'auto' }}>
              {mode === 'spectral' && ([['Atlas', '/spectral'], ...WAVE_ITEMS, ...RADIO_ITEMS, ...LIGHT_ITEMS, ['Fields', '/spectral/fields']] as [string, string][]).map(([label, to]) =>
                <button key={to} role="menuitem" className={`/${path.join('/')}` === to ? 'active' : ''} onClick={() => { setMoreOpen(false); navigate(to); }}>〰 {label}</button>)}
              {([['📖 Encyclopedia', () => setQuery({ enc: query.has('enc') ? null : 'index' })], ['🔗 Relationships', () => navigate('/relations')], ['📚 Sources', () => navigate('/sources')], ['📓 Notebook', () => navigate('/notebook')], ['📸 Snapshot this view', () => setSnapOpen(true)],
                ['⟷ Scale', () => setScaleOpen((o) => !o)], ['⚙ Settings', () => setSettingsOpen(true)]] as [string, () => void][]).map(([label, act]) =>
                <button key={label} role="menuitem" onClick={() => { setMoreOpen(false); act(); }}>{label}</button>)}
            </div>
          )}
        </div>
      </header>
      {scaleOpen && <ScaleNavigator onClose={() => setScaleOpen(false)} />}
      {query.has('enc') && <Suspense fallback={null}><EncyclopediaDrawer /></Suspense>}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {snapOpen && <SnapshotDialog onClose={() => setSnapOpen(false)} />}
    </>
  );
}
