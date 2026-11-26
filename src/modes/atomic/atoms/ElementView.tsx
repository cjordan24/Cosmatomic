import { useMemo, useState } from 'react';
import curated from '@datasets/curated/curated-reference.json';
import { Viewport } from '@/rendering/Viewport';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Loading, Panel, ProvenanceBadge } from '@/ui/components';
import { FAMILY_COLORS, getElement, atomicWeightLabel } from './elements';
import { useAtomState } from './useAtomState';
import { AtomSceneContents, orbitalLabel, type AtomView } from './AtomScene';
import { DIAGRAMS, Diagram, type DiagramId } from './diagrams';
import { formatConfiguration, L_LETTER, subshellLabel, type L } from './configuration';
import { groundStates, formatHalfLife, longestLivedA } from './isotopes';
import { ORBITAL_NAMES, orbitalName, type OrbitalId } from '../orbitals/hydrogenic';
import { transitionLine, wavelengthToColor } from './spectrum';
import { MOLECULES } from '../molecules/molecules';

const VIEWS: { id: AtomView; label: string; kind: string }[] = [
  { id: 'shell', label: 'Shell model', kind: 'educational' },
  { id: 'cloud', label: 'Probability cloud', kind: 'quantum (approx.)' },
  { id: 'orbital', label: 'Orbital', kind: 'quantum' },
  { id: 'nucleus', label: 'Nucleus', kind: 'schematic' },
  { id: 'size', label: 'Size', kind: 'data' },
];

const supSign = (q: number) => (q === 0 ? 'neutral' : `${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '+' : '−'}`);

export default function ElementView({ Z }: { Z: number }) {
  const { query } = useRoute();
  const view = (query.get('view') as AtomView) ?? 'cloud';
  const diagram = (query.get('diagram') as DiagramId) ?? 'bohr';
  const A = query.get('A') ? Number(query.get('A')) : null;
  const q = Number(query.get('q') ?? 0);
  const opacity = Number(query.get('opacity') ?? 0.55);
  const xs = query.get('xs') === '1';
  const st = useAtomState(Z, A, q);
  const [mobileDiagrams, setMobileDiagrams] = useState(false);
  const [photon, setPhoton] = useState<{ color: string; key: number; absorb: boolean; text: string } | null>(null);

  const oneElectron = st?.electrons === 1;
  // Orbital choices: occupied subshells; for one-electron systems any n ≤ 5.
  const orbitalChoices: OrbitalId[] = useMemo(() => {
    if (!st) return [];
    const subs = oneElectron ? Array.from({ length: 5 }, (_, n) => Array.from({ length: Math.min(4, n + 1) }, (_, l) => ({ n: n + 1, l: l as L }))).flat() : st.config.map((s) => ({ n: s.n, l: s.l }));
    return subs.flatMap((s) => Array.from({ length: 2 * s.l + 1 }, (_, k) => ({ n: s.n, l: s.l, m: k - s.l })));
  }, [st, oneElectron]);
  const orbParam = query.get('orb');
  const defaultOrb = useMemo<OrbitalId>(() => {
    if (!st) return { n: 1, l: 0, m: 0 };
    if (oneElectron) return { n: 1, l: 0, m: 0 };
    const outer = st.config[st.config.length - 1] ?? { n: 1, l: 0 };
    const top = [...st.config].sort((a, b) => b.n - a.n || b.l - a.l)[0] ?? outer;
    return { n: top.n, l: top.l, m: 0 };
  }, [st, oneElectron]);
  const orbital: OrbitalId = useMemo(() => {
    if (!orbParam) return defaultOrb;
    const [n, l, m] = orbParam.split(',').map(Number);
    return orbitalChoices.find((o) => o.n === n && o.l === l && o.m === m) ?? defaultOrb;
  }, [orbParam, orbitalChoices, defaultOrb]);

  const element = getElement(Z);
  if (!element) return <div className="loading">No element with Z = {Z}. <button className="link-btn" onClick={() => navigate('/atomic')}>Back to table</button></div>;
  if (!st) return <Loading label="Loading atomic data" />;

  const orbitalZ = oneElectron ? st.protons : st.zeff.get(`${orbital.n},${orbital.l}`) ?? 1;
  const tile = FAMILY_COLORS[element.groupBlock] ?? '#7df9ff';
  const llA = st.nuclides ? longestLivedA(st.nuclides) : null;
  const inSun = (curated.solarPhotosphericAbundances.logEpsilon as Record<string, number>)[element.symbol] !== undefined;
  const atmospheres = Object.entries(curated.atmospheres.bodies).filter(([, list]) => list.some((x) => x.species === element.symbol));
  const molecules = MOLECULES.filter((m) => m.atoms.some((a) => a.Z === Z)).slice(0, 8);

  const excite = (dir: 1 | -1) => {
    const nFrom = orbital.n;
    const nTo = nFrom + dir;
    if (nTo < 1 || nTo > 5) return;
    const line = transitionLine(Math.max(nFrom, nTo), Math.min(nFrom, nTo), st.protons, st.nuclearMassU);
    const nm = line.wavelengthNm;
    const color = nm >= 380 && nm <= 750 ? wavelengthToColor(nm) : nm < 380 ? '#c8a8ff' : '#ff8a6b';
    setPhoton({ color, key: Date.now(), absorb: dir === 1, text: `${dir === 1 ? 'Absorbed' : 'Emitted'} photon: n=${nFrom} → n=${nTo}, λ = ${nm.toFixed(2)} nm (${nm < 380 ? 'ultraviolet' : nm > 750 ? 'infrared' : 'visible'}), ΔE = ${Math.abs(line.energyEV).toFixed(3)} eV` });
    setQuery({ orb: `${nTo},${Math.min(orbital.l, nTo - 1)},${Math.abs(orbital.m) <= Math.min(orbital.l, nTo - 1) ? orbital.m : 0}` });
  };

  const modelText: Record<AtomView, React.ReactNode> = {
    shell: <><strong>Educational shell model.</strong> Electrons are drawn moving on rings for teaching only — real electrons have no defined trajectories. Shell occupancy is exact; radii and motion are not physical.</>,
    cloud: st.electrons === 0 ? <><strong>Fully ionised</strong> — no electrons remain, so there is no electron probability density to draw.</> : <><strong>Probability density |ψ|²</strong> of all {st.electrons} electrons, sampled point-by-point (points are independent samples, not particles or paths). {oneElectron ? 'Exact hydrogen-like solution.' : 'Multi-electron approximation: hydrogenic orbitals with Slater effective charges — qualitative, not Hartree–Fock.'} Colour = subshell (s cyan · p blue · d green · f magenta).</>,
    orbital: <><strong>{orbitalName(orbital)} orbital</strong> (n={orbital.n}, l={orbital.l}, m={orbital.m}) — analytic ψ with Z{oneElectron ? '' : '_eff'} = {orbitalZ.toFixed(2)}. Cyan / pink = positive / negative wavefunction phase. {oneElectron ? 'Exact (non-relativistic) for this one-electron system.' : 'Shape exact for hydrogenic ψ; size uses the Slater approximation.'}</>,
    nucleus: <><strong>Schematic nucleus</strong> of {st.A ?? '?'}{element.symbol}: {st.protons} protons (red), {st.neutrons ?? '?'} neutrons (grey), R ≈ {(1.2 * Math.cbrt(st.A ?? 1)).toFixed(2)} fm. Nucleons have no fixed positions — this packing is illustrative only. The atom is ~10⁴–10⁵× larger.</>,
    size: !element.vanDerWaalsRadiusPm ? <><strong>No van der Waals radius</strong> is published in the dataset for {element.name}, so no size comparison is drawn (values are never estimated).</> : <><strong>Van der Waals radii</strong> (PubChem) compared with reference elements, drawn to a common scale. Atoms have no sharp edge; vdW radius is a contact-distance convention.</>,
  };

  return (
    <>
      <Viewport camera={{ position: [0, 1.5, 7.5], fov: 45 }}>
        <AtomSceneContents st={st} view={view} opacity={opacity} crossSection={xs} orbital={orbital} orbitalZ={orbitalZ} photon={photon} />
      </Viewport>

      <nav className="view-switch" aria-label="Atomic representation">
        {VIEWS.map((v) => <button key={v.id} className={view === v.id ? 'active' : ''} onClick={() => setQuery({ view: v.id })} title={v.kind}>{v.label}</button>)}
        <button className={`mobile-only ${mobileDiagrams ? 'active' : ''}`} onClick={() => setMobileDiagrams((m) => !m)}>Diagrams</button>
      </nav>

      <Panel id="element-info" className="left-panel" title={<>Element · {VIEWS.find((v) => v.id === view)?.kind}</>}
        actions={<><button onClick={() => Z > 1 && navigate(`/atomic/element/${Z - 1}`)} aria-label="Previous element" disabled={Z <= 1}>‹</button><button onClick={() => Z < 118 && navigate(`/atomic/element/${Z + 1}`)} aria-label="Next element" disabled={Z >= 118}>›</button></>}>
        <div className="element-hero" style={{ ['--tile' as string]: tile }}>
          <div className="big"><span>{Z}</span><b>{element.symbol}</b><span>{atomicWeightLabel(element, llA)}</span></div>
          <div>
            <h2>{element.name}{st.charge !== 0 && <sup style={{ fontSize: 14, marginLeft: 4 }}>{supSign(st.charge)}</sup>}</h2>
            <div className="note">{element.groupBlock} · {st.position.block}-block · period {st.position.period}{st.position.group ? ` · group ${st.position.group}` : ''}</div>
            <div style={{ marginTop: 6 }}>{element.hasStableIsotope ? <ProvenanceBadge cls="observed" title="Measured data" /> : <span className="badge" style={{ color: 'var(--warn)' }}>☢ no stable isotope</span>}</div>
          </div>
        </div>

        <div className="section-title">Composition</div>
        <dl className="kv">
          <KV k="Protons" v={st.protons} />
          <KV k="Neutrons" v={st.neutrons} />
          <KV k="Electrons" v={st.electrons} />
          <dt>Configuration</dt><dd style={{ fontSize: 11 }}>{formatConfiguration(st.config)}</dd>
          <KV k="Shells" v={st.shells.join(', ')} />
          <KV k="Valence electrons" v={st.valence} title="Main group: outer-shell s+p; d-block: ns+(n−1)d; f-block: undefined" />
        </dl>

        <div className="section-title">Isotope</div>
        {st.nuclides ? (
          <>
            <select value={st.A ?? ''} onChange={(e) => setQuery({ A: e.target.value })} aria-label="Select isotope" style={{ width: '100%' }}>
              {groundStates(st.nuclides).map((n) => {
                const nat = st.nuclides!.natural.find((x) => x.A === n.A);
                return <option key={n.A} value={n.A}>{element.symbol}-{n.A} · N={n.A - Z} · {nat?.abundance ? `${(nat.abundance * 100).toPrecision(3)} % natural` : formatHalfLife(n)}</option>;
              })}
            </select>
            <p className="note" style={{ margin: '6px 0 0' }}>
              {st.isotopeReason === 'most-abundant' && 'Default: most abundant natural isotope.'}
              {st.isotopeReason === 'longest-lived' && <span style={{ color: 'var(--warn)' }}>No stable isotope — showing the longest-lived nuclide, {element.symbol}-{st.A} (t½ {st.nuclide ? formatHalfLife(st.nuclide) : 'unknown'}).</span>}
              {st.isotopeReason === 'user' && st.nuclide && `Selected: t½ ${formatHalfLife(st.nuclide)}.`}
            </p>
          </>
        ) : <p className="note">Loading nuclide table…</p>}

        <div className="section-title">Charge state</div>
        <div className="chip-row" role="group" aria-label="Charge state">
          {st.allowedCharges.map((c) => <button key={c} className={`chip ${c === st.charge ? 'active' : ''}`} onClick={() => setQuery({ q: c })}>{c === 0 ? `${element.symbol} (neutral)` : `${element.symbol}${supSign(c)}`}</button>)}
        </div>
        <p className="note">Ion states offered: documented oxidation states (PubChem) plus ionisation stages with a measured NIST spectrum. Ionisation removes electrons from the outermost subshell.</p>

        <div className="section-title">Properties</div>
        <dl className="kv">
          <KV k="Atomic weight" v={element.hasNaturalAbundance ? element.atomicWeight : null} unit="u" sig={7} />
          {st.natural && <KV k={`Mass of ${element.symbol}-${st.A}`} v={st.natural.mass} unit="u" sig={9} />}
          <KV k="Electronegativity" v={element.electronegativityPauling} unit="(Pauling)" />
          <KV k="1st ionisation energy" v={element.ionizationEnergyEV} unit="eV" />
          <KV k="Electron affinity" v={element.electronAffinityEV} unit="eV" />
          <KV k="vdW radius" v={element.vanDerWaalsRadiusPm} unit="pm" />
          <KV k="Oxidation states" v={element.oxidationStates.map((o) => (o > 0 ? `+${o}` : `${o}`)).join(', ')} />
          <KV k="State (STP)" v={element.standardState} />
          <KV k="Melting point" v={element.meltingPointK} unit="K" />
          <KV k="Boiling point" v={element.boilingPointK} unit="K" />
          <KV k="Density" v={element.densityGcm3} unit="g/cm³" />
          <KV k="Crustal abundance" v={element.crustalAbundanceMgKg} unit="mg/kg" />
          <KV k="Ground term" v={element.groundLevel} />
          <KV k="Discovered" v={element.yearDiscovered} />
        </dl>

        {(inSun || atmospheres.length > 0 || molecules.length > 0) && (
          <>
            <div className="section-title">Connections</div>
            <div className="note" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {inSun && <button className="link-btn" style={{ textAlign: 'left' }} onClick={() => navigate('/cosmic/sun')}>☉ Present in the solar photosphere — open the Sun</button>}
              {atmospheres.map(([b]) => <button key={b} className="link-btn" style={{ textAlign: 'left' }} onClick={() => navigate(`/cosmic/${b}`)}>◍ Constituent of {b[0].toUpperCase() + b.slice(1)}'s atmosphere</button>)}
              {molecules.length > 0 && <span>In molecules: {molecules.map((m, i) => <span key={m.id}>{i > 0 && ', '}<button className="link-btn" onClick={() => navigate(`/atomic/molecules/${m.id}`)}>{m.name}</button></span>)}</span>}
            </div>
          </>
        )}

        {element.description && <><div className="section-title">About</div><p className="note">{element.description}</p></>}
        <div className="section-title">Provenance</div>
        <p className="note">Properties: PubChem periodic table (NCBI). Isotopes: IUPAC CIAAW; nuclides: IAEA AMDC NUBASE (via PubChem PUG View). Configuration exceptions as published (NIST). Values shown as “unknown” are absent from the source — never estimated.</p>
      </Panel>

      {(view === 'cloud' || view === 'orbital') && (
        <div className="panel center-controls">
          {view === 'orbital' && (
            <label className="note" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>Orbital
              <select value={`${orbital.n},${orbital.l},${orbital.m}`} onChange={(e) => setQuery({ orb: e.target.value })} aria-label="Orbital">
                {orbitalChoices.map((o) => <option key={`${o.n}${o.l}${o.m}`} value={`${o.n},${o.l},${o.m}`}>{o.n}{ORBITAL_NAMES[o.l][o.m]}</option>)}
              </select>
            </label>
          )}
          <label className="note" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>Opacity
            <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setQuery({ opacity: e.target.value })} aria-label="Cloud opacity" />
          </label>
          <label className="note" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={xs} onChange={(e) => setQuery({ xs: e.target.checked ? '1' : null })} /> Cross-section
          </label>
          {view === 'orbital' && oneElectron && (
            <>
              <button className="chip" onClick={() => excite(1)} disabled={orbital.n >= 5}>Excite ↑ (absorb)</button>
              <button className="chip" onClick={() => excite(-1)} disabled={orbital.n <= 1}>De-excite ↓ (emit)</button>
            </>
          )}
        </div>
      )}

      <div className="model-label" role="note">
        {photon && view === 'orbital' ? <span style={{ color: photon.color }}>{photon.text}. <em style={{ color: 'var(--text-dim)' }}>Photon drawing is illustrative.</em></span> : modelText[view]}
        {view === 'orbital' && !oneElectron && <div className="note" style={{ marginTop: 4 }}>Excitation demonstrations are available for one-electron systems (H, He⁺, Li²⁺ …), where transition energies are exact.</div>}
      </div>

      <Panel id="element-diagrams" className={`right-panel ${mobileDiagrams ? 'mobile-open' : ''}`} title="2D diagrams · shared data">
        <div className="diagram-tabs" role="tablist">
          {DIAGRAMS.map((d) => <button key={d.id} role="tab" aria-selected={diagram === d.id} className={`chip ${diagram === d.id ? 'active' : ''}`} onClick={() => setQuery({ diagram: d.id })}>{d.label}</button>)}
        </div>
        <div className="diagram"><Diagram id={diagram} st={st} /></div>
        {view === 'orbital' && <p className="note" style={{ marginTop: 10 }}>Showing {orbitalLabel(orbital)} · subshell {subshellLabel(orbital)} ({L_LETTER[orbital.l]}-type, {2 * orbital.l + 1} orbitals).</p>}
      </Panel>
    </>
  );
}
