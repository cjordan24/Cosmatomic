/**
 * Shared scientific line plot (SVG). Every plot must name the physical quantity and unit on both
 * axes — the component requires them. Optional log axes, reference lines and markers.
 */
import type { ReactNode } from 'react';

export interface Series { points: [number, number][]; color: string; label?: string; dashed?: boolean; width?: number }
export interface PlotProps {
  series: Series[];
  xLabel: string; yLabel: string; // quantity + unit, e.g. "wavelength λ (µm)"
  xLog?: boolean; yLog?: boolean;
  xDomain?: [number, number]; yDomain?: [number, number];
  width?: number; height?: number;
  hLines?: { y: number; label: string; color?: string }[];
  vLines?: { x: number; label: string; color?: string }[];
  markers?: { x: number; y: number; label?: string; color?: string }[];
  ariaLabel: string;
  children?: ReactNode;
}

const nice = (v: number) => { const e = Math.floor(Math.log10(Math.abs(v) || 1)); const f = v / 10 ** e; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * 10 ** e; };
export const fmtTick = (v: number) => (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-2 && v !== 0) ? v.toExponential(0).replace('e+', 'e') : Number(v.toPrecision(4)).toString());

function ticks(lo: number, hi: number, log: boolean): number[] {
  if (log) { const out: number[] = []; for (let e = Math.ceil(Math.log10(lo)); e <= Math.floor(Math.log10(hi)); e++) out.push(10 ** e); return out; }
  const step = nice((hi - lo) / 5); const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}

export function LinePlot({ series, xLabel, yLabel, xLog, yLog, xDomain, yDomain, width = 380, height = 200, hLines = [], vLines = [], markers = [], ariaLabel, children }: PlotProps) {
  const all = series.flatMap((s) => s.points).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && (!xLog || x > 0) && (!yLog || y > 0));
  if (!all.length) return <p className="note">No data in range.</p>;
  const [x0, x1] = xDomain ?? [Math.min(...all.map((p) => p[0])), Math.max(...all.map((p) => p[0]))];
  let [y0, y1] = yDomain ?? [Math.min(...all.map((p) => p[1]), ...hLines.map((h) => h.y)), Math.max(...all.map((p) => p[1]), ...hLines.map((h) => h.y))];
  if (y0 === y1) { y0 -= Math.abs(y0) * 0.1 || 1; y1 += Math.abs(y1) * 0.1 || 1; }
  const pad = { l: 52, r: 10, t: 10, b: 36 };
  const W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const tx = (v: number) => xLog ? Math.log10(v) : v, ty = (v: number) => yLog ? Math.log10(v) : v;
  const sx = (v: number) => pad.l + ((tx(v) - tx(x0)) / (tx(x1) - tx(x0) || 1)) * W;
  const sy = (v: number) => pad.t + H - ((ty(v) - ty(y0)) / (ty(y1) - ty(y0) || 1)) * H;
  const clip = `clip-${ariaLabel.replace(/\W/g, '')}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="plot" role="img" aria-label={ariaLabel}>
      <defs><clipPath id={clip}><rect x={pad.l} y={pad.t} width={W} height={H} /></clipPath></defs>
      <rect x={pad.l} y={pad.t} width={W} height={H} fill="rgba(255,255,255,0.02)" stroke="var(--line)" />
      {ticks(x0, x1, !!xLog).map((v) => <g key={`x${v}`}><line x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + H} stroke="var(--line)" /><text x={sx(v)} y={pad.t + H + 12} textAnchor="middle">{fmtTick(v)}</text></g>)}
      {ticks(y0, y1, !!yLog).map((v) => <g key={`y${v}`}><line x1={pad.l} x2={pad.l + W} y1={sy(v)} y2={sy(v)} stroke="var(--line)" /><text x={pad.l - 4} y={sy(v) + 3} textAnchor="end">{fmtTick(v)}</text></g>)}
      <g clipPath={`url(#${clip})`}>
        {hLines.map((h) => <g key={h.label}><line x1={pad.l} x2={pad.l + W} y1={sy(h.y)} y2={sy(h.y)} stroke={h.color ?? 'var(--warn)'} strokeDasharray="4 3" /><text x={pad.l + W - 4} y={sy(h.y) - 3} textAnchor="end" style={{ fill: h.color ?? 'var(--warn)' }}>{h.label}</text></g>)}
        {vLines.map((v) => <g key={v.label}><line x1={sx(v.x)} x2={sx(v.x)} y1={pad.t} y2={pad.t + H} stroke={v.color ?? 'var(--warn)'} strokeDasharray="4 3" /><text x={sx(v.x) + 3} y={pad.t + 10} style={{ fill: v.color ?? 'var(--warn)' }}>{v.label}</text></g>)}
        {series.map((s, i) => (
          <polyline key={i} fill="none" stroke={s.color} strokeWidth={s.width ?? 1.6} strokeDasharray={s.dashed ? '5 4' : undefined}
            points={s.points.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y)).map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')} />
        ))}
        {markers.map((m, i) => <g key={i}><circle cx={sx(m.x)} cy={sy(m.y)} r={3.2} fill={m.color ?? 'var(--accent)'} />{m.label && <text x={sx(m.x) + 5} y={sy(m.y) - 5} style={{ fill: m.color ?? 'var(--accent)' }}>{m.label}</text>}</g>)}
        {children}
      </g>
      <text x={pad.l + W / 2} y={height - 4} textAnchor="middle" style={{ fill: 'var(--text)' }}>{xLabel}</text>
      <text transform={`translate(11 ${pad.t + H / 2}) rotate(-90)`} textAnchor="middle" style={{ fill: 'var(--text)' }}>{yLabel}</text>
      {series.some((s) => s.label) && (
        <g>{series.filter((s) => s.label).map((s, i) => <g key={i} transform={`translate(${pad.l + 6} ${pad.t + 12 + i * 12})`}><line x1={0} x2={14} y1={-3} y2={-3} stroke={s.color} strokeDasharray={s.dashed ? '4 3' : undefined} /><text x={18} y={0}>{s.label}</text></g>)}</g>
      )}
    </svg>
  );
}
