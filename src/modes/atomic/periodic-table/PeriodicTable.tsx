import { useMemo, useRef, useState } from 'react';
import { ELEMENTS, ELEMENTS_MANIFEST, FAMILY_COLORS, atomicWeightLabel, tablePosition, type ElementRecord } from '../atoms/elements';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { SCHEMES, colorFor, schemeRange } from './schemes';
import { ramp } from '@/rendering/colors';
import { ProvenanceBadge } from '@/ui/components';

const BLOCKS = ['s', 'p', 'd', 'f'] as const;

export default function PeriodicTable() {
  const { query } = useRoute();
  const scheme = SCHEMES.find((s) => s.id === query.get('color')) ?? SCHEMES[0];
  const [filter, setFilter] = useState('');
  const [block, setBlock] = useState<string | null>(null);
  const [hover, setHover] = useState<{ e: ElementRecord; x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const range = useMemo(() => schemeRange(scheme, ELEMENTS), [scheme]);

  const matches = (e: ElementRecord) => {
    const f = filter.trim().toLowerCase();
    if (block && tablePosition(e.Z).block !== block) return false;
    if (!f) return true;
    return e.name.toLowerCase().includes(f) || e.symbol.toLowerCase() === f || String(e.Z) === f || e.groupBlock.toLowerCase().includes(f) || (e.standardState ?? '').toLowerCase().includes(f);
  };

  /** Arrow-key navigation across the 2D layout. */
  const onKey = (ev: React.KeyboardEvent, e: ElementRecord) => {
    const p = tablePosition(e.Z);
    const d: Record<string, [number, number]> = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    const step = d[ev.key];
    if (!step) return;
    ev.preventDefault();
    for (let k = 1; k < 18; k++) {
      const row = p.row + step[0] * k, col = p.col + step[1] * k;
      const target = ELEMENTS.find((x) => { const q = tablePosition(x.Z); return q.row === row && q.col === col; });
      if (target) { gridRef.current?.querySelector<HTMLButtonElement>(`[data-z="${target.Z}"]`)?.focus(); return; }
      if (row < 1 || row > 10 || col < 1 || col > 18) return;
    }
  };

  const legend = scheme.kind === 'categorical'
    ? Object.entries(scheme.categories ?? FAMILY_COLORS).map(([k, c]) => <span key={k}><span className="sw" style={{ background: c }} />{k}</span>)
    : (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span className="mono">{scheme.log ? `10^${range[0].toFixed(1)}` : range[0].toPrecision(3)}</span>
        <span className="bar" style={{ background: `linear-gradient(90deg, ${[0, 0.25, 0.5, 0.75, 1].map(ramp).join(',')})` }} />
        <span className="mono">{scheme.log ? `10^${range[1].toFixed(1)}` : range[1].toPrecision(3)}</span>
        <span>{scheme.unit}</span>
      </span>
    );

  return (
    <div className="ptable-wrap" onMouseLeave={() => setHover(null)}>
      <div className="ptable-toolbar">
        <h1>PERIODIC TABLE</h1>
        <label className="note" htmlFor="scheme">Colour by</label>
        <select id="scheme" value={scheme.id} onChange={(e) => setQuery({ color: e.target.value })}>
          {SCHEMES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <input type="search" placeholder="Filter: name, symbol, Z, family, state" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter elements" style={{ height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', minWidth: 230 }} />
        <div className="chip-row" role="group" aria-label="Block filter">
          {BLOCKS.map((b) => <button key={b} className={`chip ${block === b ? 'active' : ''}`} onClick={() => setBlock(block === b ? null : b)}>{b}-block</button>)}
        </div>
        <span style={{ flex: 1 }} />
        <span className="note">118 elements · <ProvenanceBadge cls="observed" /> data: PubChem · IUPAC CIAAW · IAEA AMDC · retrieved {ELEMENTS_MANIFEST.retrievedAt.slice(0, 10)}</span>
      </div>

      <div className="ptable" ref={gridRef} role="grid" aria-label="Periodic table of the elements">
        {ELEMENTS.map((e) => {
          const p = tablePosition(e.Z);
          const c = colorFor(scheme, e, range);
          const dim = !matches(e);
          return (
            <button
              key={e.Z}
              data-z={e.Z}
              className={`tile ${dim ? 'dim' : ''} ${c.color ? '' : 'nodata'}`}
              style={{ gridRow: p.row === 9 || p.row === 10 ? p.row : p.row, gridColumn: p.col, ['--tile' as string]: c.color ?? '#3a4466' }}
              onClick={() => navigate(`/atomic/element/${e.Z}`)}
              onKeyDown={(ev) => onKey(ev, e)}
              onMouseEnter={(ev) => setHover({ e, x: ev.clientX, y: ev.clientY })}
              onMouseMove={(ev) => setHover({ e, x: ev.clientX, y: ev.clientY })}
              aria-label={`${e.name}, atomic number ${e.Z}, ${scheme.label}: ${c.label}`}
            >
              <span className="z">{e.Z}</span>
              {!e.hasStableIsotope && <span className="rad" title="No stable isotope">☢</span>}
              <span className="sym">{e.symbol}</span>
              <span className="nm">{e.name}</span>
              <span className="wt">{atomicWeightLabel(e)}</span>
            </button>
          );
        })}
        <div className="placeholder-tile" style={{ gridRow: 6, gridColumn: 3 }}>57–71</div>
        <div className="placeholder-tile" style={{ gridRow: 7, gridColumn: 3 }}>89–103</div>
      </div>

      <div className="legend" aria-label="Legend">
        <strong style={{ color: 'var(--text)' }}>{scheme.label}</strong>{legend}
        <span><span className="sw nodata" style={{ background: 'repeating-linear-gradient(135deg,#0a0f1f 0 3px,#24304f 3px 6px)' }} />no data / unknown</span>
        <span>☢ no stable isotope</span>
        <span className="note">Source: {scheme.source}</span>
      </div>
      {scheme.note && <p className="note" style={{ marginTop: 6 }}>{scheme.note}</p>}
      <p className="note" style={{ marginTop: 6 }}>Atomic weights: IUPAC standard atomic weights; <span className="mono">[A]</span> = mass number of the reference isotope for elements with no standard atomic weight. Layout: La–Lu and Ac–Lr shown in the f-block rows.</p>

      {hover && (
        <div className="ptable-hover" style={{ left: Math.min(hover.x + 16, window.innerWidth - 240), top: hover.y + 16 }}>
          <strong>{hover.e.name}</strong> <span className="note">({hover.e.symbol}, Z = {hover.e.Z})</span>
          <div className="note">{hover.e.groupBlock} · {hover.e.electronConfiguration}</div>
          <div style={{ marginTop: 4 }}>{scheme.label}: <span className="mono">{colorFor(scheme, hover.e, range).label}</span></div>
        </div>
      )}
    </div>
  );
}
