/**
 * Data-driven 2D atomic diagrams. Every diagram is a pure function of AtomState.
 */
import { formatSig } from '@/core/units/units';
import { setQuery } from '@/shared/router';
import { L_LETTER, formatConfiguration, orbitalBoxes, subshellLabel, MADELUNG } from './configuration';
import { decayModes, formatHalfLife, groundStates } from './isotopes';
import { hydrogenLikeLines, levelEnergyEV, wavelengthToColor, SERIES } from './spectrum';
import type { AtomState } from './useAtomState';
import { subshellColor } from './AtomScene';
import { CONSTANTS } from '@/core/constants/constants';

export type DiagramId = 'bohr' | 'lewis' | 'config' | 'boxes' | 'nucleus' | 'energy' | 'spectrum' | 'isotopes';
export const DIAGRAMS: { id: DiagramId; label: string }[] = [
  { id: 'bohr', label: 'Bohr shells' }, { id: 'lewis', label: 'Lewis dot' }, { id: 'config', label: 'Configuration' },
  { id: 'boxes', label: 'Orbital boxes' }, { id: 'nucleus', label: 'Nucleus' }, { id: 'energy', label: 'Energy levels' },
  { id: 'spectrum', label: 'Spectrum' }, { id: 'isotopes', label: 'Isotopes' },
];

const sym = (st: AtomState) => `${st.element.symbol}${st.charge === 0 ? '' : st.charge > 0 ? `${st.charge > 1 ? st.charge : ''}+` : `${-st.charge > 1 ? -st.charge : ''}−`}`;

function Bohr({ st }: { st: AtomState }) {
  const n = st.shells.length;
  const size = 360, c = size / 2;
  const r0 = 34, dr = n ? Math.min(32, (c - r0 - 10) / n) : 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Bohr diagram of ${st.element.name}: shells ${st.shells.join(', ')}`}>
      <circle cx={c} cy={c} r={r0 - 8} fill="rgba(255,120,90,0.25)" stroke="#ff8a6b" />
      <text x={c} y={c - 2} textAnchor="middle" fontSize="13" fontWeight="600">{st.protons}p⁺</text>
      <text x={c} y={c + 13} textAnchor="middle" fontSize="11" opacity="0.8">{st.neutrons ?? '?'}n⁰</text>
      {st.shells.map((count, i) => {
        const r = r0 + dr * (i + 1);
        return (
          <g key={i}>
            <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(90,170,255,0.45)" />
            {Array.from({ length: count }, (_, k) => {
              const a = (k / count) * Math.PI * 2 - Math.PI / 2;
              return <circle key={k} cx={c + r * Math.cos(a)} cy={c + r * Math.sin(a)} r={3.4} fill="#7df9ff" />;
            })}
            <text x={c + r + 3} y={c - 3} fontSize="9" opacity="0.7">{count}</text>
          </g>
        );
      })}
      <text x={8} y={size - 8} fontSize="10" opacity="0.6">Educational model · shell radii not to scale</text>
    </svg>
  );
}

function Lewis({ st }: { st: AtomState }) {
  if (st.position.block === 'd' || st.position.block === 'f') {
    return <p className="note">Lewis dot structures are conventionally defined for main-group (s- and p-block) elements. {st.element.name} is a {st.position.block}-block element, so no Lewis structure is drawn.</p>;
  }
  const maxN = Math.max(...st.neutralConfig.map((s) => s.n));
  const v = st.config.filter((s) => s.n === maxN && s.l <= 1).reduce((t, s) => t + s.electrons, 0);
  const sides: number[] = [0, 0, 0, 0];
  if (st.element.Z === 2 || (v === 2 && st.position.block === 's')) sides[0] = 2;
  else for (let i = 0; i < v; i++) sides[i % 4]++;
  const c = 110, off = 40;
  const pos = [[0, -off], [off, 0], [0, off], [-off, 0]];
  return (
    <svg viewBox="0 0 220 220" role="img" aria-label={`Lewis structure of ${sym(st)} with ${v} valence electrons`}>
      {st.charge !== 0 && <text x={c} y={c + 14} textAnchor="middle" fontSize="92" opacity="0.25">[ ]</text>}
      <text x={c} y={c + 14} textAnchor="middle" fontSize="40" fontWeight="600">{st.element.symbol}</text>
      {st.charge !== 0 && <text x={c + 62} y={c - 30} fontSize="18">{st.charge > 0 ? `${st.charge > 1 ? st.charge : ''}+` : `${-st.charge > 1 ? -st.charge : ''}−`}</text>}
      {sides.map((k, i) => Array.from({ length: k }, (_, j) => {
        const [dx, dy] = pos[i];
        const spread = k === 2 ? (j === 0 ? -7 : 7) : 0;
        return <circle key={`${i}${j}`} cx={c + dx + (dy !== 0 ? spread : 0)} cy={c + dy + (dx !== 0 ? spread : 0)} r={4.2} fill="#7df9ff" />;
      }))}
      <text x={6} y={212} fontSize="10" opacity="0.6">{v} valence electron{v === 1 ? '' : 's'}</text>
    </svg>
  );
}

function Config({ st }: { st: AtomState }) {
  const filled = MADELUNG.filter((m) => st.config.some((s) => s.n === m.n && s.l === m.l));
  return (
    <div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 16, margin: '4px 0 8px' }}>{formatConfiguration(st.config)}</p>
      <p className="note" style={{ fontFamily: 'var(--mono)' }}>{formatConfiguration(st.config, false)}</p>
      {st.element.configurationPredicted && <p className="note warn">Ground-state configuration for {st.element.name} is predicted/calculated, not measured.</p>}
      <div className="section-title">Subshell occupancy (filling order)</div>
      <svg viewBox={`0 0 400 ${filled.length * 20 + 10}`} role="img" aria-label="Subshell occupancy bar chart">
        {filled.map((m, i) => {
          const s = st.config.find((x) => x.n === m.n && x.l === m.l)!;
          const cap = [2, 6, 10, 14][s.l];
          return (
            <g key={i} transform={`translate(0, ${i * 20 + 4})`}>
              <text x={0} y={12} fontSize="11" fontFamily="var(--mono)">{subshellLabel(s)}</text>
              <rect x={34} y={2} width={cap * 22} height={13} rx={3} fill="rgba(255,255,255,0.06)" />
              <rect x={34} y={2} width={s.electrons * 22} height={13} rx={3} fill={subshellColor(s.l)} opacity={0.8} />
              <text x={40 + cap * 22} y={12} fontSize="10" opacity="0.7">{s.electrons}/{cap}</text>
            </g>
          );
        })}
      </svg>
      {st.charge !== 0 && <p className="note">Ion configuration derived by removing electrons from the highest-n subshell first (cations) or adding in Madelung order (anions) — a standard approximation.</p>}
    </div>
  );
}

function Boxes({ st }: { st: AtomState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {st.config.map((s) => (
        <div key={`${s.n}${s.l}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, fontFamily: 'var(--mono)', color: subshellColor(s.l) }}>{subshellLabel(s)}</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {orbitalBoxes(s).map((b, i) => (
              <span key={i} style={{ width: 26, height: 26, border: '1px solid var(--line-strong)', borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--accent)' }}>{b === 'pair' ? '⇅' : b === 'up' ? '↑' : ''}</span>
            ))}
          </div>
        </div>
      ))}
      <p className="note">Hund's rule: electrons occupy degenerate orbitals singly (parallel spins) before pairing.</p>
    </div>
  );
}

function NucleusComp({ st }: { st: AtomState }) {
  const N = st.neutrons ?? 0, Z = st.protons, A = Z + N;
  const R = 1.2 * Math.cbrt(A);
  const atomR = st.element.vanDerWaalsRadiusPm;
  return (
    <div>
      <svg viewBox="0 0 400 70" role="img" aria-label={`${Z} protons and ${N} neutrons`}>
        <rect x={0} y={10} width={400 * (Z / A)} height={26} fill="#ff6b5c" rx={4} />
        <rect x={400 * (Z / A)} y={10} width={400 * (N / A)} height={26} fill="#9fb3d9" rx={4} />
        <text x={6} y={28} fontSize="12" fill="#1a0505">{Z} p</text>
        <text x={394} y={28} fontSize="12" textAnchor="end" fill="#0b1426">{N} n</text>
        <text x={0} y={58} fontSize="11" opacity="0.75">A = {A} · N/Z = {(N / Z).toFixed(3)}</text>
      </svg>
      <dl className="kv">
        <dt>Nuclear radius R ≈ 1.2 fm·A^⅓</dt><dd>{R.toFixed(2)} fm</dd>
        <dt>Atom (vdW) / nucleus size</dt><dd className={atomR ? '' : 'unknown'}>{atomR ? `≈ ${formatSig((atomR * 1000) / R, 3)} ×` : 'unknown'}</dd>
        <dt>Nuclide mass</dt><dd>{st.natural?.mass ?? st.nuclide?.mass ? `${(st.natural?.mass ?? st.nuclide!.mass)!.toFixed(6)} u` : 'unknown'}</dd>
        <dt>Mass defect (approx.)</dt><dd>{st.nuclide?.mass ? `${((Z * 1.00782503 + N * 1.00866492 - st.nuclide.mass) * 931.494).toFixed(2)} MeV` : 'unknown'}</dd>
      </dl>
      <p className="note">Binding energy B = [Z·m(¹H) + N·mₙ − m(atom)]c². R = r₀A^⅓ is an empirical charge-radius fit (r₀ ≈ 1.2 fm).</p>
    </div>
  );
}

function Energy({ st }: { st: AtomState }) {
  const oneElectron = st.electrons === 1;
  const levels = oneElectron
    ? Array.from({ length: 6 }, (_, i) => ({ label: `n = ${i + 1}`, E: levelEnergyEV(i + 1, st.protons, st.nuclearMassU), l: 0 }))
    : st.config.map((s) => ({ label: subshellLabel(s), E: (-CONSTANTS.RyEV.value * (st.zeff.get(`${s.n},${s.l}`) ?? 1) ** 2) / (s.n * s.n), l: s.l }));
  const Emin = Math.min(...levels.map((l) => l.E));
  const y = (E: number) => 20 + 260 * Math.pow(E / Emin, 0.33);
  return (
    <div>
      <svg viewBox="0 0 400 300" role="img" aria-label="Energy level diagram">
        <line x1={40} y1={10} x2={40} y2={290} stroke="rgba(255,255,255,0.3)" />
        <text x={44} y={14} fontSize="10" opacity="0.7">0 eV (ionisation)</text>
        {levels.map((l, i) => (
          <g key={i}>
            <line x1={60} x2={300} y1={y(l.E)} y2={y(l.E)} stroke={oneElectron ? '#7df9ff' : subshellColor(l.l)} strokeWidth={1.5} />
            <text x={306} y={y(l.E) + 4} fontSize="10" fontFamily="var(--mono)">{l.label}</text>
            <text x={56} y={y(l.E) - 3} fontSize="9" textAnchor="end" opacity="0.7">{l.E.toFixed(2)}</text>
          </g>
        ))}
      </svg>
      <p className="note">{oneElectron
        ? 'Exact non-relativistic one-electron levels Eₙ = −R_M Z²/n² with reduced-mass correction (fine structure neglected). Vertical axis compressed.'
        : 'APPROXIMATE orbital energies from Slater effective charges, E ≈ −13.6 eV·Z_eff²/n². Qualitative only — real multi-electron energies require Hartree–Fock or measured term values (NIST ASD).'}</p>
    </div>
  );
}

function Spectrum({ st }: { st: AtomState }) {
  if (st.electrons !== 1) {
    return (
      <div>
        <p className="note">Emission/absorption lines of multi-electron atoms cannot be computed from the Bohr/Rydberg formula. Measured lines come from the NIST Atomic Spectra Database, which is not yet ingested in Phase 1 — no lines are drawn rather than inventing them.</p>
        {st.element.nistSpectraUrl && <p><a href={st.element.nistSpectraUrl} target="_blank" rel="noreferrer">Open NIST ASD lines for {st.element.symbol} →</a></p>}
        <p className="note">Tip: select hydrogen, or ionise helium to He⁺, to see computed hydrogen-like spectra.</p>
      </div>
    );
  }
  const lines = hydrogenLikeLines(st.protons, st.nuclearMassU, 4, 12);
  const vis = lines.filter((l) => l.wavelengthNm >= 380 && l.wavelengthNm <= 750);
  const x = (nm: number) => ((nm - 380) / 370) * 400;
  return (
    <div>
      <svg viewBox="0 0 400 90" role="img" aria-label="Visible emission spectrum">
        <defs><linearGradient id="vis">{[380, 420, 460, 500, 540, 580, 620, 660, 700, 750].map((nm) => <stop key={nm} offset={`${((nm - 380) / 370) * 100}%`} stopColor={wavelengthToColor(nm)} stopOpacity={0.18} />)}</linearGradient></defs>
        <rect x={0} y={8} width={400} height={50} fill="url(#vis)" />
        <rect x={0} y={8} width={400} height={50} fill="#000" opacity={0.55} />
        {vis.map((l) => <rect key={`${l.nUpper}-${l.nLower}`} x={x(l.wavelengthNm) - 1} y={8} width={2.4} height={50} fill={wavelengthToColor(l.wavelengthNm)} />)}
        {[400, 500, 600, 700].map((nm) => <text key={nm} x={x(nm)} y={74} fontSize="10" textAnchor="middle" opacity="0.7">{nm} nm</text>)}
      </svg>
      <table className="table-mini">
        <thead><tr><th>Transition</th><th>Series</th><th>λ (vac) nm</th><th>ΔE eV</th></tr></thead>
        <tbody>
          {lines.filter((l) => l.nUpper - l.nLower <= 3).slice(0, 12).map((l) => (
            <tr key={`${l.nUpper}-${l.nLower}`}><td>{l.nUpper} → {l.nLower}</td><td>{SERIES[l.nLower]}</td><td>{l.wavelengthNm.toFixed(3)}</td><td>{l.energyEV.toFixed(4)}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="note">Computed (derived): Rydberg formula with reduced mass for M = {st.nuclearMassU.toFixed(4)} u. Absorption lines occur at the same wavelengths.</p>
    </div>
  );
}

function Isotopes({ st }: { st: AtomState }) {
  if (!st.nuclides) return <p className="note">Loading nuclide table…</p>;
  const nat = st.nuclides.natural.filter((n) => n.abundance !== null);
  const gs = groundStates(st.nuclides);
  const notable = [...gs].sort((a, b) => (b.stable ? 1e99 : b.halfLifeS ?? -1) - (a.stable ? 1e99 : a.halfLifeS ?? -1)).slice(0, 14).sort((a, b) => a.A - b.A);
  return (
    <div>
      <div className="section-title">Natural isotopic composition</div>
      {nat.length ? (
        <svg viewBox={`0 0 400 ${nat.length * 22 + 6}`} role="img" aria-label="Natural abundance chart">
          {nat.map((n, i) => (
            <g key={n.A} transform={`translate(0, ${i * 22})`} style={{ cursor: 'pointer' }} onClick={() => setQuery({ A: n.A })}>
              <text x={0} y={15} fontSize="11" fontFamily="var(--mono)" fill={n.A === st.A ? 'var(--accent)' : undefined}>{n.A}{st.element.symbol}</text>
              <rect x={56} y={4} width={300 * (n.abundance ?? 0)} height={14} rx={3} fill={n.A === st.A ? '#7df9ff' : '#3aa8ff'} />
              {n.abundanceInterval && <rect x={56 + 300 * n.abundanceInterval[0]} y={10} width={Math.max(1, 300 * (n.abundanceInterval[1] - n.abundanceInterval[0]))} height={2} fill="#f5c76b" />}
              <text x={60 + 300 * (n.abundance ?? 0)} y={15} fontSize="10" opacity="0.8">{((n.abundance ?? 0) * 100).toPrecision(4)} %{n.abundanceInterval ? ' (interval midpoint)' : ''}</text>
            </g>
          ))}
        </svg>
      ) : <p className="note">No naturally occurring isotopes with a defined terrestrial abundance — {st.element.name} is known only from synthetic or trace radioactive sources.</p>}
      <div className="section-title">Longest-lived ground-state nuclides (click to select)</div>
      <table className="table-mini">
        <thead><tr><th>Nuclide</th><th>N</th><th>Half-life</th><th>Decay modes</th></tr></thead>
        <tbody>
          {notable.map((n) => (
            <tr key={n.A} className={n.A === st.A ? 'sel' : ''} style={{ cursor: 'pointer' }} onClick={() => setQuery({ A: n.A })}>
              <td>{n.A}{st.element.symbol}</td><td>{n.A - st.protons}</td><td>{formatHalfLife(n)}</td>
              <td style={{ fontSize: 10.5 }}>{decayModes(n.decay).map((d) => `${d.mode}${d.percent ? ` ${d.percent}%` : ''}`).join(', ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">{gs.length} known ground-state nuclides (IAEA AMDC NUBASE). Yellow ticks mark CIAAW abundance intervals.</p>
    </div>
  );
}

export function Diagram({ id, st }: { id: DiagramId; st: AtomState }) {
  switch (id) {
    case 'bohr': return <Bohr st={st} />;
    case 'lewis': return <Lewis st={st} />;
    case 'config': return <Config st={st} />;
    case 'boxes': return <Boxes st={st} />;
    case 'nucleus': return <NucleusComp st={st} />;
    case 'energy': return <Energy st={st} />;
    case 'spectrum': return <Spectrum st={st} />;
    case 'isotopes': return <Isotopes st={st} />;
  }
}
export { L_LETTER };
