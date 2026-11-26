/**
 * Thermochemistry for a curated reaction: ΔrH°, ΔrS°, ΔrG°(T), K(T), per-species sourced values and
 * an energy-level (Hess) diagram. Levels are Derived from tabulated data; the reaction-path curve
 * between them is Illustrative (no measured activation energies are bundled).
 */
import { useMemo, useState } from 'react';
import { KV, ProvenanceBadge } from '@/ui/components';
import { navigate } from '@/shared/router';
import { formatSig } from '@/core/units/units';
import { prettySpecies } from './formula';
import { toEquation, type CuratedReaction } from './library';
import { DCP_WARNING_K, T_STD, equilibriumK, gibbs, reactionThermo, type ReactionThermo } from './thermo';

function EnergyDiagram({ rt }: { rt: ReactionThermo }) {
  if (rt.dH.value === null) return null;
  const sumF = (sign: number) => rt.terms.filter((t) => Math.sign(t.nu) === sign).reduce((s, t) => s + Math.abs(t.nu) * t.data!.dfH!.value, 0);
  const R = sumF(-1), P = sumF(1);
  const lo = Math.min(0, R, P), hi = Math.max(0, R, P);
  const span = hi - lo || 1;
  const W = 360, H = 230, top = 52, bot = 30;
  const y = (v: number) => top + ((hi - v) / span) * (H - top - bot);
  const lvl = (x0: number, x1: number, v: number, label: string, color: string) => (
    <g><line x1={x0} x2={x1} y1={y(v)} y2={y(v)} stroke={color} strokeWidth={2.5} />
      <text x={(x0 + x1) / 2} y={y(v) - 5} textAnchor="middle" style={{ fill: color }}>{label}</text>
      <text x={(x0 + x1) / 2} y={y(v) + 13} textAnchor="middle">{formatSig(v, 5)} kJ</text></g>
  );
  const exo = P < R;
  return (
    <figure style={{ margin: '8px 0' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label={`Energy diagram: ΔrH° = ${formatSig(rt.dH.value, 5)} kJ/mol`}>
        <line x1={20} x2={20} y1={top - 6} y2={H - bot + 4} stroke="var(--line-strong)" />
        {lvl(150, 230, 0, 'elements', 'var(--text-faint)')}
        {lvl(30, 120, R, 'reactants', 'var(--accent)')}
        {lvl(260, 350, P, 'products', exo ? '#5cf2a6' : '#ff7a90')}
        {/* Illustrative path: a smooth hump with NO numeric barrier height */}
        <path d={`M120 ${y(R)} C 170 ${y(Math.max(R, P)) - 34}, 210 ${y(Math.max(R, P)) - 34}, 260 ${y(P)}`} fill="none" stroke="var(--warn)" strokeDasharray="4 4" strokeWidth={1.3} />
        <text x={190} y={12} textAnchor="middle" style={{ fill: 'var(--warn)' }}>path shape illustrative · barrier unknown</text>
        <line x1={340} x2={340} y1={y(R)} y2={y(P)} stroke="var(--text-dim)" markerEnd="url(#arr)" />
        <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--text-dim)" /></marker></defs>
        <text x={W / 2} y={H - 8} textAnchor="middle">ΔrH° = {formatSig(rt.dH.value, 5)} kJ/mol ({exo ? 'exothermic' : 'endothermic'})</text>
      </svg>
      <figcaption className="note" style={{ fontSize: 10.5 }}>Vertical axis: enthalpy relative to the elements in their standard states (kJ per mole of reaction as written). Levels <ProvenanceBadge cls="derived" /> · dashed path <ProvenanceBadge cls="illustrative" /></figcaption>
    </figure>
  );
}

export default function ThermoPanel({ reaction }: { reaction: CuratedReaction }) {
  const rt = useMemo(() => reactionThermo(toEquation(reaction)), [reaction]);
  const [T, setT] = useState(T_STD);
  const dG = gibbs(rt, T);
  const K = dG === null ? null : equilibriumK(dG, T);
  const far = Math.abs(T - T_STD) > DCP_WARNING_K;
  return (
    <div aria-label="Thermochemistry">
      <div className="section-title">Thermochemistry <ProvenanceBadge cls="derived" title={rt.dH.basis} /></div>
      <dl className="kv">
        <KV k="ΔrH° (298.15 K)" v={rt.dH.value === null ? null : `${formatSig(rt.dH.value, 6)}${rt.dH.uncertainty !== null ? ` ± ${formatSig(rt.dH.uncertainty, 2)}` : ''}`} unit="kJ/mol" />
        <KV k="ΔrS° (298.15 K)" v={rt.dS.value === null ? null : `${formatSig(rt.dS.value, 5)}${rt.dS.uncertainty !== null ? ` ± ${formatSig(rt.dS.uncertainty, 2)}` : ''}`} unit="J/(mol·K)" />
        <KV k={`ΔrG° (${T.toFixed(0)} K)`} v={dG} unit="kJ/mol" sig={5} />
        <KV k={`K (${T.toFixed(0)} K)`} v={K === null ? null : K === Infinity || K > 1e300 ? '> 10³⁰⁰' : K < 1e-300 ? '< 10⁻³⁰⁰' : formatSig(K, 3)} />
      </dl>
      <div className="slider-row"><span>T</span><input type="range" min={200} max={1500} step={1} value={T} onChange={(e) => setT(Number(e.target.value))} aria-label="Temperature in kelvin" /><span style={{ fontFamily: 'var(--mono)' }}>{T.toFixed(0)} K</span></div>
      {far && <p className="note warn">⚠ ΔrH° and ΔrS° are held at their 298.15 K values (ΔrCp° = 0). At {T.toFixed(0)} K this is an approximation, and phases written as (l) or (s) may no longer be the stable ones.</p>}
      {rt.photochemical && <p className="note">Photochemical step: ΔrH° counts chemical species only. It is the minimum energy the absorbed photon must supply (per mole of photons), not a property of the light.</p>}
      {(rt.missingH.length > 0 || rt.missingS.length > 0) && <p className="note warn">Unknown: no sourced {rt.missingH.length ? 'ΔfH°' : 'S°'} for {[...new Set([...rt.missingH, ...rt.missingS])].map((k) => prettySpecies(k)).join(', ')}. Nothing is estimated.</p>}
      {reaction.net && rt.dH.value !== null && <p className="note">For a net equation ΔrH° is path-independent (Hess’s law), even though the real mechanism has many steps.</p>}
      <EnergyDiagram rt={rt} />
      <div className="section-title">Species data (298.15 K, 1 bar)</div>
      <table className="table-mini" aria-label="Species thermochemical data">
        <thead><tr><th>Species</th><th>ν</th><th>ΔfH° kJ/mol</th><th>S° J/(mol·K)</th></tr></thead>
        <tbody>{rt.terms.map((t) => (
          <tr key={t.key}>
            <td title={t.data ? [t.data.dfH?.source, t.data.S?.source].filter(Boolean).join('\n') : 'no data'}>{prettySpecies(t.key)}</td>
            <td>{t.nu > 0 ? `+${t.nu}` : t.nu}</td>
            <td className={t.data?.dfH ? '' : 'unknown'}>{t.data?.dfH ? `${t.data.dfH.value}${t.data.dfH.uncertainty !== null ? ` ± ${t.data.dfH.uncertainty}` : ''}${t.data.dfH.derived ? '*' : ''}` : 'unknown'}</td>
            <td className={t.data?.S ? '' : 'unknown'}>{t.data?.S ? `${t.data.S.value}${t.data.S.uncertainty !== null ? ` ± ${t.data.S.uncertainty}` : ''}` : 'unknown'}</td>
          </tr>
        ))}</tbody>
      </table>
      <p className="note" style={{ fontSize: 10.5 }}>
        Sources: <button className="link-btn" onClick={() => navigate('/sources/codata-key-values')}>CODATA Key Values (1989)</button> first, then the <button className="link-btn" onClick={() => navigate('/sources/nist-webbook')}>NIST Chemistry WebBook</button> (literature reference per value: hover a species).
        {rt.terms.some((t) => t.data?.dfH?.derived) && ' * derived from the measured combustion enthalpy.'} Uncertainties are combined in quadrature, treating the values as independent.
      </p>
    </div>
  );
}
