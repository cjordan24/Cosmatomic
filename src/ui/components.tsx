import { useState, type CSSProperties, type ReactNode } from 'react';
import { PROVENANCE_LABEL, type Provenance, type ProvenanceClass } from '@/core/provenance/provenance';
import { formatSig } from '@/core/units/units';
import { useVoyager } from '@/shared/store';

/** Collapsible / dismissible glass panel. Collapse state is global so it persists across views. */
export function Panel({ id, title, className = '', style, children, actions, onClose, mobileToggle = true }: {
  id: string; title: ReactNode; className?: string; style?: CSSProperties; children: ReactNode; actions?: ReactNode; onClose?: () => void;
  /** Right panels are hidden on phones; by default a floating button opens them. False when the view has its own toggle. */
  mobileToggle?: boolean;
}) {
  const collapsed = useVoyager((s) => !!s.panelsCollapsed[id]);
  const toggle = useVoyager((s) => s.togglePanel);
  const [mobileOpen, setMobileOpen] = useState(false);
  const autoToggle = mobileToggle && /\bright-panel\b/.test(className);
  const label = typeof title === 'string' ? title : 'Details';
  return (
    <>
    {autoToggle && <button className={`chip mobile-only panel-mobile-toggle ${mobileOpen ? 'active open' : ''}`} aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>{label} {mobileOpen ? "▾" : "▴"}</button>}
    <section className={`panel ${className} ${autoToggle && mobileOpen ? 'mobile-open' : ''} ${collapsed ? 'collapsed' : ''}`} style={style} aria-label={typeof title === 'string' ? title : id}>
      <header className="panel-head">
        <span className="title">{title}</span>
        {actions}
        <button onClick={() => toggle(id)} aria-expanded={!collapsed} aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}>{collapsed ? '▸' : '▾'}</button>
        {onClose && <button onClick={onClose} aria-label="Close panel">✕</button>}
      </header>
      <div className="panel-body">{children}</div>
    </section>
    </>
  );
}

export function ProvenanceBadge({ cls, title }: { cls: ProvenanceClass; title?: string }) {
  const p = PROVENANCE_LABEL[cls];
  return (
    <span className="badge" style={{ color: p.color }} title={title ?? p.description}>
      <span className="dot" />{p.label}
    </span>
  );
}

export function SourceList({ sources }: { sources: Provenance[] }) {
  return (
    <ul className="note" style={{ paddingLeft: 16, margin: '6px 0' }}>
      {sources.map((s, i) => (
        <li key={i} style={{ marginBottom: 4 }}>
          <ProvenanceBadge cls={s.class} /> {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.institution}</a> : s.institution}
          {s.transcribed && <em> · manually transcribed</em>}
          {s.uncertainty && <span> · {s.uncertainty}</span>}
        </li>
      ))}
    </ul>
  );
}

/** Key/value row that renders "unknown" — never a made-up number — when the value is missing. */
export function KV({ k, v, unit, sig = 4, title }: { k: ReactNode; v: number | string | null | undefined; unit?: string; sig?: number; title?: string }) {
  const missing = v === null || v === undefined || (typeof v === 'number' && !Number.isFinite(v)) || v === '';
  return (
    <>
      <dt title={title}>{k}</dt>
      <dd className={missing ? 'unknown' : ''}>{missing ? 'unknown' : typeof v === 'number' ? `${formatSig(v, sig)}${unit ? ` ${unit}` : ''}` : `${v}${unit ? ` ${unit}` : ''}`}</dd>
    </>
  );
}

export const Logo = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="4.5" fill="#7df9ff" />
    <ellipse cx="32" cy="32" rx="25" ry="9" fill="none" stroke="#7df9ff" strokeWidth="2" />
    <ellipse cx="32" cy="32" rx="25" ry="9" fill="none" stroke="#b18cff" strokeWidth="2" transform="rotate(60 32 32)" />
    <ellipse cx="32" cy="32" rx="25" ry="9" fill="none" stroke="#f5c76b" strokeWidth="2" transform="rotate(120 32 32)" />
  </svg>
);

export const SearchGlyph = () => (
  <svg className="glyph" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
);

export function Loading({ label = 'Loading' }: { label?: string }) {
  return <div className="loading" role="status">{label.toUpperCase()}…</div>;
}
